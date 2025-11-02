# SARIR Personnel System — Backend Architecture (Dev/Ops)

این سند معماری بخش Backend را توضیح می‌دهد؛ آنچه در عمل راه افتاد:

## Tech Stack
- **Python 3.11**
- **FastAPI + Uvicorn**
- **SQLAlchemy + Alembic**
- **PostgreSQL 18 (Docker: `postgres:18-alpine`)**
- سیستم‌عامل میزبان: **Windows + PowerShell 7**

## چیدمان پوشه‌ها (واقعی در ریپو)

sarir-personnel-system/
├─ docs/
│ ├─ architecture.md
│ ├─ setup.md
│ └─ user-guide.md
├─ packages/
│ └─ backend/
│ ├─ main.py
│ ├─ core/
│ │ └─ database.py
│ ├─ alembic.ini
│ └─ alembic/
│ ├─ env.py
│ └─ versions/
│ └─ 0001_create_users.py
└─ Setup/
├─ docker-compose.yml
├─ Rebuild-SARIR-DB.ps1
└─ Migrate.ps1