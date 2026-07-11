"""
normtrace/app/main.py
NormTrace — Electoral Rights Analysis Platform
MVP: Costa Rica + Mexico · Electoral & Participation Rights

Architecture philosophy:
  - Python does ALL structural work (parsing, gap detection, scoring)
  - Claude is called ONCE at the end with a compact structured prompt
  - Token budget per analysis: ~2,000 input + ~1,500 output = ~$0.01 per analysis

Citation:
  Santos Domínguez, A. B. (2026). NormTrace-Political Rights: Legal-Institutional
  Activation Mapping of Political Participation Rights in Mexico and Costa Rica
  (Version v0.1.2) [Computer software]. Zenodo.
  https://doi.org/10.5281/zenodo.21296393
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import analysis, countries, instruments

app = FastAPI(
    title="NormTrace API",
    description=(
        "Political-rights document-level screening — Costa Rica & Mexico v1.1-methodology. "
        "Cite as: Santos Domínguez, A. B. (2026). NormTrace-Political Rights (v0.1.2). "
        "Zenodo. https://doi.org/10.5281/zenodo.21296393"
    ),
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis.router,    prefix="/api/v1/analysis",    tags=["Analysis"])
app.include_router(countries.router,   prefix="/api/v1/countries",   tags=["Countries"])
app.include_router(instruments.router, prefix="/api/v1/instruments", tags=["Instruments"])

@app.get("/")
def root():
    return {
        "service": "NormTrace",
        "version": "1.1.0",
        "countries": ["CR", "MX"],
        "topics": ["electoral_rights"],
        "status": "operational",
        "citation": (
            "Santos Domínguez, A. B. (2026). NormTrace-Political Rights: "
            "Legal-Institutional Activation Mapping of Political Participation "
            "Rights in Mexico and Costa Rica (Version v0.1.2) [Computer software]. "
            "Zenodo. https://doi.org/10.5281/zenodo.21296393"
        ),
        "doi": "10.5281/zenodo.21296393"
    }

@app.get("/health")
def health():
    return {"status": "ok"}
