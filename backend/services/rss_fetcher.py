"""RSS feed fetcher — Google News and generic feeds."""

from __future__ import annotations

import hashlib
from datetime import datetime, timezone
from typing import Any
from urllib.parse import quote_plus

import feedparser
import httpx


def _doc_id(url: str, title: str) -> str:
    return hashlib.md5(f"{url}:{title}".encode()).hexdigest()[:12]


async def fetch_rss_feed(url: str, timeout: float = 12.0) -> list[dict[str, Any]]:
    """Fetch and parse an RSS/Atom feed URL."""
    docs: list[dict[str, Any]] = []
    try:
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
            resp = await client.get(
                url,
                headers={"User-Agent": "Mozilla/5.0 (compatible; EmitlyBot/1.0)"},
            )
            if resp.status_code >= 400:
                return docs
            parsed = feedparser.parse(resp.text)
    except Exception:
        return docs

    for entry in parsed.entries[:15]:
        title = getattr(entry, "title", "") or ""
        link = getattr(entry, "link", "") or url
        summary = getattr(entry, "summary", "") or getattr(entry, "description", "") or ""
        published = getattr(entry, "published_parsed", None) or getattr(
            entry, "updated_parsed", None
        )
        if published:
            published_at = datetime(*published[:6], tzinfo=timezone.utc).isoformat()
        else:
            published_at = datetime.now(timezone.utc).isoformat()

        docs.append(
            {
                "id": _doc_id(link, title),
                "title": title,
                "url": link,
                "publisher": parsed.feed.get("title", "RSS Feed"),
                "published_at": published_at,
                "summary": summary[:500],
                "raw_content": f"{title} {summary}"[:2000],
                "source_type": "rss",
            }
        )
    return docs


def google_news_rss_url(
    query: str,
    *,
    locale: str = "AE",
    language: str = "en",
) -> str:
    """Google News RSS — default UAE locale for dream-list companies."""
    ceid = f"{locale}:{language}"
    return (
        f"https://news.google.com/rss/search?q={quote_plus(query)}"
        f"&hl={language}&gl={locale}&ceid={ceid}"
    )


def _site_domain(website: str | None) -> str:
    if not website:
        return ""
    from urllib.parse import urlparse

    host = urlparse(website if "://" in website else f"https://{website}").netloc.lower()
    return host.removeprefix("www.")


def company_news_queries(
    company_name: str,
    country: str = "UAE",
    *,
    website: str | None = None,
    industry: str | None = None,
) -> list[str]:
    """Multiple news search queries per company."""
    quoted = f'"{company_name}"'
    domain = _site_domain(website)
    queries: list[str] = []

    if domain:
        queries.append(f"site:{domain}")

    if len(company_name.strip()) <= 5:
        industry_hint = industry or "cybersecurity"
        queries.extend(
            [
                f'{quoted} {industry_hint} {country}',
                f'{quoted} ("cyber security" OR cybersecurity OR "threat intelligence") {country}',
            ]
        )
    else:
        queries.extend(
            [
                f'{quoted} (AI OR "artificial intelligence" OR LLM OR cloud OR partnership OR launch)',
                f'"{company_name}" cybersecurity {country} AI',
                f'"{company_name}" ("cyber security" OR cybersecurity OR "threat intelligence")',
            ]
        )

    queries.append(
        f"{quoted} site:thenationalnews.com OR site:gulfnews.com OR site:wam.ae OR site:zawya.com"
    )
    return queries
