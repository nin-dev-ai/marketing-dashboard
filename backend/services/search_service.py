"""Web search — Tavily (news-focused) with DuckDuckGo fallback."""

from __future__ import annotations

import hashlib
from datetime import datetime, timezone
from typing import Any

from config import get_settings


def _doc_id(url: str, title: str) -> str:
    return hashlib.md5(f"{url}:{title}".encode()).hexdigest()[:12]


async def search_web(
    query: str,
    max_results: int = 5,
    *,
    topic: str | None = None,
) -> list[dict[str, Any]]:
    settings = get_settings()
    if settings.tavily_api_key:
        return await _search_tavily(
            query, max_results, settings.tavily_api_key, topic=topic
        )
    return await _search_duckduckgo(query, max_results)


async def search_company_news(company_name: str, country: str = "UAE") -> list[dict[str, Any]]:
    """Run multiple news-oriented searches for a company."""
    queries = [
        f'"{company_name}" AI news {country} last month',
        f'"{company_name}" artificial intelligence partnership OR launch OR infrastructure',
        f'"{company_name}" LLM OR "machine learning" OR sovereign cloud',
    ]
    docs: list[dict[str, Any]] = []
    seen: set[str] = set()
    for q in queries:
        for doc in await search_web(q, max_results=5, topic="news"):
            key = doc.get("url") or doc.get("id", "")
            if key and key not in seen:
                seen.add(key)
                docs.append(doc)
    return docs


async def _search_duckduckgo(query: str, max_results: int) -> list[dict[str, Any]]:
    docs: list[dict[str, Any]] = []
    try:
        from duckduckgo_search import DDGS

        with DDGS() as ddgs:
            results = list(ddgs.news(query, max_results=max_results))
        if not results:
            results = list(ddgs.text(query, max_results=max_results))
        for r in results:
            title = r.get("title", "")
            url = r.get("url", r.get("href", r.get("link", "")))
            body = r.get("body", r.get("snippet", r.get("content", "")))
            docs.append(
                {
                    "id": _doc_id(url, title),
                    "title": title,
                    "url": url,
                    "publisher": r.get("source", "Web Search"),
                    "published_at": r.get("date", datetime.now(timezone.utc).isoformat()),
                    "summary": body[:400],
                    "raw_content": f"{title} {body}"[:2000],
                    "source_type": "search",
                }
            )
    except Exception:
        pass
    return docs


async def _search_tavily(
    query: str,
    max_results: int,
    api_key: str,
    *,
    topic: str | None = None,
) -> list[dict[str, Any]]:
    docs: list[dict[str, Any]] = []
    try:
        import httpx

        payload: dict[str, Any] = {
            "api_key": api_key,
            "query": query,
            "max_results": max_results,
            "search_depth": "advanced",
            "include_answer": False,
        }
        if topic:
            payload["topic"] = topic

        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post("https://api.tavily.com/search", json=payload)
            if resp.status_code >= 400:
                return await _search_duckduckgo(query, max_results)
            data = resp.json()
        for r in data.get("results", []):
            title = r.get("title", "")
            url = r.get("url", "")
            content = r.get("content", "")
            docs.append(
                {
                    "id": _doc_id(url, title),
                    "title": title,
                    "url": url,
                    "publisher": r.get("source", "Tavily"),
                    "published_at": r.get("published_date")
                    or datetime.now(timezone.utc).isoformat(),
                    "summary": content[:400],
                    "raw_content": content[:2000],
                    "source_type": "search",
                }
            )
    except Exception:
        return await _search_duckduckgo(query, max_results)
    return docs


async def search_linkedin_signals(company_name: str) -> list[dict[str, Any]]:
    """LinkedIn via search snippets."""
    query = f'"{company_name}" site:linkedin.com (AI OR "artificial intelligence" OR partnership)'
    docs = await search_web(query, max_results=4)
    for d in docs:
        d["publisher"] = "LinkedIn (via search)"
        d["source_type"] = "linkedin_search"
    return docs
