"""User Alert ORM models."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, TIMESTAMPTZ
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.news import Base


class UserAlert(Base):
    __tablename__ = "user_alerts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    keywords: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False)
    courses: Mapped[list[str] | None] = mapped_column(ARRAY(String))
    sentiment_threshold: Mapped[float | None] = mapped_column(Float)
    regions: Mapped[list[str] | None] = mapped_column(ARRAY(String))
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMPTZ(timezone=True), nullable=False, default=datetime.utcnow
    )
    last_triggered_at: Mapped[datetime | None] = mapped_column(TIMESTAMPTZ(timezone=True))

    hits: Mapped[list["AlertHit"]] = relationship(back_populates="alert", cascade="all, delete-orphan")


class AlertHit(Base):
    __tablename__ = "alert_hits"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    alert_id: Mapped[int] = mapped_column(ForeignKey("user_alerts.id", ondelete="CASCADE"))
    article_id: Mapped[int] = mapped_column(ForeignKey("news_articles.id", ondelete="CASCADE"))
    matched_keywords: Mapped[list[str] | None] = mapped_column(ARRAY(String))
    triggered_at: Mapped[datetime] = mapped_column(
        TIMESTAMPTZ(timezone=True), nullable=False, default=datetime.utcnow
    )

    alert: Mapped["UserAlert"] = relationship(back_populates="hits")
