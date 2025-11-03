from __future__ import annotations
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SessionOut(BaseModel):
    jti: str
    device_id: Optional[str] = None
    user_agent: Optional[str] = None
    ip: Optional[str] = None
    created_at: datetime
    last_used_at: datetime
    expires_at: datetime
    is_revoked: bool
