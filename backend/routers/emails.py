from fastapi import APIRouter, HTTPException

from graph.marketing_graph import run_email_pipeline
from schemas.email import EmailDraft, EmailGenerateRequest, EmailGenerateResponse, EmailUpdate
from store.json_store import get_store

router = APIRouter(prefix="/api", tags=["emails"])


@router.post("/emails/generate", response_model=EmailGenerateResponse)
async def generate_emails(payload: EmailGenerateRequest):
    store = get_store()
    company = store.get_company(payload.company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    intel_record = store.get_intelligence_by_company(payload.company_id)
    if not intel_record:
        raise HTTPException(status_code=404, detail="Intelligence not found — generate first")

    campaign_id, emails = await run_email_pipeline(
        company, intel_record.intelligence, campaign_id=""
    )
    return EmailGenerateResponse(campaign_id=campaign_id, emails=emails)


@router.get("/email-workspace/{campaign_id}")
def get_email_workspace(campaign_id: str):
    workspace = get_store().get_email_workspace(campaign_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Campaign or emails not found")
    return workspace


@router.patch("/emails/{email_id}", response_model=EmailDraft)
def update_email(email_id: str, payload: EmailUpdate):
    store = get_store()
    email = store.update_email(
        email_id,
        subject=payload.subject,
        body=payload.body,
        status=payload.status,
    )
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    return email
