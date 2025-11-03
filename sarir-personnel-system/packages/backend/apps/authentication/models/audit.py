from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey, Index, text
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column
from core.database import Base

class AuthAudit(Base):
    __tablename__ = "auth_audit"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True)
    event: Mapped[str] = mapped_column(String(40), nullable=False)  # login_success, login_fail, refresh, logout, logout_all, revoke_session, revoke_current
    jti: Mapped[str | None] = mapped_column(String(64), index=True)
    ip: Mapped[str | None] = mapped_column(String(45))
    user_agent: Mapped[str | None] = mapped_column(String(512))

    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("now()"), nullable=False)

    __table_args__ = (
        Index("ix_auth_audit_event_time", "event", "created_at"),
    )
