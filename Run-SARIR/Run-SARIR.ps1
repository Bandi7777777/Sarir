# ===== SARIR one-click launcher (stable, debug-friendly) =====
# - Docker Desktop + compose (اختیاری)
# - Backend FastAPI (venv خودکار؛ اولویت با Python 3.11/3.12)
# - Frontend Next.js (PORT=3000 + BACKEND_BASE)
# - هر سرویس در پنجره مجزا + لاگ کنار همین فایل

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$log  = Join-Path $here ("Run-SARIR_" + (Get-Date -Format "yyyyMMdd_HHmmss") + ".log")
try { Start-Transcript -Path $log -Append | Out-Null } catch {}

# ---- مسیرها (طبق پروژه شما) ----
$SetupPath    = "D:\Projects\Website\1.Code\1.SARIR\Setup"
$FrontendPath = "D:\Projects\Website\1.Code\1.SARIR\sarir-personnel-system\packages\frontend"
$BackendPath  = "D:\Projects\Website\1.Code\1.SARIR\sarir-personnel-system\packages\backend"

# ---- پورت‌ها ----
$BackendPort  = 8000
$FrontendPort = 3000
$BackendBase  = "http://127.0.0.1:$BackendPort"

# ---- ابزارک‌ها ----
function Exists($p){ Test-Path -LiteralPath $p }

