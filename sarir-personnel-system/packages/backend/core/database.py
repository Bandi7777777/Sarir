from __future__ import annotations

import os
from urllib.parse import quote_plus
from typing import Tuple

# --- Load .env automatically (backend root) ---
try:
    from pathlib import Path
    from dotenv import load_dotenv  # pip install python-dotenv
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)
except Exception:
    # If dotenv isn't installed or .env missing, just continue.
    pass

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

# ---------------------------------------------------
# Build URL (handles special chars like @ via quote_plus)
# ---------------------------------------------------
def _make_url() -> str:
    url = os.getenv("DATABASE_URL")
    if url:
        return url
    host = os.getenv("DB_HOST", "127.0.0.1")
    port = os.getenv("DB_PORT", "5432")
    name = os.getenv("DB_NAME", "sarir")
    user = os.getenv("DB_USER", "sarir_user")
    pwd  = quote_plus(os.getenv("DB_PASSWORD", ""))  # encodes @ -> %40
    return f"postgresql+psycopg://{user}:{pwd}@{host}:{port}/{name}"

SQLALCHEMY_DATABASE_URL: str = _make_url()

# -----------------
# SQLAlchemy Engine
# -----------------
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

# -----------------
# Session (sync)
# -----------------
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# -----------------
# Declarative Base
# -----------------
Base = declarative_base()

# -----------------
# Helpers
# -----------------
def mask_url(url: str) -> str:
    """Mask password for logs/health."""
    try:
        if "://" not in url:
            return url
        scheme, rest = url.split("://", 1)
        if "@" not in rest:
            return f"{scheme}://***"
        userpass, hostpart = rest.split("@", 1)
        user = userpass.split(":", 1)[0] if ":" in userpass else userpass
        return f"{scheme}://{user}:***@{hostpart}"
    except Exception:
        return "***"

async def ping() -> Tuple[bool, str, str]:
    """Simple DB health check used by main.py: (ok, reason, masked_url)."""
    try:
        with engine.connect() as conn:
            conn.execute(text("select 1"))
        return True, "", mask_url(SQLALCHEMY_DATABASE_URL)
    except Exception as e:
        return False, f"{type(e).__name__}: {e}", mask_url(SQLALCHEMY_DATABASE_URL)
