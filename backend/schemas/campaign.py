from typing import Literal

from pydantic import BaseModel

from schemas.company import Company

CampaignStatus = Literal[
    "Draft", "In Progress", "Ready to Send", "Sent", "Paused", "Completed"
]
TimelineStepStatus = Literal["completed", "in_progress", "pending"]
EmailStatus = Literal["Draft", "In Review", "Approved", "Sent"]


class CampaignTimelineStep(BaseModel):
    id: str
    label: str
    status: TimelineStepStatus
    timestamp: str | None = None
    caption: str | None = None


class CampaignSummary(BaseModel):
    key_signal: str
    industry: str
    country: str
    added_on: str
    matched_services: list[str]
    why_high_value: str


class EmailSequenceSummary(BaseModel):
    id: str
    step: int
    type: str
    subject: str
    status: EmailStatus


class ActivityItem(BaseModel):
    id: str
    message: str
    timestamp: str


class CampaignDetail(BaseModel):
    id: str
    name: str
    company: Company
    status: CampaignStatus
    opportunity_score: int
    emails_count: int
    stakeholders_count: int
    timeline: list[CampaignTimelineStep]
    summary: CampaignSummary
    email_sequence: list[EmailSequenceSummary]
    activity: list[ActivityItem]


class CampaignListItem(BaseModel):
    id: str
    name: str
    company_id: str
    company_name: str
    industry: str
    opportunity_score: int
    status: CampaignStatus
    emails_count: int
    updated_at: str
    intelligence_run_id: str | None = None


class CampaignRecord(BaseModel):
    id: str
    name: str
    company_id: str
    intelligence_run_id: str | None = None
    status: CampaignStatus = "Draft"
    opportunity_score: int = 0
    created_at: str
    updated_at: str
