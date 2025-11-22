from __future__ import annotations

import os
from datetime import timedelta
from typing import List


class Settings:
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-change-me")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    JWT_ISSUER: str = os.getenv("JWT_ISSUER", "sarir-backend")
    JWT_AUDIENCE_ACCESS: str = os.getenv("JWT_AUDIENCE_ACCESS", "access")
    JWT_AUDIENCE_REFRESH: str = os.getenv("JWT_AUDIENCE_REFRESH", "refresh")
    JWT_LEEWAY_SECONDS: int = int(os.getenv("JWT_LEEWAY_SECONDS", "15"))

    # Cookies
    COOKIE_DOMAIN: str | None = os.getenv("COOKIE_DOMAIN")
    COOKIE_SECURE: bool = os.getenv("COOKIE_SECURE", "false").lower() == "true"
    COOKIE_SAMESITE: str = os.getenv("COOKIE_SAMESITE", "lax")
    COOKIE_PATH: str = os.getenv("COOKIE_PATH", "/")

    # CORS
    CORS_ALLOW_ORIGINS: str = os.getenv(
        "CORS_ALLOW_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    )

    @property
    def access_delta(self) -> timedelta:
        return timedelta(minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES)

    @property
    def refresh_delta(self) -> timedelta:
        return timedelta(days=self.REFRESH_TOKEN_EXPIRE_DAYS)

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.CORS_ALLOW_ORIGINS.split(",") if o.strip()]


settings = Settings()
