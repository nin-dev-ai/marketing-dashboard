"""Map risks to services from catalog."""

from __future__ import annotations

import json
import uuid
from pathlib import Path

from config import get_settings
from schemas.intelligence import MatchedService, Risk


def _load_catalog() -> list[dict]:
    path = get_settings().data_dir / "services_catalog.json"
    return json.loads(path.read_text(encoding="utf-8"))


def map_services_to_risks(risks: list[Risk], max_services: int = 4) -> list[MatchedService]:
    catalog = _load_catalog()
    risk_text = " ".join(f"{r.title} {r.description}".lower() for r in risks)
    scored: list[tuple[int, dict]] = []

    for svc in catalog:
        score = 0
        for kw in svc.get("risk_keywords", []):
            if kw.lower() in risk_text:
                score += 2
        if score > 0:
            scored.append((score, svc))

    scored.sort(key=lambda x: x[0], reverse=True)
    if not scored:
        scored = [(1, catalog[i]) for i in range(min(max_services, len(catalog)))]

    return [
        MatchedService(
            id=svc["id"],
            name=svc["name"],
            rationale=svc["description"],
        )
        for _, svc in scored[:max_services]
    ]
