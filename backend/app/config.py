"""Application configuration loaded from environment variables.

All secrets and connection strings come from the environment (a local .env
file in development, or the hosting provider's variable settings in
production). Nothing sensitive is hard-coded.
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- OpenAI ---
    openai_api_key: str

    # --- Database ---
    # Postgres connection string, e.g.
    # postgresql+psycopg://user:password@host:5432/dbname
    # On Railway this is provided automatically as DATABASE_URL.
    database_url: str = "sqlite+pysqlite:///./local.db"

    # --- Auth ---
    # Generate one with:  python -c "import secrets; print(secrets.token_hex(32))"
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # --- Models ---
    transcription_model: str = "whisper-1"
    fact_check_model: str = "gpt-4o"

    # --- CORS ---
    # Comma-separated list of allowed front-end origins.
    frontend_origins: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.frontend_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
