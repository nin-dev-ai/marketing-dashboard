"""Stakeholder recommendations from templates."""

from __future__ import annotations

import json
import uuid

from config import get_settings
from schemas.intelligence import Stakeholder


def recommend_stakeholders(industry: str, max_count: int = 3) -> list[Stakeholder]:
    path = get_settings().data_dir / "sample_contacts.json"
    templates = json.loads(path.read_text(encoding="utf-8"))

    roles = list(templates.get("default", []))
    roles.extend(templates.get(industry, []))

    stakeholders: list[Stakeholder] = []
    seen: set[str] = set()
    for t in roles:
        if t["role"] in seen:
            continue
        seen.add(t["role"])
        stakeholders.append(
            Stakeholder(
                id=f"p_{uuid.uuid4().hex[:6]}",
                name=t["name"],
                role=t["role"],
                team=t.get("team"),
                reason=t["reason"],
            )
        )
        if len(stakeholders) >= max_count:
            break
    return stakeholders
