"""High-level campaign helpers built on the JSON store."""

from store.json_store import get_store


def simulate_send(campaign_id: str) -> bool:
    store = get_store()
    campaign = store.update_campaign_status(campaign_id, "Sent")
    if not campaign:
        return False
    for email in store.get_emails_for_campaign(campaign_id):
        if email.status != "Sent":
            store.update_email(email.id, status="Sent")
    store.add_activity(f"Campaign '{campaign.name}' simulated send completed")
    return True
