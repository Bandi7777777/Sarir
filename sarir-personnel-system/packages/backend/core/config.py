from __future__ import annotations
import os
from datetime import timedelta

class Settings:
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "CHANGE_ME_IN_PROD")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    JWT_ISSUER: str = os.getenv("JWT_ISSUER", "sarir-backend")
    JWT_AUDIENCE_ACCESS: str = os.getenv("JWT_AUDIENCE_ACCESS", "access")
    JWT_AUDIENCE_REFRESH: str = os.getenv("JWT_AUDIENCE_REFRESH", "refresh")
    JWT_LEEWAY_SECONDS: int = int(os.getenv("JWT_LEEWAY_SECONDS", "15"))

    # Cookies
    COOKIE_DOMAIN: str | None = os.getenv("COOKIE_DOMAIN")  # مثل: .imex-gmbh.com
    COOKIE_SECURE: bool = os.getenv("COOKIE_SECURE", "false").lower() == "true"  # dev=false
    COOKIE_SAMESITE: str = os.getenv("COOKIE_SAMESITE", "lax")  # lax/strict/none
    COOKIE_PATH: str = os.getenv("COOKIE_PATH", "/")

    @property
    def access_delta(self) -> timedelta:
        return timedelta(minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES)

    @property
    def refresh_delta(self) -> timedelta:
        return timedelta(days=self.REFRESH_TOKEN_EXPIRE_DAYS)

settings = Settings()
