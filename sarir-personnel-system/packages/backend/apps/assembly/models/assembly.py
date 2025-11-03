from sqlalchemy import Column, String, DateTime, Boolean, func, text
from sqlalchemy.dialects.postgresql import UUID
from core.database import Base

class Assembly(Base):
    __tablename__ = "assemblies"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    title = Column(String(160), nullable=False)        # عنوان جلسه مجمع
    fiscal_year = Column(String(10), nullable=True)    # سال مالی
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(30), nullable=True)         # planned/held/published
    is_active = Column(Boolean, nullable=False, server_default=text("true"))
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
