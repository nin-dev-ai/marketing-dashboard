from fastapi import APIRouter, HTTPException

from schemas.company import Company, CompanyCreate
from store.json_store import get_store

router = APIRouter(prefix="/api", tags=["companies"])


@router.post("/companies", response_model=Company)
def create_company(payload: CompanyCreate):
    return get_store().create_company(payload)


@router.get("/companies/{company_id}", response_model=Company)
def get_company(company_id: str):
    company = get_store().get_company(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company
