from fastapi import APIRouter

from schemas.dream_list import DreamCompanyResponse
from schemas.jobs import MonitoringToggle
from services.dream_list_service import (
    get_dream_companies_for_api,
    get_dream_company_by_id,
    set_company_monitoring,
)

router = APIRouter(prefix="/api", tags=["dream-companies"])


@router.get("/dream-companies", response_model=list[DreamCompanyResponse])
def list_dream_companies():
    """All companies from the Campaign Compass Postgres dream list."""
    return get_dream_companies_for_api()


@router.get("/dream-companies/{company_id}", response_model=DreamCompanyResponse)
def get_dream_company(company_id: str):
    return get_dream_company_by_id(company_id)


@router.patch("/dream-companies/{company_id}/monitoring", response_model=DreamCompanyResponse)
def update_dream_company_monitoring(company_id: str, body: MonitoringToggle):
    """Enable or disable daily news scanning for a company."""
    return set_company_monitoring(company_id, body.monitoring_enabled)
