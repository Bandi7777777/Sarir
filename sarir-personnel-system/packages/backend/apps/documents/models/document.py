from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey, Index, func, text
from sqlalchemy.dialects.postgresql import UUID
from core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    # employee / driver / board / assembly / user / generic
    subject_type = Column(String(32), nullable=False)
    subject_id = Column(UUID(as_uuid=True), nullable=True)

    title = Column(String(200), nullable=True)
    category = Column(String(50), nullable=False, server_default="general")

    file_name = Column(String(255), nullable=False)
    file_path = Column(Text, nullable=False)
    mime_type = Column(String(100), nullable=True)
    file_size = Column(Integer, nullable=True)
    checksum_sha256 = Column(String(64), nullable=True)

    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    is_archived = Column(Boolean, nullable=False, server_default=text("false"))
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

Index("ix_documents_subject", Document.subject_type, Document.subject_id)
Index("ix_documents_checksum", Document.checksum_sha256)
