"""AP Terminal — FastAPI application entry point.

Bloomberg-style real-time terminal for global AP, IELTS, TOEFL, SAT data and news.
"""

from __future__ import annotations

import asyncio
import json
import random
import time
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import os

from fastapi.staticfiles import StaticFiles

from app.api.rest.ai_features import router as ai_router
from app.api.rest.summarize import router as summarize_router
from app.api.rest.tokens import router as tokens_router
from app.api.rest.translate import router as translate_router
from app.api.ws.terminal import manager, router as ws_router
from app.config import settings
from app.engine.translate_cache import NEWS_POOL_ZH

# ═══════════════════════════════════════════════════════════════
# Simulated News Pools
# ═══════════════════════════════════════════════════════════════

AP_NEWS_POOL = [
    {"title": "College Board Announces AP Exam Schedule Changes for 2026", "source": "College Board Newsroom", "summary": "Updated exam schedules with new digital testing options for 2026 AP exams.", "keywords": ["exam schedule", "digital testing", "2026"], "ap_courses": [], "sentiment_label": "neutral", "region": "US"},
    {"title": "AP Calculus AB Sees Record Enrollment Growth of 12% in 2026", "source": "Education Week", "summary": "Enrollment in AP Calculus AB has grown 12% year-over-year, driven by expanded access programs.", "keywords": ["enrollment", "calculus", "growth", "access"], "ap_courses": ["CALC AB"], "sentiment_label": "positive", "region": "US"},
    {"title": "New Study Confirms AP Coursework Significantly Improves College Readiness", "source": "Inside Higher Ed", "summary": "Research shows AP coursework improves college readiness by 34% across all demographics.", "keywords": ["research", "college readiness", "study"], "ap_courses": [], "sentiment_label": "positive", "region": "US"},
    {"title": "r/APStudents: Ultimate Guide to Self-Studying AP Physics 1", "source": "Reddit", "summary": "Top-voted thread: students share comprehensive study strategies for AP Physics 1.", "keywords": ["physics", "study tips", "self-study", "exam prep"], "ap_courses": ["PHYS 1"], "sentiment_label": "neutral", "region": "Global"},
    {"title": "AP African American Studies Expands to All 50 US States", "source": "College Board Newsroom", "summary": "After successful pilot, the newest AP course reaches nationwide availability.", "keywords": ["african american studies", "expansion"], "ap_courses": ["AFAM STUDIES"], "sentiment_label": "positive", "region": "US"},
    {"title": "AI-Powered Study Tools Transform AP Exam Preparation Landscape", "source": "The Chronicle of Higher Education", "summary": "AI platforms are changing how students prep for AP, raising equity questions.", "keywords": ["AI", "technology", "exam prep", "equity"], "ap_courses": [], "sentiment_label": "neutral", "region": "Global"},
    {"title": "AP Computer Science Principles Surpasses Calculus AB in Popularity", "source": "Education Week", "summary": "CS Principles becomes the most popular STEM AP course, reflecting growing CS interest.", "keywords": ["computer science", "STEM", "enrollment", "trend"], "ap_courses": ["CS PRINCIPLES"], "sentiment_label": "positive", "region": "US"},
    {"title": "Top Universities Announce Major AP Credit Policy Updates for 2027", "source": "Inside Higher Ed", "summary": "Harvard, Stanford, MIT among universities expanding AP credit for scores of 4 and 5.", "keywords": ["credit policy", "universities", "admissions", "Ivy League"], "ap_courses": [], "sentiment_label": "positive", "region": "US"},
    {"title": "r/APStudents: 2026 AP Chemistry Exam Discussion & Predictions", "source": "Reddit", "summary": "Over 2,000 comments discussing the 2026 AP Chemistry exam difficulty and FRQ answers.", "keywords": ["chemistry", "exam discussion", "predictions"], "ap_courses": ["CHEM"], "sentiment_label": "mixed", "region": "Global"},
    {"title": "Global AP Program Expands: 50+ New International Schools Adopt AP", "source": "College Board Newsroom", "summary": "Schools in China, India, Singapore, and Europe increasingly offering AP courses.", "keywords": ["international", "expansion", "global", "Asia"], "ap_courses": [], "sentiment_label": "positive", "region": "Global"},
]

