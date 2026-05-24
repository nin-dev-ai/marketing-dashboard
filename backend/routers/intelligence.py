from fastapi import APIRouter, HTTPException

from graph.marketing_graph import run_intelligence_pipeline
from schemas.company import Company
from schemas.intelligence import CompanyIntelligence, IntelligenceGenerateRequest
from store.json_store import get_store

router = APIRouter(prefix="/api", tags=["intelligence"])


@router.post("/intelligence/generate", response_model=CompanyIntelligence)
async def generate_intelligence(payload: IntelligenceGenerateRequest):
    store = get_store()
    company: Company | None = None

    if payload.company_id:
        company = store.get_company(payload.company_id)

    if not company and payload.company_name:
        from schemas.company import CompanyCreate

        company = store.create_company(
            CompanyCreate(
                company_name=payload.company_name,
                website=payload.website,
                industry=payload.industry,
                country=payload.country,
                notes=payload.notes,
                linkedin_url=payload.linkedin_url,
            )
        )
    elif company:
        company = Company(
            id=company.id,
            name=payload.company_name or company.name,
            website=payload.website or company.website,
            industry=payload.industry or company.industry,
            country=payload.country or company.country,
            notes=payload.notes or company.notes,
            linkedin_url=payload.linkedin_url or company.linkedin_url,
            tags=company.tags,
        )

    if not company:
        raise HTTPException(status_code=400, detail="company_id or company_name required")

    intelligence = await run_intelligence_pipeline(company)
    return intelligence


@router.get("/intelligence/{company_id}", response_model=CompanyIntelligence)
def get_intelligence(company_id: str):
    store = get_store()
    record = store.get_intelligence_by_company(company_id)
    if not record:
        raise HTTPException(status_code=404, detail="Intelligence not found")
    return record.intelligence
