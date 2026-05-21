"""
app/services/analysis_service.py

The engine that does 90% of the analytical work in pure Python.
Claude is called ONCE at the end with the structured output.

Token strategy:
  - Input to Claude: ~1,500 tokens (structured JSON + compact prompt)
  - Output from Claude: ~1,200 tokens (narrative + recommendations)
  - Total cost per analysis: ~$0.008 at Sonnet 4 pricing
"""

import re
from dataclasses import dataclass, field
from instruments.electoral_rights import ELECTORAL_STANDARDS, Standard, get_standards_for_country
from app.data.country_profiles import get_country


# ─────────────────────────────────────────────────────────────────────────────
# DATA STRUCTURES
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class GapFinding:
    standard_id: str
    right: str
    instrument: str
    article: str
    gap_type: str          # total_absence | recognition_without_guarantee |
                           # regression | direct_incompatibility |
                           # implementation_gap | indirect_discrimination | compliant
    severity: str          # critical | significant | moderate | low | compliant
    evidence_from_statute: str   # exact text or absence note
    evidence_from_profile: str   # from country profile data
    reasoning: str               # Python-generated analytical reasoning
    case_law_relevant: list[str] = field(default_factory=list)
    assessment_level: str = "document_level"
    confidence: str = "medium"
    methodological_note: str = (
        "This is a preliminary document-level finding. Absence in the uploaded text does not by itself establish system-level non-compliance."
    )


@dataclass
class AnalysisResult:
    country_iso: str
    country_name: str
    topic: str
    statute_title: str
    statute_text_excerpt: str      # first 500 chars for reference
    total_standards: int
    gaps_critical: int
    gaps_significant: int
    gaps_moderate: int
    gaps_low: int
    compliant_count: int
    overall_score: int             # 0–100 (Python-computed)
    findings: list[GapFinding]
    red_flags: list[str]
    conventionality_viable: bool
    litigation_mechanisms: list[str]
    # Populated by Claude in final step:
    ai_narrative: str = ""
    ai_recommendations: list[str] = field(default_factory=list)
    ai_priority_finding: str = ""
    assessment_scope: str = "document_level_screening"
    score_label: str = "preliminary_structural_risk_signal"
    methodological_caveats: list[str] = field(default_factory=list)
    corpus_coverage: dict = field(default_factory=dict)


# ─────────────────────────────────────────────────────────────────────────────
# TEXT PROCESSING (pure Python, no AI)
# ─────────────────────────────────────────────────────────────────────────────

