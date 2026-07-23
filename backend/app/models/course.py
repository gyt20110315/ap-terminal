"""AP Course ORM model."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import TIMESTAMPTZ
from sqlalchemy.orm import Mapped, mapped_column

from app.models.news import Base


class APCourse(Base):
    __tablename__ = "ap_courses"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    short_name: Mapped[str | None] = mapped_column(String(50))
    category: Mapped[str | None] = mapped_column(String(100))
    enrollment: Mapped[int | None] = mapped_column(Integer)
    avg_score: Mapped[float | None] = mapped_column(Float)
    passing_rate: Mapped[float | None] = mapped_column(Float)
    score_5_pct: Mapped[float | None] = mapped_column(Float)
    score_4_pct: Mapped[float | None] = mapped_column(Float)
    score_3_pct: Mapped[float | None] = mapped_column(Float)
    score_2_pct: Mapped[float | None] = mapped_column(Float)
    score_1_pct: Mapped[float | None] = mapped_column(Float)
    data_year: Mapped[int | None] = mapped_column(Integer)
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMPTZ(timezone=True), nullable=False, default=datetime.utcnow
    )
