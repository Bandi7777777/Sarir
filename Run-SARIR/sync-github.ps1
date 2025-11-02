param(
  [string]$RepoRoot = 'D:\Projects\1. Website\1.Code\1.SARIR\sarir-personnel-system',
  [string]$Message  = (Get-Date -Format "yyyy-MM-dd HH:mm") + " - auto-sync"
)

$ErrorActionPreference = 'Stop'

function WInfo([string]$m){ Write-Host "[i] $m" }
function WOk([string]$m){ Write-Host "[OK] $m" -ForegroundColor Green }
function WErr([string]$m){ Write-Host "[X] $m" -ForegroundColor Red }

# logging (compatible with Windows PowerShell and PowerShell 7)
$ScriptPath = $PSCommandPath
if (-not $ScriptPath -or $ScriptPath -eq '') { $ScriptPath = $MyInvocation.MyCommand.Path }
$RunDir = Split-Path -LiteralPath $ScriptPath
$LogDir = Join-Path $RunDir 'logs'
if (-not (Test-Path -LiteralPath $LogDir)) {
  New-Item -ItemType Directory -Path $LogDir | Out-Null
}
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
  if (-not $git) {
    WErr "git not found in PATH"
    throw "GitMissing"
  }

  $hasOrigin = git remote | Select-String -SimpleMatch 'origin'
  if (-not $hasOrigin) {
    WErr "No 'origin' remote. Run: git remote add origin YOUR_REMOTE_URL"
    throw "NoOrigin"
  }

  $branch = (git rev-parse --abbrev-ref HEAD).Trim()
  WInfo ("Branch: " + $branch)

  $changes = git status --porcelain
  if ($changes) {
    WInfo "Staging changes..."
    git add -A
    WInfo "Committing..."
    git commit -m $Message
  } else {
    WInfo "No local changes to commit."
  }

  WInfo "Pull --rebase..."
  try { git pull --rebase } catch { WErr "Rebase failed - continuing." }

  WInfo "Push..."
  try { git push } catch {
    WInfo ("Retry: git push --set-upstream origin " + $branch)
    git push --set-upstream origin $branch
  }

  WOk "Done."
}
catch {
  WErr ("FAILED: " + $_.Exception.Message)
  exit 1
}
finally {
  Stop-Transcript | Out-Null
  WInfo ("Log file: " + $LogFile)
}
