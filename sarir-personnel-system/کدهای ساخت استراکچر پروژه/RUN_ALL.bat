@echo off
cd /d %~dp0
echo [1/2] Exporter...
start /wait "" "%~dp0sarir_exporter_v3.pyw"
echo [2/2] Bundling...
start /wait "" "%~dp0bundle_export_output.pyw"
echo Done. Check outputs folder.
