from __future__ import annotations
from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID

class LoginIn(BaseModel):
    username: str  # یا email
    password: str
    device_id: Optional[str] = None

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class MeOut(BaseModel):
    id: UUID
    public_id: UUID
    username: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_superuser: bool
