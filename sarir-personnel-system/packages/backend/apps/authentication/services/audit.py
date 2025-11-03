from __future__ import annotations
from sqlalchemy.orm import Session
from apps.authentication.models.audit import AuthAudit

def log_event(db: Session, *, user_id, event: str, jti: str | None, ip: str | None, ua: str | None):
    rec = AuthAudit(user_id=user_id, event=event, jti=jti, ip=ip, user_agent=(ua[:512] if ua else None))
    db.add(rec)
