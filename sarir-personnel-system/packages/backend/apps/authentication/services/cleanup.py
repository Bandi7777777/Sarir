from __future__ import annotations
import asyncio
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from core.database import SessionLocal
from apps.authentication.models.token import AuthSession

def _now():
    return datetime.now(tz=timezone.utc)

def _cleanup_once() -> int:
    db: Session = SessionLocal()
    try:
        # حذف رکوردهای منقضی
        q = db.query(AuthSession).filter(AuthSession.expires_at < _now())
        deleted = q.delete(synchronize_session=False)
        db.commit()
        return deleted or 0
    except Exception:
        db.rollback()
        return 0
    finally:
        db.close()

async def run_cleanup_loop(interval_seconds: int = 1800):
    while True:
        try:
            _cleanup_once()
        except Exception:
            pass
        await asyncio.sleep(interval_seconds)
