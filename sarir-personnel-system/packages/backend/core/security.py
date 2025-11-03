from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import jwt  # PyJWT
from passlib.context import CryptContext

# =========================
# Password hashing (bcrypt)
# =========================
_pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(plain: str) -> str:
    return _pwd_ctx.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return _pwd_ctx.verify(plain, hashed)
    except Exception:
        return False


# ==============
# JWT Settings
# ==============
SECRET_KEY: str = os.getenv("SECRET_KEY", "please-change-me")
ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")

ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

JWT_ISSUER: str = os.getenv("JWT_ISSUER", "sarir-soft-backend")
JWT_AUDIENCE_ACCESS: str = os.getenv("JWT_AUDIENCE_ACCESS", os.getenv("JWT_AUDIENCE", "sarir-soft-frontend-access"))
JWT_AUDIENCE_REFRESH: str = os.getenv("JWT_AUDIENCE_REFRESH", os.getenv("JWT_AUDIENCE", "sarir-soft-frontend-refresh"))
JWT_LEEWAY_SECONDS: int = int(os.getenv("JWT_LEEWAY_SECONDS", "15"))

# =====================
# JWT helpers
# =====================
def _now_utc() -> datetime:
    return datetime.now(tz=timezone.utc)

def _exp_delta(minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES) -> timedelta:
    return timedelta(minutes=minutes)

def _refresh_delta(days: int = REFRESH_TOKEN_EXPIRE_DAYS) -> timedelta:
    return timedelta(days=days)

def _create_token(
    *,
    subject: str,
    jti: str,
    audience: str,
    expires_delta: Optional[timedelta] = None,
    token_type: str = "access",
    extra_claims: Optional[Dict[str, Any]] = None,
) -> str:
    now = _now_utc()
    exp = now + (expires_delta or (_exp_delta() if token_type == "access" else _refresh_delta()))
    claims: Dict[str, Any] = {
        "sub": subject,
        "jti": jti,
        "aud": audience,
        "iss": JWT_ISSUER,
        "iat": now,
        "nbf": now,
        "exp": exp,
        "typ": token_type.upper(),
    }
    if extra_claims:
        claims.update(extra_claims)
    return jwt.encode(claims, SECRET_KEY, algorithm=ALGORITHM)

def create_access_token(*, sub: str, jti: str, extra: Optional[Dict[str, Any]] = None, expires_delta: Optional[timedelta] = None) -> str:
    return _create_token(subject=sub, jti=jti, audience=JWT_AUDIENCE_ACCESS, expires_delta=expires_delta or _exp_delta(), token_type="access", extra_claims=extra)

def create_refresh_token(*, sub: str, jti: str, extra: Optional[Dict[str, Any]] = None, expires_delta: Optional[timedelta] = None) -> str:
    return _create_token(subject=sub, jti=jti, audience=JWT_AUDIENCE_REFRESH, expires_delta=expires_delta or _refresh_delta(), token_type="refresh", extra_claims=extra)

def _decode(token: str, *, expected_aud: str) -> Dict[str, Any]:
    return jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM],
        audience=expected_aud,
        issuer=JWT_ISSUER,
        leeway=JWT_LEEWAY_SECONDS,
        options={"require": ["sub", "jti", "aud", "iss", "iat", "nbf", "exp"]},
    )

def decode_access(token: str) -> Dict[str, Any]:
    try:
        return _decode(token, expected_aud=JWT_AUDIENCE_ACCESS)
    except jwt.ExpiredSignatureError as e:
        raise ValueError("Access token expired") from e
    except jwt.InvalidAudienceError as e:
        raise ValueError("Invalid audience (not access)") from e
    except jwt.InvalidIssuerError as e:
        raise ValueError("Invalid issuer") from e
    except jwt.InvalidSignatureError as e:
        raise ValueError("Invalid signature") from e
    except jwt.DecodeError as e:
        raise ValueError("Malformed token") from e
    except Exception as e:
        raise ValueError(f"Invalid token: {type(e).__name__}") from e

def decode_refresh(token: str) -> Dict[str, Any]:
    try:
        return _decode(token, expected_aud=JWT_AUDIENCE_REFRESH)
    except jwt.ExpiredSignatureError as e:
        raise ValueError("Refresh token expired") from e
    except jwt.InvalidAudienceError as e:
        raise ValueError("Invalid audience (not refresh)") from e
    except jwt.InvalidIssuerError as e:
        raise ValueError("Invalid issuer") from e
    except jwt.InvalidSignatureError as e:
        raise ValueError("Invalid signature") from e
    except jwt.DecodeError as e:
        raise ValueError("Malformed token") from e
    except Exception as e:
        raise ValueError(f"Invalid token: {type(e).__name__}") from e

# --- Wrapper برای ناسازگاری‌های قبلی (جهت سازگاری با auth.py فعلی) ---
def decode_token(token: str, *, aud: str) -> Dict[str, Any]:
    """Wrapper سازگار: اگر aud='access' بود مثل decode_access و اگر 'refresh' بود مثل decode_refresh عمل می‌کند."""
    if aud == JWT_AUDIENCE_ACCESS or aud.lower() == "access":
        return _decode(token, expected_aud=JWT_AUDIENCE_ACCESS)
    if aud == JWT_AUDIENCE_REFRESH or aud.lower() == "refresh":
        return _decode(token, expected_aud=JWT_AUDIENCE_REFRESH)
    # اگر مخاطب سفارشی باشد، همان را اعتبارسنجی می‌کنیم
    return _decode(token, expected_aud=aud)
