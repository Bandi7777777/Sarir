param(
  [string]$RepoRoot = 'D:\Projects\1. Website\1.Code\1.SARIR\sarir-personnel-system',
  [string]$Message  = (Get-Date -Format "yyyy-MM-dd HH:mm") + " - auto-sync"
)

$ErrorActionPreference = 'Stop'

function WInfo([string]$m){ Write-Host "[i] $m" }
function WOk([string]$m){ Write-Host "[OK] $m" -ForegroundColor Green }
function WErr([string]$m){ Write-Host "[X] $m" -ForegroundColor Red }

# logging (PS 5/7 compatible)
$ScriptPath = $PSCommandPath
if (-not $ScriptPath -or $ScriptPath -eq '') { $ScriptPath = $MyInvocation.MyCommand.Path }
$RunDir = Split-Path -LiteralPath $ScriptPath
$LogDir = Join-Path $RunDir 'logs'
if (-not (Test-Path -LiteralPath $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }
$LogFile = Join-Path $LogDir ("sync-" + (Get-Date -Format 'yyyyMMdd-HHmmss') + ".log")
Start-Transcript -Path $LogFile -Append | Out-Null

# ------- متغیرهای خلاصه -------
$DidCommit    = $false
$CommitHash   = ""
$CommitMsg    = ""
$ChangedFiles = @()
$AheadCount   = 0
$DidPush      = $false
$UpstreamStr  = ""

try {
  if (-not (Test-Path -LiteralPath $RepoRoot)) {
    WErr ("RepoRoot not found: " + $RepoRoot)
    throw "RepoRootMissing"
  }

  Set-Location -LiteralPath $RepoRoot
  WInfo ("Repo: " + (Get-Location))

  $git = Get-Command git -ErrorAction SilentlyContinue
  if (-not $git) { WErr "git not found in PATH"; throw "GitMissing" }

  $hasOrigin = git remote | Select-String -SimpleMatch 'origin'
  if (-not $hasOrigin) { WErr "No 'origin' remote. Run: git remote add origin YOUR_REMOTE_URL"; throw "NoOrigin" }

  $branch = (git rev-parse --abbrev-ref HEAD).Trim()
  if (-not $branch) { WErr "Cannot detect current branch"; throw "NoBranch" }
  WInfo ("Branch: " + $branch)

  # تغییرات ورک‌تری؟
  $changes = git status --porcelain

  if ($changes) {
    # لیست فایل‌های تغییرکرده قبل از commit
    $ChangedFiles = ($changes | ForEach-Object {
      # ورودی porcelain مثل: " M path\file" یا "A  path\file"
      $_.Substring(3).Trim()
    })

    WInfo "Changes detected. Staging..."
    git add -A
    WInfo "Committing..."
    git commit -m $Message | Out-Null

    $DidCommit  = $true
    $CommitHash = (git rev-parse --short HEAD).Trim()
    $CommitMsg  = (git log -1 --pretty=%s).Trim()
  } else {
    WInfo "No working tree changes."
  }

  # آیا upstream داریم؟
  $hasUpstream = $true
  try {
    $UpstreamStr = (git rev-parse --abbrev-ref --symbolic-full-name "@{u}" 2>$null).Trim()
    if (-not $UpstreamStr) { $hasUpstream = $false }
  } catch { $hasUpstream = $false }

  if (-not $hasUpstream) {
    try {
      git branch --set-upstream-to "origin/$branch" 2>$null | Out-Null
      $hasUpstream = $true
      $UpstreamStr = "origin/$branch"
      WInfo ("Upstream set to: " + $UpstreamStr)
    } catch {
      WInfo "No upstream yet; will set on first push."
      $hasUpstream = $false
    }
  }

  if ($hasUpstream) {
    $AheadCount = [int]((git rev-list --count "@{u}..HEAD" 2>$null) | Select-Object -First 1)
  } else {
    # اگر upstream نداریم ولی همین الان commit کردیم، عملا ahead هستیم
    if ($DidCommit) { $AheadCount = 1 }
  }

  if ($DidCommit -or ($AheadCount -gt 0)) {
    WInfo ("Sync needed. Local ahead: " + $AheadCount)
    try {
      WInfo "Pushing..."
      git push | Out-Null
      $DidPush = $true
    } catch {
      WInfo ("Retry with --set-upstream origin " + $branch)
      git push --set-upstream origin $branch | Out-Null
      $DidPush = $true
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

  # ------- چاپ خلاصهٔ انتهایی -------
  Write-Host ""
  Write-Host "================ خلاصهٔ عملیات ================"
  Write-Host ("شاخه: " + $branch)
  if ($DidCommit) {
    Write-Host ("کامیت جدید: " + $CommitHash)
    Write-Host ("پیام کامیت: " + $CommitMsg)
    if ($ChangedFiles.Count -gt 0) {
      Write-Host "فایل‌های تغییر کرده:"
      $ChangedFiles | ForEach-Object { Write-Host (" - " + $_) }
    }
  } else {
    Write-Host "کامیت جدیدی انجام نشد."
  }
  if ($UpstreamStr -and $UpstreamStr -ne "") {
    Write-Host ("Upstream: " + $UpstreamStr)
  }
  Write-Host ("Ahead (تعداد کامیت‌های جلوتر نسبت به ریموت): " + $AheadCount)
  Write-Host ("Push انجام شد؟ " + ($(if ($DidPush) { "بله" } else { "خیر" })))
  Write-Host ("مسیر لاگ: " + $LogFile)
  Write-Host "==============================================="
  Write-Host ""

  WInfo ("Log file: " + $LogFile)
}
