"""Website page fetcher — article link extraction from news/blog sections."""

from __future__ import annotations

import hashlib
import re
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup

NEWS_LIST_PATHS = ["/news", "/press", "/blog", "/insights", "/media", "/newsroom"]
ARTICLE_PATH_PATTERN = re.compile(
    r"/(news|blog|press|insights|media|article|story|post)s?/|/\d{4}/",
    re.I,
)
SKIP_EXTENSIONS = (".pdf", ".jpg", ".png", ".gif", ".zip", ".css", ".js")


def _doc_id(url: str) -> str:
    return hashlib.md5(url.encode()).hexdigest()[:12]


def _extract_text(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()
    text = soup.get_text(separator=" ", strip=True)
    return re.sub(r"\s+", " ", text)[:3000]


def _extract_title(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    og = soup.find("meta", property="og:title")
    if og and og.get("content"):
        return og["content"].strip()[:200]
    if soup.title and soup.title.string:
        return soup.title.string.strip()[:200]
    h1 = soup.find("h1")
    return h1.get_text(strip=True)[:200] if h1 else "Untitled"


def _same_site(base: str, link: str) -> bool:
    return urlparse(base).netloc.replace("www.", "") == urlparse(link).netloc.replace(
        "www.", ""
    )


def _looks_like_article_url(url: str) -> bool:
    if any(url.lower().endswith(ext) for ext in SKIP_EXTENSIONS):
        return False
    path = urlparse(url).path
    if len(path.strip("/").split("/")) < 2 and not ARTICLE_PATH_PATTERN.search(path):
        return False
    return bool(ARTICLE_PATH_PATTERN.search(path)) or len(path.strip("/").split("/")) >= 2


def _extract_article_links(html: str, page_url: str, limit: int = 8) -> list[tuple[str, str]]:
    """Return (headline, absolute_url) pairs from a listing page."""
    soup = BeautifulSoup(html, "html.parser")
    candidates: list[tuple[str, str, int]] = []
    seen: set[str] = set()

    for tag in soup.find_all(["a", "h2", "h3", "h4"]):
        if tag.name != "a":
            link = tag.find("a", href=True)
            if not link:
                continue
            headline = tag.get_text(strip=True)
            href = link.get("href", "")
        else:
            headline = tag.get_text(strip=True)
            href = tag.get("href", "")

        if not href or not headline or len(headline) < 15:
            continue
        abs_url = urljoin(page_url, href)
        if abs_url in seen or not _same_site(page_url, abs_url):
            continue
        if not _looks_like_article_url(abs_url):
            continue
        seen.add(abs_url)
        score = 10
        if ARTICLE_PATH_PATTERN.search(abs_url):
            score += 20
        candidates.append((headline[:200], abs_url, score))

    candidates.sort(key=lambda x: x[2], reverse=True)
    return [(h, u) for h, u, _ in candidates[:limit]]


async def _fetch_html(url: str, timeout: float = 12.0) -> str | None:
    try:
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
            resp = await client.get(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0 (compatible; EmitlyBot/1.0; +https://emitly.ai)"
                },
            )
            if resp.status_code >= 400:
                return None
            return resp.text
    except Exception:
        return None


async def fetch_article_page(url: str, headline_hint: str = "") -> dict[str, Any] | None:
    html = await _fetch_html(url)
    if not html:
        return None
    text = _extract_text(html)
    if len(text) < 80:
        return None
    title = _extract_title(html)
    if len(title) < 12 and headline_hint:
        title = headline_hint
    return {
        "id": _doc_id(url),
        "title": title,
        "url": url,
        "publisher": urlparse(url).netloc,
        "published_at": datetime.now(timezone.utc).isoformat(),
        "summary": text[:500],
        "raw_content": text,
        "source_type": "news_article",
    }


async def fetch_news_articles_from_site(
    base_url: str,
    max_articles: int = 6,
) -> list[dict[str, Any]]:
    """Discover individual articles from company news/blog listing pages."""
    if not base_url:
        return []
    if not base_url.startswith("http"):
        base_url = f"https://{base_url}"

    parsed = urlparse(base_url)
    root = f"{parsed.scheme}://{parsed.netloc}"
    list_urls = [urljoin(root + "/", p.lstrip("/")) for p in NEWS_LIST_PATHS]

    discovered: list[tuple[str, str]] = []
    seen_pages: set[str] = set()

    for list_url in list_urls:
        if list_url in seen_pages:
            continue
        seen_pages.add(list_url)
        html = await _fetch_html(list_url)
        if not html:
            continue
        for headline, article_url in _extract_article_links(html, list_url, limit=6):
            if article_url not in {u for _, u in discovered}:
                discovered.append((headline, article_url))
        if len(discovered) >= max_articles:
            break

    docs: list[dict[str, Any]] = []
    for headline, article_url in discovered[:max_articles]:
        doc = await fetch_article_page(article_url, headline_hint=headline)
        if doc:
            docs.append(doc)
    return docs
