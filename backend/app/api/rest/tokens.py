"""Token usage tracking API."""

from __future__ import annotations

from fastapi import APIRouter

from app.engine.token_tracker import tracker

router = APIRouter()


@router.get("/api/tokens")
async def get_token_usage():
    """Get current token usage summary.

    Returns total tokens consumed, estimated cost (USD), calls by type,
    and recent call history.
    """
    return tracker.summary()
