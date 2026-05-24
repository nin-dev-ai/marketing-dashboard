from typing import Literal

from pydantic import BaseModel, Field

from schemas.company import Company

EmailStatus = Literal["Draft", "In Review", "Approved", "Sent"]


class PersonalizationReasons(BaseModel):
    recent_ai_initiative: str
    detected_risks: list[str]
    matched_services: list[str]
    targeting: str
    context_summary: str


class EmailDraft(BaseModel):
    id: str
    step: int
    type: str
    subject: str
    body: str
    status: EmailStatus = "Draft"
    personalization_score: int = 85
    relevance_score: int = 82
    ai_suggestions: list[str] = Field(default_factory=list)
    updated: str
    campaign_id: str | None = None
    personalization_reasons: list[str] = Field(default_factory=list)


class EmailGenerateRequest(BaseModel):
    company_id: str
    intelligence_id: str = ""


class EmailGenerateResponse(BaseModel):
    campaign_id: str
    emails: list[EmailDraft]


class EmailUpdate(BaseModel):
    subject: str | None = None
    body: str | None = None
    status: EmailStatus | None = None


class EmailWorkspaceData(BaseModel):
    campaign_id: str
    campaign_name: str
    company: Company
    personalization: PersonalizationReasons
    emails: list[EmailDraft]
