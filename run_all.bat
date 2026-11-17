@echo off
title CareerOS Launcher
echo Launching Backend and Frontend...
start "CareerOS Backend" cmd /k "%~dp0run_backend.bat"
ping 127.0.0.1 -n 3 >nul
start "CareerOS Frontend" cmd /k "%~dp0run_frontend.bat"
ping 127.0.0.1 -n 3 >nul
start http://127.0.0.1:5173
echo Both services launched!
