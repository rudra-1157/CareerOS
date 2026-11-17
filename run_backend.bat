@echo off
title CareerOS Backend
cd /d "%~dp0backend"
echo Starting CareerOS Backend on http://127.0.0.1:8000 ...
"C:\Users\rudra\AppData\Local\Python\bin\python.exe" -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pause
