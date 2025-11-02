@echo off
setlocal
cd /d "%~dp0"

rem Prefer PowerShell 7 (pwsh), fallback to Windows PowerShell
where pwsh >nul 2>&1
if %errorlevel%==0 (
  set "_PS=pwsh"
) else (
  set "_PS=powershell"
)

"%_PS%" -NoProfile -ExecutionPolicy Bypass -NoExit -File ".\Run-SARIR.ps1"
endlocal
