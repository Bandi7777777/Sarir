from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict

class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    subject_type: str
    subject_id: Optional[UUID] = None
    title: Optional[str] = None
    category: str
    file_name: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    checksum_sha256: Optional[str] = None
    uploaded_by: Optional[UUID] = None
    is_archived: bool
    created_at: datetime
    updated_at: datetime

class DocumentCreateIn(BaseModel):
    subject_type: str = Field(..., description="employee / driver / board / assembly / user / generic")
    subject_id: Optional[UUID] = Field(None)
    title: Optional[str] = None
    category: Optional[str] = Field(default="general")
