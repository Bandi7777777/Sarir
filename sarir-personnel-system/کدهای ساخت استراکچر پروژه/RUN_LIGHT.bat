@echo off
cd /d %~dp0
set BACK=export.config.json.backup
if exist export.config.json ren export.config.json %BACK%
copy /Y export.profile_minimal.json export.config.json >nul
echo [1/2] Exporter (LIGHT)...
start /wait "" "%~dp0sarir_exporter_v3.pyw"
echo [2/2] Bundling (LIGHT)...
start /wait "" "%~dp0bundle_light_output.pyw"
if exist %BACK% (del /q export.config.json & ren %BACK% export.config.json)
echo Done. Check outputs_light folder.
