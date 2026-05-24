"""Generate 3-step email sequence."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from config import get_settings
from schemas.company import Company
from schemas.email import EmailDraft
from schemas.intelligence import CompanyIntelligence


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _template_emails(company: Company, intel: CompanyIntelligence) -> list[EmailDraft]:
    signal = intel.latest_signal.summary[:120]
    services = ", ".join(s.name for s in intel.matched_services[:3])
    return [
        EmailDraft(
            id=f"em_{uuid.uuid4().hex[:8]}",
            step=1,
            type="Initial Outreach",
            status="Draft",
            subject=f"Strengthening {company.name}'s AI infrastructure security",
            body=f"""Hi {{{{first_name}}}},

Saw recent activity around {company.name}'s AI initiatives — {signal}

As organisations rapidly adopt AI, securing data, models and copilots becomes mission-critical. We've helped similar platforms in {company.country or 'the region'} with {services or 'AI security assessments'} — without slowing delivery.

Would a 20-minute call next week be useful?

Best,
{{{{sender_name}}}}""",
            personalization_score=92,
            relevance_score=88,
            ai_suggestions=[
                "Add a concrete metric the company cares about.",
                "Include a one-line ISO 42001 proof point.",
            ],
            updated=_now_iso(),
            personalization_reasons=[signal, services],
        ),
        EmailDraft(
            id=f"em_{uuid.uuid4().hex[:8]}",
            step=2,
            type="Value Follow-up",
            status="Draft",
            subject=f"{company.name} + AI red-teaming: a quick proof point",
            body=f"""Hi {{{{first_name}}}},

Following up on {company.name}. We recently red-teamed a regional healthcare LLM and surfaced prompt-injection paths before launch — several would have exposed sensitive data under realistic workflows.

Happy to share a one-pager on the methodology if useful.

Best,
{{{{sender_name}}}}""",
            personalization_score=86,
            relevance_score=84,
            ai_suggestions=["Quantify outcome with before/after framing."],
            updated=_now_iso(),
            personalization_reasons=intel.risks[:2] and [intel.risks[0].title] or [],
        ),
        EmailDraft(
            id=f"em_{uuid.uuid4().hex[:8]}",
            step=3,
            type="Final Follow-up",
            status="Draft",
            subject=f"Closing the loop — AI security for {company.name}",
            body=f"""Hi {{{{first_name}}}},

Last note from me — if AI security for {company.name} is on your roadmap this quarter, I'd love to connect. If not, I'll close the loop on my side.

Best,
{{{{sender_name}}}}""",
            personalization_score=78,
            relevance_score=80,
            ai_suggestions=["Offer a low-friction artifact instead of a meeting."],
            updated=_now_iso(),
            personalization_reasons=[intel.key_takeaway[:100]],
        ),
    ]


async def generate_email_sequence(
    company: Company, intelligence: CompanyIntelligence
) -> list[EmailDraft]:
    settings = get_settings()
    if settings.llm_enabled:
        try:
            from langchain_openai import ChatOpenAI
            from pydantic import BaseModel

            class EmailItem(BaseModel):
                step: int
                type: str
                subject: str
                body: str

            class EmailList(BaseModel):
                emails: list[EmailItem]

            llm = ChatOpenAI(
                model="gpt-4o-mini", temperature=0.5, api_key=settings.openai_api_key
            ).with_structured_output(EmailList)

            context = (
                f"Company: {company.name}\nIndustry: {company.industry}\n"
                f"Signal: {intelligence.latest_signal.summary}\n"
                f"Risks: {', '.join(r.title for r in intelligence.risks[:3])}\n"
                f"Services: {', '.join(s.name for s in intelligence.matched_services[:3])}"
            )
            result = await llm.ainvoke(
                f"Write a 3-step B2B cybersecurity outreach email sequence (Initial, Follow-up, Final):\n\n{context}"
            )
            return [
                EmailDraft(
                    id=f"em_{uuid.uuid4().hex[:8]}",
                    step=e.step,
                    type=e.type,
                    subject=e.subject,
                    body=e.body,
                    status="Draft",
                    personalization_score=85 + (3 - e.step) * 2,
                    relevance_score=82 + (3 - e.step) * 2,
                    ai_suggestions=[],
                    updated=_now_iso(),
                )
                for e in result.emails[:3]
            ]
        except Exception:
            pass

    return _template_emails(company, intelligence)
