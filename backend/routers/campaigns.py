from fastapi import APIRouter, HTTPException

from schemas.campaign import CampaignDetail
from store.campaign_store import simulate_send
from store.json_store import get_store

router = APIRouter(prefix="/api", tags=["campaigns"])


@router.get("/campaigns")
def list_campaigns():
    store = get_store()
    campaigns = store.list_campaigns()
    return [
        {
            "id": c.id,
            "name": c.name,
            "company_id": c.company_id,
            "status": c.status,
            "opportunity_score": c.opportunity_score,
            "updated_at": c.updated_at,
        }
        for c in campaigns
    ]


@router.get("/campaigns/{campaign_id}", response_model=CampaignDetail)
def get_campaign(campaign_id: str):
    detail = get_store().get_campaign_detail(campaign_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return detail


@router.post("/campaigns/{campaign_id}/simulate-send")
def simulate_campaign_send(campaign_id: str):
    if not simulate_send(campaign_id):
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"status": "sent", "campaign_id": campaign_id}
