from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # ⬅️ حتماً annotation داشته باشه
    DATABASE_URL: str = "postgresql+psycopg://postgres:123@localhost:5432/sarir_db"
    # اگر فعلاً Postgres آماده نیست، موقتاً اینو جایگزین کن:
    # DATABASE_URL: str = "sqlite+aiosqlite:///./app.db"

    CORS_ORIGINS: List[str] = [
        "http://localhost:3300",
        "http://127.0.0.1:3300",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # پیکربندی مدرن Pydantic v2
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

settings = Settings()
