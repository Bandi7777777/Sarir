from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.engine.url import make_url

from .settings import settings


url = make_url(settings.DATABASE_URL)

# اگر sqlite async خواستی استفاده کنی باید driver async باشه: sqlite+aiosqlite
# برای Postgres با psycopg3 async نیازی به تغییر اضافی نیست.
engine = create_async_engine(settings.DATABASE_URL, pool_pre_ping=True, future=True)

AsyncSessionLocal = async_sessionmaker(
    bind=engine, autoflush=False, autocommit=False, expire_on_commit=False, class_=AsyncSession
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
