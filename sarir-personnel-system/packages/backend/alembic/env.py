from __future__ import annotations
from logging.config import fileConfig
from alembic import context
import os, sys
from sqlalchemy import create_engine, pool

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from core.database import Base  # shared Base

config = context.config
if config.config_file_name:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "sarir")
DB_USER = os.getenv("DB_USER", "sarir_user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

ENGINE_URL = f"postgresql+psycopg://{DB_HOST}:{DB_PORT}/{DB_NAME}"
CONNECT_ARGS = {"host": DB_HOST, "port": DB_PORT, "dbname": DB_NAME, "user": DB_USER, "password": DB_PASSWORD}

def run_migrations_offline() -> None:
    context.configure(
        url=ENGINE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
        include_schemas=True,
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    engine = create_engine(ENGINE_URL, pool_pre_ping=True, poolclass=pool.NullPool, connect_args=CONNECT_ARGS)
    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
            include_schemas=True,
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
