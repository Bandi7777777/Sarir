param(
  [string]$RepoRoot = 'D:\Projects\1. Website\1.Code\1.SARIR\sarir-personnel-system',
  [string]$Message  = (Get-Date -Format "yyyy-MM-dd HH:mm") + " - auto-sync"
)

$ErrorActionPreference = 'Stop'

function WInfo([string]$m){ Write-Host "[i]  $m" -ForegroundColor Cyan }
function WOk([string]$m){ Write-Host "[OK] $m" -ForegroundColor Green }
function WErr([string]$m){ Write-Host "[X]  $m" -ForegroundColor Red }

# ---- helpers: fixed-width console tables (no ANSI) ----
function Write-Cell([string]$text, [int]$width, [System.ConsoleColor]$color=[System.ConsoleColor]::Gray){
  $plain = $text
  if ($plain.Length -gt $width) { $plain = $plain.Substring(0, $width) }
  $pad = $width - $plain.Length
  $orig = $Host.UI.RawUI.ForegroundColor
  $Host.UI.RawUI.ForegroundColor = $color
  Write-Host -NoNewline $plain
  $Host.UI.RawUI.ForegroundColor = $orig
  if ($pad -gt 0) { Write-Host -NoNewline (" " * $pad) }
}

function Draw-Table2([string]$title, [hashtable[]]$rows){
  if (-not $rows) { return }
  $w1 = 14
  $w2 = 88
  $bar = "+" + ("-"*($w1+2)) + "+" + ("-"*($w2+2)) + "+"

  Write-Host ""
  Write-Host $bar
  if ($title){
    Write-Host "| " -NoNewline
    Write-Cell $title $w1 ([System.ConsoleColor]::Magenta)
    Write-Host " | " -NoNewline
    Write-Cell "" $w2
    Write-Host " |"
    Write-Host $bar
  }

  # header
  Write-Host "| " -NoNewline
  Write-Cell "Field" $w1 ([System.ConsoleColor]::Yellow)
  Write-Host " | " -NoNewline
  Write-Cell "Value" $w2 ([System.ConsoleColor]::Yellow)
  Write-Host " |"
  Write-Host $bar

  foreach($r in $rows){
    $field = [string]$r.Field
    $value = [string]$r.Value
    $col = [System.ConsoleColor]::Gray
    if ($r.ContainsKey('Color') -and $r.Color) { $col = $r.Color }

    Write-Host "| " -NoNewline
    Write-Cell $field $w1 ([System.ConsoleColor]::Gray)
    Write-Host " | " -NoNewline
    Write-Cell $value $w2 $col
    Write-Host " |"
  }
  Write-Host $bar
}

function Draw-Table1([string]$title, [string[]]$items){
  if (-not $items -or $items.Count -eq 0) { return }
  $w = ($items | ForEach-Object { $_.Length } | Measure-Object -Maximum).Maximum
  if ($w -lt 10) { $w = 10 }
  $bar = "+" + ("-"*($w+2)) + "+"

  Write-Host ""
  Write-Host $bar
  if ($title){
    Write-Host "| " -NoNewline
    Write-Cell $title $w ([System.ConsoleColor]::Magenta)
    Write-Host " |"
    Write-Host $bar
  }
  foreach($x in $items){
    Write-Host "| " -NoNewline
    Write-Cell $x $w ([System.ConsoleColor]::Cyan)
    Write-Host " |"
  }
  Write-Host $bar
}

