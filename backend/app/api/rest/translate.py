"""Translation API — DeepSeek AI translation with Google Translate fallback."""

from __future__ import annotations

import asyncio
import json
import logging
import re

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


class TranslateRequest(BaseModel):
    text: str
    target: str = "zh-CN"
    source: str = "auto"


class TranslateResponse(BaseModel):
    original: str
    translated: str
    source_lang: str
    target_lang: str
    method: str = "ai"  # "ai" or "google"


async def _translate_via_deepseek(text: str, target: str) -> str:
    """Use DeepSeek AI for translation."""
    target_lang = "Simplified Chinese" if target == "zh-CN" else target

    prompt = f"""Translate the following English text to {target_lang}.
Return ONLY the translated text, no explanations or notes.

Text to translate:
{text[:3000]}"""

    headers = {
        "Authorization": f"Bearer {settings.ai_api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.ai_model,
        "messages": [
            {"role": "system", "content": "You are a professional translator. Translate text accurately and naturally. Return ONLY the translated text."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.1,
        "max_tokens": 2048,
    }

    async with httpx.AsyncClient(timeout=25.0) as client:
        resp = await client.post(settings.ai_api_url, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()


@router.post("/api/translate", response_model=TranslateResponse)
async def translate_text(req: TranslateRequest):
    """Translate text to target language.

    Primary: DeepSeek AI translation (high quality, requires API key)
    Fallback: Google Translate via deep-translator

    Example:
        POST /api/translate
        {"text": "AP Calculus AB sees record enrollment", "target": "zh-CN"}
    """
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    text = req.text.strip()

    # Try DeepSeek AI first
    if settings.ai_api_key:
        try:
            result = await _translate_via_deepseek(text, req.target)
            return TranslateResponse(
                original=text,
                translated=result,
                source_lang=req.source,
                target_lang=req.target,
                method="ai",
            )
        except Exception as e:
            logger.warning("DeepSeek translation failed, trying Google: %s", e)

    # Fallback: Google Translate
    try:
        from deep_translator import GoogleTranslator
        translator = GoogleTranslator(source=req.source, target=req.target)
        result = await asyncio.wait_for(
            asyncio.to_thread(translator.translate, text),
            timeout=10.0,
        )
        return TranslateResponse(
            original=text,
            translated=result,
            source_lang=req.source,
            target_lang=req.target,
            method="google",
        )
    except asyncio.TimeoutError:
        logger.error("Google Translate timed out")
        raise HTTPException(status_code=504, detail="Translation timed out")
    except Exception as e:
        logger.error("All translation methods failed: %s", e)
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")