class StatuteParser:
    """
    Extracts structured signals from statute text without AI.
    Uses keyword matching + pattern recognition for Spanish/English legal text.
    """

    # Obligation verbs → obligation strength (1.0 = mandatory, 0.0 = aspirational)
    OBLIGATION_VERBS_ES = {
        "garantizará": 1.0, "garantiza": 1.0,
        "establecerá": 0.9, "establece": 0.9,
        "deberá": 0.9, "debe": 0.9,
        "sanciona": 0.9, "prohíbe": 1.0, "queda prohibido": 1.0,
        "asegurará": 0.85, "asegura": 0.85,
        "implementará": 0.8, "implementa": 0.8,
        "promoverá": 0.5, "promueve": 0.5,
        "fomentará": 0.4, "fomenta": 0.4,
        "procurará": 0.3, "procura": 0.3,
        "podrá": 0.2, "puede": 0.2,   # discretionary
        "buscará": 0.2,
    }

    # Rights-holder language signals
    RIGHTS_MODEL_POSITIVE = [
        "titular de derechos", "derecho a", "derecho de",
        "ciudadano tiene derecho", "todo ciudadano",
        "sufragio universal", "libre ejercicio",
        "accesibilidad", "ajuste razonable", "inclusión",
        "participación efectiva", "sin discriminación",
        "personas con discapacidad", "pueblos indígenas",
        "paridad", "alternancia", "equidad de género",
    ]

    MEDICAL_MODEL_SIGNALS = [
        "incapaz", "incapacidad mental", "enajenado", "demente",
        "interdicto", "bajo tutela", "discapacitado",
        "minusválido", "inválido",
    ]

    PARTICIPATION_KEYWORDS = [
        "referéndum", "referendo", "consulta popular", "plebiscito",
        "iniciativa ciudadana", "iniciativa popular",
        "revocación de mandato", "revocatoria",
        "petición", "audiencia pública", "cabildo abierto",
        "participación ciudadana", "mecanismo de participación",
    ]

    ELECTORAL_KEYWORDS = [
        "sufragio", "voto", "votación", "elección", "electoral",
        "candidato", "candidatura", "partido político",
        "padrón electoral", "registro electoral",
        "tribunal electoral", "organismo electoral",
        "campaña", "financiamiento", "financiamiento político",
        "circunscripción", "distrito electoral",
    ]

    RESTRICTION_KEYWORDS = [
        "suspensión de derechos", "suspensión del derecho al voto",
        "privación de libertad", "sentencia", "condena",
        "inhabilitación", "prohibición de participar",
        "requisito", "restricción", "limitación",
    ]

    def __init__(self, text: str):
        self.text = text
        self.text_lower = text.lower()
        self.words = text_lower = text.lower().split()

    def _contains(self, keywords: list[str]) -> list[str]:
        """Return which keywords are found in text."""
        return [kw for kw in keywords if kw in self.text_lower]

    def _count_obligations(self) -> dict:
        """Count and classify obligation verbs found."""
        found = {}
        for verb, strength in self.OBLIGATION_VERBS_ES.items():
            count = self.text_lower.count(verb)
            if count > 0:
                found[verb] = {"count": count, "strength": strength}
        return found

    def extract_signals(self) -> dict:
        """Extract all analytical signals — returns structured dict."""
        obligation_verbs = self._count_obligations()

        # Average obligation strength of found verbs
        if obligation_verbs:
            avg_strength = sum(
                v["strength"] for v in obligation_verbs.values()
            ) / len(obligation_verbs)
        else:
            avg_strength = 0.5

        # Check for key terms
        rights_signals = self._contains(self.RIGHTS_MODEL_POSITIVE)
        medical_signals = self._contains(self.MEDICAL_MODEL_SIGNALS)
        participation_found = self._contains(self.PARTICIPATION_KEYWORDS)
        electoral_found = self._contains(self.ELECTORAL_KEYWORDS)
        restriction_found = self._contains(self.RESTRICTION_KEYWORDS)

        # Check for specific critical elements
        has_universal_suffrage = any(
            term in self.text_lower
            for term in ["sufragio universal", "voto universal", "universal y secreto"]
        )
        has_secret_ballot = any(
            term in self.text_lower
            for term in ["voto secreto", "sufragio secreto", "secreto del voto"]
        )
        has_gender_parity = any(
            term in self.text_lower
            for term in ["paridad", "50%", "cincuenta por ciento",
                         "equidad de género", "alternancia"]
        )
        has_disability_provision = any(
            term in self.text_lower
            for term in ["discapacidad", "accesibilidad", "ajuste razonable",
                         "braille", "lengua de señas", "formato accesible"]
        )
        has_indigenous_provision = any(
            term in self.text_lower
            for term in ["indígena", "pueblo originario", "comunidad indígena",
                         "sistema normativo indígena", "usos y costumbres"]
        )
        has_sanction = any(
            term in self.text_lower
            for term in ["sanción", "multa", "infracción", "nulidad",
                         "responsabilidad", "penalidad"]
        )
        has_enforcement_body = any(
            term in self.text_lower
            for term in ["tribunal", "instituto", "comisión", "organismo",
                         "fiscalización", "supervisión", "autoridad electoral"]
        )
        has_automatic_restriction = any(
            term in self.text_lower
            for term in ["automáticamente", "de pleno derecho", "ipso facto",
                         "sin necesidad de declaración", "suspensión automática"]
        )
        has_independent_candidacy = any(
            term in self.text_lower
            for term in ["candidatura independiente", "candidato independiente",
                         "sin partido", "candidatura ciudadana"]
        )
        has_remedies = any(
            term in self.text_lower
            for term in ["recurso", "impugnación", "juicio", "apelación",
                         "amparo", "demanda", "queja", "denuncia", "medio de impugnación"]
        )
        has_judicial_review = any(
            term in self.text_lower
            for term in ["tribunal", "juez", "sala", "corte", "control constitucional",
                         "control de constitucionalidad", "jurisdicción"]
        )

        return {
            "obligation_strength_avg": round(avg_strength, 2),
            "obligation_verbs_found": list(obligation_verbs.keys()),
            "has_discretionary_only": avg_strength < 0.5,
            "rights_model_signals": rights_signals,
            "medical_model_signals": medical_signals,
            "uses_medical_model": len(medical_signals) > 0,
            "participation_mechanisms": participation_found,
            "has_participation_mechanisms": len(participation_found) > 0,
            "electoral_terms": electoral_found,
            "restriction_terms": restriction_found,
            "has_restrictions": len(restriction_found) > 0,
            "has_universal_suffrage": has_universal_suffrage,
            "has_secret_ballot": has_secret_ballot,
            "has_gender_parity": has_gender_parity,
            "has_disability_provision": has_disability_provision,
            "has_indigenous_provision": has_indigenous_provision,
            "has_sanction": has_sanction,
            "has_enforcement_body": has_enforcement_body,
            "has_automatic_restriction": has_automatic_restriction,
            "has_independent_candidacy": has_independent_candidacy,
            "has_remedies": has_remedies,
            "has_judicial_review": has_judicial_review,
            "word_count": len(self.text.split()),
            "char_count": len(self.text),
        }


# ─────────────────────────────────────────────────────────────────────────────
# GAP DETECTION ENGINE (pure Python)
# ─────────────────────────────────────────────────────────────────────────────

