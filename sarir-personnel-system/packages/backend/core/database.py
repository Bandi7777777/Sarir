# D:\Projects\1. Website\1.Code\1.SARIR\sarir-personnel-system\packages\backend\core\database.py
from __future__ import annotations
from typing import AsyncGenerator, Tuple
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy import text
import os

DB_URL = os.getenv("SQLALCHEMY_DATABASE_URI") or os.getenv("DATABASE_URL") \
         or "postgresql+psycopg://sarir_user:Sarir%402026@127.0.0.1:5432/sarir"

Base = declarative_base()
async_engine: AsyncEngine = create_async_engine(DB_URL, pool_pre_ping=True, pool_size=5, max_overflow=10)
AsyncSessionLocal = async_sessionmaker(bind=async_engine, expire_on_commit=False, autoflush=False, autocommit=False, class_=AsyncSession)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session

def _mask(url: str) -> str:
    try:
        if "://" in url and "@" in url:
            scheme, rest = url.split("://", 1)
            creds, host = rest.split("@", 1)
            user = creds.split(":", 1)[0]
            return f"{scheme}://{user}:***@{host}"
    except Exception:
        pass
    return url

# ------------ Robust Health (tries multiple DSNs safely) ------------
async def ping() -> Tuple[bool, str, str]:
    """
    Try DB_* envs first (filling sensible defaults if some are missing),
    then fallback to parsed DATABASE_URL (decoded), and finally a hard
    dev DSN. Uses psycopg (sync) in a thread to avoid async driver quirks.
    """
    import psycopg, urllib.parse, asyncio

    masked = _mask(DB_URL)

    def _try_connect(dsn: str) -> tuple[bool, str]:
        try:
            with psycopg.connect(dsn) as conn:
                with conn.cursor() as cur:
                    cur.execute("select 1")
                    cur.fetchone()
            return True, ""
        except Exception as e:
            return False, f"{type(e).__name__}: {e}"

    def _build_dsn_from_db_env() -> str:
        host = os.getenv("DB_HOST") or "127.0.0.1"
        port = os.getenv("DB_PORT") or "5432"
        name = os.getenv("DB_NAME") or "sarir"
        user = os.getenv("DB_USER") or "sarir_user"
        pwd  = os.getenv("DB_PASSWORD") or ""
        return f"host={host} port={port} dbname={name} user={user} password={pwd}"

    def _build_dsn_from_url(url: str) -> str:
        u = urllib.parse.urlsplit(url)
        host = u.hostname or "127.0.0.1"
        port = u.port or 5432
        name = (u.path or "/sarir").lstrip("/") or "sarir"
        user = urllib.parse.unquote(u.username or "sarir_user")
        pwd  = urllib.parse.unquote(u.password or "")
        return f"host={host} port={port} dbname={name} user={user} password={pwd}"

    def _connect_sequence() -> tuple[bool, str]:
        reasons = []

        # 1) DB_* envs (حتی اگر بعضی نبود، با default پر می‌کنیم)
        dsn1 = _build_dsn_from_db_env()
        ok, r = _try_connect(dsn1)
        if ok: return True, ""
        reasons.append(f"[DB_*] {r}")

        # 2) از DATABASE_URL یا DB_URL (پارس و decode)
        url = os.getenv("DATABASE_URL") or DB_URL
        dsn2 = _build_dsn_from_url(url)
        ok, r = _try_connect(dsn2)
        if ok: return True, ""
        reasons.append(f"[DATABASE_URL] {r}")

        # 3) fallback سخت dev (اگر همه چیز خراب شد)
        dsn3 = "host=127.0.0.1 port=5432 dbname=sarir user=sarir_user password=Sarir@2026"
        ok, r = _try_connect(dsn3)
        if ok: return True, ""
        reasons.append(f"[fallback] {r}")

        return False, " | ".join(reasons)

    ok, reason = await asyncio.to_thread(_connect_sequence)
    return ok, reason, masked
