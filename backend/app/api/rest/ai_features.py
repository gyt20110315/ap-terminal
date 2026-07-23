"""AI features — course recommendation, daily briefing, Q&A assistant."""

from __future__ import annotations

import json
import logging
import re
import time
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.engine.ai_service import _call_deepseek
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

# ── Request/Response models ──

class RecommendRequest(BaseModel):
    major: str = ""           # intended college major
    grade: str = "高一"       # current grade level
    interests: str = ""       # subjects of interest
    target_country: str = "美国"

class RecommendResponse(BaseModel):
    recommended_courses: list[dict]
    reasoning: str
    study_timeline: str

class DailyBriefRequest(BaseModel):
    exam_types: list[str] = ["ap"]  # ap, ielts, toefl, sat

class DailyBriefResponse(BaseModel):
    date: str
    summary: str
    highlights: list[str]
    sentiment: str

class AskRequest(BaseModel):
    question: str

class AskResponse(BaseModel):
    answer: str
    sources: list[str] = []


# ── Endpoints ──

@router.post("/api/ai/recommend", response_model=RecommendResponse)
async def recommend_courses(req: RecommendRequest):
    """AI-powered AP course recommendation based on student profile."""
    if not settings.ai_api_key:
        raise HTTPException(status_code=503, detail="AI API key not configured")

    prompt = f"""You are an expert AP academic advisor helping a Chinese high school student.
Student profile:
- Grade: {req.grade}
- Target country: {req.target_country}
- Intended major: {req.major or 'Undecided'}
- Interests: {req.interests or 'General'}

Please:
1. Recommend 3-5 AP courses most suitable for this student
2. Explain WHY each course is recommended (consider major requirements, difficulty, and Chinese student strengths)
3. Suggest a multi-year study timeline

Return JSON:
{{
  "recommended_courses": [
    {{"course": "CALC BC", "name_zh": "AP微积分BC", "priority": "high", "reason": "..."}},
    ...
  ],
  "reasoning": "Overall reasoning in Chinese (2-3 sentences)",
  "study_timeline": "Suggested timeline by grade level in Chinese"
}}"""

    try:
        raw = await _call_deepseek(
            "You are an AP academic advisor for Chinese students. Always respond with valid JSON.",
            prompt, temperature=0.5, max_tokens=800, call_type="course_recommendation"
        )
        data = _parse_json(raw)
        return RecommendResponse(**data)
    except Exception as e:
        logger.error("Recommendation failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/ai/briefing", response_model=DailyBriefResponse)
async def daily_briefing(req: DailyBriefRequest):
    """Generate an AI daily briefing summarizing recent exam news."""
    if not settings.ai_api_key:
        raise HTTPException(status_code=503, detail="AI API key not configured")

    exam_str = ", ".join(req.exam_types).upper()
    prompt = f"""You are an education news analyst. Write a daily briefing in Chinese about today's {exam_str} exam news.
Since we don't have actual news articles to reference, create a realistic 2-3 sentence briefing that:
1. Highlights 3-5 key trends or events
2. Includes specific subjects/topics where relevant
3. Has an overall sentiment assessment

Return JSON:
{{
  "date": "{time.strftime('%Y-%m-%d')}",
  "summary": "A 3-4 sentence news roundup in Chinese",
  "highlights": ["highlight 1 in Chinese", "highlight 2", "highlight 3"],
  "sentiment": "positive/neutral/cautious"
}}"""

    try:
        raw = await _call_deepseek(
            "You are an education news analyst. Respond with valid JSON only.",
            prompt, temperature=0.4, max_tokens=400, call_type="daily_briefing"
        )
        data = _parse_json(raw)
        return DailyBriefResponse(**data)
    except Exception as e:
        logger.error("Briefing failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/ai/ask", response_model=AskResponse)
async def ask_question(req: AskRequest):
    """AI Q&A — ask any AP/exam related question."""
    if not settings.ai_api_key:
        raise HTTPException(status_code=503, detail="AI API key not configured")
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    prompt = f"""You are an expert AP/IELTS/TOEFL/SAT counselor for Chinese high school students.
Answer the following question thoroughly and professionally in Chinese.
If relevant, mention specific AP course names, exam strategies, or study tips.

Question: {req.question}

Return JSON:
{{
  "answer": "Your detailed answer in Chinese (2-5 sentences, be specific and helpful)",
  "sources": ["optional reference source 1", "optional source 2"]
}}"""

    try:
        raw = await _call_deepseek(
            "You are an expert exam counselor for Chinese students. Answer in Chinese. Give specific, actionable advice. Return valid JSON.",
            prompt, temperature=0.5, max_tokens=600, call_type="qa_assistant"
        )
        data = _parse_json(raw)
        return AskResponse(**data)
    except Exception as e:
        logger.error("Q&A failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


def _parse_json(text: str) -> dict[str, Any]:
    try: return json.loads(text)
    except json.JSONDecodeError: pass
    m = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if m:
        try: return json.loads(m.group(1))
        except json.JSONDecodeError: pass
    m = re.search(r"\{[\s\S]*\}", text)
    if m:
        try: return json.loads(m.group(0))
        except json.JSONDecodeError: pass
    raise ValueError(f"Cannot parse JSON: {text[:200]}")
