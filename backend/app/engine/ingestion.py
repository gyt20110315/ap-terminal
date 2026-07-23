"""Ingestion scheduler — orchestrates all scrapers and broadcasts results."""

from __future__ import annotations

import asyncio
import json
import logging
import random
import time
from datetime import datetime, timezone

import httpx

from app.api.ws.terminal import manager
from app.engine.dedup import deduplicator
from app.engine.processing import process_article
from app.engine.scrapers.edu_rss import fetch_all_edu_rss
from app.engine.scrapers.google_news import fetch_all_google_news
from app.engine.scrapers.reddit import fetch_all_reddit

logger = logging.getLogger(__name__)


class IngestionScheduler:
    """Orchestrates periodic scraping of all data sources and broadcasts results."""

    def __init__(self) -> None:
        self._running = False
        self._tasks: list[asyncio.Task] = []
        self._client: httpx.AsyncClient | None = None
        self._articles_ingested: int = 0
        self._articles_today: int = 0
        self._last_edu_fetch: float = 0
        self._last_cb_fetch: float = 0

    async def start(self) -> None:
        """Start all ingestion tasks."""
        self._running = True
        self._client = httpx.AsyncClient(
            timeout=httpx.Timeout(20.0),
            follow_redirects=True,
        )

        # Start periodic scrapers
        self._tasks = [
            asyncio.create_task(self._run_high_frequency()),
            asyncio.create_task(self._run_medium_frequency()),
            asyncio.create_task(self._run_low_frequency()),
            asyncio.create_task(self._run_stats_updater()),
        ]
        logger.info("Ingestion scheduler started with %d tasks", len(self._tasks))

    async def stop(self) -> None:
        """Stop all ingestion tasks."""
        self._running = False
        for task in self._tasks:
            task.cancel()
        if self._client:
            await self._client.aclose()
        logger.info("Ingestion scheduler stopped. Total ingested: %d", self._articles_ingested)

    async def _run_high_frequency(self) -> None:
        """Fetch high-frequency sources every 30 seconds."""
        while self._running:
            try:
                # Reddit — most real-time social data
                logger.debug("Fetching Reddit...")
                articles = await fetch_all_reddit(self._client)
                await self._process_batch(articles, "Reddit")
            except Exception as e:
                logger.error("High-frequency fetch error: %s", e)
            await asyncio.sleep(30)

    async def _run_medium_frequency(self) -> None:
        """Fetch medium-frequency sources every 60-90 seconds."""
        while self._running:
            try:
                # Google News RSS
                logger.debug("Fetching Google News RSS...")
                articles = await fetch_all_google_news(
                    self._client, use_course_queries=(random.random() < 0.5)
                )
                await self._process_batch(articles, "Google News")
            except Exception as e:
                logger.error("Medium-frequency fetch error: %s", e)
            await asyncio.sleep(random.uniform(60, 90))

    async def _run_low_frequency(self) -> None:
        """Fetch low-frequency sources every 5 minutes."""
        while self._running:
            try:
                # Education RSS feeds
                logger.debug("Fetching education RSS feeds...")
                articles = await fetch_all_edu_rss(self._client)
                await self._process_batch(articles, "Education RSS")
            except Exception as e:
                logger.error("Low-frequency fetch error: %s", e)
            await asyncio.sleep(300)

    async def _run_stats_updater(self) -> None:
        """Update global stats every 30 seconds."""
        while self._running:
            try:
                await manager.broadcast("stats", json.dumps({
                    "total_articles": self._articles_ingested,
                    "articles_today": self._articles_today,
                    "active_sources": 7,
                    "courses_tracked": 39,
                    "timestamp": time.time(),
                }))
                await manager.broadcast("heartbeat", json.dumps({"ts": time.time()}))
            except Exception:
                pass
            await asyncio.sleep(30)

    async def _process_batch(self, articles: list[dict], source_label: str) -> None:
        """Process a batch of articles: dedup, NLP, broadcast, count."""
        new_count = 0
        for article in articles:
            if deduplicator.is_duplicate(article):
                continue
            deduplicator.mark_seen(article)

            # NLP processing
            processed = process_article(article)
            processed["source"] = processed.get("source", source_label)
            processed["fetched_at"] = datetime.now(timezone.utc).isoformat()

            # Broadcast to all WebSocket clients
            await manager.broadcast("news", json.dumps(processed))
            await manager.broadcast("news_ticker", json.dumps({
                "title": processed["title"],
                "source": processed["source"],
                "sentiment": processed.get("sentiment_label", "neutral"),
            }))

            # Update trending topics periodically
            if processed.get("keywords") and random.random() < 0.3:
                topics = {"topics": processed["keywords"][:5], "timestamp": time.time()}
                await manager.broadcast("topics", json.dumps(topics))

            new_count += 1

        if new_count > 0:
            self._articles_ingested += new_count
            self._articles_today += new_count
            logger.info(
                "Ingested %d new articles from %s (total: %d)",
                new_count, source_label, self._articles_ingested,
            )


# Global instance
scheduler = IngestionScheduler()
