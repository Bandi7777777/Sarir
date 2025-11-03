"""create board_members and assemblies

Revision ID: 0005_create_board_and_assembly
Revises: 0004_create_documents
Create Date: 2025-11-03 00:00:00
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0005_create_board_and_assembly"
down_revision = "0004_create_documents"
branch_labels = None
depends_on = None

def build_table_board_members():
    op.create_table(
        "board_members",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("full_name", sa.String(length=120), nullable=False),
        sa.Column("role", sa.String(length=60), nullable=True),
        sa.Column("email", sa.String(length=120), nullable=True),
        sa.Column("phone", sa.String(length=40), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

def build_table_assemblies():
    op.create_table(
        "assemblies",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("title", sa.String(length=160), nullable=False),
        sa.Column("fiscal_year", sa.String(length=10), nullable=True),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

def upgrade():
    build_table_board_members()
    build_table_assemblies()

def downgrade():
    op.drop_table("assemblies")
    op.drop_table("board_members")
