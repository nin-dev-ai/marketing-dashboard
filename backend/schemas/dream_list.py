from pydantic import BaseModel


class DreamListCompany(BaseModel):
    company_id: str
    company_name: str
    website: str | None = None
    linkedin_url: str | None = None
    industry: str | None = None
    country: str = "UAE"
    notes: str | None = None
    discovery_source: str | None = None
    discovery_reason: str | None = None
    added_by_ai: bool = False
    status: str = "active"
    monitoring_enabled: bool = False
    last_scraped_at: str | None = None
    created_at: str | None = None
    updated_at: str | None = None
    opportunity_score: int = 0
    weekly_summary: str | None = None


class DreamCompanyResponse(BaseModel):
    """Shape expected by the Dream Companies frontend page."""

    id: str
    name: str
    website: str
    industry: str
    country: str
    status: str
    opportunity_score: int
    stakeholders_count: int = 0
    campaigns_count: int = 0
    emails_count: int = 0
    last_signal: str | None = None
    added_at: str
    updated_at: str
    slug: str
    description: str | None = None
    linkedin_url: str | None = None
    discovery_source: str | None = None
    discovery_reason: str | None = None
    added_by_ai: bool = False
    monitoring_enabled: bool = False
