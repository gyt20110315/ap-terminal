"""News article ORM model."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Float, Index, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, TIMESTAMPTZ
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class NewsArticle(Base):
    __tablename__ = "news_articles"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    source: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    source_url: Mapped[str | None] = mapped_column(Text)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    content: Mapped[str | None] = mapped_column(Text)
    summary: Mapped[str | None] = mapped_column(Text)
    url: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    published_at: Mapped[datetime] = mapped_column(
        TIMESTAMPTZ(timezone=True), nullable=False, default=datetime.utcnow
    )
    fetched_at: Mapped[datetime] = mapped_column(
        TIMESTAMPTZ(timezone=True), nullable=False, default=datetime.utcnow
    )
    sentiment_score: Mapped[float | None] = mapped_column(Float)
    sentiment_label: Mapped[str | None] = mapped_column(String(20))
    keywords: Mapped[list[str] | None] = mapped_column(ARRAY(String))
    ap_courses: Mapped[list[str] | None] = mapped_column(ARRAY(String))
    region: Mapped[str | None] = mapped_column(String(100))
    language: Mapped[str] = mapped_column(String(10), default="en")

    __table_args__ = (
        Index("idx_news_published", "published_at", postgresql_using="btree"),
    )