# ---------- logging ----------
$ScriptPath = $PSCommandPath
if (-not $ScriptPath -or $ScriptPath -eq '') { $ScriptPath = $MyInvocation.MyCommand.Path }
$RunDir = Split-Path -LiteralPath $ScriptPath
$LogDir = Join-Path $RunDir 'logs'
if (-not (Test-Path -LiteralPath $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }
$LogFile = Join-Path $LogDir ("sync-" + (Get-Date -Format 'yyyyMMdd-HHmmss') + ".log")
Start-Transcript -Path $LogFile -Append | Out-Null

# ---------- summary vars ----------
$DidCommit    = $false
$CommitHash   = ""
$CommitMsg    = ""
$ChangedFiles = @()
$AheadCount   = 0
$DidPush      = $false
$UpstreamStr  = ""
$Branch       = ""

try {
  if (-not (Test-Path -LiteralPath $RepoRoot)) { WErr ("RepoRoot not found: " + $RepoRoot); throw "RepoRootMissing" }

  Set-Location -LiteralPath $RepoRoot
  WInfo ("Repo: " + (Get-Location))

  $git = Get-Command git -ErrorAction SilentlyContinue
  if (-not $git) { WErr "git not found in PATH"; throw "GitMissing" }

  $hasOrigin = git remote | Select-String -SimpleMatch 'origin'
  if (-not $hasOrigin) { WErr "No 'origin' remote. Run: git remote add origin YOUR_REMOTE_URL"; throw "NoOrigin" }

  $Branch = (git rev-parse --abbrev-ref HEAD).Trim()
  if (-not $Branch) { WErr "Cannot detect current branch"; throw "NoBranch" }
  WInfo ("Branch: " + $Branch)

  $changes = git status --porcelain
  if ($changes) {
    $ChangedFiles = ($changes | ForEach-Object { $_.Substring(3).Trim() })
    WInfo "Changes detected. Staging..."
    git add -A | Out-Null
    WInfo "Committing..."
    git commit -m $Message | Out-Null
    $DidCommit  = $true
    $CommitHash = (git rev-parse --short HEAD).Trim()
    $CommitMsg  = (git log -1 --pretty=%s).Trim()
  } else {
    WInfo "No working tree changes."
  }

  $hasUpstream = $true
  try {
    $UpstreamStr = (git rev-parse --abbrev-ref --symbolic-full-name "@{u}" 2>$null).Trim()
    if (-not $UpstreamStr) { $hasUpstream = $false }
  } catch { $hasUpstream = $false }

  if (-not $hasUpstream) {
    try {
      git branch --set-upstream-to "origin/$Branch" 2>$null | Out-Null
      $hasUpstream = $true
      $UpstreamStr = "origin/$Branch"
      WInfo ("Upstream set to: " + $UpstreamStr)
    } catch {
      WInfo "No upstream yet; will set on first push."
      $hasUpstream = $false
    }
  }

  if ($hasUpstream) {
    $AheadCount = [int]((git rev-list --count "@{u}..HEAD" 2>$null) | Select-Object -First 1)
  } elseif ($DidCommit) {
    $AheadCount = 1
  }

  if ($DidCommit -or ($AheadCount -gt 0)) {
    WInfo ("Sync needed. Local ahead: " + $AheadCount)
    try {
      WInfo "Pushing..."
      git push | Out-Null
      $DidPush = $true
    } catch {
      WInfo ("Retry with --set-upstream origin " + $Branch)
      git push --set-upstream origin $Branch | Out-Null
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

  $rows = @(
    @{ Field = "Branch";         Value = $Branch;                                    Color = [System.ConsoleColor]::Cyan }
    @{ Field = "New Commit";     Value = ($(if($DidCommit){ $CommitHash } else { "-" })); Color = [System.ConsoleColor]::Green }
    @{ Field = "Commit Message"; Value = ($(if($DidCommit){ $CommitMsg } else { "-" })) }
    @{ Field = "Upstream";       Value = ($(if($UpstreamStr){ $UpstreamStr } else { "-" })) }
    @{ Field = "Ahead Count";    Value = "$AheadCount";                              Color = [System.ConsoleColor]::Cyan }
    @{ Field = "Pushed?";        Value = ($(if($DidPush){ "Yes" } else { "No" }));   Color = ($(if($DidPush){ [System.ConsoleColor]::Green } else { [System.ConsoleColor]::Red })) }
    @{ Field = "Log File";       Value = $LogFile }
  )
  Draw-Table2 "SUMMARY" $rows

  if ($ChangedFiles -and $ChangedFiles.Count -gt 0) {
    Draw-Table1 "CHANGED FILES" $ChangedFiles
  }

  WInfo ("Log file: " + $LogFile)
}
