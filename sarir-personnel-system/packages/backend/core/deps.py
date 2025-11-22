from __future__ import annotations
from datetime import datetime, timezone

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from apps.authentication.models.user import User
from apps.authentication.models.token import AuthSession
from core.database import SessionLocal
from core.security import JWT_AUDIENCE_ACCESS, decode_token

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def _utcnow():
    return datetime.now(tz=timezone.utc)

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    # 1) از هدر Authorization
    token = None
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if auth and auth.lower().startswith("bearer "):
        token = auth.split(" ", 1)[1].strip()

    # 2) در صورت نیاز، از کوکی access_token (اختیاری)
    if not token:
        token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    try:
        payload = decode_token(token, aud=JWT_AUDIENCE_ACCESS)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    sub = payload.get("sub")  # public_id
    jti = payload.get("jti")
    if not sub or not jti:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    # session must exist, not revoked, not expired
    sess = db.query(AuthSession).filter(
        AuthSession.jti == jti,
        AuthSession.is_revoked == False
    ).first()
    if not sess or sess.expires_at <= _utcnow():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired or revoked")

    user = db.query(User).filter(User.public_id == sub, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    return user
