from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from apps.authentication.models.token import AuthSession
from apps.authentication.models.user import User
from core.config import settings
from core.deps import get_current_user, get_db
from core.security import create_access_token, hash_password, verify_password
from .schemas import TokenOut, UserLogin, UserOut, UserRegister

router = APIRouter(tags=["Authentication"])


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing = (
        db.query(User)
        .filter(or_(User.username == payload.username, User.email == payload.email))
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="username or email already exists",
        )

    user = User(
        username=payload.username,
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
        is_active=True,
        is_superuser=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return UserOut(
        id=str(user.id),
        public_id=str(user.public_id),
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        is_superuser=user.is_superuser,
    )


@router.post("/login", response_model=TokenOut)
def login(payload: UserLogin, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not user.hashed_password or not verify_password(
        payload.password, user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid credentials"
        )

    jti = uuid.uuid4().hex
    expires_at = _utcnow() + settings.access_delta
    session = AuthSession(
        user_id=user.id,
        jti=jti,
        expires_at=expires_at,
        user_agent=request.headers.get("user-agent"),
        ip=request.client.host if request.client else None,
    )
    db.add(session)
    db.commit()

    token = create_access_token(
        sub=str(user.public_id),
        jti=jti,
        extra={"username": user.username, "is_superuser": user.is_superuser},
        expires_delta=settings.access_delta,
    )
    return TokenOut(access_token=token)


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return UserOut(
        id=str(current_user.id),
        public_id=str(current_user.public_id),
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        is_superuser=current_user.is_superuser,
    )