IELTS_NEWS_POOL = [
    {"title": "IELTS Introduces Fully Digital Testing Experience Worldwide", "source": "British Council", "summary": "IELTS launches new fully digital test format with faster score reporting (1-2 days).", "keywords": ["digital", "IELTS", "test format", "score"], "sentiment_label": "positive", "region": "Global"},
    {"title": "Australian Universities Raise IELTS Score Requirements for 2027 Intake", "source": "Times Higher Education", "summary": "Several Australian Group of Eight universities increase minimum IELTS requirements to 7.0.", "keywords": ["IELTS", "Australia", "requirements", "university"], "sentiment_label": "negative", "region": "Australia"},
    {"title": "IELTS vs TOEFL: Which Test Should Chinese Students Choose in 2026?", "source": "Study International", "summary": "Comprehensive comparison of IELTS and TOEFL for Chinese students applying abroad.", "keywords": ["IELTS", "TOEFL", "comparison", "Chinese students"], "sentiment_label": "neutral", "region": "Global"},
    {"title": "IELTS Speaking Section Gets AI-Assisted Scoring Pilot", "source": "IELTS Official", "summary": "IELTS begins piloting AI-assisted scoring for speaking sections, alongside human examiners.", "keywords": ["IELTS", "speaking", "AI", "scoring"], "sentiment_label": "neutral", "region": "Global"},
    {"title": "Top 10 IELTS Preparation Tips from Band 9 Achievers", "source": "IELTS Advantage", "summary": "Band 9 scorers share their most effective strategies and common mistakes to avoid.", "keywords": ["IELTS", "preparation", "tips", "band 9"], "sentiment_label": "positive", "region": "Global"},
    {"title": "China Sees 15% Increase in IELTS Test Takers in 2026", "source": "British Council China", "summary": "Chinese IELTS test-taker numbers surge as study-abroad demand rebounds post-pandemic.", "keywords": ["IELTS", "China", "growth", "test-takers"], "sentiment_label": "positive", "region": "China"},
    {"title": "UK Universities Accept IELTS One Skill Retake for 2026 Admissions", "source": "UCAS", "summary": "More UK universities now accept IELTS One Skill Retake results for undergraduate admissions.", "keywords": ["IELTS", "One Skill Retake", "UK", "admissions"], "sentiment_label": "positive", "region": "UK"},
    {"title": "IELTS Academic vs General Training: Updated Guide for 2026", "source": "IDP Education", "summary": "Detailed guide on choosing between IELTS Academic and General Training modules.", "keywords": ["IELTS", "Academic", "General Training", "guide"], "sentiment_label": "neutral", "region": "Global"},
]

TOEFL_NEWS_POOL = [
    {"title": "ETS Shortens TOEFL iBT to Under 2 Hours Starting July 2026", "source": "ETS Official", "summary": "TOEFL iBT test duration reduced to 1 hour 56 minutes with streamlined reading section.", "keywords": ["TOEFL", "shorter", "ETS", "test format"], "sentiment_label": "positive", "region": "Global"},
    {"title": "TOEFL iBT Score Acceptance Expands to 100% of US Universities", "source": "ETS", "summary": "TOEFL is now accepted by every US university, including those previously requiring IELTS.", "keywords": ["TOEFL", "acceptance", "US universities", "expansion"], "sentiment_label": "positive", "region": "US"},
    {"title": "TOEFL Home Edition Gains Popularity Among Chinese Test-Takers", "source": "China Daily", "summary": "More Chinese students opt for TOEFL Home Edition for convenience and scheduling flexibility.", "keywords": ["TOEFL", "Home Edition", "China", "test-takers"], "sentiment_label": "positive", "region": "China"},
    {"title": "New TOEFL Writing Task: 'Academic Discussion' Replaces Independent Essay", "source": "ETS", "summary": "TOEFL writing section revamped with new 'Writing for an Academic Discussion' task format.", "keywords": ["TOEFL", "writing", "reform", "new format"], "sentiment_label": "neutral", "region": "Global"},
    {"title": "TOEFL Score Comparison: What's a Good Score for Top 50 US Universities?", "source": "US News Education", "summary": "Analysis of TOEFL score requirements across top US universities for international students.", "keywords": ["TOEFL", "scores", "university", "requirements"], "sentiment_label": "neutral", "region": "US"},
    {"title": "TOEFL Essentials Test Discontinued by ETS — What It Means", "source": "The PIE News", "summary": "ETS discontinues TOEFL Essentials, focusing resources on TOEFL iBT improvements.", "keywords": ["TOEFL", "Essentials", "discontinued", "ETS"], "sentiment_label": "negative", "region": "Global"},
    {"title": "Japanese Universities Expand TOEFL Requirements for English-Taught Programs", "source": "Japan Times", "summary": "Growing number of Japanese universities require TOEFL for English-medium undergraduate programs.", "keywords": ["TOEFL", "Japan", "requirements", "English-taught"], "sentiment_label": "positive", "region": "Japan"},
    {"title": "TOEFL MyBest Scores: Updated Policy Guide for 2026 Applications", "source": "ETS", "summary": "Comprehensive guide to how universities use TOEFL MyBest Scores in admissions decisions.", "keywords": ["TOEFL", "MyBest Scores", "admissions", "guide"], "sentiment_label": "positive", "region": "Global"},
]

