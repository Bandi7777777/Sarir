import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from core.config import settings

# ---------------------------------------------------------------------------
# Routers (auth must exist; others log warnings if missing)
# ---------------------------------------------------------------------------
from apps.auth.routes import router as auth_router

try:
    from apps.board.views.board_routes import router as board_router
except ImportError:
    board_router = None
    print("Warning: Could not import board_routes")

try:
    from apps.personnel.views.personnel_routes import router as personnel_router
except ImportError:
    personnel_router = None
    print("Warning: Could not import personnel_routes")

try:
    from apps.contracts.views.contracts_routes import router as contracts_router
except ImportError:
    contracts_router = None
    print("Warning: Could not import contracts_routes")

try:
    from apps.insurance.views.insurance_routes import router as insurance_router
except ImportError:
    insurance_router = None
    print("Warning: Could not import insurance_routes")

try:
    from apps.reports.views.report_routes import router as report_router
except ImportError:
    report_router = None
    print("Warning: Could not import report_routes")

# ---------------------------------------------------------------------------
# App Configuration
# ---------------------------------------------------------------------------
app = FastAPI(
    title="SARIR Personnel System",
    version="1.0.7",
    description="API Backend for Sarir Integrated System",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS Configuration (Security)
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Register Routes
# ---------------------------------------------------------------------------
# Auth is required; domain routers are optional.
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
if board_router:
    app.include_router(board_router, prefix="/api/board", tags=["Dashboard/Board"])
if personnel_router:
    app.include_router(personnel_router, prefix="/api/personnel", tags=["Personnel"])
if contracts_router:
    app.include_router(contracts_router, prefix="/api/contracts", tags=["Contracts"])
if insurance_router:
    app.include_router(insurance_router, prefix="/api/insurance", tags=["Insurance"])
if report_router:
    app.include_router(report_router, prefix="/api/reports", tags=["Reports"])

# ---------------------------------------------------------------------------
# Health Check & Static Files
# ---------------------------------------------------------------------------
@app.get("/api/health")
async def health_check():
    return {"status": "active", "system": "Sarir Backend"}


@app.get("/")
async def root():
    return {"message": "Welcome to Sarir Personnel System API"}


if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")
