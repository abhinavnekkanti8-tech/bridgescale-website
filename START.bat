@echo off
setlocal enabledelayedexpansion

echo.
echo ===================================================================
echo         BridgeScale Platform - One-Click Start (Windows)
echo ===================================================================
echo.

REM Always work from the script's directory
cd /d "%~dp0"

REM ─────────────────────────────────────────────────────────────────
REM [1/6] Check Docker
REM ─────────────────────────────────────────────────────────────────
echo [1/6] Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not in PATH.
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo OK - Docker found

REM ─────────────────────────────────────────────────────────────────
REM [2/6] Clean up old containers AND volumes (force fresh DB init)
REM ─────────────────────────────────────────────────────────────────
echo.
echo [2/6] Cleaning up old containers and database volumes...
docker-compose down --remove-orphans --volumes >nul 2>&1
echo OK - Ready for fresh start

REM ─────────────────────────────────────────────────────────────────
REM [3/6] Start Docker containers (PostgreSQL + Redis)
REM ─────────────────────────────────────────────────────────────────
echo.
echo [3/6] Starting PostgreSQL and Redis...
docker-compose up -d
if errorlevel 1 (
    echo WARNING: docker-compose had issues. Checking if containers started anyway...
)

REM Wait for PostgreSQL to accept connections on the correct database
echo   Waiting for PostgreSQL to be ready (max 45 seconds)...
set "wait_count=0"

:wait_db
set /a wait_count+=1
docker exec platform_db pg_isready -U platform -d platform_dev >nul 2>&1
if not errorlevel 1 (
    echo OK - PostgreSQL is ready
    goto db_ready
)
if !wait_count! geq 45 (
    echo ERROR: PostgreSQL did not become ready in time.
    echo.
    echo Check the logs: docker logs platform_db
    echo Then re-run start.bat
    pause
    exit /b 1
)
REM Show progress every 5 seconds
set /a "mod=wait_count %% 5"
if !mod! == 0 echo   Still waiting... (!wait_count!s elapsed)
timeout /t 1 >nul
goto wait_db

:db_ready

REM ─────────────────────────────────────────────────────────────────
REM [4/6] Backend - install + setup database
REM ─────────────────────────────────────────────────────────────────
echo.
echo [4/6] Setting up backend...
cd /d "%~dp0backend"

echo   Installing dependencies...
call npm install --legacy-peer-deps >nul 2>&1
if errorlevel 1 (
    echo ERROR: Backend npm install failed.
    pause
    exit /b 1
)

echo   Generating Prisma client...
call npx prisma generate >nul 2>&1

echo   Pushing database schema...
call npx prisma db push --accept-data-loss >nul 2>&1
if errorlevel 1 (
    echo WARNING: db push had issues, trying to continue...
)

echo   Seeding database...
call npm run seed >nul 2>&1

echo OK - Backend ready

REM ─────────────────────────────────────────────────────────────────
REM [5/6] Frontend - install dependencies
REM ─────────────────────────────────────────────────────────────────
echo.
echo [5/6] Setting up frontend...
cd /d "%~dp0frontend"

echo   Installing dependencies...
call npm install --legacy-peer-deps >nul 2>&1
if errorlevel 1 (
    echo ERROR: Frontend npm install failed.
    pause
    exit /b 1
)

REM Fix the SWC binary issue on Windows by removing the broken binary
REM and letting Next.js fall back to Babel (which works fine for dev)
if exist "node_modules\@next\swc-win32-x64-msvc\next-swc.win32-x64-msvc.node" (
    echo   Fixing SWC binary for Windows...
    del /f /q "node_modules\@next\swc-win32-x64-msvc\next-swc.win32-x64-msvc.node" >nul 2>&1
)

echo OK - Frontend ready

REM ─────────────────────────────────────────────────────────────────
REM [6/6] Launch development servers
REM ─────────────────────────────────────────────────────────────────
echo.
echo [6/6] Starting development servers...
cd /d "%~dp0"

start "BridgeScale Backend" cmd /k "title BridgeScale Backend && cd /d "%~dp0backend" && npm run start:dev"
timeout /t 3 >nul
start "BridgeScale Frontend" cmd /k "title BridgeScale Frontend && cd /d "%~dp0frontend" && npm run dev"

REM ─────────────────────────────────────────────────────────────────
REM Done
REM ─────────────────────────────────────────────────────────────────
echo.
echo ===================================================================
echo   Platform is booting up!
echo.
echo   Backend:  http://localhost:4000/api/v1
echo   Frontend: http://localhost:3000
echo             (falls back to 3001 if 3000 is busy)
echo.
echo   Demo Accounts:
echo     Admin:    admin@platform.com   / Admin@123!
echo     Startup:  ravi@acmetech.com    / Startup@123
echo     Operator: priya@diasporasales.com / Operator@123
echo.
echo   Note: Two windows opened - Backend and Frontend servers.
echo         Wait 10-15 seconds for servers to fully boot.
echo ===================================================================
echo.
echo Press any key to close this window (servers keep running)...
pause >nul

exit /b 0
