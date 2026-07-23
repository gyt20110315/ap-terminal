"""NLP processing pipeline for news articles."""

from __future__ import annotations

import re
from typing import Any

from textblob import TextBlob

# AP course name mapping — maps keywords to AP course short names
AP_COURSE_KEYWORDS: dict[str, str] = {
    # Mathematics
    "calculus ab": "CALC AB",
    "calc ab": "CALC AB",
    "calculus bc": "CALC BC",
    "calc bc": "CALC BC",
    "statistics": "STATS",
    "ap stats": "STATS",
    "precalculus": "PRECALC",
    "pre calc": "PRECALC",
    # Sciences
    "biology": "BIO",
    "ap bio": "BIO",
    "chemistry": "CHEM",
    "ap chem": "CHEM",
    "physics 1": "PHYS 1",
    "physics 2": "PHYS 2",
    "physics c mechanics": "PHYS C:M",
    "physics c e&m": "PHYS C:E&M",
    "physics c electricity": "PHYS C:E&M",
    "environmental science": "ENVIRO SCI",
    "ap enviro": "ENVIRO SCI",
    "apes": "ENVIRO SCI",
    # Computer Science
    "computer science a": "CS A",
    "computer science principles": "CS PRINCIPLES",
    "ap csp": "CS PRINCIPLES",
    "ap csa": "CS A",
    # English
    "english language": "ENG LANG",
    "ap lang": "ENG LANG",
    "english literature": "ENG LIT",
    "ap lit": "ENG LIT",
    # History
    "us history": "US HISTORY",
    "apush": "US HISTORY",
    "world history": "WORLD HIST",
    "european history": "EURO HIST",
    "us government": "US GOV",
    "ap gov": "US GOV",
    "human geography": "HUMAN GEO",
    "ap hug": "HUMAN GEO",
    "african american studies": "AFAM STUDIES",
    # Social Sciences
    "psychology": "PSYCH",
    "ap psych": "PSYCH",
    "macroeconomics": "MACRO ECON",
    "macroecon": "MACRO ECON",
    "microeconomics": "MICRO ECON",
    "microecon": "MICRO ECON",
    # World Languages
    "spanish language": "SPAN LANG",
    "chinese language": "CHINESE LANG",
    "french language": "FRENCH LANG",
    "japanese language": "JAPANESE LANG",
    "german language": "GERMAN LANG",
    "italian language": "ITALIAN LANG",
    "latin": "LATIN",
    # Arts
    "art history": "ART HIST",
    "music theory": "MUSIC THEO",
    "studio art 2d": "STUDIO 2D",
    "studio art 3d": "STUDIO 3D",
    "studio art drawing": "STUDIO DRAW",
    # Capstone
    "seminar": "SEMINAR",
    "ap research": "RESEARCH",
}

# Common AP-related keywords for extraction
AP_GENERAL_KEYWORDS = [
    "college board", "ap exam", "ap test", "ap score", "ap course",
    "advanced placement", "ap credit", "ap policy", "ap curriculum",
    "ap teacher", "ap student", "ap classroom", "ap syllabus",
    "ap registration", "ap test prep", "ap tutoring", "ap workshop",
]


def analyze_sentiment(text: str) -> dict[str, Any]:
    """Analyze sentiment of text using TextBlob.

    Returns polarity (-1 to 1) and label.
    """
    if not text:
        return {"score": 0.0, "label": "neutral"}

    try:
        blob = TextBlob(text[:2000])  # Limit to first 2000 chars
        polarity = blob.sentiment.polarity

        if polarity > 0.2:
            label = "positive"
        elif polarity < -0.2:
            label = "negative"
        else:
            label = "neutral"

        return {"score": round(polarity, 4), "label": label}
    except Exception:
        return {"score": 0.0, "label": "neutral"}


def extract_ap_courses(text: str) -> list[str]:
    """Extract AP course references from text."""
    text_lower = text.lower()
    matched = set()

    for keyword, short_name in AP_COURSE_KEYWORDS.items():
        if re.search(r'\b' + re.escape(keyword) + r'\b', text_lower):
            matched.add(short_name)

    return sorted(matched)


def extract_keywords(text: str, max_keywords: int = 8) -> list[str]:
    """Extract AP-related keywords from text."""
    text_lower = text.lower()
    found = []

    for kw in AP_GENERAL_KEYWORDS:
        if kw in text_lower:
            found.append(kw)

    # If not enough AP-specific keywords, use noun phrases from TextBlob
    if len(found) < 3:
        try:
            blob = TextBlob(text[:2000])
            phrases = blob.noun_phrases[:max_keywords - len(found)]
            found.extend([p.lower() for p in phrases])
        except Exception:
            pass

    return found[:max_keywords]


def process_article(article: dict[str, Any]) -> dict[str, Any]:
    """Run full NLP pipeline on an article.

    - Sentiment analysis on title + summary
    - AP course identification
    - Keyword extraction
    """
    text = article.get("title", "")
    if article.get("summary"):
        text += ". " + article["summary"]
    if article.get("content"):
        text += ". " + article["content"][:1000]

    sentiment = analyze_sentiment(text)
    ap_courses = extract_ap_courses(text)
    keywords = extract_keywords(text)

    return {
        **article,
        "sentiment_score": sentiment["score"],
        "sentiment_label": sentiment["label"],
        "keywords": keywords,
        "ap_courses": ap_courses,
    }
