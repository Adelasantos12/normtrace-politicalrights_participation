"""app/routers/countries.py"""
from fastapi import APIRouter, HTTPException
from app.data.country_profiles import get_country, list_countries

router = APIRouter()

@router.get("/")
def get_all_countries():
    return list_countries()

@router.get("/{iso}")
def get_country_profile(iso: str):
    profile = get_country(iso)
    if not profile:
        raise HTTPException(404, f"Country {iso} not found")
    return profile

@router.get("/{iso}/electoral-summary")
def get_electoral_summary(iso: str):
    profile = get_country(iso)
    if not profile:
        raise HTTPException(404, f"Country {iso} not found")
    elec = profile.get("electoral_system", {})
    part = profile.get("participation", {})
    rights = profile.get("rights_framework", {})
    return {
        "country": profile["name"],
        "electoral_body": elec.get("body"),
        "gender_parity": elec.get("gender_parity"),
        "independent_candidates": elec.get("independent_candidates"),
        "indigenous_seats": elec.get("indigenous_reserved_seats"),
        "participation_mechanisms": {
            "referendum": part.get("referendum"),
            "citizen_initiative": part.get("citizen_initiative"),
            "recall": part.get("recall"),
            "popular_veto": part.get("popular_veto"),
        },
        "voting_restrictions": {
            "felony_disenfranchisement": rights.get("felony_disenfranchisement"),
            "disability_restriction": rights.get("disability_voting_restriction"),
            "migrant_voting": rights.get("migrant_voting"),
        },
        "crpd_ratified": profile["crpd"]["ratified"],
        "crpd_optional_protocol": profile["crpd"]["optional_protocol"],
        "achr_jurisdiction": profile["achr"]["iachr_jurisdiction"],
        "red_flags_count": len(profile.get("electoral_red_flags", [])),
    }
