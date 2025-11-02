from __future__ import annotations

import os
from typing import List

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core.database import ping as db_ping

# =======================
# App meta / description
# =======================
app = FastAPI(
    title="SARIR-SOFT API",
    version="1.0.1",
    description="Unified API entrypoint (health, auth, and business routes).",
)

# =======================
# CORS (configurable)
# =======================
def _parse_origins(raw: str | None) -> List[str]:
    if not raw:
        return []
    return [o.strip() for o in raw.split(",") if o.strip()]

ENV_CORS = os.getenv("CORS_ALLOW_ORIGINS")  # e.g. "http://localhost:3000,https://app.example.com"
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

# ==========
# Health
# ==========
@app.get("/health", tags=["health"])
async def health_root():
    return {"status": "ok"}

@app.get("/api/health", tags=["health"])
async def health_api():
    return {"status": "ok"}

@app.get("/api/health/db", tags=["health"])
async def health_db(verbose: int = Query(0)):
    """
    اگر DB down بود، 503 برمی‌گردد (برای liveness/readiness probes خوب است).
    """
    ok, reason, masked = await db_ping()
    body = {"status": "ok" if ok else "down"}
    if verbose:
        body.update({"db_url": masked, "reason": str(reason)})
    return body if ok else JSONResponse(status_code=503, content=body)

@app.get("/", tags=["root"])
async def root():
    return {"message": "SARIR-SOFT backend is alive", "api_base": "/api"}

# =======================
# Include Routers (safe)
# =======================
# نکته: اگر هر ماژولی نبود یا import شکست خورد، سرویس بالا می‌آید
# و فقط همان بخش غیرفعال می‌ماند؛ برای محیط dev تجربه‌ی بهتری است.

try:
    from apps.auth.routes import router as auth_router
    # توجه: اگر داخل خود روتر prefix داشته باشد، همین کافی است؛
    # وگرنه می‌توان اینجا prefix="/api" داد. چون پروژه‌ی شما
    # قبلاً به همین شکل بوده، رفتار را حفظ می‌کنیم.
    app.include_router(auth_router)
except Exception:
    pass

try:
    from apps.personnel.views.employee_routes import router as employees_router
    app.include_router(employees_router, prefix="/api")
except Exception:
    pass

try:
    from apps.drivers.views.driver_routes import router as drivers_router
    app.include_router(drivers_router, prefix="/api")
except Exception:
    pass

try:
    from apps.notifications.views.notification_routes import router as notifications_router
    app.include_router(notifications_router, prefix="/api")
except Exception:
    pass
