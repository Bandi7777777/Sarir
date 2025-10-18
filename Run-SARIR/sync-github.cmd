@echo off
REM === One-click GitHub sync ===
powershell -ExecutionPolicy Bypass -File "D:\Projects\Website\1.Code\1.SARIR\Run-SARIR\sync-github.ps1" -RepoPath "D:\Projects\Website\1.Code\1.SARIR" -Branch "main"
echo.
echo --- Done. Press any key to close ---
pause >nul