SAT_NEWS_POOL = [
    {"title": "College Board Releases Full Digital SAT Score Data: Average Up 15 Points", "source": "College Board", "summary": "First full year of digital SAT shows average scores increased by 15 points to 1075.", "keywords": ["SAT", "digital", "score", "average"], "sentiment_label": "positive", "region": "US"},
    {"title": "Digital SAT Adaptive Testing: How the Algorithm Really Works", "source": "Khan Academy", "summary": "In-depth explanation of the digital SAT's section-adaptive algorithm and scoring mechanism.", "keywords": ["SAT", "digital", "adaptive", "algorithm"], "sentiment_label": "neutral", "region": "Global"},
    {"title": "Top US Universities Reinstate SAT Requirements for 2027 Admissions", "source": "The New York Times", "summary": "Yale, Dartmouth, Brown among universities reversing test-optional policies for 2027 cycle.", "keywords": ["SAT", "required", "admissions", "Ivy League"], "sentiment_label": "positive", "region": "US"},
    {"title": "SAT Math Section Gets Harder: New Question Types for 2026-2027", "source": "College Board", "summary": "Digital SAT Math introduces more advanced algebra and data analysis question types.", "keywords": ["SAT", "math", "new questions", "harder"], "sentiment_label": "negative", "region": "Global"},
    {"title": "China SAT Test-Taker Numbers Rebound to Pre-Pandemic Levels", "source": "South China Morning Post", "summary": "Chinese SAT registrations return to 2019 levels as US study-abroad interest recovers.", "keywords": ["SAT", "China", "test-takers", "recovery"], "sentiment_label": "positive", "region": "China"},
    {"title": "Ultimate Digital SAT Prep Guide: Best Free Resources for 2026", "source": "PrepScholar", "summary": "Curated list of the best free SAT prep resources, including Bluebook, Khan Academy, and more.", "keywords": ["SAT", "preparation", "free resources", "guide"], "sentiment_label": "positive", "region": "Global"},
    {"title": "SAT vs ACT: Updated 2026 Comparison for International Students", "source": "US News", "summary": "Comprehensive SAT vs ACT comparison with updated score concordance and test format details.", "keywords": ["SAT", "ACT", "comparison", "international"], "sentiment_label": "neutral", "region": "Global"},
    {"title": "SAT Score Choice and Superscoring: Complete Strategy Guide 2026", "source": "College Board", "summary": "How to strategically use Score Choice and superscoring to maximize your college applications.", "keywords": ["SAT", "Score Choice", "superscoring", "strategy"], "sentiment_label": "positive", "region": "US"},
]

# ═══════════════════════════════════════════════════════════════
# News Generators (one per exam type)
# ═══════════════════════════════════════════════════════════════

