@echo off
title Prayana App
echo Starting Prayana...

REM Start Backend (silently in background)
start /min "Prayana Backend" cmd /c "cd /d "%~dp0backend" && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

REM Start Frontend (silently in background)
start /min "Prayana Frontend" cmd /c "cd /d "%~dp0frontend" && npm run dev"

REM Wait for servers to boot up
timeout /t 4 /nobreak >nul

REM Open browser
start http://localhost:3000

exit
