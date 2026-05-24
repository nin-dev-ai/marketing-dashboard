from typing import Literal

from pydantic import BaseModel, Field

from schemas.company import Company

RiskSeverity = Literal["Low", "Medium", "High", "Critical"]


class LatestSignal(BaseModel):
    title: str
    source: str
    published_at: str
    summary: str
    url: str | None = None


class Risk(BaseModel):
    id: str
    title: str
    description: str
    severity: RiskSeverity


class MatchedService(BaseModel):
    id: str
    name: str
    rationale: str


class Stakeholder(BaseModel):
    id: str
    name: str
    role: str
    team: str | None = None
    reason: str


class IntelligenceSource(BaseModel):
    id: str
    title: str
    url: str
    publisher: str
    date: str


class CompanyIntelligence(BaseModel):
    company: Company
    opportunity_score: int
    latest_signal: LatestSignal
    initiative_summary: str
    why_this_company: str
    risks: list[Risk]
    matched_services: list[MatchedService]
    stakeholders: list[Stakeholder]
    key_takeaway: str
    sources: list[IntelligenceSource]


class IntelligenceGenerateRequest(BaseModel):
    company_id: str = ""
    company_name: str = ""
    website: str = ""
    industry: str = ""
    country: str = ""
    notes: str = ""
    linkedin_url: str | None = None


class IntelligenceRunRecord(BaseModel):
    id: str
    company_id: str
    intelligence: CompanyIntelligence
    created_at: str
