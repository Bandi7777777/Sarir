from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Boolean, ForeignKey, Index, text
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class AuthSession(Base):
    """
    سرور-ساید ردیابی سشن‌ها (برای رفرش‌توکن‌های چرخشی).
    - jti: شناسه یکتای رفرش‌توکن (برای Rotation/Revocation)
    - expires_at: تاریخ انقضا (هم‌راستا با exp خود توکن)
    - last_used_at: آخرین استفاده (در هر /refresh به‌روزرسانی می‌شود)
    - is_revoked: ابطال دستی/سیستمی (logout یا logout-all)
    - device_id, user_agent, ip: برای محدودسازی همزمانی و مانیتورینگ
    """

    __tablename__ = "auth_sessions"

    # Keys
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        nullable=False,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Token identity
    jti: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)

    # Device / Context (اختیاری اما مفید)
    device_id: Mapped[Optional[str]] = mapped_column(String(80))
    user_agent: Mapped[Optional[str]] = mapped_column(String(512))
    ip: Mapped[Optional[str]] = mapped_column(String(45))  # IPv4/IPv6

    # Lifecycle
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=text("now()"),
        nullable=False,
    )
    last_used_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=text("now()"),
        onupdate=text("now()"),
        nullable=False,
    )
    expires_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        index=True,
    )
    is_revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)

    # Relation
    user = relationship("User", back_populates="sessions")

    __table_args__ = (
        Index("ix_auth_sessions_user_active", "user_id", "is_revoked"),
        Index("ix_auth_sessions_expiry_scan", "expires_at"),
    )

    def __repr__(self) -> str:
        state = "revoked" if self.is_revoked else "active"
        return f"<AuthSession {self.jti} {state} for {self.user_id}>"
