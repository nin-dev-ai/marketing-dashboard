"""Email generation service — delegates to chains with template fallback."""

from __future__ import annotations

from datetime import datetime, timezone

from chains.generate_emails import generate_email_sequence
from schemas.company import Company
from schemas.email import EmailDraft
from schemas.intelligence import CompanyIntelligence


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def build_email_sequence(
    company: Company,
    intelligence: CompanyIntelligence,
    campaign_id: str,
) -> list[EmailDraft]:
    emails = await generate_email_sequence(company, intelligence)
    for em in emails:
        em.campaign_id = campaign_id
        em.updated = _now_iso()
    return emails
