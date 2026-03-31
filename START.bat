@echo off
echo ===================================================
echo     RTIH Platform - One-Click Start (Windows)
echo ===================================================
echo.

:: Always work from the script's directory
cd /d "%~dp0"

echo [1/6] Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not in PATH.
    echo Please install Docker Desktop and try again.
    pause
    exit /b 1
)

echo [2/6] Starting Database and Cache (Docker)...
docker-compose up -d
if errorlevel 1 (
    echo WARNING: docker-compose failed. Continuing anyway...
)

echo [3/6] Waiting for PostgreSQL to be ready...
timeout /t 8 >nul

echo [4/6] Installing Backend dependencies...
cd /d "%~dp0backend"
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo ERROR: Backend npm install failed.
    pause
    exit /b 1
)

echo [5/6] Preparing Database...
call npx prisma generate
call npx prisma db push --accept-data-loss 2>nul
if errorlevel 1 (
    echo NOTE: db push had warnings, continuing...
)
call npm run seed 2>nul
echo Database ready.

echo [6/6] Installing Frontend dependencies...
cd /d "%~dp0frontend"
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo ERROR: Frontend npm install failed.
    pause
    exit /b 1
)

echo.
echo ===================================================
echo   Booting Backend and Frontend...
echo ===================================================
echo.

cd /d "%~dp0"
start "RTIH Backend" cmd /k "cd /d "%~dp0backend" && npm run start:dev"
timeout /t 3 >nul
start "RTIH Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ===================================================
echo   Platform is booting up!
echo.
echo   Backend:  http://localhost:4000/api/v1
echo   Frontend: http://localhost:3000
echo.
echo   Demo Accounts:
echo     Admin:    admin@platform.com / Admin@123!
echo     Startup:  ravi@acmetech.com / Startup@123
echo     Operator: priya@diasporasales.com / Operator@123
echo ===================================================
echo.
echo Press any key to close this window (servers keep running)...
pause >nul
