from apps.authentication.services.audit import log_event
from __future__ import annotations
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from core.config import settings
from core.security import verify_password, create_access_token, create_refresh_token, decode_token
from core.deps import get_db, get_current_user
from apps.authentication.models.user import User
from apps.authentication.models.token import AuthSession
from apps.authentication.services.sessions import (
    prune_to_max_sessions, create_session, rotate_session,
    revoke_session, revoke_all_sessions
)
from apps.authentication.schemas.auth import LoginIn, TokenOut, MeOut

router = APIRouter(prefix="/auth", tags=["auth"])

def _now() -> datetime:
    return datetime.now(tz=timezone.utc)

def _set_refresh_cookie(resp: Response, token: str, expires_at: datetime):
    resp.set_cookie(
        key="refresh_token",
        value=token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        domain=settings.COOKIE_DOMAIN,
        path=settings.COOKIE_PATH,
        expires=int(expires_at.timestamp()),
    )

def _clear_refresh_cookie(resp: Response):
    resp.delete_cookie(
        key="refresh_token",
        domain=settings.COOKIE_DOMAIN,
        path=settings.COOKIE_PATH,
    )

def _set_access_cookie(resp: Response, token: str):
    # اختیاری: اگر بخواهی از کوکی برای access هم استفاده کنی
    resp.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        domain=settings.COOKIE_DOMAIN,
        path=settings.COOKIE_PATH,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

@router.post("/login", response_model=TokenOut)
def login(data: LoginIn, request: Request, response: Response, db: Session = Depends(get_db)):
    # 1) یافتن کاربر با username یا email
    user = db.query(User).filter(
        or_(User.username == data.username, User.email == data.username),
        User.is_active == True
    ).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # 2) سقف ۲ سشن همزمان
    try:
        prune_to_max_sessions(db, user_id=user.id, max_sessions=2)
        # 3) ساخت سشن جدید + صدور توکن‌ها
        ua = request.headers.get("user-agent") or ""
        ip = request.client.host if request.client else None
        sess = create_session(
            db,
            user_id=user.id,
            device_id=(data.device_id or None),
            user_agent=ua,
            ip=ip,
            refresh_delta=settings.refresh_delta,
        )
        db.commit()
    except Exception:
        db.rollback()
        raise

    access = create_access_token(
        sub=str(user.public_id), jti=sess.jti,
        extra={"username": user.username, "is_superuser": user.is_superuser}
    )
    refresh = create_refresh_token(sub=str(user.public_id), jti=sess.jti)

    _set_refresh_cookie(response, refresh, sess.expires_at)
    # _set_access_cookie(response, access)  # اختیاری

    return {"access_token": access, "token_type": "bearer"}

@router.post("/refresh", response_model=TokenOut)
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token")

    try:
        payload = decode_token(token, aud=settings.JWT_AUDIENCE_REFRESH)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    sub = payload.get("sub")  # public_id
    jti = payload.get("jti")
    if not sub or not jti:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    sess = db.query(AuthSession).filter(
        AuthSession.jti == jti, AuthSession.is_revoked == False
    ).first()
    if not sess or sess.expires_at <= _now():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired or revoked")

    user = db.query(User).filter(User.public_id == sub, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    try:
        rotate_session(db, session=sess, refresh_delta=settings.refresh_delta)
        db.commit()
    except Exception:
        db.rollback()
        raise

    new_access = create_access_token(
        sub=str(user.public_id), jti=sess.jti,
        extra={"username": user.username, "is_superuser": user.is_superuser}
    )
    new_refresh = create_refresh_token(sub=str(user.public_id), jti=sess.jti)

    _set_refresh_cookie(response, new_refresh, sess.expires_at)
    # _set_access_cookie(response, new_access)  # اختیاری

    return {"access_token": new_access, "token_type": "bearer"}

@router.post("/logout", status_code=204, response_model=None)
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    token = request.cookies.get("refresh_token")
    if token:
        try:
            payload = decode_token(token, aud=settings.JWT_AUDIENCE_REFRESH)
            jti = payload.get("jti")
            if jti:
                try:
                    revoke_session(db, jti=jti)
                    db.commit()
                except Exception:
                    db.rollback()
                    raise
        except Exception:
            # توکن نامعتبر/منقضی؛ فقط کوکی را پاک می‌کنیم
            pass
    _clear_refresh_cookie(response)
    response.delete_cookie("access_token", domain=settings.COOKIE_DOMAIN, path=settings.COOKIE_PATH)
    return

@router.post("/logout-all", status_code=204, response_model=None)
def logout_all(response: Response, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    نکته: Response نباید Optional/Union یا Depends باشد. FastAPI خودش تزریق می‌کند.
    """
    try:
        revoke_all_sessions(db, user_id=user.id)
        db.commit()
    except Exception:
        db.rollback()
        raise
    _clear_refresh_cookie(response)
    response.delete_cookie("access_token", domain=settings.COOKIE_DOMAIN, path=settings.COOKIE_PATH)
    return

@router.get("/me", response_model=MeOut)
def me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "public_id": user.public_id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "is_superuser": bool(user.is_superuser),
    }