async def _generate_news(tag: str, pool: list[dict], interval_range: tuple[float, float]) -> None:
    """Generic news generator that pulls from a pool and broadcasts on channel '{tag}'."""
    while True:
        await asyncio.sleep(random.uniform(*interval_range))

        article = dict(random.choice(pool))
        now = datetime.now(timezone.utc)
        article["published_at"] = now.isoformat()
        article["fetched_at"] = now.isoformat()
        article["exam_type"] = tag

        # Inject pre-translated Chinese title/summary
        zh = NEWS_POOL_ZH.get(article["title"], {})
        article["title_zh"] = zh.get("title_zh", article["title"])
        article["summary_zh"] = zh.get("summary_zh", article.get("summary", ""))

        # Broadcast full article (now includes title_zh + summary_zh)
        await manager.broadcast(f"news_{tag}", json.dumps(article))

        # Ticker item — use Chinese title for display
        await manager.broadcast("news_ticker", json.dumps({
            "title": article.get("title_zh", article["title"]),
            "title_en": article["title"],
            "source": article["source"],
            "sentiment": article.get("sentiment_label", "neutral"),
            "exam_type": tag,
        }))

        # Periodic trending update
        if random.random() < 0.5 and article.get("keywords"):
            await manager.broadcast(f"topics_{tag}", json.dumps({
                "topics": article["keywords"][:5],
                "timestamp": time.time(),
            }))

        # Periodic sentiment update
        if random.random() < 0.4:
            await manager.broadcast(f"sentiment_{tag}", json.dumps({
                "score": round(random.uniform(-0.4, 0.7), 3),
                "positive_ratio": round(random.uniform(0.25, 0.65), 2),
                "negative_ratio": round(random.uniform(0.1, 0.35), 2),
                "neutral_ratio": round(random.uniform(0.1, 0.4), 2),
                "timestamp": time.time(),
            }))


async def _generate_stats() -> None:
    """Periodic global stats for all exam types."""
    while True:
        await asyncio.sleep(12)
        for tag in ["ap", "ielts", "toefl", "sat"]:
            await manager.broadcast(f"stats_{tag}", json.dumps({
                "total_articles": random.randint(400, 1800),
                "articles_today": random.randint(40, 180),
                "active_sources": random.randint(5, 9),
                "exams_tracked": {"ap": 39, "ielts": 1, "toefl": 1, "sat": 1}.get(tag, 1),
                "timestamp": time.time(),
            }))
        await manager.broadcast("heartbeat", json.dumps({"ts": time.time()}))


# ═══════════════════════════════════════════════════════════════
# Lifespan
# ═══════════════════════════════════════════════════════════════

@asynccontextmanager
async def lifespan(_app: FastAPI):
    tasks = [
        asyncio.create_task(_generate_news("ap", AP_NEWS_POOL, (1.5, 4))),
        asyncio.create_task(_generate_news("ielts", IELTS_NEWS_POOL, (2, 5))),
        asyncio.create_task(_generate_news("toefl", TOEFL_NEWS_POOL, (2, 5))),
        asyncio.create_task(_generate_news("sat", SAT_NEWS_POOL, (2, 5))),
        asyncio.create_task(_generate_stats()),
    ]

    yield

    for t in tasks:
        t.cancel()
    await asyncio.gather(*tasks, return_exceptions=True)


# ═══════════════════════════════════════════════════════════════
# App
# ═══════════════════════════════════════════════════════════════

app = FastAPI(
    title="AP Terminal",
    description="Bloomberg-style real-time terminal for AP, IELTS, TOEFL, SAT.",
    version="0.3.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ws_router)
app.include_router(translate_router)
app.include_router(summarize_router)
app.include_router(tokens_router)
app.include_router(ai_router)

# Serve frontend static files in production
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")


@app.get("/api/health")
async def root():
    return {"status": "ok", "service": "AP Terminal", "version": "0.3.0"}


@app.get("/api/news")
async def get_news(limit: int = 50, exam: str = "ap"):
    return {"articles": [], "total": 0, "exam": exam, "message": "DB not yet connected"}


@app.get("/api/courses")
async def get_courses():
    courses = [
        {"name": "AP Calculus AB", "short_name": "CALC AB", "category": "Mathematics"},
        {"name": "AP Biology", "short_name": "BIO", "category": "Sciences"},
        {"name": "AP US History", "short_name": "US HISTORY", "category": "History"},
        {"name": "AP Computer Science A", "short_name": "CS A", "category": "Computer Science"},
        {"name": "AP Psychology", "short_name": "PSYCH", "category": "Social Sciences"},
    ]
    return {"courses": courses, "total": 39}
