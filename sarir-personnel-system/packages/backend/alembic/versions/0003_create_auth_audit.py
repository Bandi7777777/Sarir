"""create auth_audit table

Revision ID: 0003_create_auth_audit
Revises: 0002_create_auth_sessions
Create Date: 2025-11-03
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0003_create_auth_audit"
down_revision = "0002_create_auth_sessions"
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "auth_audit",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("event", sa.String(40), nullable=False),
        sa.Column("jti", sa.String(64), nullable=True),
        sa.Column("ip", sa.String(45), nullable=True),
        sa.Column("user_agent", sa.String(512), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_auth_audit_event_time", "auth_audit", ["event", "created_at"])
    op.create_index("ix_auth_audit_jti", "auth_audit", ["jti"])

def downgrade():
    op.drop_index("ix_auth_audit_jti", table_name="auth_audit")
    op.drop_index("ix_auth_audit_event_time", table_name="auth_audit")
    op.drop_table("auth_audit")
