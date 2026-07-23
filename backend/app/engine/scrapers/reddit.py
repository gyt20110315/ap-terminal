"""Reddit API scraper for r/APStudents and related subreddits."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

import asyncio
import httpx

logger = logging.getLogger(__name__)

# Subreddits to monitor
SUBREDDITS = [
    "APStudents",
    "APTeachers",
    "ApplyingToCollege",
    "college",
]

# Common Reddit user-agent
USER_AGENT = "AP-Terminal/0.1.0 (educational research tool)"


async def _fetch_subreddit(
    client: httpx.AsyncClient, subreddit: str, sort: str = "new", limit: int = 25
) -> list[dict[str, Any]]:
    """Fetch posts from a subreddit using the JSON API (no auth required)."""
    url = f"https://www.reddit.com/r/{subreddit}/{sort}.json?limit={limit}"
    headers = {"User-Agent": USER_AGENT}
    try:
        resp = await client.get(url, headers=headers, timeout=15.0)
        resp.raise_for_status()
        data = resp.json()
        posts: list[dict[str, Any]] = []
        for child in data.get("data", {}).get("children", []):
            post = child["data"]
            title = post.get("title", "")
            selftext = post.get("selftext", "")

            # Only include AP-related posts
            title_lower = title.lower()
            selftext_lower = selftext.lower()
            is_ap_related = any(kw in title_lower or kw in selftext_lower for kw in [
                "ap ", "advanced placement", "college board", "ap exam",
                "ap test", "ap class", "ap course", "ap chem", "ap bio",
                "ap calc", "ap physics", "apush", "ap gov", "ap lang",
                "ap lit", "ap stats", "ap psych", "ap cs", "ap csp",
                "ap csa", "ap world", "ap euro", "ap enviro", "ap hug",
                "ap music", "ap art", "ap spanish", "ap french", "ap chinese",
            ])

            if not is_ap_related and subreddit != "APStudents":
                continue

            created = datetime.fromtimestamp(post["created_utc"], tz=timezone.utc)
            posts.append({
                "title": title,
                "source": f"Reddit r/{subreddit}",
                "url": f"https://reddit.com{post.get('permalink', '')}",
                "published_at": created.isoformat(),
                "summary": selftext[:300] if selftext else title,
                "content": selftext[:1000] if selftext else None,
                "source_url": url,
                "region": "Global",
            })
        return posts
    except Exception as e:
        logger.warning("Reddit fetch failed for r/%s: %s", subreddit, e)
        return []


async def fetch_all_reddit(
    client: httpx.AsyncClient | None = None,
) -> list[dict[str, Any]]:
    """Fetch AP-related posts from all monitored subreddits."""
    should_close = client is None
    if client is None:
        client = httpx.AsyncClient()

    try:
        tasks = [_fetch_subreddit(client, sub) for sub in SUBREDDITS]
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
