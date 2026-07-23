"""Education news RSS feeders — Education Week, Inside Higher Ed, etc."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

import asyncio
import feedparser
import httpx

logger = logging.getLogger(__name__)

# Education RSS feeds
RSS_FEEDS = [
    {
        "name": "Education Week",
        "url": "https://www.edweek.org/feeds/all-articles",
    },
    {
        "name": "Inside Higher Ed",
        "url": "https://www.insidehighered.com/feed",
    },
    {
        "name": "The Chronicle of Higher Education",
        "url": "https://www.chronicle.com/feed",
    },
]

# Advanced Placement specific RSS feeds
AP_RSS_FEEDS = [
    {
        "name": "Education Week — College & Workforce Readiness",
        "url": "https://www.edweek.org/feeds/topics/college-workforce-readiness",
    },
]


async def _fetch_single_feed(
    client: httpx.AsyncClient, feed_info: dict[str, str]
) -> list[dict[str, Any]]:
    """Fetch and parse a single RSS feed."""
    try:
        resp = await client.get(feed_info["url"], timeout=15.0)
        resp.raise_for_status()
        feed = feedparser.parse(resp.text)
        articles: list[dict[str, Any]] = []
        for entry in feed.entries[:15]:
            title = entry.get("title", "")
            summary = entry.get("summary", entry.get("description", ""))

            # Filter for AP/education related content
            text = f"{title} {summary}".lower()
            is_ap_related = any(kw in text for kw in [
                "advanced placement", "ap exam", "ap course", "ap test",
                "college board", "ap score", "ap credit", "ap program",
                "high school", "curriculum", "standardized test",
            ])

            if not is_ap_related:
                continue

            published = (
                datetime(*entry.published_parsed[:6], tzinfo=timezone.utc).isoformat()
                if hasattr(entry, "published_parsed") and entry.published_parsed
                else datetime.now(timezone.utc).isoformat()
            )

            articles.append({
                "title": title,
                "source": feed_info["name"],
                "url": entry.get("link", ""),
                "published_at": published,
                "summary": summary[:500] if summary else title,
                "source_url": feed_info["url"],
                "region": "US",
            })
        return articles
    except Exception as e:
        logger.warning("RSS fetch failed for %s: %s", feed_info["name"], e)
        return []


async def fetch_all_edu_rss(
    client: httpx.AsyncClient | None = None,
) -> list[dict[str, Any]]:
    """Fetch articles from all education RSS feeds."""
    should_close = client is None
    if client is None:
        client = httpx.AsyncClient()

    try:
        all_feeds = RSS_FEEDS + AP_RSS_FEEDS
        tasks = [_fetch_single_feed(client, f) for f in all_feeds]
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
