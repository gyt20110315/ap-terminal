"""Google News RSS scraper for AP-related news."""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any
from urllib.parse import quote

import feedparser
import httpx

logger = logging.getLogger(__name__)

# Google News RSS search queries for AP topics
SEARCH_QUERIES = [
    "Advanced Placement courses",
    "AP exam College Board",
    "AP test scores",
    "AP curriculum changes",
    "College Board AP program",
]

# AP course-specific queries (rotate through these)
COURSE_QUERIES = [
    "AP Calculus exam",
    "AP Biology test",
    "AP Chemistry exam",
    "AP Physics exam",
    "AP Computer Science",
    "AP US History exam",
    "AP English Language",
    "AP Psychology exam",
    "AP Statistics exam",
    "AP World History",
]


def _build_rss_url(query: str) -> str:
    """Build a Google News RSS URL for a search query."""
    encoded = quote(query)
    return f"https://news.google.com/rss/search?q={encoded}&hl=en-US&gl=US&ceid=US:en"


async def _fetch_rss(client: httpx.AsyncClient, query: str) -> list[dict[str, Any]]:
    """Fetch and parse a single Google News RSS feed."""
    url = _build_rss_url(query)
    try:
        resp = await client.get(url, timeout=15.0)
        resp.raise_for_status()
        feed = feedparser.parse(resp.text)
        articles: list[dict[str, Any]] = []
        for entry in feed.entries[:10]:
            articles.append({
                "title": entry.get("title", ""),
                "source": entry.get("source", {}).get("title", "Google News"),
                "url": entry.get("link", ""),
                "published_at": (
                    datetime(*entry.published_parsed[:6], tzinfo=timezone.utc).isoformat()
                    if hasattr(entry, "published_parsed") and entry.published_parsed
                    else datetime.now(timezone.utc).isoformat()
                ),
                "summary": entry.get("summary", ""),
                "source_url": url,
                "region": "US",
            })
        return articles
    except Exception as e:
        logger.warning("Google News RSS fetch failed for '%s': %s", query, e)
        return []


async def fetch_all_google_news(
    client: httpx.AsyncClient | None = None,
    use_course_queries: bool = False,
) -> list[dict[str, Any]]:
    """Fetch AP news from all Google News RSS queries.

    Args:
        client: Optional shared httpx client.
        use_course_queries: If True, also fetch course-specific queries.

    Returns:
        List of article dicts.
    """
    should_close = client is None
    if client is None:
        client = httpx.AsyncClient()

    try:
        queries = SEARCH_QUERIES.copy()
        if use_course_queries:
            # Pick 3 random course queries to diversify coverage
            import random
            queries.extend(random.sample(COURSE_QUERIES, 3))

        tasks = [_fetch_rss(client, q) for q in queries]
        results = await asyncio.gather(*tasks)
        articles: list[dict[str, Any]] = []
        seen_urls: set[str] = set()
        for batch in results:
            for article in batch:
                url = article.get("url", "")
                if url and url not in seen_urls:
                    seen_urls.add(url)
                    articles.append(article)
        return articles
    finally:
        if should_close:
            await client.aclose()
