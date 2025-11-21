from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# ---------------------------------------------------------------------------
# Import Routers based on your Project Structure (backend/apps/...)
# ---------------------------------------------------------------------------
# نکته: اگر نام دقیق فایل‌ها متفاوت است، فقط نام فایل را در انتهای خط اصلاح کنید
try:
    from apps.authentication.views.auth_routes import router as auth_router
except ImportError:
    auth_router = None
    print("Warning: Could not import auth_routes")

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
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # آدرس سرور نهایی را بعدا اینجا اضافه کنید
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Register Routes
# ---------------------------------------------------------------------------
# فقط روترهایی که با موفقیت ایمپورت شده‌اند را ثبت می‌کنیم
if auth_router:
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

# اگر پوشه static دارید برای سرو کردن فایل‌های آپلودی:
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")