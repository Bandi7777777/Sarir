# SARIR-SOFT – Snapshot (DB + Backend) — Handoff for “Basic Auth” Chat

> **Purpose:** این فایل، خلاصه‌ی دقیق کارهایی است که در این گفت‌وگو انجام شد + نسخه‌ی نهایی پیشنهادی فایل‌ها و مسیرها تا بتوانیم در چت جدید **Basic Auth** ادامه دهیم.  
> **نکته:** من بین چت‌های جداگانه حافظه‌ی دائمی ندارم. برای ادامه‌ی راحت، همین فایل را در چت جدید ضمیمه/کپی کن.

---

## 1) وضعیت نهایی

- **Docker / PostgreSQL 18 (Alpine)** روی کانتینر `sarir_db` روی پورت میزبان **5432**.
- دیتابیس **sarir**، یوزر **sarir_user**، پسورد **`Sarir@2026`** (SCRAM-SHA-256).
- جدول‌ها: `public.users` + `public.alembic_version` (نسخه `0001_create_users`).
- **Health API** بک‌اند روی `http://localhost:8000/api/health/db` → `{"status":"ok"}`.
- مشکل تداخل‌های قبلی (پسورد/%, HBA، سرویس محلی Postgres روی ویندوز، import CORS در FastAPI، و …) رفع شد.

---

## 2) مسیرها (Paths)

> فرض ریشه‌ها:
> - Setup root: `D:\Projects\1. Website\1.Code\1.SARIR\Setup`
> - Backend root: `D:\Projects\1. Website\1.Code\1.SARIR\sarir-personnel-system\packages\backend`

**Files we created/adjusted (final recommended content below):**

- `Setup\docker-compose.yml`
- `Setup\Rebuild-SARIR-DB.ps1` *(اسکریپت بازسازی سریع)*
- `packages\backend\.env` *(اختیاری؛ اما env.py روی DB_* تکیه می‌کند)*
- `packages\backend\alembic\env.py`
- `packages\backend\alembic\versions\0001_create_users.py`
- `packages\backend\core\database.py`
- `packages\backend\main.py` *(Route سلامت DB + CORS)*

---

## 3) Docker Compose (Postgres 18)

**File:** `D:\Projects\1. Website\1.Code\1.SARIR\Setup\docker-compose.yml`

```yaml
version: "3.9"

services:
  db:
    image: postgres:18-alpine
    container_name: sarir_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: sarir_user
      POSTGRES_PASSWORD: "Sarir@2026"
      POSTGRES_DB: sarir
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sarir_user -d sarir || exit 1"]
      interval: 5s
      timeout: 5s
      retries: 12
    volumes:
      - db18_data:/var/lib/postgresql/data

volumes:
  db18_data:
```

**دستورها:**

```powershell
cd "D:\Projects\1. Website\1.Code\1.SARIR\Setup"
docker compose up -d
docker ps --filter "name=sarir_db"
docker exec -e PGPASSWORD="Sarir@2026" -it sarir_db psql -U sarir_user -h 127.0.0.1 -d sarir -c "select 1;"
```

**نکته HBA (داخل کانتینر):** حالت امن (SCRAM) — پیش‌فرض PG18 هم `scram-sha-256` است، ولی الگوی زیر برای شفافیت:

```sh
# داخل کانتینر:
H=$(psql -U sarir_user -d postgres -Atc "show hba_file")
cat > "$H" <<'EOF'
# Secure HBA (scram everywhere)
local   all             all                                     scram-sha-256
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             ::1/128                 scram-sha-256
host    all             all             0.0.0.0/0               scram-sha-256
EOF
psql -U sarir_user -d postgres -c "select pg_reload_conf();"
```

**Reset Password (اگر لازم شد):**
```sh
psql -U sarir_user -d postgres -c "ALTER ROLE sarir_user WITH LOGIN PASSWORD 'Sarir@2026';"
```

---

## 4) Alembic — فایل‌های Migration

### 4.1) `alembic\versions\0001_create_users.py` (Exact final content)

**File:** `D:\Projects\1. Website\1.Code\1.SARIR\sarir-personnel-system\packages\backend\alembic\versions\0001_create_users.py`

