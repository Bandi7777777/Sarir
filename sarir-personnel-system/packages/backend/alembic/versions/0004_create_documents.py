"""create documents table

Revision ID: 0004_create_documents
Revises: 0003_create_auth_audit
Create Date: 2025-11-03 00:00:00
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0004_create_documents"
down_revision = "0003_create_auth_audit"
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "documents",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("subject_type", sa.String(length=32), nullable=False),
        sa.Column("subject_id", postgresql.UUID(as_uuid=True), nullable=True),

        sa.Column("title", sa.String(length=200), nullable=True),
        sa.Column("category", sa.String(length=50), nullable=False, server_default="general"),

        sa.Column("file_name", sa.String(length=255), nullable=False),
        sa.Column("file_path", sa.Text(), nullable=False),
        sa.Column("mime_type", sa.String(length=100), nullable=True),
        sa.Column("file_size", sa.Integer(), nullable=True),
        sa.Column("checksum_sha256", sa.String(length=64), nullable=True),

        sa.Column("uploaded_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),

        sa.Column("is_archived", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_documents_subject", "documents", ["subject_type", "subject_id"], unique=False)
    op.create_index("ix_documents_checksum", "documents", ["checksum_sha256"], unique=False)

def downgrade():
    op.drop_index("ix_documents_checksum", table_name="documents")
    op.drop_index("ix_documents_subject", table_name="documents")
    op.drop_table("documents")
