"""app/routers/instruments.py"""
from fastapi import APIRouter, HTTPException
from instruments.electoral_rights import ELECTORAL_STANDARDS, get_standard, list_instruments

router = APIRouter()

@router.get("/")
def get_all_instruments():
    return list_instruments()

@router.get("/standards")
def get_all_standards():
    return [
        {
            "id": s.id, "right": s.right,
            "instrument": s.instrument, "article": s.article,
            "normative_force": s.normative_force,
            "authority_type": s.authority_type,
            "applies_cr": s.applies_to_cr, "applies_mx": s.applies_to_mx,
            "case_law_count": len(s.case_law),
        }
        for s in ELECTORAL_STANDARDS
    ]

@router.get("/standards/{standard_id}")
def get_standard_detail(standard_id: str):
    std = get_standard(standard_id.upper())
    if not std:
        raise HTTPException(404, f"Standard {standard_id} not found")
    return {
        "id": std.id, "right": std.right,
        "instrument": std.instrument, "article": std.article,
        "source_full": std.source_full,
        "content": std.content,
        "normative_force": std.normative_force,
        "authority_type": std.authority_type,
        "binding_status_note": std.binding_status_note,
        "source_url": std.source_url,
        "gc_reference": std.gc_reference,
        "required_elements": std.required_elements,
        "minimum_test": std.minimum_test,
        "case_law": std.case_law,
        "gap_types": std.gap_types,
    }
