from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class AssemblyIn(BaseModel):
    title: str
    fiscal_year: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    status: Optional[str] = "planned"
    is_active: bool = True

class AssemblyOut(BaseModel):
    id: UUID
    title: str
    fiscal_year: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    status: Optional[str] = None
    is_active: bool
    created_at: datetime
