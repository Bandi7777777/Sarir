<# Run-SARIR.ps1 — start backend/frontend, wait ready (HttpClient), then open Chrome /login, keep window open #>
$ErrorActionPreference = "Stop"
$startedAt = Get-Date -Format "MM/dd/yyyy HH:mm:ss"
Write-Host "▶ Run-SARIR.ps1 started at $startedAt`n"
Write-Host "Script path: $($MyInvocation.MyCommand.Path)`n"
Write-Host "PowerShell: $($PSVersionTable.PSVersion)`n"

# ---------------- Paths ----------------
$ScriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$SetupDir    = Join-Path $ProjectRoot "Setup"
$BackendDir  = Join-Path $ProjectRoot "sarir-personnel-system\packages\backend"
$FrontendDir = Join-Path $ProjectRoot "sarir-personnel-system\packages\frontend"

$ComposeFile = Join-Path $SetupDir "docker-compose.yml"
$BackendMain = Join-Path $BackendDir "main.py"
$FrontendPkg = Join-Path $FrontendDir "package.json"

# ---------------- Config ----------------
$BackendHealth = "http://localhost:8000/health"
$FrontendUrl   = "http://localhost:3000"
$LoginUrl      = "$FrontendUrl/login"   # اگر مسیر لاگین فرق دارد این را عوض کن
$ChromeExe     = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$WaitMax       = 120   # sec

# ---------------- Helpers (HttpClient) ----------------
Add-Type -AssemblyName System.Net.Http
$global:_http = New-Object System.Net.Http.HttpClient
$global:_http.Timeout = [TimeSpan]::FromSeconds(2)

function Test-HttpOk([string]$u) {
  try {
    $resp = $global:_http.GetAsync($u).GetAwaiter().GetResult()
    return ([int]$resp.StatusCode -lt 500)
  } catch { return $false }
}
function Wait-Ready([string]$url, [int]$timeoutSec, [string]$label) {
  Write-Host ("• Waiting for {0} (up to {1}s) → {2}" -f $label, $timeoutSec, $url)
  for($i=0; $i -lt $timeoutSec; $i++){
    if (Test-HttpOk $url) { Write-Host ("  {0} is ready." -f $label); return $true }
    Start-Sleep -Seconds 1
    if (($i+1) % 10 -eq 0) { Write-Host ("  still waiting {0}s..." -f ($i+1)) }
  }
  Write-Host ("  {0} not ready in {1}s (continuing...)" -f $label, $timeoutSec)
  return $false
}

# ---------------- Sanity checks ----------------
Write-Host "== Sanity Checks =="
function Test-Tool($name, $cmd) { try { & $cmd | Out-Null; Write-Host "$name`t: OK" } catch { Write-Host "$name`t: MISSING" } }
Test-Tool "Node.js"     { node -v }
Test-Tool "pnpm"        { pnpm -v }
Test-Tool "Python"      { python --version }
Test-Tool "docker cli"  { docker --version }
Write-Host ""

# ---------------- Docker Compose (silent skip) ----------------
Write-Host "== Docker Compose =="
function Test-DockerEngine { & docker info *> $null; return ($LASTEXITCODE -eq 0) }
if ((Test-Path $ComposeFile) -and (Test-DockerEngine)) {
  Write-Host "• Using compose: $ComposeFile"
  Push-Location $SetupDir; try { docker compose up -d | Write-Host } finally { Pop-Location }
} elseif (Test-Path $ComposeFile) {
  Write-Host "• Docker engine is NOT running → skipping compose (no errors)."
} else {
  Write-Host "• Skipping compose (no compose file in $SetupDir)"
}
Write-Host ""

# ---------------- Backend ----------------
Write-Host "== Backend (FastAPI) =="
if (Test-Path $BackendMain) {
  Write-Host "• Starting backend from: $BackendDir"
  $env:PYTHONUNBUFFERED = "1"
  Start-Process -FilePath "powershell.exe" -WorkingDirectory $BackendDir -ArgumentList @(
    "-NoExit","-Command","python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
  )
} else { Write-Host "✗ Backend main.py not found: $BackendMain" }
Write-Host ""

# ---------------- Frontend ----------------
Write-Host "== Frontend (Next.js) =="
if (Test-Path $FrontendPkg) {
  Write-Host "• Starting frontend from: $FrontendDir"
  Start-Process -FilePath "powershell.exe" -WorkingDirectory $FrontendDir -ArgumentList @(
    "-NoExit","-Command", @"
if (Test-Path pnpm-lock.yaml) { pnpm install --frozen-lockfile } else { pnpm install }
pnpm dev
"@
  )
} else { Write-Host "✗ Frontend path not found (no package.json): $FrontendDir" }

# ---------------- Wait & Open Chrome ----------------
Write-Host ""
Write-Host "== Readiness =="
$be = Wait-Ready -url $BackendHealth -timeoutSec $WaitMax -label "backend"
$fe = Wait-Ready -url $FrontendUrl   -timeoutSec $WaitMax -label "frontend"

Write-Host ""
Write-Host "== OPENING CHROME =="
if (!(Test-Path $ChromeExe)) {
  Write-Host "✗ Chrome not found at: $ChromeExe"
  Write-Host "Open manually: $LoginUrl"
} else {
  $args = @("--new-window", "$LoginUrl")
  Write-Host ("• Launching Chrome: `"{0}`" {1}" -f $ChromeExe, ($args -join ' '))
  try {
    Start-Process -FilePath $ChromeExe -ArgumentList $args -WindowStyle Normal
    Write-Host "• Chrome launched → $LoginUrl"
  } catch {
    Write-Host "✗ Failed to launch Chrome: $($_.Exception.Message)"
    Write-Host ("Try manual:  & `"{0}`" `"{1}`"" -f $ChromeExe, $LoginUrl)
  }
}

# ---------------- Keep the launcher window open ----------------
Write-Host "`n== Launcher is running. Press ENTER to close this window =="
# (اگر ترجیح می‌دی تا وقتی سرویس‌ها بالا هستند باز بمونه:)
# while (Test-HttpOk $BackendHealth -or Test-HttpOk $FrontendUrl) { Start-Sleep -Seconds 5 }
[void](Read-Host)