class GapDetector:
    """
    Applies normative standards against country profile + statute signals.
    Generates structured findings without AI.
    AI receives these findings and writes the narrative.
    """

    SEVERITY_MAP = {
        "total_absence":             "critical",
        "direct_incompatibility":    "critical",
        "regression":                "significant",
        "indirect_discrimination":   "significant",
        "recognition_without_guarantee": "moderate",
        "implementation_gap":        "moderate",
        "compliant":                 "compliant",
    }

    def __init__(self, country_iso: str, signals: dict):
        self.iso = country_iso.upper()
        self.profile = get_country(country_iso)
        self.signals = signals
        self.standards = get_standards_for_country(country_iso)

    def _gap_type_to_severity(self, gap_type: str) -> str:
        return self.SEVERITY_MAP.get(gap_type, "moderate")

    def detect_all(self) -> list[GapFinding]:
        """Run all detection rules. Returns list of GapFinding."""
        findings = []
        for std in self.standards:
            finding = self._check_standard(std)
            if finding:
                findings.append(finding)
        return findings

    def _check_standard(self, std: Standard) -> GapFinding | None:
        """Route to specific check method per standard, including registry aliases."""
        aliases = {
            "ICCPR_GC25_RESTRICTIONS": "iccpr_25_restrictions",
            "OC28_ELECTORAL_INDEPENDENCE": "oc28_democracy",
            "IDC_2_6": "carta_democratica",
            "CRPD_12_29_LEGAL_CAPACITY": "crpd_12_29_legal_capacity",
            "ACHR_8_25_REMEDY": "achr_8_25_remedy",
            "CEDAW_GR25_TSM": "cedaw_7_8",
            "UNDRIP_18_19": "ilo169_6_7",
        }
        method_name = aliases.get(std.id, std.id).lower()
        method = getattr(self, f"_check_{method_name}", None)
        if method:
            return method(std)
        return self._generic_check(std)

    def _generic_check(self, std: Standard) -> GapFinding:
        """Default check: presence of related keywords → tentative compliance."""
        electoral_covered = self.signals.get("has_universal_suffrage") and \
                           self.signals.get("has_secret_ballot")
        if electoral_covered:
            return GapFinding(
                standard_id=std.id, right=std.right,
                instrument=std.instrument, article=std.article,
                gap_type="compliant", severity="compliant",
                evidence_from_statute="Keywords consistent with standard found in text.",
                evidence_from_profile="Country profile shows relevant provisions.",
                reasoning="Preliminary assessment: statute appears to address this standard. "
                          "Detailed article-by-article review recommended.",
                case_law_relevant=std.case_law[:2] if std.case_law else []
            )
        return GapFinding(
            standard_id=std.id, right=std.right,
            instrument=std.instrument, article=std.article,
            gap_type="recognition_without_guarantee", severity="moderate",
            evidence_from_statute="Standard-specific provisions not clearly identified in text.",
            evidence_from_profile="Country profile does not indicate specific provision.",
            reasoning="The statute does not clearly address this standard. "
                      "May be regulated elsewhere in the legal system.",
            case_law_relevant=std.case_law[:2] if std.case_law else []
        )

    # ── SPECIFIC DETECTION RULES ─────────────────────────────────────────────

    def _check_iccpr_25_b(self, std: Standard) -> GapFinding:
        """ICCPR art. 25(b) — right to vote and to be elected."""
        profile = self.profile
        s = self.signals

        # Check automatic disenfranchisement
        if profile["rights_framework"].get("felony_disenfranchisement") \
           and s.get("has_automatic_restriction"):
            return GapFinding(
                standard_id=std.id, right=std.right,
                instrument=std.instrument, article=std.article,
                gap_type="regression",
                severity="significant",
                evidence_from_statute="Statute contains language consistent with automatic "
                                      "suspension of political rights.",
                evidence_from_profile=f"Country profile confirms automatic disenfranchisement: "
                                      f"{profile['rights_framework'].get('felony_source', 'See profile')}",
                reasoning="HRC General Comment 25 (1996), para. 14: restrictions on the right "
                          "to vote must be based on objective and reasonable criteria. Automatic "
                          "suspension of all persons with criminal convictions, including those in "
                          "pre-trial detention, without individualised assessment, is incompatible "
                          "with ICCPR art. 25(b).",
                case_law_relevant=[
                    "HRC GC 25 (1996) para. 14: individualised assessment required",
                    "Multiple HRC Concluding Observations on automatic disenfranchisement",
                ]
            )

        # Check secret ballot
        if not s.get("has_secret_ballot"):
            return GapFinding(
                standard_id=std.id, right=std.right,
                instrument=std.instrument, article=std.article,
                gap_type="recognition_without_guarantee",
                severity="moderate",
                evidence_from_statute="Secret ballot not explicitly guaranteed in uploaded text.",
                evidence_from_profile="Profile does not flag absence of secret ballot.",
                reasoning="ICCPR art. 25(b) explicitly requires secret ballot. If not present "
                          "in the statute, verify whether guaranteed elsewhere (e.g. Constitution).",
                case_law_relevant=[]
            )

        # Universal suffrage present → compliant on this standard
        if s.get("has_universal_suffrage") and s.get("has_secret_ballot"):
            return GapFinding(
                standard_id=std.id, right=std.right,
                instrument=std.instrument, article=std.article,
                gap_type="compliant", severity="compliant",
                evidence_from_statute="Universal suffrage and secret ballot provisions found.",
                evidence_from_profile="Country profile confirms universal suffrage and secret ballot.",
                reasoning="Statute appears consistent with ICCPR art. 25(b) on core voting rights. "
                          "Note: HRC also requires these rights to be free from undue restrictions.",
                case_law_relevant=[]
            )

        return self._generic_check(std)

    def _check_iccpr_25_restrictions(self, std: Standard) -> GapFinding:
        """Reasonableness of restrictions on political rights."""
        profile = self.profile
        elec = profile.get("electoral_system", {})
        rights = profile.get("rights_framework", {})

        issues = []

        # Independent candidacy threshold check
        if elec.get("independent_candidates") is False:
            issues.append(
                f"No independent candidacies permitted ({self.iso}). "
                f"Source: {elec.get('independent_source', 'See profile')}. "
                f"Castañeda Gutman v. Mexico (IACtHR 2008): party monopoly not per se "
                f"incompatible but must be justified as necessary in a democratic society."
            )
        elif elec.get("independent_candidates") is True:
            note = elec.get("independent_note", "")
            if "signature" in note.lower() or "firma" in note.lower():
                issues.append(
                    f"Independent candidacy exists but requires signatures. "
                    f"Castañeda doctrine: thresholds must be proportionate. Verify levels."
                )

        if not issues:
            return GapFinding(
                standard_id=std.id, right=std.right,
                instrument=std.instrument, article=std.article,
                gap_type="compliant", severity="compliant",
                evidence_from_statute="No clearly disproportionate restrictions identified.",
                evidence_from_profile="Country profile does not flag unreasonable restrictions.",
                reasoning="Preliminary assessment: restrictions appear within accepted range. "
                          "Full proportionality review requires article-by-article analysis.",
                case_law_relevant=[]
            )

        return GapFinding(
            standard_id=std.id, right=std.right,
            instrument=std.instrument, article=std.article,
            gap_type="regression" if len(issues) > 1 else "recognition_without_guarantee",
            severity="significant" if len(issues) > 1 else "moderate",
            evidence_from_statute="Restriction provisions detected in statute text.",
            evidence_from_profile=" | ".join(issues),
            reasoning="HRC GC 25, para. 15: electoral systems must not impose unreasonable "
                      "barriers. IACtHR Castañeda Gutman (2008): requirements must be "
                      "proportionate and non-discriminatory. Review required.",
            case_law_relevant=[
                "IACtHR, Castañeda Gutman v. Mexico (2008), Series C No. 184",
                "HRC General Comment No. 25 (1996), para. 15",
            ]
        )

    def _check_achr_23_1(self, std: Standard) -> GapFinding:
        """ACHR art. 23(1) — political rights."""
        s = self.signals
        profile = self.profile
        elec = profile.get("electoral_system", {})

        # Critical gap: no electoral body mentioned
        if not s.get("has_enforcement_body"):
            return GapFinding(
                standard_id=std.id, right=std.right,
                instrument=std.instrument, article=std.article,
                gap_type="implementation_gap",
                severity="significant",
                evidence_from_statute="No independent electoral administration body "
                                      "identified in uploaded text.",
                evidence_from_profile=f"Country has: {elec.get('body', 'unknown')}",
                reasoning="IACtHR OC-28/21 (2021), paras 66–95: States must maintain "
                          "independent electoral bodies free from political interference. "
                          "If the statute does not establish or reference an independent "
                          "body, this is an implementation gap.",
                case_law_relevant=[
                    "IACtHR, OC-28/21 (2021): electoral body independence as HR obligation",
                ]
            )

        # Check if gender parity present
        has_parity = s.get("has_gender_parity") or elec.get("gender_parity")
        if not has_parity:
            return GapFinding(
                standard_id=std.id, right=std.right,
                instrument=std.instrument, article=std.article,
                gap_type="indirect_discrimination",
                severity="significant",
                evidence_from_statute="No gender parity provisions identified in statute.",
                evidence_from_profile=f"Country electoral gender parity: "
                                      f"{elec.get('gender_parity', False)}",
                reasoning="CEDAW arts. 7–8 + CEDAW GR 23 (1997): States must take active "
                          "measures to achieve women's political participation. Absence of "
                          "parity measures may constitute indirect discrimination.",
                case_law_relevant=[
                    "CEDAW Committee, General Recommendation No. 23 (1997)",
                ]
            )

        return GapFinding(
            standard_id=std.id, right=std.right,
            instrument=std.instrument, article=std.article,
            gap_type="compliant", severity="compliant",
            evidence_from_statute="Electoral body and participation provisions found.",
            evidence_from_profile="Country profile confirms electoral framework.",
            reasoning="Statute appears to address core requirements of ACHR art. 23(1). "
                      "Full analysis requires article-by-article review of all provisions.",
            case_law_relevant=std.case_law[:2]
        )

    def _check_achr_8_25_remedy(self, std: Standard) -> GapFinding:
        """ACHR arts. 8 and 25 — effective remedy and due process."""
        s = self.signals
        if s.get("has_remedies") or s.get("has_judicial_review"):
            return GapFinding(
                standard_id=std.id, right=std.right,
                instrument=std.instrument, article=std.article,
                gap_type="compliant", severity="compliant",
                evidence_from_statute="Remedy or review language identified in uploaded text.",
                evidence_from_profile="Country profile identifies ordinary and/or constitutional electoral remedies.",
                reasoning="Preliminary document-level assessment: the text appears to include review or remedy language relevant to ACHR arts. 8 and 25. A full assessment requires checking deadlines, standing, competence and enforceability.",
                case_law_relevant=std.case_law[:2] if std.case_law else []
            )
        return GapFinding(
            standard_id=std.id, right=std.right,
            instrument=std.instrument, article=std.article,
            gap_type="recognition_without_guarantee", severity="moderate",
            evidence_from_statute="No clear remedy, appeal, review, challenge or complaint mechanism identified in uploaded text.",
            evidence_from_profile="Country profile suggests remedies may exist elsewhere in the domestic framework.",
            reasoning="The uploaded text does not clearly operationalise an effective remedy for political-rights violations. This should be treated as a document-level gap unless the broader domestic corpus confirms absence of remedy.",
            case_law_relevant=std.case_law[:2] if std.case_law else []
        )

    def _check_crpd_12_29_legal_capacity(self, std: Standard) -> GapFinding:
        """CRPD arts. 12 and 29 — legal capacity restrictions."""
        s = self.signals
        if s.get("uses_medical_model"):
            return GapFinding(
                standard_id=std.id, right=std.right,
                instrument=std.instrument, article=std.article,
                gap_type="direct_incompatibility", severity="critical",
                evidence_from_statute=f"Potential legal-capacity or medical-model terms identified: {s.get('medical_model_signals', [])}",
                evidence_from_profile="Country profile requires current constitutional and jurisprudential verification.",
                reasoning="Disability, guardianship, interdiction or mental-capacity language may be incompatible with CRPD arts. 12 and 29 if used to restrict voting, candidacy or political participation.",
                case_law_relevant=std.case_law[:2] if std.case_law else []
            )
        return GapFinding(
            standard_id=std.id, right=std.right,
            instrument=std.instrument, article=std.article,
            gap_type="compliant", severity="compliant",
            evidence_from_statute="No legal-capacity exclusion signal identified in uploaded text.",
            evidence_from_profile="Profile-level issues still require corpus verification.",
            reasoning="No document-level incompatibility with CRPD arts. 12 and 29 was detected. This does not rule out restrictions elsewhere in the domestic legal system.",
            case_law_relevant=std.case_law[:2] if std.case_law else []
        )

    def _check_achr_23_2(self, std: Standard) -> GapFinding:
        """ACHR art. 23(2) — closed list of permissible restrictions."""
        profile = self.profile
        rights = profile.get("rights_framework", {})
        s = self.signals

        issues = []

        # Check for disability restrictions (cognitive capacity)
        if rights.get("disability_voting_restriction") is True:
            issues.append(
                f"Disability-based voting restriction present. "
                f"Source: {rights.get('disability_source', 'See profile')}. "
                f"CRPD GC No. 1 (2014): any restriction based on disability is "
                f"incompatible with CRPD art. 12. Read with ACHR art. 23(2): "
                f"'mental capacity' must be reinterpreted in light of CRPD."
            )
        elif rights.get("disability_source", "").count("incapacidad") > 0 or \
             rights.get("disability_source", "").count("cognitive") > 0:
            issues.append(
                f"Residual cognitive incapacity provision may create de facto restriction. "
                f"Source: {rights.get('disability_source', 'See profile')}. "
                f"Requires scrutiny under CRPD art. 12 + GC No. 1."
            )

        # Automatic disenfranchisement
        if rights.get("felony_disenfranchisement") and \
           s.get("has_automatic_restriction"):
            issues.append(
                "Automatic suspension of rights upon criminal conviction detected. "
                "ACHR art. 23(2): 'sentencing by competent court' means only criminal "
                "conviction — not pre-trial detention. Administrative sanctions cannot "
                "restrict political rights (López Mendoza v. Venezuela, 2011)."
            )

        if not issues:
            return GapFinding(
                standard_id=std.id, right=std.right,
                instrument=std.instrument, article=std.article,
                gap_type="compliant", severity="compliant",
                evidence_from_statute="No obviously impermissible restrictions identified.",
                evidence_from_profile="Country profile does not flag impermissible restrictions.",
                reasoning="Preliminary assessment: no restriction outside art. 23(2) exhaustive "
                          "list detected. Detailed review of all restriction provisions required.",
                case_law_relevant=[]
            )

        severity = "critical" if len(issues) >= 2 else "significant"
        return GapFinding(
            standard_id=std.id, right=std.right,
            instrument=std.instrument, article=std.article,
            gap_type="direct_incompatibility" if len(issues) >= 2 else "regression",
            severity=severity,
            evidence_from_statute="Restriction provisions incompatible with art. 23(2) found.",
            evidence_from_profile=" | ".join(issues),
            reasoning="IACtHR: the list in art. 23(2) is exhaustive. Any restriction not "
                      "on the list violates the Convention. 'Mental capacity' must be "
                      "interpreted narrowly and in light of CRPD art. 12 (supported "
                      "decision-making, not denial of legal capacity).",
            case_law_relevant=[
                "IACtHR, López Mendoza v. Venezuela (2011), Series C No. 233",
                "CRPD Committee, General Comment No. 1 (2014) on legal capacity",
            ]
        )

    def _check_crpd_29(self, std: Standard) -> GapFinding:
        """CRPD art. 29 — political participation for persons with disabilities."""
        s = self.signals
        profile = self.profile

        if not s.get("has_disability_provision"):
            return GapFinding(
                standard_id=std.id, right=std.right,
                instrument=std.instrument, article=std.article,
                gap_type="total_absence",
                severity="critical",
                evidence_from_statute="No accessibility or disability provisions found in "
                                      "uploaded text for electoral/political participation.",
                evidence_from_profile=f"CRPD ratified: {profile['crpd']['date']}. "
                                      f"CO findings: {profile['crpd'].get('co_electoral_findings', 'See profile')}",
                reasoning="CRPD art. 29 requires States to: (a) ensure voting procedures, "
                          "facilities and materials are accessible; (b) protect the right "
                          "to vote by secret ballot; (c) allow assistance by a person of "
                          "choice. Absence of any disability provisions in an electoral "
                          "statute constitutes a total absence gap. GC No. 1 (2014) also "
                          "requires elimination of any restriction on legal capacity "
                          "that affects political rights.",
                case_law_relevant=[
                    "CRPD Committee, General Comment No. 1 (2014): no voting restrictions "
                    "based on disability permitted",
                    f"CRPD Committee, Concluding Observations on {profile['name']} "
                    f"({profile['crpd'].get('concluding_observations', 'pending')})",
                ]
            )

        return GapFinding(
            standard_id=std.id, right=std.right,
            instrument=std.instrument, article=std.article,
            gap_type="implementation_gap", severity="moderate",
            evidence_from_statute="Some disability/accessibility provisions found in text.",
            evidence_from_profile=f"CO: {profile['crpd'].get('co_electoral_findings', '')}",
            reasoning="Disability provisions present but CRPD art. 29 requires comprehensive "
                      "accessibility — Braille, sign language, assisted voting, physical access. "
                      "Implementation adequacy requires on-the-ground assessment.",
            case_law_relevant=std.case_law[:2]
        )

    def _check_cedaw_7_8(self, std: Standard) -> GapFinding:
        """CEDAW arts. 7–8 — women's political participation."""
        s = self.signals
        profile = self.profile
        elec = profile.get("electoral_system", {})

        has_parity = s.get("has_gender_parity") or elec.get("gender_parity")
        parity_source = elec.get("gender_parity_source", "Not specified")

        if has_parity:
            return GapFinding(
                standard_id=std.id, right=std.right,
                instrument=std.instrument, article=std.article,
                gap_type="compliant", severity="compliant",
                evidence_from_statute="Gender parity provisions identified in text.",
                evidence_from_profile=f"Parity mechanism: {parity_source}",
                reasoning="CEDAW arts. 7–8 + GR 23: temporary special measures including "
                          "parity requirements are not only permissible but may be required. "
                          "Parity provisions found. Implementation monitoring required.",
                case_law_relevant=[]
            )

        return GapFinding(
            standard_id=std.id, right=std.right,
            instrument=std.instrument, article=std.article,
            gap_type="recognition_without_guarantee",
            severity="significant",
            evidence_from_statute="No gender parity or affirmative measures found.",
            evidence_from_profile=f"Gender parity in electoral system: {elec.get('gender_parity', False)}",
            reasoning="CEDAW GR 23 (1997), para. 15: States must take positive action to "
                      "overcome systemic barriers to women's participation. Absence of "
                      "affirmative measures in a statute governing political participation "
                      "is inconsistent with CEDAW arts. 7–8.",
            case_law_relevant=["CEDAW Committee, General Recommendation No. 23 (1997)"]
        )

    def _check_ilo169_6_7(self, std: Standard) -> GapFinding:
        """ILO 169 arts. 6–7 — indigenous consultation and participation."""
        s = self.signals
        profile = self.profile
        elec = profile.get("electoral_system", {})

        has_indigenous = s.get("has_indigenous_provision") or \
                         elec.get("indigenous_reserved_seats")

        if not has_indigenous:
            return GapFinding(
                standard_id=std.id, right=std.right,
                instrument=std.instrument, article=std.article,
                gap_type="total_absence" if self.iso == "MX" else "recognition_without_guarantee",
                severity="critical" if self.iso == "MX" else "significant",
                evidence_from_statute="No indigenous participation provisions found in text.",
                evidence_from_profile=f"Indigenous reserved seats: "
                                      f"{elec.get('indigenous_reserved_seats', False)}. "
                                      f"ILO 169 source: {std.source_full[:60]}...",
                reasoning=f"ILO Convention 169 ratified by {profile['name']}. "
                          f"Arts. 6–7 require consultation and participation mechanisms "
                          f"for indigenous peoples in decisions affecting them, including "
                          f"electoral legislation. IACtHR Yatama v. Nicaragua (2005): "
                          f"States must create conditions for indigenous electoral participation "
                          f"through their own institutions.",
                case_law_relevant=[
                    "IACtHR, Yatama v. Nicaragua (2005), Series C No. 127",
                    "ILO Committee of Experts on Application of Conventions, annual reports",
                ]
            )

        return GapFinding(
            standard_id=std.id, right=std.right,
            instrument=std.instrument, article=std.article,
            gap_type="implementation_gap", severity="moderate",
            evidence_from_statute="Indigenous participation provisions found.",
            evidence_from_profile=f"Mechanism: {elec.get('indigenous_note', 'See profile')}",
            reasoning="Provisions exist but ILO 169 requires FPIC, not merely notification. "
                      "Yatama standard: participation through own institutions, not just "
                      "access to general electoral system. Implementation quality review needed.",
            case_law_relevant=["IACtHR, Yatama v. Nicaragua (2005)"]
        )

    def _check_oc28_democracy(self, std: Standard) -> GapFinding:
        """OC-28/21 — electoral body independence."""
        profile = self.profile
        elec = profile.get("electoral_system", {})
        s = self.signals

        body = elec.get("body", "unknown")
        rank = elec.get(f"{elec.get('body', 'ine').lower().split()[0]}_rank",
                        elec.get("ine_rank", elec.get("tse_rank", "unknown")))
        note = elec.get("ine_note", elec.get("tse_note", ""))

        # Mexico: INE popular election reform raises OC-28/21 concerns
        if self.iso == "MX" and "popular vote" in note.lower() and "do not assume" not in note.lower():
            return GapFinding(
                standard_id=std.id, right=std.right,
                instrument=std.instrument, article=std.article,
                gap_type="implementation_gap",
                severity="significant",
                evidence_from_statute="Electoral body provisions in statute being analysed.",
                evidence_from_profile=f"INE councillors elected by popular vote (2023 reform). "
                                      f"Note: {note[:200]}",
                reasoning="IACtHR OC-28/21 (2021), paras 66–95: electoral administration "
                          "bodies must be independent from political and partisan influence. "
                          "Popular election of electoral body councillors is unprecedented "
                          "and creates a structural risk to institutional independence that "
                          "requires assessment under the OC-28/21 standard.",
                case_law_relevant=["IACtHR, OC-28/21 (2021), paras 66–95"]
            )

        # Costa Rica: TSE unreviewable — potential concern
        if self.iso == "CR" and ("unreviewable" in (note + "").lower() or
           "not subject to appeal" in (note + "").lower()):
            return GapFinding(
                standard_id=std.id, right=std.right,
                instrument=std.instrument, article=std.article,
                gap_type="implementation_gap",
                severity="moderate",
                evidence_from_statute="TSE provisions in statute.",
                evidence_from_profile=f"TSE rank: {rank}. Note: {note[:200]}",
                reasoning="IACtHR OC-28/21: institutional independence is positive. "
                          "However, unreviewability of TSE decisions may create a gap "
                          "in rights protection: if TSE violates a political right, "
                          "no domestic remedy exists. ACHR art. 25 (effective remedy) "
                          "and art. 8 (fair hearing) require an accessible review mechanism.",
                case_law_relevant=["IACtHR, OC-28/21 (2021)", "ACHR art. 25"]
            )

        return GapFinding(
            standard_id=std.id, right=std.right,
            instrument=std.instrument, article=std.article,
            gap_type="compliant", severity="compliant",
            evidence_from_statute="Electoral body provisions found.",
            evidence_from_profile=f"Body: {body}, Rank: {rank}",
            reasoning="Electoral administration body appears to have constitutional "
                      "or statutory independence. OC-28/21 standard appears met at "
                      "structural level. Functional independence requires empirical assessment.",
            case_law_relevant=[]
        )

    def _check_carta_democratica(self, std: Standard) -> GapFinding:
        """Carta Democrática — democratic governance framework."""
        s = self.signals
        profile = self.profile
        part = profile.get("participation", {})

        mechanisms = []
        if part.get("referendum"):
            mechanisms.append("referendum")
        if part.get("citizen_initiative"):
            mechanisms.append("citizen_initiative")
        if part.get("recall"):
            mechanisms.append("recall")
        if part.get("popular_veto"):
            mechanisms.append("popular_veto")

        if len(mechanisms) >= 2 or s.get("has_participation_mechanisms"):
            return GapFinding(
                standard_id=std.id, right=std.right,
                instrument=std.instrument, article=std.article,
                gap_type="compliant", severity="compliant",
                evidence_from_statute="Multiple participation mechanisms found.",
                evidence_from_profile=f"Mechanisms: {', '.join(mechanisms)}",
                reasoning="Carta Democrática art. 2: effective participation of citizens "
                          "in decisions relating to their own development is a requirement "
                          "of democracy. Multiple mechanisms present suggest compliance "
                          "at structural level.",
                case_law_relevant=[]
            )

        return GapFinding(
            standard_id=std.id, right=std.right,
            instrument=std.instrument, article=std.article,
            gap_type="recognition_without_guarantee",
            severity="moderate",
            evidence_from_statute="Limited participation mechanisms in uploaded text.",
            evidence_from_profile=f"Known mechanisms: {mechanisms or 'none identified'}",
            reasoning="Carta Democrática arts. 2–6 require effective participation mechanisms. "
                      "Statute may regulate only one aspect (e.g. elections) without addressing "
                      "broader participation. Review of full legal framework recommended.",
            case_law_relevant=["IACtHR, OC-28/21 (2021)"]
        )


