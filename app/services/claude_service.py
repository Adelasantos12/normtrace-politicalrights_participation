"""
app/services/claude_service.py

One focused call to Claude at the end of the analysis pipeline.
Input: structured AnalysisResult from Python analysis
Output: narrative + prioritised recommendations + priority finding

Token budget:
  System prompt: ~400 tokens (static, cached)
  User message: ~800 tokens (structured findings)
  Response: ~1,200 tokens
  Total: ~2,400 tokens per analysis ≈ $0.008 at Sonnet pricing
"""

import json
import os
import httpx
from app.services.analysis_service import AnalysisResult


SYSTEM_PROMPT = """You are NormTrace, a legal analysis tool specialising in 
human rights compliance of electoral and political participation laws. 
You receive structured analysis produced by a Python engine and write 
concise academic commentary in British English.

Your output must follow this exact JSON structure:
{
  "narrative": "3–4 paragraph analytical narrative (academic register, no bullet points)",
  "priority_finding": "One sentence identifying the most critical gap",
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}

Rules:
- narrative: academic, precise, cite specific instruments and cases given
- priority_finding: one sentence, most critical finding only
- recommendations: exactly 3, each one concrete and actionable, citing the 
  specific article or standard it addresses
- Use British English spelling throughout
- Do not repeat the structured data verbatim — synthesise and interpret
- Do not add new facts not present in the input
- Do not convert document-level absence into system-level non-compliance
- Use calibrated language: "preliminary", "document-level", "requires verification against the broader domestic corpus"
- Treat the numerical score as a structural risk signal, not as a legal compliance score"""


def build_user_message(result: AnalysisResult) -> str:
    """
    Build a compact prompt from the structured AnalysisResult.
    Only sends what Claude needs — not the full object.
    """
    # Summarise findings by severity
    critical = [f for f in result.findings if f.severity == "critical"]
    significant = [f for f in result.findings if f.severity == "significant"]
    compliant = [f for f in result.findings if f.severity == "compliant"]

    findings_summary = []
    for f in critical + significant:
        findings_summary.append({
            "right": f.right,
            "instrument": f.instrument,
            "article": f.article,
            "gap_type": f.gap_type,
            "severity": f.severity,
            "reasoning": f.reasoning[:300],  # truncate to save tokens
            "assessment_level": f.assessment_level,
            "confidence": f.confidence,
            "methodological_note": f.methodological_note,
            "key_case": f.case_law_relevant[0] if f.case_law_relevant else None,
        })

    data = {
        "country": result.country_name,
        "statute": result.statute_title,
        "score": result.overall_score,
        "score_label": result.score_label,
        "assessment_scope": result.assessment_scope,
        "methodological_caveats": result.methodological_caveats,
        "gaps": {
            "critical": result.gaps_critical,
            "significant": result.gaps_significant,
            "moderate": result.gaps_moderate,
            "compliant": result.compliant_count,
        },
        "top_findings": findings_summary[:6],  # max 6 to control tokens
        "red_flags": result.red_flags[:3],     # max 3
        "conventionality_viable": result.conventionality_viable,
        "litigation_mechanisms": result.litigation_mechanisms[:3],
    }

    return f"Analyse this structured output and produce the required JSON:\n\n{json.dumps(data, ensure_ascii=False, indent=2)}"


async def enrich_with_narrative(result: AnalysisResult) -> AnalysisResult:
    """
    Call Claude once to add narrative and recommendations to the result.
    Returns the enriched AnalysisResult.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        # Fallback if no API key (dev mode)
        result.ai_narrative = (
            f"Structural analysis complete. {result.gaps_critical} critical gap(s) "
            f"and {result.gaps_significant} significant gap(s) identified. "
            f"Overall compliance score: {result.overall_score}/100. "
            f"(Claude narrative unavailable — no API key configured.)"
        )
        result.ai_recommendations = [
            "Configure ANTHROPIC_API_KEY to enable AI narrative generation.",
            "Review findings in the structured analysis above.",
            "Consult the cited instruments and case law for detailed standards.",
        ]
        result.ai_priority_finding = (
            f"Most critical gap: {result.findings[0].right} "
            f"({result.findings[0].instrument} {result.findings[0].article})"
            if result.findings else "No findings generated."
        )
        return result

    user_message = build_user_message(result)

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-5-20251001",   # Haiku: cheapest for this task
                "max_tokens": 1200,
                "system": SYSTEM_PROMPT,
                "messages": [{"role": "user", "content": user_message}],
            }
        )

    if response.status_code != 200:
        result.ai_narrative = f"Claude API error: {response.status_code}"
        return result

    content = response.json()["content"][0]["text"].strip()

    # Parse JSON response
    try:
        # Strip markdown fences if present
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        parsed = json.loads(content)
        result.ai_narrative = parsed.get("narrative", "")
        result.ai_recommendations = parsed.get("recommendations", [])
        result.ai_priority_finding = parsed.get("priority_finding", "")
    except json.JSONDecodeError:
        result.ai_narrative = content
        result.ai_recommendations = []
        result.ai_priority_finding = ""

    return result
