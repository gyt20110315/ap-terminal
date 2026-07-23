"""Auto-translation cache — translates news titles/summaries to Chinese via Google Translate.

Zero token cost. Translations are cached in memory and used by news generators.
"""

from __future__ import annotations

import asyncio
import logging

logger = logging.getLogger(__name__)

# In-memory cache: English text → Chinese translation
_cache: dict[str, str] = {}


async def translate_to_chinese(text: str) -> str:
    """Translate English text to Simplified Chinese using Google Translate.

    Results are cached in memory. Falls back to original text on failure.
    """
    if not text or not text.strip():
        return text

    key = text.strip()
    if key in _cache:
        return _cache[key]

    # Try Google Translate via deep-translator (free)
    try:
        from deep_translator import GoogleTranslator
        translator = GoogleTranslator(source="en", target="zh-CN")
        result = await asyncio.wait_for(
            asyncio.to_thread(translator.translate, key),
            timeout=8.0,
        )
        _cache[key] = result
        logger.debug("Translated: %s → %s", key[:40], result[:40])
        return result
    except asyncio.TimeoutError:
        logger.debug("Translation timed out for: %s", key[:40])
    except Exception as e:
        logger.debug("Translation error: %s", e)

    # Fall back to original
    _cache[key] = key
    return key


async def translate_article_fields(article: dict) -> dict:
    """Add title_zh and summary_zh fields to an article dict.

    Translates title and summary to Chinese via Google Translate (cached).
    """
    article["title_zh"] = await translate_to_chinese(article.get("title", ""))
    if article.get("summary"):
        article["summary_zh"] = await translate_to_chinese(article["summary"])
    return article


