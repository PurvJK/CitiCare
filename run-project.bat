@echo off
title CitiCare Launcher
echo ========================================================
echo               CitiCare Dev Launcher
echo ========================================================
echo Starting Backend on port 5000...
start "CitiCare Backend" cmd /k "cd /d ""%~dp0backend"" && npm run dev"

echo Starting Frontend on port 8080...
start "CitiCare Frontend" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo Waiting for services to initialize...
timeout /t 3 >nul
start http://localhost:8080
echo All services launched!
