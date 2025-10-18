from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Routers
from reminders import router as reminders_router  # from packages/backend/reminders.py

app = FastAPI(title="SARIR Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # TODO: در پروڈاکشن محدودتر کن
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Mockهای سبک برای جلوگیری از 502 در FE (می‌تونی حذف کنی)
@app.get("/api/notifications")
def list_notifications():
    return [
        {"id": 1, "title": "System update", "body": "All services are healthy."},
        {"id": 2, "title": "Reminder", "body": "HR form deadline is tomorrow."},
    ]

@app.get("/api/drivers")
def list_drivers():
    return [
        {"id": "DRV-1001", "name": "John Doe", "status": "active"},
        {"id": "DRV-1002", "name": "Jane Smith", "status": "inactive"},
    ]

# اتصال روت‌های یادآور
app.include_router(reminders_router)
