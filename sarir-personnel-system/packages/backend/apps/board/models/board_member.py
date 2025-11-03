from sqlalchemy import Column, String, Boolean, DateTime, func, text
from sqlalchemy.dialects.postgresql import UUID
from core.database import Base

class BoardMember(Base):
    __tablename__ = "board_members"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    full_name = Column(String(120), nullable=False)
    role = Column(String(60), nullable=True)  # chair / member / ...
    email = Column(String(120), nullable=True)
    phone = Column(String(40), nullable=True)
    is_active = Column(Boolean, nullable=False, server_default=text("true"))
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
