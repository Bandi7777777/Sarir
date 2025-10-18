@echo off
setlocal

REM تلاش با PowerShell 7؛ اگر نبود، کلاسیک
where pwsh >nul 2>nul
if %errorlevel%==0 (
  set PS_EXEC=pwsh
) else (
  set PS_EXEC=powershell
)

set PS1="%~dp0Run-SARIR.ps1"

REM -NoExit تا خطاها نمایش بمانند
%PS_EXEC% -NoLogo -NoProfile -ExecutionPolicy Bypass -NoExit -File %PS1%

endlocal
