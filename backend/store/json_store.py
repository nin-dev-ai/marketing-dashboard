import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from config import get_settings
from schemas.campaign import (
    ActivityItem,
    CampaignDetail,
    CampaignRecord,
    CampaignSummary,
    CampaignTimelineStep,
    EmailSequenceSummary,
)
from schemas.company import Company, CompanyCreate
from schemas.dashboard import (
    DashboardData,
    DashboardKpis,
    RecentCampaign,
    TopOpportunity,
)
from schemas.email import EmailDraft, EmailWorkspaceData, PersonalizationReasons
from schemas.intelligence import CompanyIntelligence, IntelligenceRunRecord


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _slugify(name: str) -> str:
    return "".join(c if c.isalnum() else "-" for c in name.lower()).strip("-")[:48]


class JsonStore:
    def __init__(self, path: Path | None = None) -> None:
        settings = get_settings()
        self.path = path or settings.store_file
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if not self.path.exists():
            self._write(self._empty())

    def _empty(self) -> dict[str, Any]:
        return {
            "companies": [],
            "intelligence_runs": [],
            "campaigns": [],
            "emails": [],
            "source_documents": [],
            "activity": [],
        }

    def _read(self) -> dict[str, Any]:
        try:
            return json.loads(self.path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return self._empty()

    def _write(self, data: dict[str, Any]) -> None:
        tmp = self.path.with_suffix(".json.tmp")
        tmp.write_text(json.dumps(data, indent=2, default=str), encoding="utf-8")
        tmp.replace(self.path)

    def _mutate(self, fn) -> Any:
        data = self._read()
        result = fn(data)
        self._write(data)
        return result

    def create_company(self, payload: CompanyCreate) -> Company:
        company = Company(
            id=_slugify(payload.company_name) or str(uuid.uuid4())[:8],
            name=payload.company_name,
            website=payload.website,
            industry=payload.industry,
            country=payload.country,
            notes=payload.notes or None,
            linkedin_url=payload.linkedin_url,
            tags=[payload.industry] if payload.industry else [],
        )

        def update(data: dict) -> Company:
            existing = next((c for c in data["companies"] if c["id"] == company.id), None)
            if existing:
                company.id = f"{company.id}-{str(uuid.uuid4())[:6]}"
            data["companies"].append(company.model_dump())
            data["activity"].insert(
                0,
                {
                    "id": f"act_{uuid.uuid4().hex[:8]}",
                    "message": f"{company.name} added as a dream company",
                    "timestamp": _now_iso(),
                },
            )
            return company

        return self._mutate(update)

    def get_company(self, company_id: str) -> Company | None:
        data = self._read()
        for c in data["companies"]:
            if c["id"] == company_id:
                return Company.model_validate(c)
        return None

    def list_companies(self) -> list[Company]:
        return [Company.model_validate(c) for c in self._read()["companies"]]

    def save_intelligence(
        self, company_id: str, intelligence: CompanyIntelligence
    ) -> IntelligenceRunRecord:
        record = IntelligenceRunRecord(
            id=f"intel_{uuid.uuid4().hex[:10]}",
            company_id=company_id,
            intelligence=intelligence,
            created_at=_now_iso(),
        )

        def update(data: dict) -> IntelligenceRunRecord:
            data["intelligence_runs"] = [
                r for r in data["intelligence_runs"] if r.get("company_id") != company_id
            ]
            data["intelligence_runs"].append(record.model_dump())
            data["activity"].insert(
                0,
                {
                    "id": f"act_{uuid.uuid4().hex[:8]}",
                    "message": f"AI Intelligence generated for {intelligence.company.name}",
                    "timestamp": _now_iso(),
                },
            )
            return record

        return self._mutate(update)

    def get_intelligence_by_company(self, company_id: str) -> IntelligenceRunRecord | None:
        data = self._read()
        runs = [r for r in data["intelligence_runs"] if r.get("company_id") == company_id]
        if not runs:
            return None
        return IntelligenceRunRecord.model_validate(runs[-1])

    def get_intelligence_run(self, run_id: str) -> IntelligenceRunRecord | None:
        data = self._read()
        for r in data["intelligence_runs"]:
            if r.get("id") == run_id:
                return IntelligenceRunRecord.model_validate(r)
        return None

    def create_campaign(
        self,
        company_id: str,
        intelligence_run_id: str,
        name: str,
        opportunity_score: int,
    ) -> CampaignRecord:
        record = CampaignRecord(
            id=f"cmp_{uuid.uuid4().hex[:10]}",
            name=name,
            company_id=company_id,
            intelligence_run_id=intelligence_run_id,
            status="Draft",
            opportunity_score=opportunity_score,
            created_at=_now_iso(),
            updated_at=_now_iso(),
        )

        def update(data: dict) -> CampaignRecord:
            data["campaigns"].append(record.model_dump())
            return record

        return self._mutate(update)

    def get_campaign(self, campaign_id: str) -> CampaignRecord | None:
        data = self._read()
        for c in data["campaigns"]:
            if c["id"] == campaign_id:
                return CampaignRecord.model_validate(c)
        return None

    def list_campaigns(self) -> list[CampaignRecord]:
        return [CampaignRecord.model_validate(c) for c in self._read()["campaigns"]]

    def update_campaign_status(self, campaign_id: str, status: str) -> CampaignRecord | None:
        def update(data: dict) -> CampaignRecord | None:
            for c in data["campaigns"]:
                if c["id"] == campaign_id:
                    c["status"] = status
                    c["updated_at"] = _now_iso()
                    return CampaignRecord.model_validate(c)
            return None

        return self._mutate(update)

    def save_emails(self, campaign_id: str, emails: list[EmailDraft]) -> list[EmailDraft]:
        def update(data: dict) -> list[EmailDraft]:
            data["emails"] = [e for e in data["emails"] if e.get("campaign_id") != campaign_id]
            for em in emails:
                d = em.model_dump()
                d["campaign_id"] = campaign_id
                data["emails"].append(d)
            for c in data["campaigns"]:
                if c["id"] == campaign_id:
                    c["updated_at"] = _now_iso()
            data["activity"].insert(
                0,
                {
                    "id": f"act_{uuid.uuid4().hex[:8]}",
                    "message": f"Email sequence generated for campaign",
                    "timestamp": _now_iso(),
                },
            )
            return emails

        return self._mutate(update)

    def get_emails_for_campaign(self, campaign_id: str) -> list[EmailDraft]:
        data = self._read()
        emails = [e for e in data["emails"] if e.get("campaign_id") == campaign_id]
        emails.sort(key=lambda x: x.get("step", 0))
        return [EmailDraft.model_validate(e) for e in emails]

    def get_email(self, email_id: str) -> EmailDraft | None:
        data = self._read()
        for e in data["emails"]:
            if e["id"] == email_id:
                return EmailDraft.model_validate(e)
        return None

    def update_email(self, email_id: str, **fields) -> EmailDraft | None:
        def update(data: dict) -> EmailDraft | None:
            for e in data["emails"]:
                if e["id"] == email_id:
                    for k, v in fields.items():
                        if v is not None:
                            e[k] = v
                    e["updated"] = _now_iso()
                    return EmailDraft.model_validate(e)
            return None

        return self._mutate(update)

    def get_email_workspace(self, campaign_id: str) -> EmailWorkspaceData | None:
        campaign = self.get_campaign(campaign_id)
        if not campaign:
            return None
        company = self.get_company(campaign.company_id)
        if not company:
            return None
        intel = self.get_intelligence_by_company(campaign.company_id)
        emails = self.get_emails_for_campaign(campaign_id)
        if not emails:
            return None

        personalization = PersonalizationReasons(
            recent_ai_initiative=intel.intelligence.latest_signal.summary
            if intel
            else "",
            detected_risks=[r.title for r in intel.intelligence.risks[:3]] if intel else [],
            matched_services=[s.name for s in intel.intelligence.matched_services[:3]]
            if intel
            else [],
            targeting=", ".join(s.role for s in intel.intelligence.stakeholders[:3])
            if intel
            else "",
            context_summary=intel.intelligence.key_takeaway if intel else "",
        )
        return EmailWorkspaceData(
            campaign_id=campaign_id,
            campaign_name=campaign.name,
            company=company,
            personalization=personalization,
            emails=emails,
        )

    def get_campaign_detail(self, campaign_id: str) -> CampaignDetail | None:
        campaign = self.get_campaign(campaign_id)
        if not campaign:
            return None
        company = self.get_company(campaign.company_id)
        if not company:
            return None
        intel = self.get_intelligence_by_company(campaign.company_id)
        emails = self.get_emails_for_campaign(campaign_id)
        intel_data = intel.intelligence if intel else None

        approved = sum(1 for e in emails if e.status == "Approved")
        email_status = "completed" if emails else "pending"
        approved_status = "in_progress" if emails and approved < len(emails) else (
            "completed" if emails and approved == len(emails) else "pending"
        )

        timeline = [
            CampaignTimelineStep(
                id="t1",
                label="Company Added",
                status="completed",
                timestamp=campaign.created_at,
                caption="Dream company created",
            ),
            CampaignTimelineStep(
                id="t2",
                label="AI Intelligence Generated",
                status="completed" if intel else "pending",
                timestamp=intel.created_at if intel else None,
                caption=f"{len(intel_data.risks)} risks · {len(intel_data.matched_services)} services"
                if intel_data
                else None,
            ),
            CampaignTimelineStep(
                id="t3",
                label="Emails Generated",
                status=email_status if emails else "pending",
                caption=f"{len(emails)}-step sequence" if emails else None,
            ),
            CampaignTimelineStep(
                id="t4",
                label="Emails Approved",
                status=approved_status,
                caption=f"{approved} of {len(emails)} approved" if emails else None,
            ),
            CampaignTimelineStep(id="t5", label="Ready to Send", status="pending"),
            CampaignTimelineStep(
                id="t6",
                label="Sent",
                status="completed" if campaign.status == "Sent" else "pending",
            ),
        ]

        summary = CampaignSummary(
            key_signal=intel_data.latest_signal.title if intel_data else "",
            industry=company.industry,
            country=company.country,
            added_on=campaign.created_at,
            matched_services=[s.name for s in intel_data.matched_services]
            if intel_data
            else [],
            why_high_value=intel_data.why_this_company if intel_data else "",
        )

        data = self._read()
        activity = [
            ActivityItem.model_validate(a)
            for a in data.get("activity", [])[:8]
        ]

        return CampaignDetail(
            id=campaign.id,
            name=campaign.name,
            company=company,
            status=campaign.status,
            opportunity_score=campaign.opportunity_score,
            emails_count=len(emails),
            stakeholders_count=len(intel_data.stakeholders) if intel_data else 0,
            timeline=timeline,
            summary=summary,
            email_sequence=[
                EmailSequenceSummary(
                    id=e.id,
                    step=e.step,
                    type=e.type,
                    subject=e.subject,
                    status=e.status,
                )
                for e in emails
            ],
            activity=activity,
        )

    def add_activity(self, message: str) -> None:
        def update(data: dict) -> None:
            data["activity"].insert(
                0,
                {
                    "id": f"act_{uuid.uuid4().hex[:8]}",
                    "message": message,
                    "timestamp": _now_iso(),
                },
            )

        self._mutate(update)

    def get_dashboard(self) -> DashboardData:
        data = self._read()
        companies = data["companies"]
        campaigns = [CampaignRecord.model_validate(c) for c in data["campaigns"]]
        emails = data["emails"]

        ready = sum(1 for c in campaigns if c.status == "Ready to Send")
        in_progress = sum(1 for c in campaigns if c.status in ("In Progress", "Draft"))

        recent: list[RecentCampaign] = []
        for c in sorted(campaigns, key=lambda x: x.updated_at, reverse=True)[:5]:
            co = self.get_company(c.company_id)
            recent.append(
                RecentCampaign(
                    id=c.id,
                    campaign=c.name,
                    company=co.name if co else "",
                    industry=co.industry if co else "",
                    opportunity_score=c.opportunity_score,
                    status=c.status,
                    emails=len([e for e in emails if e.get("campaign_id") == c.id]),
                    updated=c.updated_at,
                )
            )

        top_opps: list[TopOpportunity] = []
        for run in sorted(
            data["intelligence_runs"],
            key=lambda r: r.get("intelligence", {}).get("opportunity_score", 0),
            reverse=True,
        )[:5]:
            intel = run.get("intelligence", {})
            co = intel.get("company", {})
            top_opps.append(
                TopOpportunity(
                    id=run.get("id", ""),
                    company=co.get("name", ""),
                    industry=co.get("industry", ""),
                    opportunity_score=intel.get("opportunity_score", 0),
                )
            )

        activity = [ActivityItem.model_validate(a) for a in data.get("activity", [])[:10]]

        return DashboardData(
            kpis=DashboardKpis(
                dream_companies=len(companies),
                opportunities=in_progress + ready,
                emails_generated=len(emails),
                ready_to_send=ready,
            ),
            recent_campaigns=recent,
            top_opportunities=top_opps,
            activity_feed=activity,
        )

    def save_source_documents(self, company_id: str, documents: list[dict]) -> None:
        def update(data: dict) -> None:
            data["source_documents"] = [
                d for d in data["source_documents"] if d.get("company_id") != company_id
            ]
            for doc in documents:
                doc["company_id"] = company_id
                doc["id"] = doc.get("id") or f"doc_{uuid.uuid4().hex[:8]}"
            data["source_documents"].extend(documents)

        self._mutate(update)


_store: JsonStore | None = None


def get_store() -> JsonStore:
    global _store
    if _store is None:
        _store = JsonStore()
    return _store
