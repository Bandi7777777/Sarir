from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from core.database import get_db
from core.security import hash_password, verify_password, create_access_token
from .schemas import UserRegister, UserLogin, TokenOut, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=UserOut, status_code=201)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)):
    # 1) عدم تکراری بودن username / email
    check_sql = text("""
        SELECT username, email FROM public.users
        WHERE username = :u OR (:e::text IS NOT NULL AND email = :e)
        LIMIT 1
    """)
    res = await db.execute(check_sql, {"u": payload.username, "e": payload.email})
    row = res.first()
    if row:
        raise HTTPException(status_code=409, detail="username or email already exists")

    # 2) درج کاربر
    insert_sql = text("""
        INSERT INTO public.users (username, email, full_name, hashed_password, is_active, is_superuser)
        VALUES (:u, :e, :f, :hp, TRUE, FALSE)
        RETURNING id::text, public_id::text, username, email, full_name, is_superuser
    """)
    hashed = hash_password(payload.password)
    res = await db.execute(insert_sql, {"u": payload.username, "e": payload.email, "f": payload.full_name, "hp": hashed})
    await db.commit()
    r = res.first()
    return UserOut(
        id=r[0], public_id=r[1], username=r[2],
        email=r[3], full_name=r[4], is_superuser=r[5]
    )

@router.post("/login", response_model=TokenOut)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    # 1) دریافت hashed_password و public_id
    q = text("""
        SELECT public_id::text, hashed_password
        FROM public.users WHERE username = :u
        LIMIT 1
    """)
    res = await db.execute(q, {"u": payload.username})
    row = res.first()
    if not row:
        raise HTTPException(status_code=401, detail="invalid credentials")

    public_id, hashed = row[0], row[1]
    if not hashed or not verify_password(payload.password, hashed):
        raise HTTPException(status_code=401, detail="invalid credentials")

    # 2) ساخت توکن (sub=username, uid=public_id)
    token = create_access_token({"sub": payload.username, "uid": public_id})
    return TokenOut(access_token=token)
