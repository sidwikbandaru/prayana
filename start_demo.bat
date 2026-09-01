@echo off
title Prayana (CityFlow + GreenMile) Launcher
echo ===================================================
echo     Launching Prayana Full-Stack MVP Platform
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting Python FastAPI Backend Server on port 8000...
start "Prayana Backend" cmd /k "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

echo [2/3] Starting React + Vite Frontend on port 3000...
start "Prayana Frontend" cmd /k "cd frontend && npm run dev"

echo [3/3] Opening browser at http://localhost:3000...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo Prayana is now running!
echo - Frontend: http://localhost:3000
echo - Backend API Docs: http://localhost:8000/docs
echo.
pause
