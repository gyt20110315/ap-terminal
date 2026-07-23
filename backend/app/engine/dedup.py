"""Deduplication logic for news articles."""

from __future__ import annotations

import hashlib
from typing import Any


class ArticleDeduplicator:
    """Detects duplicate articles using URL and content fingerprinting."""

    def __init__(self, max_size: int = 100_000) -> None:
        self._seen_urls: set[str] = set()
        self._seen_fingerprints: set[str] = set()
        self._max_size = max_size

    def _fingerprint(self, title: str, content: str | None = None) -> str:
        """Generate a content fingerprint from title + first 500 chars of content."""
        text = title
        if content:
            text += content[:500]
        return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]

    def is_duplicate(self, article: dict[str, Any]) -> bool:
        """Check if article is a duplicate based on URL and content."""
        url = article.get("url", "")
        if url and url in self._seen_urls:
            return True

        fp = self._fingerprint(
            article.get("title", ""),
            article.get("content") or article.get("summary"),
        )
        if fp in self._seen_fingerprints:
            return True

        return False

    def mark_seen(self, article: dict[str, Any]) -> None:
        """Record an article as seen."""
        url = article.get("url", "")
        self._seen_urls.add(url)
        fp = self._fingerprint(
            article.get("title", ""),
            article.get("content") or article.get("summary"),
        )
        self._seen_fingerprints.add(fp)

        # Prune if too large
        if len(self._seen_urls) > self._max_size:
            # Keep most recent half
            self._seen_urls = set(list(self._seen_urls)[-self._max_size // 2:])
        if len(self._seen_fingerprints) > self._max_size:
            self._seen_fingerprints = set(list(self._seen_fingerprints)[-self._max_size // 2:])


deduplicator = ArticleDeduplicator()
