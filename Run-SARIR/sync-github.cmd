@echo off
setlocal
REM Resolve the folder of this CMD, regardless of where it's launched from:
set "HERE=%~dp0"
set "PS1=%HERE%sync-github.ps1"

REM Debug line (shows exactly what path is used):
echo Using PS1: "%PS1%"

REM Use Windows PowerShell (or change to pwsh.exe if you prefer PS7)
set "PS=C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe"

"%PS%" -NoProfile -ExecutionPolicy Bypass -File "%PS1%" %*

echo.
echo --- Done. Press any key to close ---
pause >nul
