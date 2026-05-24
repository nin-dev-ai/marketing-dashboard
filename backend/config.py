from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BACKEND_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    openai_api_key: str | None = None
    tavily_api_key: str | None = None
    cors_origins: str = "http://localhost:3000"
    data_dir: Path = BACKEND_ROOT / "data"
    store_file: Path = BACKEND_ROOT / "data" / "store.json"
    database_url: str | None = None

    @property
    def database_url_sync(self) -> str | None:
        """psycopg2-compatible URL (strips SQLAlchemy driver prefix)."""
        if not self.database_url:
            return None
        url = self.database_url
        if url.startswith("postgresql+asyncpg://"):
            return "postgresql://" + url[len("postgresql+asyncpg://") :]
        if url.startswith("postgresql+psycopg2://"):
            return "postgresql://" + url[len("postgresql+psycopg2://") :]
        return url

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def llm_enabled(self) -> bool:
        return bool(self.openai_api_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()


def reload_settings() -> Settings:
    """Clear cached settings (e.g. after .env change)."""
    get_settings.cache_clear()
    return get_settings()
