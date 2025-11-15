from __future__ import annotations

import os
import asyncio
import hmac
from typing import List

from fastapi import FastAPI, Query, Depends, HTTPException, status, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# DB health
from core.database import ping as db_ping

# === App meta ===
app = FastAPI(
    title="SARIR-SOFT API",
    version="1.0.6",
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

# ---------------------------------------------------------------------
# Basic Auth (env-driven) فقط برای مسیرهای /api/personnel/**
# ---------------------------------------------------------------------
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from passlib.context import CryptContext

_security_basic = HTTPBasic()
_pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

_BASIC_ENABLED = os.getenv("BASIC_AUTH_ENABLED", "false").lower() == "true"
_BASIC_USER = os.getenv("BASIC_AUTH_USERNAME", "internal")
_BASIC_HASH = os.getenv("BASIC_AUTH_PASSWORD_HASH")
_BASIC_PLAIN = os.getenv("BASIC_AUTH_PASSWORD")  # فقط برای dev
_BASIC_SCOPE = os.getenv("BASIC_AUTH_SCOPE", "/api/personnel").rstrip("/")

if not _BASIC_HASH:
    # اگر هش ندادی، در dev از plain بساز؛ در prod فقط HASH بده
    if _BASIC_PLAIN:
        _BASIC_HASH = _pwd_ctx.hash(_BASIC_PLAIN)
    else:
        _BASIC_HASH = _pwd_ctx.hash("change-me")

def _eq(a: str, b: str) -> bool:
    return hmac.compare_digest(a, b)

def verify_basic_for_personnel(credentials: HTTPBasicCredentials = Depends(_security_basic)):
    if not _BASIC_ENABLED:
        return
    if not _eq(credentials.username, _BASIC_USER):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials.",
            headers={"WWW-Authenticate": "Basic"},
        )
    if not _pwd_ctx.verify(credentials.password, _BASIC_HASH):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials.",
            headers={"WWW-Authenticate": "Basic"},
        )
    return {"username": _BASIC_USER}

# ----------------------
# Routers (include here)
# ----------------------
from apps.authentication.routes.auth import router as auth_router
app.include_router(auth_router, prefix="/api")

from apps.authentication.routes.sessions import router as sessions_router
app.include_router(sessions_router, prefix="/api")

# Documents
from apps.documents.views.document_routes import router as document_router
app.include_router(document_router, prefix="/api/documents", tags=["documents"])

# Board / Assembly (optional modules)
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

# Personnel (روت‌های پرسنل را با Basic محافظت می‌کنیم)
try:
    from apps.personnel.views.employee_routes import router as employees_router

    protected_personnel = APIRouter(
        prefix="/api",
        dependencies=[Depends(verify_basic_for_personnel)] if _BASIC_ENABLED else None,
    )
    protected_personnel.include_router(employees_router)
    app.include_router(protected_personnel)
except Exception:
    pass

# Notifications (optional)
try:
    from apps.notifications.views.notification_routes import router as notifications_router
    app.include_router(notifications_router, prefix="/api")
except Exception:
    pass

# Drivers (optional)
try:
    from apps.drivers.views.driver_routes import router as drivers_router
    app.include_router(drivers_router, prefix="/api")
except Exception:
    pass

# تست سریع Basic برای پرسنل
_personnel_test = APIRouter(
    prefix="/api/personnel",
    tags=["personnel"],
    dependencies=[Depends(verify_basic_for_personnel)] if _BASIC_ENABLED else None,
)

@_personnel_test.get("/ping")
def personnel_ping():
    return {"ok": True}

app.include_router(_personnel_test)

# === Background housekeeping for expired sessions ===
from apps.authentication.services.cleanup import run_cleanup_loop
_cleanup_task: asyncio.Task | None = None

@app.on_event("startup")
async def _startup():
    # شروع job پاکسازی بدون ایجاد crash در shutdown
    global _cleanup_task
    _cleanup_task = asyncio.create_task(run_cleanup_loop())

@app.on_event("shutdown")
async def _shutdown():
    # فقط cancel کن؛ دیگه await نکن تا CancelledError به lifespan نرسه
    global _cleanup_task
    if _cleanup_task and not _cleanup_task.cancelled():
        _cleanup_task.cancel()