```python
"""create users table

Revision ID: 0001_create_users
Revises:
Create Date: 2025-11-02
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_create_users"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("public_id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("username", sa.String(50), nullable=False),
        sa.Column("email", sa.String(120)),
        sa.Column("full_name", sa.String(100)),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("is_superuser", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id", name="pk_users"),
        sa.UniqueConstraint("public_id", name="uq_users_public_id"),
        sa.UniqueConstraint("username", name="uq_users_username"),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_index("ix_users_username", "users", ["username"], unique=False)
    op.create_index("ix_users_email", "users", ["email"], unique=False)

def downgrade():
    op.drop_index("ix_users_email", table_name="users")
    op.drop_index("ix_users_username", table_name="users")
    op.drop_table("users")
```

### 4.2) `alembic\env.py` (robust URL from env)

**File:** `D:\Projects\1. Website\1.Code\1.SARIR\sarir-personnel-system\packages\backend\alembic\env.py`

```python
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import os
from urllib.parse import quote_plus

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = None

def _make_sqlalchemy_url():
    url = os.getenv("DATABASE_URL")
    if url:
        return url
    host = os.getenv("DB_HOST", "127.0.0.1")
    port = os.getenv("DB_PORT", "5432")
    db   = os.getenv("DB_NAME", "sarir")
    user = os.getenv("DB_USER", "sarir_user")
    pwd  = quote_plus(os.getenv("DB_PASSWORD", ""))
    return f"postgresql+psycopg://{user}:{pwd}@{host}:{port}/{db}"

def run_migrations_offline():
    url = _make_sqlalchemy_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    connectable = engine_from_config(
        {"sqlalchemy.url": _make_sqlalchemy_url()},
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata, compare_type=True)
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

> **Alembic commands used:**
>
> ```powershell
> # در ریشه backend (داخل venv)
> python -m alembic history
> python -m alembic current
> python -m alembic upgrade head
> python -m alembic stamp 0001_create_users
> ```

---

## 5) Backend — Env, Database, Health

### 5.1) `.env` (optional; ساده نگه‌دار)

**File:** `D:\Projects\1. Website\1.Code\1.SARIR\sarir-personnel-system\packages\backend\.env`

```dotenv
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=sarir
DB_USER=sarir_user
DB_PASSWORD=Sarir@2026
# DATABASE_URL=postgresql+psycopg://sarir_user:Sarir%402026@127.0.0.1:5432/sarir

SECRET_KEY=CHANGE_ME_IN_PROD
```

### 5.2) `core\database.py`

**File:** `D:\Projects\1. Website\1.Code\1.SARIR\sarir-personnel-system\packages\backend\core\database.py`

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from urllib.parse import quote_plus
import os

def _make_url():
    url = os.getenv("DATABASE_URL")
    if url:
        return url
    host = os.getenv("DB_HOST", "127.0.0.1")
    port = os.getenv("DB_PORT", "5432")
    name = os.getenv("DB_NAME", "sarir")
    user = os.getenv("DB_USER", "sarir_user")
    pwd  = quote_plus(os.getenv("DB_PASSWORD", ""))
    return f"postgresql+psycopg://{user}:{pwd}@{host}:{port}/{name}"

SQLALCHEMY_DATABASE_URL = _make_url()

engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True, pool_size=5, max_overflow=10)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def mask_url(url: str) -> str:
    # mask password in DSN for logs/health
    if "://" not in url:
        return url
    scheme, rest = url.split("://", 1)
    if "@" not in rest or ":" not in rest.split("@")[0]:
        return f"{scheme}://***:{'***'}@" + rest.split("@", 1)[1] if "@" in rest else f"{scheme}://***"
    userpass, hostpart = rest.split("@", 1)
    user = userpass.split(":", 1)[0]
    return f"{scheme}://{user}:***@{hostpart}"
```

### 5.3) `main.py` (CORS + /api/health/db)

**File:** `D:\Projects\1. Website\1.Code\1.SARIR\sarir-personnel-system\packages\backend\main.py`

