# scripts/dev.ps1
# Ù¾Ù†Ø¬Ø±Ù‡ 1: Backend
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd 'D:\Projects\Website\1.Code\1.SARIR\sarir-personnel-system\packages\backend'; .\.venv\Scripts\Activate.ps1; python -m uvicorn main:app --reload --port 8000"
)

# Ù¾Ù†Ø¬Ø±Ù‡ 2: Frontend
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd 'D:\Projects\Website\1.Code\1.SARIR\sarir-personnel-system\packages\frontend'; pnpm dev -- --port 3300"
)
