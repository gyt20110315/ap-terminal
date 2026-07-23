"""AI Summarization & Relevance Scoring API endpoints."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator

from app.engine.ai_service import (
    score_relevance_chinese_student,
    summarize_article_detailed,
)

logger = logging.getLogger(__name__)

router = APIRouter()


class SummarizeRequest(BaseModel):
    title: str
    content: str | None = None
    summary: str | None = None
    source: str = ""
    language: str = "zh"


class SummarizeResponse(BaseModel):
    headline_summary: str = ""
    detailed_summary: str = ""
    key_points: list[str] = []
    background_context: str = ""
    stakeholder_impact: str = ""
    action_items: str | list[str] = ""
    sentiment: str = "neutral"
    credibility_note: str = ""
    fallback: bool = False

    @field_validator("action_items", mode="before")
    @classmethod
    def coerce_action_items(cls, v: object) -> str:
        if v is None: return ""
        if isinstance(v, list): return "; ".join(str(x) for x in v)
        return str(v)

    @field_validator("key_points", mode="before")
    @classmethod
    def coerce_key_points(cls, v: object) -> list[str]:
        if v is None: return []
        if isinstance(v, str): return [v]
        if isinstance(v, list): return [str(x) for x in v]
        return []


class RelevanceRequest(BaseModel):
    title: str
    content: str | None = None
    summary: str | None = None
    source: str = ""


class RelevanceResponse(BaseModel):
    relevance_score: int
    relevance_level: str
    target_grade: str
    why_relevant: str
    affected_courses: list[str] = []
    urgency: str
    action_suggestion: str
    key_takeaway_for_students: str
    fallback: bool = False


@router.post("/api/summarize", response_model=SummarizeResponse)
async def summarize(req: SummarizeRequest):
    """Generate a detailed AI summary of an AP/news article."""
    if not req.title.strip():
        raise HTTPException(status_code=400, detail="Title cannot be empty")
    try:
        result = await summarize_article_detailed(
            title=req.title, content=req.content,
            summary=req.summary, source=req.source, language=req.language,
        )
        return SummarizeResponse(**result)
    except Exception as e:
        logger.error("Summarization failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/relevance", response_model=RelevanceResponse)
async def relevance(req: RelevanceRequest):
    """Score how relevant an article is to Chinese 高一 AP students (0-100)."""
    if not req.title.strip():
        raise HTTPException(status_code=400, detail="Title cannot be empty")
    try:
        result = await score_relevance_chinese_student(
            title=req.title, content=req.content,
            summary=req.summary, source=req.source,
        )
        return RelevanceResponse(**result)
    except Exception as e:
        logger.error("Relevance scoring failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
