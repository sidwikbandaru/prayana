@echo off
title Prayana - First Time Setup & Dependency Installer
echo ===================================================
echo     Prayana - Installing All Project Dependencies
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/2] Installing Python backend packages...
cd backend
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error installing python packages. Ensure Python 3.10+ is installed and in PATH.
    pause
    exit /b
)
cd ..

echo.
echo [2/2] Installing Node.js frontend packages...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo Error installing npm packages. Ensure Node.js 18+ is installed.
    pause
    exit /b
)
cd ..

echo.
echo ===================================================
echo   Setup Complete! You can now run start_demo.bat
echo ===================================================
echo.
pause
