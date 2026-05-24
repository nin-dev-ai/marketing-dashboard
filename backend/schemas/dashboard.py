from pydantic import BaseModel

from schemas.campaign import ActivityItem, CampaignStatus


class DashboardKpis(BaseModel):
    dream_companies: int
    opportunities: int
    emails_generated: int
    ready_to_send: int


class RecentCampaign(BaseModel):
    id: str
    campaign: str
    company: str
    industry: str
    opportunity_score: int
    status: CampaignStatus
    emails: int
    updated: str


class TopOpportunity(BaseModel):
    id: str
    company: str
    industry: str
    opportunity_score: int


class DashboardData(BaseModel):
    kpis: DashboardKpis
    recent_campaigns: list[RecentCampaign]
    top_opportunities: list[TopOpportunity]
    activity_feed: list[ActivityItem]
