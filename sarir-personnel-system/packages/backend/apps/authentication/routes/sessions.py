from __future__ import annotations
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from core.deps import get_db, get_current_user
from core.config import settings
from core.security import decode_token
from apps.authentication.models.user import User
from apps.authentication.models.token import AuthSession
from apps.authentication.schemas.sessions import SessionOut
from apps.authentication.services.sessions import revoke_session

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/sessions", response_model=List[SessionOut])
def list_my_sessions(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(AuthSession).filter(AuthSession.user_id == user.id).order_by(
        AuthSession.is_revoked.asc(), AuthSession.created_at.desc()
    ).all()
    return [
        SessionOut(
            jti=s.jti,
            device_id=s.device_id,
            user_agent=s.user_agent,
            ip=s.ip,
            created_at=s.created_at,
            last_used_at=s.last_used_at,
            expires_at=s.expires_at,
            is_revoked=bool(s.is_revoked),
        )
        for s in rows
    ]

@router.delete("/sessions/{jti}", status_code=204, response_model=None)
def revoke_one_session(jti: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sess = db.query(AuthSession).filter(AuthSession.jti == jti, AuthSession.user_id == user.id).first()
    if not sess:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    if not sess.is_revoked:
        sess.is_revoked = True
        db.commit()
    return

@router.delete("/sessions/current", status_code=204, response_model=None)
def revoke_current_session(
    request: Request,
    response: Response,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    ابطال سشنِ همین کلاینت:
    - refresh_token را از کوکی می‌خوانیم و jti همان سشن را پیدا/باطل می‌کنیم.
    - هویت کاربر نیز با access token (get_current_user) تأیید می‌شود.
    - در پایان، کوکی‌ها پاک می‌شوند.
    """
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token")

    # دیکود رفرش‌توکن و انطباق sub با کاربر جاری
    try:
        payload = decode_token(token, aud=settings.JWT_AUDIENCE_REFRESH)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    sub = payload.get("sub")
    jti = payload.get("jti")
    if not sub or not jti:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    if str(user.public_id) != sub:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token user mismatch")

    # ابطال همین سشن
    revoke_session(db, jti=jti)
    db.commit()

    # پاک‌کردن کوکی‌ها (logout همین دستگاه)
    response.delete_cookie("refresh_token", domain=settings.COOKIE_DOMAIN, path=settings.COOKIE_PATH)
    response.delete_cookie("access_token", domain=settings.COOKIE_DOMAIN, path=settings.COOKIE_PATH)
    return
