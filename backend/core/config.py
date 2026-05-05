"""
FinBuddy AI — Configuration
"""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # ── LLM API Keys ──────────────────────────────────────
    OPENROUTER_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    GROK_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # ── Finance API Keys ──────────────────────────────────
    ALPHA_VANTAGE_API_KEY: str = ""
    FMP_API_KEY: str = ""           # Financial Modeling Prep
    COINGECKO_API_KEY: str = ""     # Free tier — optional
    FINNHUB_API_KEY: str = ""
    EXCHANGERATE_API_KEY: str = ""

    # ── LangSmith (optional) ──────────────────────────────
    LANGCHAIN_TRACING_V2: str = "false"
    LANGCHAIN_API_KEY: str = ""
    LANGCHAIN_PROJECT: str = "finbuddy-ai"

    # ── Memory / DB ───────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379"
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    # ── App ───────────────────────────────────────────────
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "https://*.vercel.app"]
    MAX_HISTORY_TURNS: int = 20
    DEFAULT_SESSION_TTL: int = 3600  # seconds

    # ── LLM Models ────────────────────────────────────────
    OPENROUTER_MODEL: str = "mistralai/mistral-7b-instruct:free"
    GEMINI_MODEL: str = "gemini-1.5-flash"
    OPENAI_MODEL: str = "gpt-4o-mini"

    # ── Rate limits ───────────────────────────────────────
    RATE_LIMIT_PER_MINUTE: int = 30


settings = Settings()
