"""Filter low-quality research documents (homepage titles, bare domains, etc.)."""

from __future__ import annotations

import re
from typing import Any
from urllib.parse import urlparse

MIN_TITLE_LEN = 12
MIN_SUMMARY_LEN = 40

# Paths that suggest a real article, not a listing/homepage
ARTICLE_PATH_HINTS = (
    "/news/",
    "/blog/",
    "/press/",
    "/article/",
    "/insights/",
    "/media/",
    "/story/",
    "/stories/",
    "/post/",
    "/posts/",
    "/2024/",
    "/2025/",
    "/2026/",
)


def _normalize_host(url: str) -> str:
    if not url:
        return ""
    host = urlparse(url if "://" in url else f"https://{url}").netloc.lower()
    return host.removeprefix("www.")


def _title_looks_like_domain(title: str, url: str) -> bool:
    t = title.strip().lower().rstrip("|").strip()
    if not t:
        return True
    host = _normalize_host(url)
    if not host:
        return False
    bare = t.replace("https://", "").replace("http://", "").replace("www.", "")
    if bare == host or bare == f"{host}/":
        return True
    # "Core42 | Sovereign AI" on homepage is OK if long enough; "ahad.io" is not
    if "." in bare and " " not in bare and len(bare) < 25:
        return True
    return False


def _is_homepage_url(url: str) -> bool:
    if not url:
        return True
    parsed = urlparse(url)
    path = (parsed.path or "/").rstrip("/")
    return path in ("", "/")


def _has_article_path(url: str) -> bool:
    lower = url.lower()
    return any(h in lower for h in ARTICLE_PATH_HINTS)


def _company_tokens(company_name: str) -> list[str]:
    """Significant tokens from company name for relevance matching."""
    stop = {"the", "and", "uae", "inc", "llc", "ltd", "holding", "group"}
    tokens = re.findall(r"[a-z0-9]+", company_name.lower())
    return [t for t in tokens if len(t) >= 3 and t not in stop]


def _is_ambiguous_short_name(company_name: str) -> bool:
    tokens = _company_tokens(company_name)
    return len(tokens) == 1 and len(tokens[0]) <= 5


def _domain_in_url(url: str, website: str | None) -> bool:
    if not website or not url:
        return False
    host = _normalize_host(website)
    doc_host = _normalize_host(url)
    if not host or not doc_host:
        return False
    return doc_host == host or doc_host.endswith(f".{host}")


def _business_context_terms(industry: str | None = None, country: str | None = None) -> list[str]:
    terms = [
        "cybersecurity",
        "cyber security",
        "threat intelligence",
        "artificial intelligence",
        " ai ",
        "cloud",
        "enterprise",
        "startup",
        "funding",
        "partnership",
        "launch",
        "security",
        "defense",
        "defence",
    ]
    if industry:
        terms.extend(re.findall(r"[a-z0-9]{4,}", industry.lower()))
    if country:
        terms.extend(re.findall(r"[a-z0-9]{3,}", country.lower()))
    return list(dict.fromkeys(terms))


def _looks_like_person_name_match(text: str, token: str) -> bool:
    """Reject 'Abdul Ahad', 'Badia Ahad' style person-name hits for short brands."""
    if re.search(rf"\b{re.escape(token)}\s+(?:cyber|security|group|systems|labs|technologies)\b", text, re.I):
        return False
    return bool(
        re.search(rf"\b[a-z]{{2,}}\s+{re.escape(token)}\b", text, re.I)
        and not re.search(rf"^{re.escape(token)}\b", text.strip(), re.I)
    )


def is_relevant_to_company(
    doc: dict[str, Any],
    company_name: str,
    *,
    company_website: str | None = None,
    industry: str | None = None,
    country: str | None = None,
) -> bool:
    """RSS/search hits must mention the company; on-domain articles are always relevant."""
    url = doc.get("url", "")
    if company_website and _domain_in_url(url, company_website):
        return True

    if doc.get("source_type") == "sample":
        return True

    title = (doc.get("title") or "").strip()
    hay = f"{title} {doc.get('summary', '')} {doc.get('raw_content', '')}".lower()
    name_lower = company_name.lower()
    tokens = _company_tokens(company_name)

    if _is_ambiguous_short_name(company_name):
        token = tokens[0]
        title_lower = title.lower()
        if token not in title_lower and token not in hay:
            return False
        if _looks_like_person_name_match(title_lower, token):
            return False
        context = _business_context_terms(industry, country)
        if any(term in hay for term in context):
            return True
        return bool(
            re.search(
                rf"\b{re.escape(token)}\b.*\b(launch|partner|fund|raise|appoint|secures|wins|opens)\b",
                hay,
                re.I,
            )
        )

    if name_lower in hay:
        return True

    if not tokens:
        return True

    distinctive = [t for t in tokens if len(t) >= 4]
    check = distinctive or tokens
    return any(t in hay for t in check)


def is_quality_document(doc: dict[str, Any], company_website: str | None = None) -> bool:
    """Return True if doc looks like a real news/article signal."""
    title = (doc.get("title") or "").strip()
    summary = (doc.get("summary") or doc.get("raw_content") or "").strip()
    url = doc.get("url") or ""
    source_type = doc.get("source_type", "")

    if len(title) < MIN_TITLE_LEN:
        return False

    if _title_looks_like_domain(title, url):
        return False

    # RSS, search, tavily, linkedin — trust if title is reasonable
    if source_type in ("rss", "search", "linkedin_search", "sample", "news_article"):
        return len(summary) >= 20 or len(title) >= 20

    # Website-sourced: require article-like URL or substantial summary
    if source_type == "website":
        if _is_homepage_url(url):
            company_host = _normalize_host(company_website or "")
            doc_host = _normalize_host(url)
            if company_host and doc_host == company_host:
                return False
        if _has_article_path(url):
            return len(summary) >= MIN_SUMMARY_LEN
        return len(summary) >= 120

    return len(summary) >= MIN_SUMMARY_LEN


def filter_quality_documents(
    docs: list[dict[str, Any]],
    company_website: str | None = None,
    company_name: str | None = None,
    *,
    industry: str | None = None,
    country: str | None = None,
) -> list[dict[str, Any]]:
    out = [d for d in docs if is_quality_document(d, company_website)]
    if company_name:
        out = [
            d
            for d in out
            if is_relevant_to_company(
                d,
                company_name,
                company_website=company_website,
                industry=industry,
                country=country,
            )
        ]
    return out


def rank_documents(docs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Prefer RSS/search/article pages over generic website pages."""

    def score(doc: dict[str, Any]) -> int:
        s = 0
        st = doc.get("source_type", "")
        url = doc.get("url", "")
        if st == "rss":
            s += 50
        elif st in ("search", "linkedin_search"):
            s += 40
        elif st == "news_article":
            s += 45
        if _has_article_path(url):
            s += 30
        if not _is_homepage_url(url):
            s += 10
        s += min(len(doc.get("summary", "")), 200) // 20
        return s

    return sorted(docs, key=score, reverse=True)
