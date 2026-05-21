"""app/routers/analysis.py"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from app.services.analysis_service import run_structural_analysis, AnalysisResult
from app.services.claude_service import enrich_with_narrative
import pdfplumber
import io

router = APIRouter()


class AnalysisRequest(BaseModel):
    country_iso: str          # "CR" or "MX"
    statute_title: str
    statute_text: str
    include_ai_narrative: bool = True


class FindingOut(BaseModel):
    standard_id: str
    right: str
    instrument: str
    article: str
    gap_type: str
    severity: str
    reasoning: str
    case_law_relevant: list[str]
    assessment_level: str = "document_level"
    confidence: str = "medium"
    methodological_note: str = ""


class AnalysisOut(BaseModel):
    country_iso: str
    country_name: str
    statute_title: str
    overall_score: int
    gaps_critical: int
    gaps_significant: int
    gaps_moderate: int
    compliant_count: int
    findings: list[FindingOut]
    red_flags: list[str]
    litigation_mechanisms: list[str]
    conventionality_viable: bool
    ai_narrative: str
    ai_recommendations: list[str]
    ai_priority_finding: str
    assessment_scope: str
    score_label: str
    methodological_caveats: list[str]
    corpus_coverage: dict


def result_to_out(r: AnalysisResult) -> AnalysisOut:
    return AnalysisOut(
        country_iso=r.country_iso,
        country_name=r.country_name,
        statute_title=r.statute_title,
        overall_score=r.overall_score,
        gaps_critical=r.gaps_critical,
        gaps_significant=r.gaps_significant,
        gaps_moderate=r.gaps_moderate,
        compliant_count=r.compliant_count,
        findings=[
            FindingOut(
                standard_id=f.standard_id, right=f.right,
                instrument=f.instrument, article=f.article,
                gap_type=f.gap_type, severity=f.severity,
                reasoning=f.reasoning,
                case_law_relevant=f.case_law_relevant,
                assessment_level=f.assessment_level,
                confidence=f.confidence,
                methodological_note=f.methodological_note,
            ) for f in r.findings
        ],
        red_flags=r.red_flags,
        litigation_mechanisms=r.litigation_mechanisms,
        conventionality_viable=r.conventionality_viable,
        ai_narrative=r.ai_narrative,
        ai_recommendations=r.ai_recommendations,
        ai_priority_finding=r.ai_priority_finding,
        assessment_scope=r.assessment_scope,
        score_label=r.score_label,
        methodological_caveats=r.methodological_caveats,
        corpus_coverage=r.corpus_coverage,
    )


@router.post("/text", response_model=AnalysisOut)
async def analyse_text(req: AnalysisRequest):
    """Analyse a statute provided as plain text."""
    if req.country_iso.upper() not in ("CR", "MX"):
        raise HTTPException(400, "Only CR and MX supported in v1.0")
    if len(req.statute_text) < 100:
        raise HTTPException(400, "Statute text too short (min 100 characters)")

    result = run_structural_analysis(
        country_iso=req.country_iso,
        statute_text=req.statute_text,
        statute_title=req.statute_title,
    )

    if req.include_ai_narrative:
        result = await enrich_with_narrative(result)

    return result_to_out(result)


@router.post("/pdf", response_model=AnalysisOut)
async def analyse_pdf(
    country_iso: str = Form(...),
    statute_title: str = Form(...),
    include_ai_narrative: bool = Form(True),
    file: UploadFile = File(...),
):
    """Analyse a statute uploaded as a PDF."""
    if country_iso.upper() not in ("CR", "MX"):
        raise HTTPException(400, "Only CR and MX supported in v1.0")

    contents = await file.read()
    text = ""
    try:
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        raise HTTPException(400, f"PDF extraction failed: {str(e)}")

    if len(text) < 100:
        raise HTTPException(400, "Could not extract sufficient text from PDF")

    result = run_structural_analysis(
        country_iso=country_iso,
        statute_text=text,
        statute_title=statute_title,
    )

    if include_ai_narrative:
        result = await enrich_with_narrative(result)

    return result_to_out(result)


@router.post("/compare", response_model=dict)
async def compare_countries(req: AnalysisRequest):
    """
    Run the same statute text through both CR and MX profiles.
    Useful for comparative analysis.
    """
    results = {}
    for iso in ["CR", "MX"]:
        r = run_structural_analysis(
            country_iso=iso,
            statute_text=req.statute_text,
            statute_title=req.statute_title,
        )
        if req.include_ai_narrative:
            r = await enrich_with_narrative(r)
        results[iso] = result_to_out(r).model_dump()

    return {
        "comparison": results,
        "methodological_warning": "Cross-country score deltas are preliminary document-level signals, not validated comparative compliance measures.",
        "score_delta": results["CR"]["overall_score"] - results["MX"]["overall_score"],
        "critical_gap_comparison": {
            "CR": results["CR"]["gaps_critical"],
            "MX": results["MX"]["gaps_critical"],
        }
    }
