from __future__ import annotations

import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import jwt  # PyJWT
from passlib.context import CryptContext

# =========================
# Password hashing (bcrypt)
# =========================
_pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(plain: str) -> str:
    """Hash using bcrypt with sane defaults."""
    return _pwd_ctx.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    """Constant-time verify; مقاوم در برابر خطاهای داخلی passlib."""
    try:
        return _pwd_ctx.verify(plain, hashed)
    except Exception:
        return False


# ==============
# JWT Settings
# ==============
SECRET_KEY: str = os.getenv("SECRET_KEY", "please-change-me")
ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")

# مدت‌ها (پیش‌فرض‌های معقول؛ قابل تغییر با ENV)
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# Issuer/Audience برای اعتبارسنجی بهتر در محیط‌های چندکلاینتی
JWT_ISSUER: Optional[str] = os.getenv("JWT_ISSUER") or "sarir-soft-backend"
JWT_AUDIENCE: Optional[str] = os.getenv("JWT_AUDIENCE") or "sarir-soft-frontend"

# تنطیمات decode (مثلاً clock skew)
JWT_LEEWAY_SECONDS: int = int(os.getenv("JWT_LEEWAY_SECONDS", "15"))


# =====================
# JWT helper functions
# =====================
def _now_utc() -> datetime:
    return datetime.now(tz=timezone.utc)

def _exp_delta(minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES) -> timedelta:
    return timedelta(minutes=minutes)

def _refresh_delta(days: int = REFRESH_TOKEN_EXPIRE_DAYS) -> timedelta:
    return timedelta(days=days)

def create_token(
    *,
    subject: str,
    token_type: str = "access",  # "access" | "refresh"
    expires_delta: Optional[timedelta] = None,
    extra_claims: Optional[Dict[str, Any]] = None,
) -> str:
    """
    ساخت توکن با کلایم‌های استاندارد:
    - sub: شناسه کاربر (مثلاً public_id)
    - typ: نوع توکن (access/refresh)
    - jti: شناسه تصادفی برای ردیابی سشن/ابطال
    - iat/nbf/exp: زمان‌بندی
    - iss/aud: هویت صادرکننده و مخاطب
    """
    if token_type not in {"access", "refresh"}:
        raise ValueError("token_type must be 'access' or 'refresh'")

    now = _now_utc()
    exp = now + (
        expires_delta
        or (_exp_delta() if token_type == "access" else _refresh_delta())
    )

    claims: Dict[str, Any] = {
        "jti": uuid.uuid4().hex,
        "sub": subject,
        "typ": token_type,
        "iat": now,
        "nbf": now,
        "exp": exp,
        "iss": JWT_ISSUER,
        "aud": JWT_AUDIENCE,
    }
    if extra_claims:
        claims.update(extra_claims)

    return jwt.encode(claims, SECRET_KEY, algorithm=ALGORITHM)

def create_access_token(
    subject: str,
    expires_delta: Optional[timedelta] = None,
    extra_claims: Optional[Dict[str, Any]] = None,
) -> str:
    """سازگار با کد قبلی؛ توکن access می‌سازد."""
    return create_token(
        subject=subject,
        token_type="access",
        expires_delta=expires_delta,
        extra_claims=extra_claims,
    )

def create_refresh_token(
    subject: str,
    expires_delta: Optional[timedelta] = None,
    extra_claims: Optional[Dict[str, Any]] = None,
) -> str:
    """برای مرحلهٔ بعدی (رفرش/سشن) آماده‌ست."""
    return create_token(
        subject=subject,
        token_type="refresh",
        expires_delta=expires_delta,
        extra_claims=extra_claims,
    )

def decode_token(token: str, *, verify_aud: bool = True) -> Dict[str, Any]:
    """
    دیکود امن با پیغام‌های شفاف. اگر لازم بود، verify_aud=False بده.
    """
    options = {"require": ["exp", "iat", "nbf", "sub", "typ"], "verify_aud": verify_aud}
    try:
        return jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            audience=JWT_AUDIENCE if verify_aud else None,
            issuer=JWT_ISSUER,
            leeway=JWT_LEEWAY_SECONDS,
            options=options,
        )
    except jwt.ExpiredSignatureError as e:
        raise ValueError("Token expired") from e
    except jwt.InvalidAudienceError as e:
        raise ValueError("Invalid audience") from e
    except jwt.InvalidIssuerError as e:
        raise ValueError("Invalid issuer") from e
    except jwt.InvalidSignatureError as e:
        raise ValueError("Invalid signature") from e
    except jwt.DecodeError as e:
        raise ValueError("Malformed token") from e
    except Exception as e:
        # برای لاگ: نوع خطا کافیست
        raise ValueError(f"Invalid token: {type(e).__name__}") from e
