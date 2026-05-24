"""Orchestrates company research — news-first, quality-filtered."""

from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from config import get_settings
from schemas.company import Company
from services.document_quality import filter_quality_documents, rank_documents
from services.rss_fetcher import company_news_queries, fetch_rss_feed, google_news_rss_url
from services.search_service import search_company_news, search_linkedin_signals
from services.web_fetcher import fetch_news_articles_from_site


def _data_dir() -> Path:
    return get_settings().data_dir


def load_sample_news(company: Company) -> list[dict[str, Any]]:
    path = _data_dir() / "sample_news.json"
    if not path.exists():
        return []
    items = json.loads(path.read_text(encoding="utf-8"))
    name_lower = company.name.lower()
    industry = company.industry or ""

    matched: list[dict[str, Any]] = []
    for item in items:
        names = [n.lower() for n in item.get("company_names", [])]
        industries = item.get("industries", [])
        if "*" in names or any(name_lower in n or n in name_lower for n in names):
            matched.append(item)
        elif "*" in industries or industry in industries:
            matched.append(item)

    if not matched:
        matched = [items[-1]] if items else []

    docs: list[dict[str, Any]] = []
    for i, item in enumerate(matched[:3]):
        offset = item.get("published_at_offset_days", i + 1)
        published_at = (datetime.now(timezone.utc) - timedelta(days=offset)).isoformat()
        docs.append(
            {
                "id": f"sample_{i}",
                "title": item["title"],
                "url": item.get("url", ""),
                "publisher": item.get("publisher", item.get("source", "Sample")),
                "published_at": published_at,
                "summary": item["summary"],
                "raw_content": item.get("raw_content", item["summary"]),
                "source_type": "sample",
            }
        )
    return docs


async def gather_research_documents(company: Company) -> list[dict[str, Any]]:
    """
    Collect AI-related news for a company.

    Priority:
    1. Google News RSS (UAE, multiple queries)
    2. Tavily / DuckDuckGo news search
    3. Company site news/blog article pages
    4. LinkedIn search snippets
    5. sample_news.json only if nothing real found
    """
    docs: list[dict[str, Any]] = []
    seen: set[str] = set()

    def add(doc: dict[str, Any]) -> None:
        key = doc.get("url") or doc.get("id", "")
        if key and key not in seen:
            seen.add(key)
            docs.append(doc)

    country = company.country or "UAE"

    # 1. Google News RSS
    for query in company_news_queries(
        company.name,
        country,
        website=company.website,
        industry=company.industry,
    ):
        rss_url = google_news_rss_url(query, locale="AE")
        for doc in await fetch_rss_feed(rss_url):
            add(doc)

    # 2. Web news search (Tavily news topic when configured)
    for doc in await search_company_news(company.name, country):
        add(doc)

    # 3. Company website — individual articles from /news, /blog, etc.
    if company.website:
        for doc in await fetch_news_articles_from_site(company.website, max_articles=6):
            add(doc)

    # 4. LinkedIn signals
    for doc in await search_linkedin_signals(company.name):
        add(doc)

    # Quality filter + rank (drop homepage titles like "ahad.io")
    quality = filter_quality_documents(
        docs,
        company.website,
        company.name,
        industry=company.industry,
        country=company.country,
    )
    ranked = rank_documents(quality)

    # 5. Sample fallback only when no real news found
    if not ranked:
        for doc in load_sample_news(company):
            add(doc)
        ranked = rank_documents(docs)

    return ranked[:20]
