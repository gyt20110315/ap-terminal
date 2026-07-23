"""AP Terminal configuration management."""

from __future__ import annotations

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str = (
        "postgresql+asyncpg://apterminal:apterminal@localhost:5432/apterminal"
    )
    database_url_sync: str = (
        "postgresql+psycopg2://apterminal:apterminal@localhost:5432/apterminal"
    )

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Application
    env: str = "development"
    debug: bool = True
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
    ]

    # Ingestion intervals (seconds)
    reddit_poll_interval: int = 30
    twitter_poll_interval: int = 30
    rss_poll_interval: int = 60
    college_board_poll_interval: int = 300

    # NLP
    sentiment_model: str = "textblob"

    # AI / LLM (DeepSeek by default — OpenAI compatible)
    ai_api_url: str = "https://api.deepseek.com/v1/chat/completions"
    ai_api_key: str = ""  # Set your DeepSeek API key in .env
    ai_model: str = "deepseek-chat"

    # API keys (optional — set via .env)
    reddit_client_id: str = ""
    reddit_client_secret: str = ""
    twitter_bearer_token: str = ""

    model_config = {
        "env_file": "/Users/jaspergu/ap-terminal/backend/.env",
        "env_file_encoding": "utf-8",
    }


settings = Settings()
