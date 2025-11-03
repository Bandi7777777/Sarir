from __future__ import annotations
import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from apps.authentication.models.token import AuthSession

def _utcnow():
    return datetime.now(tz=timezone.utc)

def prune_to_max_sessions(db: Session, *, user_id, max_sessions: int = 2):
    active = db.query(AuthSession).filter(
        AuthSession.user_id == user_id,
        AuthSession.is_revoked == False,
        AuthSession.expires_at > _utcnow(),
    ).order_by(AuthSession.created_at.asc()).all()
    if len(active) >= max_sessions:
        to_delete = len(active) - (max_sessions - 1)
        for s in active[:to_delete]:
            db.delete(s)

def create_session(db: Session, *, user_id, device_id: Optional[str], user_agent: Optional[str], ip: Optional[str], refresh_delta) -> AuthSession:
    jti = uuid.uuid4().hex
    sess = AuthSession(
        user_id=user_id,
        jti=jti,
        device_id=device_id,
        user_agent=(user_agent[:512] if user_agent else None),
        ip=(ip[:45] if ip else None),
        expires_at=_utcnow() + refresh_delta,
        is_revoked=False,
    )
    db.add(sess)
    return sess

def rotate_session(db: Session, *, session: AuthSession, refresh_delta):
    session.jti = uuid.uuid4().hex
    session.last_used_at = _utcnow()
    session.expires_at = _utcnow() + refresh_delta

def revoke_session(db: Session, *, jti: str):
    s = db.query(AuthSession).filter(AuthSession.jti == jti).first()
    if s and not s.is_revoked:
        s.is_revoked = True

def revoke_all_sessions(db: Session, *, user_id):
    db.query(AuthSession).filter(
        AuthSession.user_id == user_id,
        AuthSession.is_revoked == False
    ).update({"is_revoked": True})
