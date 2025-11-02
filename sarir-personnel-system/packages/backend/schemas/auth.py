from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID

class LoginIn(BaseModel):
    username: str
    password: str

class UserPublic(BaseModel):
    id: UUID
    public_id: UUID
    username: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_superuser: bool

class MeOut(UserPublic):
    pass
