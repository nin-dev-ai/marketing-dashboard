from pydantic import BaseModel, Field


class Company(BaseModel):
    id: str
    name: str
    website: str = ""
    industry: str = ""
    country: str = ""
    notes: str | None = None
    tags: list[str] | None = None
    linkedin_url: str | None = None


class CompanyCreate(BaseModel):
    company_name: str = Field(..., min_length=1)
    website: str = ""
    industry: str = ""
    country: str = ""
    notes: str = ""
    linkedin_url: str | None = None
