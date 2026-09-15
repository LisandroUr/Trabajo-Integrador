@echo off
title Vidriera Digital Municipal - TFI Ranking Precios
echo ========================================================
echo   INICIANDO VIDRIERA DIGITAL MUNICIPAL Y RANKING PRECIOS
echo ========================================================
echo.

echo [1/2] Iniciando Backend API (Express + Socket.IO) en puerto 5000...
start "Backend API - Puerto 5000" cmd /k "cd backend && npm run dev"

echo [2/2] Iniciando Frontend Web (Next.js) en puerto 3000...
start "Frontend Web - Puerto 3000" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo Servidores iniciados en segundo plano:
echo - Portal Web:     http://localhost:3000
echo - API REST:       http://localhost:5000
echo ========================================================
echo Abriendo navegador en http://localhost:3000...
timeout /t 4 >nul
start http://localhost:3000
