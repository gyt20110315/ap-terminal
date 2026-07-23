"""AI service — DeepSeek-powered summarization, relevance scoring, and analysis."""

from __future__ import annotations

import json
import logging
import re
from typing import Any

import httpx

from app.config import settings
from app.engine.token_tracker import tracker as token_tracker

logger = logging.getLogger(__name__)

AI_API_URL = getattr(settings, "ai_api_url", "https://api.deepseek.com/v1/chat/completions")
AI_API_KEY = getattr(settings, "ai_api_key", "")
AI_MODEL = getattr(settings, "ai_model", "deepseek-chat")


async def _call_deepseek(
    system_prompt: str, user_prompt: str, temperature: float = 0.3,
    max_tokens: int = 800, call_type: str = "unknown",
) -> str:
    """Call DeepSeek API, return raw text, track token usage."""
    headers = {
        "Authorization": f"Bearer {AI_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": AI_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    async with httpx.AsyncClient(timeout=45.0) as client:
        resp = await client.post(AI_API_URL, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()

        # Track token usage
        usage = data.get("usage", {})
        token_tracker.record(
            call_type=call_type,
            prompt_tokens=usage.get("prompt_tokens", 0),
            completion_tokens=usage.get("completion_tokens", 0),
        )

        return data["choices"][0]["message"]["content"]


def _parse_json(text: str) -> dict[str, Any]:
    """Extract JSON from AI response."""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    m = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if m:
        try:
            return json.loads(m.group(1))
        except json.JSONDecodeError:
            pass
    m = re.search(r"\{[\s\S]*\}", text)
    if m:
        try:
            return json.loads(m.group(0))
        except json.JSONDecodeError:
            pass
    raise ValueError(f"Cannot parse JSON: {text[:200]}")


# ─── Detailed Summarization ──────────────────────────────────────

async def summarize_article_detailed(
    title: str,
    content: str | None = None,
    summary: str | None = None,
    source: str = "",
    language: str = "zh",
) -> dict[str, Any]:
    """Generate a detailed AI summary with multiple sections."""

    article_text = f"Title: {title}\nSource: {source}\n"
    if summary:
        article_text += f"Snippet: {summary}\n"
    if content:
        article_text += f"Full text (excerpt): {content[:4000]}\n"

    target = "Simplified Chinese" if language == "zh" else "English"

    prompt = f"""You are an expert AP education analyst writing for Chinese high school students and their parents. Analyze this article in {target}.

{article_text}

Return a JSON object with these fields (all in {target}):
{{
  "headline_summary": "One sentence capturing the most important takeaway (50 chars max)",
  "detailed_summary": "A comprehensive 4-6 sentence summary covering all key information. Be thorough and include specific details, numbers, dates, and names mentioned.",
  "key_points": ["5-7 specific, actionable key takeaways. Each should be one complete sentence with concrete details."],
  "background_context": "2-3 sentences explaining the broader context — why this matters, what led to this, historical background if relevant.",
  "stakeholder_impact": "How this affects: 1) AP students, 2) AP teachers, 3) parents, 4) schools/administrators. Be specific about who is impacted and how.",
  "action_items": "2-3 concrete actions that students/teachers/parents should take based on this news.",
  "sentiment": "positive, negative, neutral, or mixed",
  "credibility_note": "Brief assessment of source reliability and whether readers should verify with official sources."
}}"""

    if not AI_API_KEY:
        return _fallback_summary_detailed(title, summary, source, language)

    try:
        raw = await _call_deepseek(
            "You are an expert education analyst. Always respond with valid JSON only. Be thorough, specific, and actionable.",
            prompt, temperature=0.3, max_tokens=1200, call_type="summary_detailed",
        )
        return _parse_json(raw)
    except Exception as e:
        logger.warning("AI detailed summary failed: %s", e)
        return _fallback_summary_detailed(title, summary, source, language)


def _fallback_summary_detailed(title: str, summary: str | None, source: str, lang: str) -> dict[str, Any]:
    if lang == "zh":
        return {
            "headline_summary": title[:50],
            "detailed_summary": f"本文来自{source}，报道了：{title}。{summary or '暂无更多内容。'}",
            "key_points": [f"来源：{source}", f"核心信息：{title[:100]}", "建议查看原文获取完整详情。"],
            "background_context": "本报道属于AP/国际教育领域的最新动态。",
            "stakeholder_impact": "此信息可能对AP学生、教师和家长有参考价值，建议关注后续发展。",
            "action_items": "建议访问原文链接了解更多信息。",
            "sentiment": "neutral",
            "credibility_note": f"来源为{source}，建议结合官方渠道（College Board）核实。",
            "fallback": True,
        }
    return {
        "headline_summary": title[:50],
        "detailed_summary": f"Article from {source}: {title}. {summary or 'No additional content.'}",
        "key_points": [f"Source: {source}", f"Core info: {title[:100]}", "See original for full details."],
        "background_context": "This is recent news in the AP/international education space.",
        "stakeholder_impact": "May be relevant to AP students, teachers, and parents.",
        "action_items": "Visit the original link for more information.",
        "sentiment": "neutral",
        "credibility_note": f"Source: {source}. Verify with official College Board channels.",
        "fallback": True,
    }


# ─── Relevance Scoring for Chinese Students ──────────────────────

async def score_relevance_chinese_student(
    title: str,
    content: str | None = None,
    summary: str | None = None,
    source: str = "",
) -> dict[str, Any]:
    """Score how relevant an article is to a Chinese 高一 (10th grade) AP student."""

    article_text = f"Title: {title}\nSource: {source}\n"
    if summary:
        article_text += f"Snippet: {summary}\n"
    if content:
        article_text += f"Content: {content[:3000]}\n"

    prompt = f"""You are an education consultant specializing in Chinese high school students preparing for AP exams.

Analyze this article's relevance to a Chinese 高一 (Grade 10, ~15-16 years old) student who is considering or preparing for AP courses and exams.

{article_text}

Return a JSON object:
{{
  "relevance_score": <integer 0-100, where 0=completely irrelevant, 100=directly critical information>,
  "relevance_level": "极高" | "高" | "中等" | "低" | "极低",
  "target_grade": "最适合的年级（如：高一/高二/高三/所有年级）",
  "why_relevant": "用中文解释为什么这条信息与中国高一AP考生相关或不相关（2-3句话）",
  "affected_courses": ["受影响的AP课程简称列表"],
  "urgency": "立即关注" | "近期关注" | "一般了解" | "无需关注",
  "action_suggestion": "给学生的一条具体建议（中文，1句话）",
  "key_takeaway_for_students": "学生最需要知道的一点（中文，1句话）"
}}"""

    if not AI_API_KEY:
        return _fallback_relevance(title, summary)

    try:
        raw = await _call_deepseek(
            "You are an education consultant for Chinese students. Always respond with valid JSON only.",
            prompt, temperature=0.2, max_tokens=600, call_type="relevance_scoring",
        )
        return _parse_json(raw)
    except Exception as e:
        logger.warning("AI relevance scoring failed: %s", e)
        return _fallback_relevance(title, summary)


def _fallback_relevance(title: str, summary: str | None) -> dict[str, Any]:
    text = f"{title} {summary or ''}".lower()
    score = 50
    if any(kw in text for kw in ["ap ", "advanced placement", "college board", "ap exam", "ap course", "ap score"]):
        score = 72
    if any(kw in text for kw in ["chinese", "china", "international student", "亚太", "亚洲", "中国"]):
        score = min(100, score + 15)
    if any(kw in text for kw in ["calculus", "physics", "chemistry", "biology", "statistics", "microeconomics", "macroeconomics"]):
        score = min(100, score + 10)

    level = "极高" if score >= 85 else "高" if score >= 70 else "中等" if score >= 50 else "低" if score >= 30 else "极低"
    return {
        "relevance_score": score,
        "relevance_level": level,
        "target_grade": "所有年级",
        "why_relevant": "该新闻涉及AP/国际教育话题，与中国准备AP考试的学生有一定关联。" if score >= 50 else "该新闻与中国AP考生的直接关联较低。",
        "affected_courses": [],
        "urgency": "近期关注" if score >= 50 else "一般了解",
        "action_suggestion": "建议阅读原文了解更多细节。" if score >= 50 else "可选择性了解。",
        "key_takeaway_for_students": "关注AP考试最新动态。" if score >= 50 else "此信息对AP备考影响不大。",
        "fallback": True,
    }


# ─── Simple summarization (backward-compatible) ──────────────────

async def summarize_article(
    title: str,
    content: str | None = None,
    summary: str | None = None,
    source: str = "",
    language: str = "zh",
) -> dict[str, Any]:
    """Simple summary — delegates to detailed version."""
    result = await summarize_article_detailed(title, content, summary, source, language)
    return {
        "summary": result.get("detailed_summary", ""),
        "key_points": result.get("key_points", []),
        "ap_relevance": result.get("stakeholder_impact", ""),
        "sentiment": result.get("sentiment", "neutral"),
        "fallback": result.get("fallback", False),
    }