function TitleRun($title, $cmd, $workdir) {
  # توجه: `$Host و `$null را escape کرده‌ایم تا در child expand نشوند (رفع ارور "=")
  $ps = "Write-Host '[${title}] cwd=$workdir' -ForegroundColor Yellow; cd `"$workdir`"; $cmd; Write-Host '[${title}] process ended. Press any key...'; `$null = `$Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')"
  Start-Process powershell -ArgumentList @("-NoLogo","-NoProfile","-ExecutionPolicy","Bypass","-NoExit","-Command", $ps) -WorkingDirectory $workdir -WindowStyle Normal
  Write-Host "» Started: $title" -ForegroundColor Green
}

function PrintStatus($name,$ok,$okColor="Green",$badColor="Red",$okText="OK",$badText="MISSING"){
  if ($ok) { $c=$okColor; $t=$okText } else { $c=$badColor; $t=$badText }
  Write-Host ($name.PadRight(12) + ": " + $t) -ForegroundColor $c
}

Write-Host "▶ Run-SARIR.ps1 started at $(Get-Date)" -ForegroundColor Cyan

# ---- Sanity checks ----
Write-Host "`n== Sanity Checks ==" -ForegroundColor Magenta
$nodeOk   = (Get-Command node -ErrorAction SilentlyContinue)  -ne $null
$pnpmOk   = (Get-Command pnpm -ErrorAction SilentlyContinue)  -ne $null
$pyCmd    = (Get-Command py    -ErrorAction SilentlyContinue)
$pythonOk = ($pyCmd -ne $null) -or (Get-Command python -ErrorAction SilentlyContinue) -ne $null
$dockerOk = (Get-Command docker -ErrorAction SilentlyContinue) -ne $null
PrintStatus "Node.js"    $nodeOk
PrintStatus "pnpm"       $pnpmOk "Green" "Yellow" "OK" "Install"
PrintStatus "Python"     $pythonOk "Green" "Yellow" "OK" "Install"
PrintStatus "docker cli" $dockerOk "Green" "Yellow" "OK" "Install"

if (-not $pnpmOk) {
  Write-Host "• Enabling corepack + pnpm..." -ForegroundColor Yellow
  try { corepack enable | Out-Null; corepack prepare pnpm@latest --activate | Out-Null } catch {}
  $pnpmOk = (Get-Command pnpm -ErrorAction SilentlyContinue) -ne $null
  PrintStatus "pnpm" $pnpmOk "Green" "Red" "OK" "FAILED"
}

# ---- 1) Docker Desktop + Compose (اختیاری) ----
Write-Host "`n== Docker Compose ==" -ForegroundColor Magenta
$composeFile = Join-Path $SetupPath "docker-compose.yml"
$yamlFile    = Join-Path $SetupPath "compose.yaml"

if (Exists $composeFile -or Exists $yamlFile) {
  $dockExe = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
  if (Exists $dockExe) {
    if (-not (Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue)) {
      Write-Host "• Starting Docker Desktop..." -ForegroundColor Yellow
      Start-Process -FilePath $dockExe | Out-Null
      Start-Sleep -Seconds 8
    } else {
      Write-Host "• Docker Desktop already running." -ForegroundColor DarkGreen
    }
  } else {
    Write-Host "• Docker Desktop exe not found at: $dockExe" -ForegroundColor DarkYellow
  }
  if ($dockerOk) {
    TitleRun "Docker Compose" "docker compose up -d; Write-Host 'Compose up issued' -ForegroundColor Green" $SetupPath
  } else {
    Write-Host "• Skipping compose (docker cli not found)" -ForegroundColor DarkYellow
  }
} else {
  Write-Host "• Skipping compose (no compose file in $SetupPath)" -ForegroundColor DarkYellow
}

# ---- Helper: انتخاب بهترین Python برای venv (اولویت 3.11/3.12) ----
function Pick-Python {
  $candidates = @()
  if ($pyCmd) { $candidates += "py -3.11","py -3.12","py -3.13","py -3.14" }
  $candidates += "python"
  foreach ($cmd in $candidates) {
    try {
      $v = & $cmd -c "import sys; print('.'.join(map(str, sys.version_info[:3])))" 2>$null
      if ($LASTEXITCODE -eq 0 -and $v) { return @{ Cmd=$cmd; Ver=$v } }
    } catch {}
  }
  return $null
}

# ---- 2) Backend (FastAPI) ----
Write-Host "`n== Backend (FastAPI) ==" -ForegroundColor Magenta
$mainPy = Join-Path $BackendPath "main.py"

if (Exists $BackendPath -and Exists $mainPy) {

  $venvDir = Join-Path $BackendPath ".venv"
  $venvAct = Join-Path $venvDir "Scripts\activate.ps1"
  $needDeps = $false

  if (-not (Exists $venvAct)) {
    $py = Pick-Python
    if ($py -eq $null) {
      Write-Host "✗ No Python found to create venv." -ForegroundColor Red
    } else {
      $ver = [version]$py.Ver
      Write-Host ("• Using Python " + $ver.ToString() + " for venv") -ForegroundColor Yellow
      if ($ver.Major -ge 3 -and $ver.Minor -ge 13) {
        Write-Host "⚠ Python $($ver.Major).$($ver.Minor) detected; pydantic-core wheels may be incompatible (خطای احتمالی). پیشنهاد: نصب Python 3.11." -ForegroundColor DarkYellow
        if (Get-Command winget -ErrorAction SilentlyContinue) {
          Start-Process cmd "/k winget install -e --id Python.Python.3.11"
        }
      }
      Push-Location $BackendPath
      try { & $py.Cmd -m venv .venv; $needDeps = $true } finally { Pop-Location }
    }
  } else {
    $needDeps = -not (Get-Command (Join-Path $venvDir "Scripts\uvicorn.exe") -ErrorAction SilentlyContinue)
  }

  if ($needDeps -and (Exists $venvAct)) {
    Write-Host "• Installing backend deps in venv..." -ForegroundColor Yellow
    $install = "`$ErrorActionPreference='Stop'; . `"$venvAct`"; python -m pip install --upgrade pip wheel; pip install `"fastapi>=0.115,<0.116`" `"uvicorn[standard]>=0.30,<0.31`" `"pydantic>=2.6,<3`" `"pydantic-core>=2.14,<3`""
    TitleRun "Backend (deps install)" $install $BackendPath
    Start-Sleep -Seconds 4
  }

  if (Exists $venvAct) {
    TitleRun "Backend (.venv)" ". `"$venvAct`"; uvicorn main:app --host 127.0.0.1 --port $BackendPort --reload" $BackendPath
  } else {
    TitleRun "Backend (system Python)" "uvicorn main:app --host 127.0.0.1 --port $BackendPort --reload" $BackendPath
  }

} else {
  Write-Host "• Skipping backend (main.py not found in $BackendPath)" -ForegroundColor DarkYellow
}

# ---- 3) Frontend (Next.js) ----
Write-Host "`n== Frontend (Next.js) ==" -ForegroundColor Magenta
if (Exists $FrontendPath) {
  # با backtick، ENV در پروسه فرزند ست می‌شود و نمایش «=...» در پنجره رخ نمی‌دهد
  $envCmd = "`$Env:BACKEND_BASE='$BackendBase'; `$Env:PORT=$FrontendPort; pnpm dev"
  TitleRun "Frontend (Next.js)" $envCmd $FrontendPath
  Start-Sleep -Seconds 4
  try { Start-Process "http://localhost:$FrontendPort/" } catch {}
} else {
  Write-Host "✗ Frontend path not found: $FrontendPath" -ForegroundColor Red
}

Write-Host "`nAll launch commands issued. Check opened windows. Log file: $log" -ForegroundColor Cyan
try { Stop-Transcript | Out-Null } catch {}
