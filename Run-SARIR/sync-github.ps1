param(
  [string]$RepoRoot = 'D:\Projects\1. Website\1.Code\1.SARIR\sarir-personnel-system',
  [string]$Message  = (Get-Date -Format "yyyy-MM-dd HH:mm") + " - auto-sync"
)

$ErrorActionPreference = 'Stop'

# ---------- Helpers (ANSI-safe, ASCII-only) ----------
function C([string]$txt, [string]$code) {
  $esc = [char]27
  return "$esc[$code" + "m$txt$esc[0m"
}
function StripAnsi([string]$s) {
  return ([regex]::Replace($s, "`e\[[0-9;]*m", ""))
}
function Pad([string]$s, [int]$w) {
  $plain = StripAnsi $s
  $pad = $w - $plain.Length
  if ($pad -lt 0) { $pad = 0 }
  return $s + (' ' * $pad)
}
function DrawTable2Cols($title, $rows) {
  # rows: array of @{Name=''; Value=''}
  $nameWidth  = 0
  $valueWidth = 0
  foreach ($r in $rows) {
    $n = [string]$r.Name
    $v = [string]$r.Value
    if ((StripAnsi $n).Length -gt $nameWidth)  { $nameWidth  = (StripAnsi $n).Length }
    if ((StripAnsi $v).Length -gt $valueWidth) { $valueWidth = (StripAnsi $v).Length }
  }
  if ($nameWidth  -lt 6)  { $nameWidth  = 6  }
  if ($valueWidth -lt 10) { $valueWidth = 10 }

  $top    = '+' + ('-'*($nameWidth+2)) + '+' + ('-'*($valueWidth+2)) + '+'
  $sep    = $top
  $bottom = $top

  if ($title -and $title -ne '') {
    $t = " " + $title + " "
    $line = $top
    Write-Host (C $line '36')
  } else {
    Write-Host $top
  }

  # header
  $h1 = C(' Field ', '97;44') # white on blue
  $h2 = C(' Value ', '97;44')
  $hLeft  = Pad((C('Field','93')), $nameWidth)   # yellow
  $hRight = Pad((C('Value','93')), $valueWidth)  # yellow
  $header = '|' + ' ' + $hLeft + ' ' + '|' + ' ' + $hRight + ' ' + '|'
  Write-Host $header
  Write-Host $sep

  foreach ($r in $rows) {
    $n = Pad([string]$r.Name,  $nameWidth)
    $v = Pad([string]$r.Value, $valueWidth)
    Write-Host ('|' + ' ' + $n + ' ' + '|' + ' ' + $v + ' ' + '|')
  }
  Write-Host $bottom
}

function DrawTable1Col($title, $items) {
  # items: array of strings
  if (-not $items -or $items.Count -eq 0) { return }
  $w = 0
  foreach ($x in $items) {
    if ((StripAnsi $x).Length -gt $w) { $w = (StripAnsi $x).Length }
  }
  if ($w -lt 5) { $w = 5 }
  $top = '+' + ('-'*($w+2)) + '+'
  Write-Host (C $top '36') # cyan
  if ($title -and $title -ne '') {
    $caption = Pad($title, $w)
    Write-Host ('|' + ' ' + (C $caption '95') + ' ' + '|') # magenta title
    Write-Host $top
  }
  foreach ($x in $items) {
    Write-Host ('|' + ' ' + (Pad $x $w) + ' ' + '|')
  }
  Write-Host $top
}

function WInfo([string]$m){ Write-Host (C "[i]" "36") " $m" }      # cyan
function WOk([string]$m){ Write-Host (C "[OK]" "92") " $m" }       # bright green
function WErr([string]$m){ Write-Host (C "[X]" "91") " $m" }       # bright red

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
  if (-not (Test-Path -LiteralPath $RepoRoot)) {
    WErr ("RepoRoot not found: " + $RepoRoot); throw "RepoRootMissing"
  }

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

  # ---------- Colored Tables ----------
  Write-Host ""
  $rows = @(
    @{ Name = C('Branch','93');            Value = C($Branch,'96') },
    @{ Name = C('New Commit','93');        Value = ($(if($DidCommit){ C($CommitHash,'92') } else { '—' })) },
    @{ Name = C('Commit Message','93');    Value = ($(if($DidCommit){ $CommitMsg } else { '—' })) },
    @{ Name = C('Upstream','93');          Value = ($(if($UpstreamStr){ $UpstreamStr } else { '—' })) },
    @{ Name = C('Ahead Count','93');       Value = C("$AheadCount",'96') },
    @{ Name = C('Pushed?','93');           Value = ($(if($DidPush){ C('Yes','92') } else { C('No','91') })) },
    @{ Name = C('Log File','93');          Value = $LogFile }
  )
  DrawTable2Cols (C('SUMMARY','94')) $rows

  if ($ChangedFiles -and $ChangedFiles.Count -gt 0) {
    $fileItems = @()
    foreach ($f in $ChangedFiles) { $fileItems += C($f,'96') }
    DrawTable1Col (C('CHANGED FILES','94')) $fileItems
  }

  Write-Host ""
  WInfo ("Log file: " + $LogFile)
}
