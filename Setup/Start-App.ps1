param(
  [string]$ComposePath = "D:\Projects\1. Website\1.Code\1.SARIR\Setup",
  [string]$BackendPath = "D:\Projects\1. Website\1.Code\1.SARIR\sarir-personnel-system\packages\backend",
  [switch]$NoMigrations
)

$ErrorActionPreference = "Stop"

function Wait-DbHealthy([string]$name) {
  Write-Host "Waiting for $name to be healthy..."
  for ($i=0; $i -lt 60; $i++) {
    $status = docker inspect -f '{{.State.Health.Status}}' $name 2>$null
    if ($status -eq 'healthy') { Write-Host "✅ DB is healthy."; return }
    Start-Sleep -Seconds 2
  }
  throw "DB is not healthy."
}

# 1) Docker Compose up
Set-Location $ComposePath
docker compose up -d

# 2) صبر تا healthy شود
Wait-DbHealthy -name "sarir_db"

# 3) فعالسازی venv و محیط
Set-Location $BackendPath
if (-not (Test-Path ".\.venv\Scripts\Activate.ps1")) {
  python -m venv .venv
}
.\.venv\Scripts\Activate.ps1

# 4) بارگذاری .env ساده (کلید=مقدار)
$envFile = Join-Path $BackendPath ".env"
if (Test-Path $envFile) {
  (Get-Content $envFile) | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) { return }
    $kv = $line -split "=", 2
    if ($kv.Count -eq 2) { Set-Item -Path ("Env:{0}" -f $kv[0]) -Value $kv[1] }
  }
}

# 5) مایگریشن
if (-not $NoMigrations) {
  python -m alembic upgrade head
}

# 6) اجرای اپ
$env:PYTHONPATH="."
python -m uvicorn main:app --host 0.0.0.0 --port 8000
