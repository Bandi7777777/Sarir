Param(
  [string]$RepoPath = "D:\Projects\Website\1.Code\1.SARIR",
  [string]$Branch   = "main"
)

$ErrorActionPreference = 'Stop'

function Write-Info($msg){ Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Ok($msg){ Write-Host "[OK]   $msg" -ForegroundColor Green }
function Write-Warn($msg){ Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err($msg){ Write-Host "[ERR]  $msg" -ForegroundColor Red }

try {
  # 0) چک پیش‌نیازها
  if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Err "git روی سیستم در PATH نیست."
    throw "Install Git for Windows and try again."
  }
  if (-not (Test-Path $RepoPath)) { throw "RepoPath not found: $RepoPath" }

  Set-Location $RepoPath
  if (-not (Test-Path ".git")) { throw "This folder is not a git repository: $RepoPath" }

  # 1) همسان‌سازی تنظیمات مفید
  git config --global --add safe.directory $RepoPath | Out-Null
  git config --global core.autocrlf true | Out-Null

  # 2) نمایش شاخه فعلی و سوئیچ به شاخه هدف
  $currentBranch = (git rev-parse --abbrev-ref HEAD).Trim()
  if ($currentBranch -ne $Branch) {
    Write-Info "Switching branch: $currentBranch -> $Branch"
    git checkout $Branch
  }

  # 3) دریافت آخرین تغییرات ریموت (با اتو-استش) و ری‌بیس
  Write-Info "Pull (rebase + autostash) from origin/$Branch"
  git pull --rebase --autostash origin $Branch

  # 4) افزودن همه تغییرات (با احترام به .gitignore)
  Write-Info "Staging changes"
  git add -A

  # 5) اگر تغییری هست، کامیت کنیم
  $status = git status --porcelain
  if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Ok "چیزی برای کامیت نیست. ریپو با ریموت همگام است."
  } else {
    $ts = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    $msg = "chore(sync): auto-sync $ts"
    Write-Info "Committing: $msg"
    git commit -m $msg
  }

  # 6) پوش به ریموت
  Write-Info "Pushing to origin/$Branch"
  git push origin $Branch

  Write-Ok "همگام‌سازی با موفقیت انجام شد ✅"
}
catch {
  Write-Err $_
  exit 1
}
