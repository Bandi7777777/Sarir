# راه‌اندازی از صفر (Backend + DB)

این راهنما تمام کاری که انجام دادیم را به شکل قابل تکرار جمع‌بندی می‌کند.

## پیش‌نیازها
- **Docker Desktop** با WSL2
- **PowerShell 7** (بهتر است با Run as Administrator)
- **Python 3.11** و یک venv تمیز

## 1) بالا آوردن Postgres 18 با Docker

پوشه: `Setup/`  
فایل: `docker-compose.yml`

```yaml
version: "3.8"
services:
  sarir_db:
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
      interval: 3s
      timeout: 3s
      retries: 20
    volumes:
      - db18_data:/var/lib/postgresql/data
volumes:
  db18_data:
