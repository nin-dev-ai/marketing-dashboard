"""Extract AI/cyber risks from research documents."""

from __future__ import annotations

import uuid
from typing import Any

from config import get_settings
from schemas.company import Company
from schemas.intelligence import Risk


def _fallback_risks(company: Company, docs: list[dict[str, Any]]) -> list[Risk]:
    text = " ".join(d.get("raw_content", "") for d in docs).lower()
    risks: list[Risk] = []

    candidates = [
        (
            "Prompt injection in AI copilots",
            "LLM-powered assistants are vulnerable to prompt injection that can exfiltrate data or alter outputs.",
            "High",
            ["prompt injection", "copilot", "llm"],
        ),
        (
            "Model & data poisoning",
            "Training pipelines may be exposed to tampered datasets and adversarial fine-tuning.",
            "High",
            ["poisoning", "training", "model"],
        ),
        (
            "Cloud misconfiguration in multi-tenant AI",
            "Multi-tenant AI platforms can leak across tenants when IAM and KMS policies are misaligned.",
            "Medium",
            ["cloud", "multi-tenant", "misconfiguration", "sovereign"],
        ),
        (
            "Lack of AI governance & assurance",
            "Limited evidence of formal AI risk management (NIST AI RMF, ISO 42001) for regulated buyers.",
            "Medium",
            ["governance", "compliance", "regulator"],
        ),
    ]

    for title, desc, severity, keywords in candidates:
        if any(kw in text for kw in keywords) or len(risks) < 2:
            risks.append(
                Risk(
                    id=f"r_{uuid.uuid4().hex[:6]}",
                    title=title,
                    description=desc.replace("AI", f"{company.name}'s AI"),
                    severity=severity,  # type: ignore[arg-type]
                )
            )
        if len(risks) >= 4:
            break
    return risks


async def extract_risks(company: Company, docs: list[dict[str, Any]]) -> list[Risk]:
    settings = get_settings()
    combined = "\n".join(d.get("raw_content", d.get("summary", "")) for d in docs[:8])

    if settings.llm_enabled and combined.strip():
        try:
            from langchain_openai import ChatOpenAI
            from pydantic import BaseModel, Field

            class RiskItem(BaseModel):
                title: str
                description: str
                severity: str = Field(description="Low, Medium, High, or Critical")

            class RiskList(BaseModel):
                risks: list[RiskItem]

            llm = ChatOpenAI(
                model="gpt-4o-mini", temperature=0.2, api_key=settings.openai_api_key
            ).with_structured_output(RiskList)

            result = await llm.ainvoke(
                f"Extract 3-4 AI/cybersecurity risks for {company.name} ({company.industry}):\n\n{combined[:3500]}"
            )
            return [
                Risk(
                    id=f"r_{uuid.uuid4().hex[:6]}",
                    title=r.title,
                    description=r.description,
                    severity=r.severity if r.severity in ("Low", "Medium", "High", "Critical") else "Medium",  # type: ignore[arg-type]
                )
                for r in result.risks[:4]
            ]
        except Exception:
            pass

    return _fallback_risks(company, docs)