# ─────────────────────────────────────────────────────────────────────────────
# SCORING
# ─────────────────────────────────────────────────────────────────────────────

def compute_score(findings: list[GapFinding]) -> int:
    """
    Compute a 0–100 compliance score.
    Weighted: critical gaps cost more than moderate ones.
    """
    if not findings:
        return 50

    weights = {
        "compliant": 0,
        "low": -5,
        "moderate": -10,
        "significant": -20,
        "critical": -35,
    }
    base = 100
    penalty = sum(weights.get(f.severity, -10) for f in findings)
    score = max(0, min(100, base + penalty))
    return score


# ─────────────────────────────────────────────────────────────────────────────
# MAIN ANALYSIS FUNCTION (called by the router)
# ─────────────────────────────────────────────────────────────────────────────

def run_structural_analysis(
    country_iso: str,
    statute_text: str,
    statute_title: str = "Uploaded statute"
) -> AnalysisResult:
    """
    Execute full structural analysis in pure Python.
    Returns AnalysisResult ready for Claude's narrative step.
    """
    profile = get_country(country_iso)
    if not profile:
        raise ValueError(f"Country {country_iso} not in database")

    # Step 1: Parse statute signals
    parser = StatuteParser(statute_text)
    signals = parser.extract_signals()

    # Step 2: Detect gaps
    detector = GapDetector(country_iso, signals)
    findings = detector.detect_all()

    # Step 3: Count by severity
    counts = {"critical": 0, "significant": 0, "moderate": 0, "low": 0, "compliant": 0}
    for f in findings:
        counts[f.severity] = counts.get(f.severity, 0) + 1

    # Step 4: Score
    # Methodological note: this is not a legal compliance score. It is a
    # preliminary structural risk signal derived from document-level findings.
    score = compute_score(findings)

    # Step 5: Determine conventionality viability
    intl_law = profile.get("intl_law", "")
    conventionality_viable = "constitutional_block" in intl_law or \
                             "pro_persona" in intl_law

    # Step 6: Litigation mechanisms
    mechanisms = []
    if country_iso == "CR":
        mechanisms = [
            "Sala Constitucional (Sala IV) — accessible amparo, no lawyer required",
            "TSE — exclusive jurisdiction over electoral matters (unreviewable)",
            "IACHR individual petition (ACHR party)",
            "IACtHR contentious jurisdiction (accepted)",
            "CRPD Committee individual communication (OP ratified)",
            "HRC communication (ICCPR OP ratified)",
        ]
    elif country_iso == "MX":
        mechanisms = [
            "TEPJF — Tribunal Electoral del Poder Judicial de la Federación",
            "Amparo indirecto — any federal court",
            "Acción de inconstitucionalidad — 33% of legislators / CNDH / parties",
            "IACHR individual petition (ACHR party)",
            "IACtHR contentious jurisdiction (accepted)",
            "CRPD Committee individual communication (OP ratified)",
            "HRC communication (ICCPR OP ratified)",
        ]

    return AnalysisResult(
        country_iso=country_iso,
        country_name=profile["name"],
        topic="electoral_rights",
        statute_title=statute_title,
        statute_text_excerpt=statute_text[:500],
        total_standards=len(findings),
        gaps_critical=counts["critical"],
        gaps_significant=counts["significant"],
        gaps_moderate=counts["moderate"],
        gaps_low=counts["low"],
        compliant_count=counts["compliant"],
        overall_score=score,
        findings=findings,
        red_flags=profile.get("electoral_red_flags", []),
        conventionality_viable=conventionality_viable,
        litigation_mechanisms=mechanisms,
        methodological_caveats=[
            "This output is a preliminary document-level screening, not a definitive legal opinion.",
            "Absence of a standard in the uploaded text may mean that it is regulated elsewhere in the domestic legal system.",
            "System-level compliance requires the constitution, statutes, electoral regulations, administrative guidelines and jurisprudence currently in force.",
            "The numerical score is a preliminary structural risk signal, not a validated compliance index.",
        ],
        corpus_coverage=profile.get("corpus_coverage", {}),
    )
