from __future__ import annotations

import os
import asyncio
from typing import List

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core.database import ping as db_ping

# === App meta ===
app = FastAPI(
    title="SARIR-SOFT API",
    version="1.0.4",
    description="Unified API entrypoint (health, auth, and business routes).",
)

# === CORS (env-driven) ===
def _parse_origins(raw: str | None) -> List[str]:
    if not raw:
        return []
    return [o.strip() for o in raw.split(",") if o.strip()]

ENV_CORS = os.getenv("CORS_ALLOW_ORIGINS")
DEFAULT_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]
allow_origins = _parse_origins(ENV_CORS) or DEFAULT_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins if "*" not in allow_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=600,
)

# === Health ===
@app.get("/health", tags=["health"])
async def health_root():
    return {"status": "ok"}

@app.get("/api/health", tags=["health"])
async def health_api():
    return {"status": "ok"}

@app.get("/api/health/db", tags=["health"])
async def health_db(verbose: int = Query(0)):
    ok, reason, masked = await db_ping()
    body = {"status": "ok" if ok else "down"}
    if verbose:
        body.update({"db_url": masked, "reason": str(reason)})
    return body if ok else JSONResponse(status_code=503, content=body)

@app.get("/", tags=["root"])
async def root():
    return {"message": "SARIR-SOFT backend is alive", "api_base": "/api"}

# === Routers (بعد از ساخت app ایمپورت و اینکلود می‌کنیم) ===
from apps.authentication.routes.auth import router as auth_router
app.include_router(auth_router, prefix="/api")

from apps.authentication.routes.sessions import router as sessions_router
app.include_router(sessions_router, prefix="/api")

# مدارک (Documents)
from apps.documents.views.document_routes import router as document_router
app.include_router(document_router, prefix="/api/documents", tags=["documents"])

# هیئت‌مدیره و مجامع (اگر فایل‌ها را ساخته‌اید)
try:
    from apps.board.views.board_routes import router as board_router
    app.include_router(board_router, prefix="/api")
except Exception:
    pass

try:
    from apps.assembly.views.assembly_routes import router as assembly_router
    app.include_router(assembly_router, prefix="/api")
except Exception:
    pass

# سایر ماژول‌ها
try:
    from apps.personnel.views.employee_routes import router as employees_router
    app.include_router(employees_router, prefix="/api")
except Exception:
    pass

try:
    from apps.notifications.views.notification_routes import router as notifications_router
    app.include_router(notifications_router, prefix="/api")
except Exception:
    pass

try:
    from apps.drivers.views.driver_routes import router as drivers_router
    app.include_router(drivers_router, prefix="/api")
except Exception:
    pass

# === Background housekeeping for expired sessions ===
from apps.authentication.services.cleanup import run_cleanup_loop
_cleanup_task: asyncio.Task | None = None

@app.on_event("startup")
async def _startup():
    global _cleanup_task
    _cleanup_task = asyncio.create_task(run_cleanup_loop())  # هر ۳۰ دقیقه یک‌بار پاک‌سازی

@app.on_event("shutdown")
async def _shutdown():
    global _cleanup_task
    if _cleanup_task:
        _cleanup_task.cancel()
        try:
            await _cleanup_task
        except Exception:
            pass
