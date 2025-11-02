param(
  [string]$RepoRoot = 'D:\Projects\1. Website\1.Code\1.SARIR\sarir-personnel-system',
  [string]$Message  = (Get-Date -Format "yyyy-MM-dd HH:mm") + " - auto-sync"
)

$ErrorActionPreference = 'Stop'

function WInfo([string]$m){ Write-Host "[i] $m" }
function WOk([string]$m){ Write-Host "[OK] $m" -ForegroundColor Green }
function WErr([string]$m){ Write-Host "[X] $m" -ForegroundColor Red }

# logging (PS 5/7 compatible) - ساده
$ScriptPath = $PSCommandPath
if (-not $ScriptPath -or $ScriptPath -eq '') { $ScriptPath = $MyInvocation.MyCommand.Path }
$RunDir = Split-Path -LiteralPath $ScriptPath
$LogDir = Join-Path $RunDir 'logs'
if (-not (Test-Path -LiteralPath $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }
$LogFile = Join-Path $LogDir ("sync-" + (Get-Date -Format 'yyyyMMdd-HHmmss') + ".log")
Start-Transcript -Path $LogFile -Append | Out-Null

try {
  if (-not (Test-Path -LiteralPath $RepoRoot)) {
    WErr ("RepoRoot not found: " + $RepoRoot)
    throw "RepoRootMissing"
  }

  Set-Location -LiteralPath $RepoRoot
  WInfo ("Repo: " + (Get-Location))

  $git = Get-Command git -ErrorAction SilentlyContinue
  if (-not $git) { WErr "git not found in PATH"; throw "GitMissing" }

  # remote/origin باید موجود باشد
  $hasOrigin = git remote | Select-String -SimpleMatch 'origin'
  if (-not $hasOrigin) { WErr "No 'origin' remote. Run: git remote add origin YOUR_REMOTE_URL"; throw "NoOrigin" }

  $branch = (git rev-parse --abbrev-ref HEAD).Trim()
  if (-not $branch) { WErr "Cannot detect current branch"; throw "NoBranch" }
  WInfo ("Branch: " + $branch)

  # تغییرات ورک‌تری؟
  $changes = git status --porcelain

  if ($changes) {
    WInfo "Changes detected. Staging..."
    git add -A
    WInfo "Committing..."
    git commit -m $Message
  } else {
    WInfo "No working tree changes."
  }

  # آیا کامیتِ پوش‌نشده داریم؟ (بدون pull/rebase)
  # اگر upstream تنظیم نیست، سعی می‌کنیم ستش کنیم؛ اگر نشد، فقط هنگام push ست‌می‌کنیم.
  $hasUpstream = $true
  $upstream = ""
  try {
    $upstream = (git rev-parse --abbrev-ref --symbolic-full-name "@{u}" 2>$null).Trim()
    if (-not $upstream) { $hasUpstream = $false }
  } catch { $hasUpstream = $false }

  if (-not $hasUpstream) {
    # تلاش برای ست‌کردن upstream به origin/<branch> اگر موجود بود
    try {
      git branch --set-upstream-to "origin/$branch" 2>$null | Out-Null
      $hasUpstream = $true
      $upstream = "origin/$branch"
      WInfo ("Upstream set to: " + $upstream)
    } catch {
      WInfo "No upstream yet; will set on first push."
      $hasUpstream = $false
    }
  }

  $ahead = 0
  if ($hasUpstream) {
    # تعداد کامیت‌های جلوتر نسبت به ریموت
    $ahead = [int]((git rev-list --count "@{u}..HEAD" 2>$null) | Select-Object -First 1)
  }

  if ($changes -or ($ahead -gt 0)) {
    WInfo ("Sync needed. Local ahead: " + $ahead)
    try {
      WInfo "Pushing..."
      git push
    } catch {
      WInfo ("Retry with --set-upstream origin " + $branch)
      git push --set-upstream origin $branch
    }
    WOk "Done."
  } else {
    WInfo "Nothing to sync (no changes and no unpushed commits)."
  }
}
catch {
  WErr ("FAILED: " + $_.Exception.Message)
  exit 1
}
finally {
  Stop-Transcript | Out-Null
  WInfo ("Log file: " + $LogFile)
}
