from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from passlib.context import CryptContext
from core.deps import get_db, get_current_user
from core.security import create_jwt
from core.config import settings
from schemas.auth import LoginIn, MeOut

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def _set_access_cookie(resp: Response, token: str):
    resp.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,  # "lax" by default
        domain=settings.COOKIE_DOMAIN,  # None -> current host
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )

def _clear_access_cookie(resp: Response):
    resp.delete_cookie(
        key="access_token",
        domain=settings.COOKIE_DOMAIN,
        path="/",
    )

@router.post("/login")
def login(data: LoginIn, response: Response, db: Session = Depends(get_db)):
    # گرفتن هش و چک bcrypt
    row = db.execute(
        text("""
            select id, public_id, username, email, full_name, is_superuser, hashed_password
            from public.users
            where username = :u and is_active = true
        """),
        {"u": data.username},
    ).mappings().first()

    if not row:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    hashed = row["hashed_password"]
    if not pwd_ctx.verify(data.password, hashed):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # ساخت Access Token (کوتاه‌عمر)
    token = create_jwt(
        claims={
            "sub": str(row["public_id"]),    # subject = public_id
            "username": row["username"],
            "is_superuser": bool(row["is_superuser"]),
        },
        expires_delta=settings.access_exp_delta,
    )

    _set_access_cookie(response, token)
    return {"ok": True}

@router.get("/me", response_model=MeOut)
def me(user = Depends(get_current_user)):
    return {
        "id": user["id"],
        "public_id": user["public_id"],
        "username": user["username"],
        "email": user["email"],
        "full_name": user["full_name"],
        "is_superuser": bool(user["is_superuser"]),
    }

@router.post("/logout")
def logout(response: Response):
    _clear_access_cookie(response)
    return {"ok": True}
