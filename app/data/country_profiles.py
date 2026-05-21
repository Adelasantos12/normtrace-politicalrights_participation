"""
app/data/country_profiles.py
Country context registry for NormTrace Political Rights.

This file stores contextual assumptions used by the screening engine. It should
not be treated as a substitute for the domestic legal corpus. Each high-risk
or time-sensitive assertion should be verified against official sources before
being used in public-facing legal analysis.
"""

COUNTRY_PROFILES = {

    "CR": {
        "iso": "CR",
        "name": "Costa Rica",
        "name_es": "Costa Rica",
        "legal_tradition": "civil_romanist",
        "government": "presidential",
        "territory": "unitary_centralised",
        "review": "sala_cuarta",                  # concentrated, most accessible in LatAm
        "intl_law": "constitutional_block",       # art. 7 + Sala IV doctrine
        "regional_system": "OAS/ACHR",
        "regional_court": "IACtHR",
        "corpus_coverage": {
            "status": "profile_only_not_full_corpus",
            "assessment_level": "document_level_screening",
            "methodological_warning": "Country profile contextualises findings but cannot establish system-level compliance without domestic statutes, regulations and jurisprudence."
        },

        # Electoral system specifics
        "electoral_system": {
            "type": "proportional_representation",
            "body": "Tribunal Supremo de Elecciones (TSE)",
            "tse_rank": "fourth_power",           # TSE is constitutional power, not just admin body
            "tse_source": "Art. 9 + Arts. 99–104 Constitución 1949",
            "tse_note": "The TSE is constitutionally entrenched as the supreme electoral authority. "
                        "Electoral decisions have a specialised finality regime; rights-review "
                        "implications should be analysed with Costa Rican constitutional and "
                        "electoral jurisprudence rather than assumed as a general absence of remedy.",
            "voting": "universal_suffrage_18",
            "mandatory_voting": False,            # voluntary since 1959
            "electronic_voting": False,
            "gender_parity": True,                # Ley 7653 + Código Electoral 2009: 50% parity
            "gender_parity_source": "Código Electoral, art. 2 — principio de paridad y alternancia",
            "indigenous_reserved_seats": False,
            "campaign_finance_public": True,      # Contribución estatal: art. 96 CN
            "independent_candidates": False,      # Only through registered parties
            "independent_source": "Arts. 96–98 Constitución 1949; Código Electoral art. 48",
            "runoff": True,                       # If no candidate reaches 40%
            "threshold": 40,                      # 40% + 1 vote to avoid runoff
        },

        # Participation mechanisms
        "participation": {
            "referendum": True,
            "referendum_source": "Art. 105 CN 1949; Ley de Regulación del Referéndum 8492/2006",
            "citizen_initiative": True,
            "initiative_signatures": 5,           # 5% of electoral register, verify against current text
            "initiative_source": "Art. 123 CN 1949",
            "initiative_note": "Legislative initiative only; not constitutional amendment",
            "recall": False,                      # No recall mechanism
            "popular_veto": None,                 # requires verification; do not infer active popular veto without corpus support
            "popular_veto_source": "Requires verification against current constitutional/statutory text",
            "civil_society_consultation": True,   # CONARE, MIDEPLAN consultation processes
            "ombudsman": "Defensoría de los Habitantes",
            "ombudsman_source": "Ley 7319/1992",
        },

        # Rights framework for electoral/political rights
        "rights_framework": {
            "suffrage_constitutional": "Art. 90 CN 1949",
            "political_rights_article": "Arts. 90–98 CN 1949",
            "equality_article": "Art. 33 CN 1949",
            "assembly_article": "Art. 26 CN 1949",
            "expression_article": "Art. 29 CN 1949",
            "association_article": "Art. 25 CN 1949",
            "disability_voting_restriction": "requires_article_38_review",     # Eliminated; universal suffrage
            "disability_voting_source": "Código Electoral art. 9 — voto accesible",
            "felony_disenfranchisement": True,          # Active convicts cannot vote
            "felony_source": "Art. 91 CN — suspensión de derechos durante condena",
            "migrant_voting": False,                    # Non-citizens cannot vote
            "lowering_age_proposal": False,             # No active proposal to lower to 16
        },

        # Key legislation to analyse
        "key_statutes": [
            {
                "name": "Constitución Política 1949",
                "articles_electoral": "Arts. 9, 90–98, 99–104",
                "url": "https://www.tse.go.cr/pdf/normativa/constitucion.pdf"
            },
            {
                "name": "Código Electoral (Ley 8765/2009)",
                "articles_electoral": "Arts. 1–18 (principios), 48–58 (partidos), 148–196 (campaña)",
                "url": "https://www.tse.go.cr/pdf/normativa/codigoelectoral.pdf"
            },
            {
                "name": "Ley de Regulación del Referéndum (8492/2006)",
                "articles_electoral": "Arts. 1–20",
                "url": "https://www.tse.go.cr/pdf/normativa/leydereferendum.pdf"
            },
        ],

        # CRPD status (relevant for art. 29)
        "crpd": {
            "ratified": True,
            "date": "2008-10-01",
            "optional_protocol": True,
            "concluding_observations": "CRPD/C/CRI/CO/1",
            "co_date": "2014-10-08",
            "co_electoral_findings": "Committee noted TSE has made progress on accessibility "
                                     "but concerns remain on voting materials in Braille and "
                                     "sign language interpretation at polling stations."
        },

        # ICCPR / ACHR status
        "iccpr": {"ratified": True, "date": "1968-11-29", "optional_protocol": True},
        "achr": {"ratified": True, "date": "1970-04-08", "iachr_jurisdiction": True},

        # Analytical red flags specific to electoral rights
        "electoral_red_flags": [
            "TSE constitutional finality in electoral matters requires careful review against ACHR arts. 8 and 25; do not infer an absolute absence of remedy without domestic jurisprudential analysis.",
            "Independent candidacies prohibited: all candidates must be registered through a "
            "political party — potential tension with ACHR art. 23 per Castañeda doctrine.",
            "Gender parity and alternation are central strengths of the Costa Rican framework; implementation should be assessed by level of election and candidacy type.",
            "Voluntary voting may produce turnout variation across electoral levels; claims about turnout levels must be sourced to TSE data for the election year analysed.",
            "No recall mechanism: elected officials cannot be removed between elections "
            "regardless of performance — gap in participatory accountability.",
            "Persons serving criminal sentences disenfranchised — art. 91 CN. ICCPR HRC "
            "General Comment 25 requires this be assessed case by case, not automatic.",
        ],
    },

    "MX": {
        "iso": "MX",
        "name": "Mexico",
        "name_es": "México",
        "legal_tradition": "civil_romanist",
        "government": "presidential",
        "territory": "federal_three_level",
        "review": "hybrid_amparo_accion",
        "intl_law": "constitutional_block_pro_persona",
        "regional_system": "OAS/ACHR",
        "regional_court": "IACtHR",
        "corpus_coverage": {
            "status": "profile_only_not_full_corpus",
            "assessment_level": "document_level_screening",
            "methodological_warning": "Country profile contextualises findings but cannot establish system-level compliance without domestic statutes, regulations and jurisprudence."
        },

        "electoral_system": {
            "type": "mixed_proportional_majoritarian",
            "body": "Instituto Nacional Electoral (INE)",
            "ine_rank": "autonomous_constitutional_body",
            "ine_source": "Art. 41 CPEUM",
            "ine_note": "INE replaced IFE after the 2014 reform and coordinates the national electoral system with OPLEs. "
                        "Do not assume popular election of INE councillors as a current rule unless verified against the current Constitution and electoral laws.",
            "judicial_body": "Tribunal Electoral del Poder Judicial de la Federación (TEPJF)",
            "tepjf_source": "Arts. 94, 99 CPEUM",
            "voting": "universal_suffrage_18",
            "mandatory_voting": False,
            "electronic_voting": False,
            "gender_parity": True,
            "gender_parity_source": "Art. 41 CPEUM + Ley General de Instituciones y "
                                    "Procedimientos Electorales (LGIPE) arts. 232–233: "
                                    "50/50 parity across all candidacies",
            "indigenous_reserved_seats": True,
            "indigenous_source": "Ley General de Instituciones y Procedimientos Electorales "
                                 "art. 329: acciones afirmativas; INE Agreement INE/CG572/2020",
            "indigenous_note": "21 federal districts with indigenous majority designated; "
                               "affirmative action candidacies for indigenous persons. "
                               "Expanded by TEPJF jurisprudence.",
            "campaign_finance_public": True,
            "campaign_finance_source": "Art. 41 CPEUM — financiamiento público predominante",
            "independent_candidates": True,
            "independent_source": "Art. 35 fracc. II CPEUM (reforma 2012); LGIPE arts. 357–389",
            "independent_note": "Constitutional reform 2012 introduced independent candidacies "
                                "for all federal offices. Signature thresholds required.",
            "runoff": False,                      # Simple plurality wins
            "threshold": None,
            "threshold_note": "FPTP for executive; mixed for legislative. No runoff.",
        },

        "participation": {
            "referendum": True,
            "referendum_source": "Art. 35 fracc. VIII CPEUM (reforma 2019); "
                                 "Ley Federal de Consulta Popular",
            "referendum_note": "Consulta popular: 2% of electoral register + Cámara/Presidente; "
                               "only on matters not restricted by Constitution. "
                               "First consulta nacional: Aug 2021 (juicio a expresidentes).",
            "citizen_initiative": True,
            "initiative_signatures": 0.13,         # 0.13% of electoral register
            "initiative_source": "Art. 35 fracc. VII CPEUM",
            "initiative_note": "Initiated in legislature; Congress decides whether to legislate.",
            "recall": True,
            "recall_source": "Art. 35 fracc. IX CPEUM (reforma 2019); "
                              "Ley Federal de Revocación de Mandato",
            "recall_note": "Revocación de mandato: for President only; 33% + 40% turnout. "
                           "First exercise: April 2022 (López Obrador kept mandate).",
            "popular_veto": False,
            "civil_society_consultation": True,
            "ombudsman": "Comisión Nacional de los Derechos Humanos (CNDH)",
            "ombudsman_source": "Art. 102-B CPEUM",
        },

        "rights_framework": {
            "suffrage_constitutional": "Art. 35 CPEUM",
            "political_rights_article": "Arts. 35–38 CPEUM",
            "equality_article": "Art. 1 CPEUM (2011 reform)",
            "assembly_article": "Art. 9 CPEUM",
            "expression_article": "Art. 6 CPEUM",
            "association_article": "Art. 9 CPEUM",
            "disability_voting_restriction": "requires_article_38_review",
            "disability_source": "CPEUM art. 38 and related jurisprudence require current verification. Any legal-capacity restriction must be reviewed against CRPD arts. 12 and 29.",
            "felony_disenfranchisement": True,
            "felony_source": "Art. 38 fracc. II CPEUM — prisión: derechos suspendidos",
            "felony_note": "Suspension and pre-trial detention voting must be analysed against current CPEUM art. 38, TEPJF jurisprudence and INE implementation rules. Avoid categorical findings without corpus support.",
            "migrant_voting": False,
            "mexican_abroad_voting": True,
            "abroad_source": "Art. 329-A LGIPE — voto de mexicanos en el extranjero "
                             "para Presidente, Senadores, Gobernadores",
            "lowering_age_proposal": True,
            "lowering_age_note": "Multiple proposals to lower to 16 in Congress; "
                                 "not yet enacted as of 2025.",
        },

        "key_statutes": [
            {
                "name": "Constitución Política (CPEUM)",
                "articles_electoral": "Arts. 1, 35–38, 41, 54, 99, 102-B, 116",
                "url": "https://www.diputados.gob.mx/LeyesBiblio/pdf/CPEUM.pdf"
            },
            {
                "name": "Ley General de Instituciones y Procedimientos Electorales (LGIPE)",
                "articles_electoral": "Arts. 1–30 (principios), 232–233 (paridad), "
                                     "329 (indígenas), 357–389 (candidaturas independientes)",
                "url": "https://www.diputados.gob.mx/LeyesBiblio/pdf/LGIPE.pdf"
            },
            {
                "name": "Ley Federal de Consulta Popular",
                "articles_electoral": "Arts. 1–27",
                "url": "https://www.diputados.gob.mx/LeyesBiblio/pdf/LFCPo.pdf"
            },
            {
                "name": "Ley Federal de Revocación de Mandato",
                "articles_electoral": "Arts. 1–24",
                "url": "https://www.diputados.gob.mx/LeyesBiblio/pdf/LFRM.pdf"
            },
        ],

        "crpd": {
            "ratified": True,
            "date": "2007-12-17",
            "optional_protocol": True,
            "concluding_observations": "CRPD/C/MEX/CO/1",
            "co_date": "2014-10-27",
            "co_electoral_findings": "Committee concerned about art. 38 CPEUM allowing "
                                     "suspension of political rights for persons under "
                                     "guardianship; recommended elimination of all "
                                     "restrictions on voting for PwD."
        },

        "iccpr": {"ratified": True, "date": "1981-03-23", "optional_protocol": True},
        "achr": {"ratified": True, "date": "1981-03-24", "iachr_jurisdiction": True},

        "electoral_red_flags": [
            "Any proposal or reform affecting INE appointment, autonomy or structure should be assessed against OC-28/21 and current SCJN/TEPJF doctrine; the profile does not assume popular election as currently valid law.",
            "CPEUM art. 38 and electoral jurisprudence on suspension of political rights, including persons in pre-trial detention, require current corpus-based review under ICCPR art. 25 and ACHR art. 23.",
            "Any legal-capacity or disability-based restriction requires review under CRPD arts. 12 and 29; conclusions should be based on current constitutional text and jurisprudence.",
            "Independent candidacy thresholds should be assessed by office and current legislation; excessive thresholds may raise Castañeda Gutman concerns.",
            "Indigenous affirmative action: INE Agreement CG572/2020 designates 21 districts "
            "but implementation contested; TEPJF has issued multiple orders.",
            "External voting should be assessed by office, modality and current INE/LGIPE rules; population figures must be sourced for the year analysed.",
            "32-state variation in local electoral laws: CPEUM sets minimum standards "
            "but state codes diverge significantly on participation mechanisms.",
        ],
    }
}

def get_country(iso: str) -> dict | None:
    return COUNTRY_PROFILES.get(iso.upper())

def list_countries() -> list[dict]:
    return [
        {"iso": k, "name": v["name"], "name_es": v["name_es"]}
        for k, v in COUNTRY_PROFILES.items()
    ]