```python
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy import text
from core.database import engine, SQLALCHEMY_DATABASE_URL, mask_url

app = FastAPI(title="SARIR Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: محدود به دامنه‌های فرانت‌اند در محیط prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health/db")
def health_db(verbose: int = 0):
    try:
        with engine.connect() as conn:
            conn.execute(text("select 1"))
        return {"status": "ok", "db_url": mask_url(SQLALCHEMY_DATABASE_URL), "reason": ""}
    except Exception as e:
        msg = f"{type(e).__name__}: {e}"
        payload = {"status": "down", "db_url": mask_url(SQLALCHEMY_DATABASE_URL)}
        if verbose:
            payload["reason"] = msg
        return payload
```

**Run (venv):**
```powershell
cd "D:\Projects\1. Website\1.Code\1.SARIR\sarir-personnel-system\packages\backend"
.\.venv\Scripts\Activate.ps1
$env:PYTHONPATH="."
# اگر لازم بود:
python -m pip install --upgrade uvicorn fastapi starlette sqlalchemy alembic psycopg[binary] python-dotenv passlib[bcrypt]
# اجرا:
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 6) Seed/تست کاربر admin

**ایجاد/به‌روزرسانی پسورد ادمین با bcrypt (pgcrypto/Blowfish):**
```sh
docker exec -it sarir_db sh -lc '
psql -U sarir_user -d sarir <<SQL
CREATE EXTENSION IF NOT EXISTS pgcrypto;
INSERT INTO public.users (username, email, full_name, hashed_password, is_superuser)
VALUES ('admin', 'admin@example.com', 'Admin', crypt($$Sarir@2026$$, gen_salt('bf')), true)
ON CONFLICT (username) DO UPDATE
SET hashed_password = EXCLUDED.hashed_password, is_superuser = true;
SQL
'
```

**تست DB:**
```powershell
docker exec -e PGPASSWORD="Sarir@2026" -it sarir_db psql -U sarir_user -h 127.0.0.1 -d sarir -c "select 1;"
```

---

## 7) Pitfalls که برطرف شدند

- **Password & URL encoding**: وجود `@` در پسورد → باید با `%40` در URL انکود شود. ما در کد از `quote_plus` استفاده کردیم تا این مشکل حذف شود.
- **HBA و روش auth**: برای دیباگ موقتاً `trust`، سپس بازگشت به **SCRAM-SHA-256**.
- **سرویس محلی Postgres روی ویندوز**: روی 5432 لیسن می‌کرد و با Docker تداخل داشت؛ بررسی با `netstat -ano | findstr :5432` و `tasklist` و رفع.
- **CORS import**: بجای `fastapi.middleware.cors.CorsMiddleware` از **`starlette.middleware.cors.CORSMiddleware`** استفاده شد.
- **python-dotenv parse error**: وابستگی env.py به `.env` حذف شد؛ مستقیماً از `os.getenv` استفاده می‌کنیم.

---

## 8) How to Rebuild from Zero (Fast)

```powershell
# 1) Stop & clean
cd "D:\Projects\1. Website\1.Code\1.SARIR\Setup"
docker compose down -v

# 2) Start DB
docker compose up -d

# 3) Wait until healthy
docker ps --filter "name=sarir_db"
docker inspect -f "{{.State.Health.Status}}" sarir_db

# 4) Optional: enforce HBA scram (see section 3)
# 5) Optional: reset password (see section 3)

# 6) Backend (venv)
cd "D:\Projects\1. Website\1.Code\1.SARIR\sarir-personnel-system\packages\backend"
.\.venv\Scripts\Activate.ps1
$env:PYTHONPATH="."
$env:DB_HOST="127.0.0.1"; $env:DB_PORT="5432"; $env:DB_NAME="sarir"; $env:DB_USER="sarir_user"; $env:DB_PASSWORD="Sarir@2026"

# 7) Alembic
python -m alembic upgrade head

# 8) Run app
python -m uvicorn main:app --host 0.0.0.0 --port 8000
# Health: http://localhost:8000/api/health/db
```

---

## 9) Next — برای چت “Basic Auth”

- آماده‌ایم برای افزودن:
  - JWT auth endpoints (`/auth/register`, `/auth/login`, `/auth/me`) با **passlib[bcrypt]** یا **argon2**.
  - dependency `get_current_user()` + Role-based guards.
  - محدودسازی CORS به دامنه‌های واقعی فرانت‌اند.

> لطفاً همین فایل را در چت جدید ضمیمه کن یا همین متن را paste کن تا ۱۰۰٪ همسو ادامه دهیم.