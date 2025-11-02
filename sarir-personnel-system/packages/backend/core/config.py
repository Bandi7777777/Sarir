import os
from datetime import timedelta

class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "CHANGE_ME_IN_PROD")  # در .env عوض کن
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
    COOKIE_DOMAIN: str | None = os.getenv("COOKIE_DOMAIN")  # مثلا: ".imex-gmbh.com"
    COOKIE_SECURE: bool = os.getenv("COOKIE_SECURE", "true").lower() == "true"  # روی prod: true
    COOKIE_SAMESITE: str = os.getenv("COOKIE_SAMESITE", "lax")  # lax/strict/none

    @property
    def access_exp_delta(self) -> timedelta:
        return timedelta(minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES)

settings = Settings()
