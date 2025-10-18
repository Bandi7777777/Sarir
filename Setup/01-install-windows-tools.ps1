# 01-install-windows-tools.ps1
# اجرا: Run as Administrator → راست‌کلیک روی فایل → Run with PowerShell

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

# 1) فعال‌سازی WSL2 (اگر قبلا فعال نبود)
try {
  wsl --status | Out-Null
} catch {
  dism /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
  dism /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
  Write-Host "WSL features enabled. Restart Windows recommended."
}

# 2) نصب ابزارها با winget (Node LTS, Python, Git, VSCode, Docker Desktop)
$apps = @(
  @{Id="OpenJS.NodeJS.LTS"; Name="Node.js LTS"},
  @{Id="Python.Python.3.12"; Name="Python 3.12"},
  @{Id="Git.Git"; Name="Git"},
  @{Id="Microsoft.VisualStudioCode"; Name="VSCode"},
  @{Id="Docker.DockerDesktop"; Name="Docker Desktop"}
)
foreach ($a in $apps) {
  Write-Host "Installing $($a.Name) ..."
  winget install -e --id $($a.Id) --accept-package-agreements --accept-source-agreements
}

# 3) فعال‌سازی Corepack و pnpm
Write-Host "Enabling Corepack / pnpm ..."
corepack enable
corepack prepare pnpm@latest --activate

Write-Host "`nAll set. If Docker Desktop asks for WSL2 engine, enable it in Settings > General."