# Pre-translated news pool — maps English → Chinese for all news templates
# These are hand-crafted natural Chinese translations (not machine-translated)
NEWS_POOL_ZH: dict[str, dict[str, str]] = {
    # ── AP ──
    "College Board Announces AP Exam Schedule Changes for 2026": {
        "title_zh": "美国大学理事会公布2026年AP考试时间调整方案",
        "summary_zh": "2026年AP考试推出全新数字化考试选项，考试时间安排有所调整。",
    },
    "AP Calculus AB Sees Record Enrollment Growth of 12% in 2026": {
        "title_zh": "AP微积分AB报考人数创纪录，2026年增长12%",
        "summary_zh": "得益于扩招政策，AP微积分AB的选修人数同比增长12%，创历史新高。",
    },
    "New Study Confirms AP Coursework Significantly Improves College Readiness": {
        "title_zh": "最新研究证实：AP课程显著提升大学入学准备度",
        "summary_zh": "研究表明，AP课程使学生大学准备度提升34%，覆盖各族裔群体。",
    },
    "r/APStudents: Ultimate Guide to Self-Studying AP Physics 1": {
        "title_zh": "Reddit热帖：AP物理1自学完全指南",
        "summary_zh": "高赞帖子汇集了AP物理1自学备考的全面攻略和实用技巧。",
    },
    "AP African American Studies Expands to All 50 US States": {
        "title_zh": "AP非裔美国人研究课程扩展至全美50个州",
        "summary_zh": "经过成功试点，这门最新的AP课程正式面向全美开放。",
    },
    "AI-Powered Study Tools Transform AP Exam Preparation Landscape": {
        "title_zh": "AI学习工具正在改变AP备考格局",
        "summary_zh": "人工智能平台正在重塑AP备考方式，同时也引发了关于教育公平的讨论。",
    },
    "AP Computer Science Principles Surpasses Calculus AB in Popularity": {
        "title_zh": "AP计算机科学原理超越微积分AB，成为最受欢迎的STEM科目",
        "summary_zh": "CS Principles报考人数超过Calculus AB，反映出计算机科学教育的持续升温。",
    },
    "Top Universities Announce Major AP Credit Policy Updates for 2027": {
        "title_zh": "顶尖大学公布2027年AP学分认定重大调整",
        "summary_zh": "哈佛、斯坦福、MIT等名校扩大了对4分和5分AP成绩的学分认可范围。",
    },
    "r/APStudents: 2026 AP Chemistry Exam Discussion & Predictions": {
        "title_zh": "Reddit热议：2026年AP化学考试讨论与预测",
        "summary_zh": "超过2000条评论，讨论AP化学考试难度和简答题答案。",
    },
    "Global AP Program Expands: 50+ New International Schools Adopt AP": {
        "title_zh": "全球AP项目持续扩张：50多所国际学校新加入",
        "summary_zh": "中国、印度、新加坡和欧洲的国际学校纷纷开设AP课程。",
    },

    # ── IELTS ──
    "IELTS Introduces Fully Digital Testing Experience Worldwide": {
        "title_zh": "雅思全球推出全数字化考试体验",
        "summary_zh": "雅思推出全新数字化考试模式，成绩出具时间缩短至1-2天。",
    },
    "Australian Universities Raise IELTS Score Requirements for 2027 Intake": {
        "title_zh": "澳大利亚多所大学提高2027年入学雅思分数要求",
        "summary_zh": "澳洲八校联盟中多所大学将最低雅思要求提高至7.0分。",
    },
    "IELTS vs TOEFL: Which Test Should Chinese Students Choose in 2026?": {
        "title_zh": "雅思 vs 托福：2026年中国学生该如何选择？",
        "summary_zh": "全面对比雅思和托福考试，为中国留学生提供选考建议。",
    },
    "IELTS Speaking Section Gets AI-Assisted Scoring Pilot": {
        "title_zh": "雅思口语部分启动AI辅助评分试点",
        "summary_zh": "雅思开始试点人工智能辅助口语评分，与人工考官并行使用。",
    },
    "Top 10 IELTS Preparation Tips from Band 9 Achievers": {
        "title_zh": "雅思9分学霸分享：十大备考秘诀",
        "summary_zh": "满分考生分享最有效的备考策略和常见误区。",
    },
    "China Sees 15% Increase in IELTS Test Takers in 2026": {
        "title_zh": "2026年中国雅思考生人数增长15%",
        "summary_zh": "随着出国留学需求回暖，中国雅思考生数量大幅回升。",
    },
    "UK Universities Accept IELTS One Skill Retake for 2026 Admissions": {
        "title_zh": "英国大学2026年起接受雅思单科重考成绩",
        "summary_zh": "更多英国大学开始接受雅思单科重考成绩用于本科申请。",
    },
    "IELTS Academic vs General Training: Updated Guide for 2026": {
        "title_zh": "2026年最新指南：雅思学术类 vs 培训类如何选择",
        "summary_zh": "详解雅思学术类和培训类考试的区别及选考建议。",
    },

    # ── TOEFL ──
    "ETS Shortens TOEFL iBT to Under 2 Hours Starting July 2026": {
        "title_zh": "ETS宣布：2026年7月起托福iBT考试缩短至2小时以内",
        "summary_zh": "托福iBT考试时长缩减至1小时56分钟，阅读部分精简优化。",
    },
    "TOEFL iBT Score Acceptance Expands to 100% of US Universities": {
        "title_zh": "托福成绩被100%美国大学认可",
        "summary_zh": "托福现已被所有美国大学接受，包括此前仅认可雅思的院校。",
    },
    "TOEFL Home Edition Gains Popularity Among Chinese Test-Takers": {
        "title_zh": "托福家考版在中国考生中越来越受欢迎",
        "summary_zh": "越来越多的中国学生选择托福家考版，看中其便捷性和灵活的考试时间。",
    },
    "New TOEFL Writing Task: 'Academic Discussion' Replaces Independent Essay": {
        "title_zh": "托福写作全新改版：「学术讨论」题型取代独立写作",
        "summary_zh": "托福写作部分推出「学术讨论」新题型，更贴近真实课堂场景。",
    },
    "TOEFL Score Comparison: What's a Good Score for Top 50 US Universities?": {
        "title_zh": "托福多少分够申美国前50名校？最新分数对标分析",
        "summary_zh": "详解美国前50大学对国际学生的托福成绩要求。",
    },
    "TOEFL Essentials Test Discontinued by ETS — What It Means": {
        "title_zh": "ETS宣布停办TOEFL Essentials考试，这意味着什么？",
        "summary_zh": "ETS停办Essentials考试，将资源集中用于iBT考试的改进。",
    },
    "Japanese Universities Expand TOEFL Requirements for English-Taught Programs": {
        "title_zh": "日本大学扩大英语授课项目的托福要求",
        "summary_zh": "越来越多日本大学的英语授课本科项目要求提交托福成绩。",
    },
    "TOEFL MyBest Scores: Updated Policy Guide for 2026 Applications": {
        "title_zh": "2026年托福MyBest Scores最新政策解读",
        "summary_zh": "全面解析各大学在招生中如何使用托福拼分成绩。",
    },

    # ── SAT ──
    "College Board Releases Full Digital SAT Score Data: Average Up 15 Points": {
        "title_zh": "College Board发布首年机考SAT成绩数据：平均分上涨15分",
        "summary_zh": "机考SAT首个完整年度数据显示，平均成绩提高到1075分。",
    },
    "Digital SAT Adaptive Testing: How the Algorithm Really Works": {
        "title_zh": "机考SAT自适应系统深度解析：算法到底如何运作？",
        "summary_zh": "深入解析机考SAT的分段自适应算法和评分机制。",
    },
    "Top US Universities Reinstate SAT Requirements for 2027 Admissions": {
        "title_zh": "顶尖美国大学恢复2027年秋季SAT强制要求",
        "summary_zh": "耶鲁、达特茅斯、布朗等名校在2027申请季取消标化可选政策。",
    },
    "SAT Math Section Gets Harder: New Question Types for 2026-2027": {
        "title_zh": "SAT数学难度升级：2026-2027年新增高难度题型",
        "summary_zh": "机考SAT数学部分引入更高级的代数与数据分析题型。",
    },
    "China SAT Test-Taker Numbers Rebound to Pre-Pandemic Levels": {
        "title_zh": "中国SAT考生数量回升至疫情前水平",
        "summary_zh": "随着赴美留学热情恢复，中国SAT报名人数回到2019年水平。",
    },
    "Ultimate Digital SAT Prep Guide: Best Free Resources for 2026": {
        "title_zh": "2026年机考SAT终极备考指南：最佳免费资源汇总",
        "summary_zh": "精选最佳免费SAT备考资源，包括Bluebook、Khan Academy等平台。",
    },
    "SAT vs ACT: Updated 2026 Comparison for International Students": {
        "title_zh": "SAT vs ACT：2026年国际学生最新对比指南",
        "summary_zh": "全面更新SAT与ACT对比，含最新分数换算表和考试形式详解。",
    },
    "SAT Score Choice and Superscoring: Complete Strategy Guide 2026": {
        "title_zh": "2026年SAT送分策略与拼分机制完全指南",
        "summary_zh": "详解如何利用Score Choice和Superscoring最大化申请竞争力。",
    },
}
