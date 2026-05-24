from typing import Any, TypedDict

from schemas.company import Company
from schemas.email import EmailDraft
from schemas.intelligence import CompanyIntelligence, Risk


class MarketingGraphState(TypedDict, total=False):
    company: Company
    documents: list[dict[str, Any]]
    intelligence: CompanyIntelligence
    risks: list[Risk]
    campaign_id: str
    intelligence_run_id: str
    emails: list[EmailDraft]
    mode: str  # "intelligence" | "emails"
