@echo off
title CareerOS Frontend
cd /d "%~dp0frontend"
echo Starting CareerOS Frontend on http://127.0.0.1:5173 ...
npm run dev -- --host 127.0.0.1 --port 5173
pause
