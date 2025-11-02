from __future__ import annotations
from pydantic import BaseModel, EmailStr, Field

class UserRegister(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr | None = None
    full_name: str | None = None
    password: str = Field(min_length=6, max_length=128)

class UserLogin(BaseModel):
    username: str
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: str | None = None
    public_id: str | None = None
    username: str
    email: str | None = None
    full_name: str | None = None
    is_superuser: bool = False
