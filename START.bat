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
REM [0/7] Bootstrap env files if missing
REM ─────────────────────────────────────────────────────────────────
echo [0/7] Checking environment files...

REM Root .env — read by docker-compose to create the right DB
if not exist ".env" (
    echo   Creating root .env for Docker Compose...
    (
        echo DB_USER=platform
        echo DB_PASSWORD=platform_dev
        echo DB_NAME=platform_dev
    ) > ".env"
    echo   OK - Root .env created
) else (
    echo   OK - Root .env already exists
)

REM Backend .env — already committed with correct settings
if not exist "backend\.env" (
    echo   WARNING: backend\.env missing. Copying from backend\.env.example...
    copy "backend\.env.example" "backend\.env" >nul 2>&1
)

REM Frontend .env.local — already committed with correct settings
if not exist "frontend\.env.local" (
    echo   WARNING: frontend\.env.local missing. Creating minimal config...
    (
        echo NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
        echo BACKEND_URL=http://localhost:4000
    ) > "frontend\.env.local"
)

echo OK - Environment files ready

REM ─────────────────────────────────────────────────────────────────
REM [1/7] Check Docker
REM ─────────────────────────────────────────────────────────────────
echo.
echo [1/7] Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not in PATH.
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo OK - Docker found

REM ─────────────────────────────────────────────────────────────────
REM [2/7] Clean up old containers AND volumes (force fresh DB init)
REM ─────────────────────────────────────────────────────────────────
echo.
echo [2/7] Cleaning up old containers and database volumes...
docker-compose down --remove-orphans --volumes >nul 2>&1
echo OK - Ready for fresh start

REM ─────────────────────────────────────────────────────────────────
REM [3/7] Start Docker containers (PostgreSQL + Redis)
REM ─────────────────────────────────────────────────────────────────
echo.
echo [3/7] Starting PostgreSQL (platform_dev) and Redis...
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
    echo OK - PostgreSQL is ready ^(platform_dev^)
    goto db_ready
)
if !wait_count! geq 45 (
    echo ERROR: PostgreSQL did not become ready in time.
    echo.
    echo Check the logs: docker logs platform_db
    echo Then re-run START.bat
    pause
    exit /b 1
)
set /a "mod=wait_count %% 5"
if !mod! == 0 echo   Still waiting... ^(!wait_count!s elapsed^)
timeout /t 1 >nul
goto wait_db

:db_ready

REM ─────────────────────────────────────────────────────────────────
REM [4/7] Backend - install + setup database
REM ─────────────────────────────────────────────────────────────────
echo.
echo [4/7] Setting up backend...
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

echo   Seeding database with demo accounts...
call npm run seed >nul 2>&1

echo OK - Backend ready ^(schema pushed, demo data seeded^)

REM ─────────────────────────────────────────────────────────────────
REM [5/7] Frontend - install dependencies
REM ─────────────────────────────────────────────────────────────────
echo.
echo [5/7] Setting up frontend...
cd /d "%~dp0frontend"

echo   Installing dependencies...
call npm install --legacy-peer-deps >nul 2>&1
if errorlevel 1 (
    echo ERROR: Frontend npm install failed.
    pause
    exit /b 1
)

REM Fix the SWC binary issue on Windows
if exist "node_modules\@next\swc-win32-x64-msvc\next-swc.win32-x64-msvc.node" (
    echo   Fixing SWC binary for Windows...
    del /f /q "node_modules\@next\swc-win32-x64-msvc\next-swc.win32-x64-msvc.node" >nul 2>&1
)

echo OK - Frontend ready

REM ─────────────────────────────────────────────────────────────────
REM [6/7] Launch development servers
REM ─────────────────────────────────────────────────────────────────
echo.
echo [6/7] Starting development servers...
cd /d "%~dp0"

start "BridgeScale Backend" cmd /k "title BridgeScale Backend (port 4000) && cd /d "%~dp0backend" && npm run start:dev"
timeout /t 3 >nul
start "BridgeScale Frontend" cmd /k "title BridgeScale Frontend (port 3000) && cd /d "%~dp0frontend" && npm run dev"

REM ─────────────────────────────────────────────────────────────────
REM [7/7] Wait for servers to boot, then open browser
REM ─────────────────────────────────────────────────────────────────
echo.
echo [7/7] Waiting 18 seconds for servers to fully boot...
timeout /t 18 >nul

echo   Opening application in browser...
start "" "http://localhost:3000"

REM ─────────────────────────────────────────────────────────────────
REM E2E Testing Guide
REM ─────────────────────────────────────────────────────────────────
echo.
echo ===================================================================
echo   Platform is running!
echo.
echo   Frontend:    http://localhost:3000
echo   Backend API: http://localhost:4000/api/v1
echo   Health:      http://localhost:4000/health
echo ===================================================================
echo.
echo   DEMO ACCOUNTS (all seeded fresh)
echo   ─────────────────────────────────────────────────────────────
echo   Admin:    admin@platform.com        /  Admin@123!
echo   Startup:  ravi@acmetech.com         /  Startup@123
echo   Operator: priya@diasporasales.com   /  Operator@123
echo.
echo ===================================================================
echo   END-TO-END TESTING GUIDE
echo ===================================================================
echo.
echo   [ADMIN FLOW]  login as admin@platform.com
echo   ─────────────────────────────────────────────────────────────
echo   /admin/dashboard          Overview + key metrics
echo   /admin/analytics          Platform-wide analytics
echo   /admin/applications       Review startup + operator applications
echo   /admin/applications/[id]/diagnosis    AI need diagnosis
echo   /admin/applications/[id]/prescreen    Talent pre-screen
echo   /admin/discovery          Discovery call management
echo   /admin/matching           AI operator-startup matching
echo   /admin/deal-desk          Deal desk tools
echo   /admin/contracts          SoW + contract oversight
echo   /admin/sow-templates      View/edit 5 seeded SoW templates
echo   /admin/billing            Invoices + payment tracking
echo   /admin/escalations        Escalation case management
echo   /admin/settings           Platform settings
echo   /admin/startups           All startup profiles
echo   /admin/operators          All operator profiles
echo.
echo   [STARTUP FLOW]  login as ravi@acmetech.com
echo   ─────────────────────────────────────────────────────────────
echo   /startup/dashboard        Startup home
echo   /startup/profile          Fill company profile (industry, stage)
echo   /startup/apply            Submit application (DUMMY_PAYMENT=true)
echo   /startup/readiness        AI demand readiness score
echo   /startup/discovery        Book / view discovery call
echo   /startup/discovery/summary  Post-call AI summary
echo   /startup/matching         View matched operators
echo   /startup/contracts        View + sign SoW
echo   /startup/billing          Invoices and payment plans
echo   /startup/engagements      Active engagements list
echo   /startup/engagements/[id]           Engagement workspace
echo   /startup/engagements/[id]/closeout  Submit closeout report
echo.
echo   [OPERATOR FLOW]  login as priya@diasporasales.com
echo   ─────────────────────────────────────────────────────────────
echo   /operator/apply           Submit operator application
echo   /operator/dashboard       Operator home
echo   /operator/profile         Update profile + availability
echo   /operator/invitations     Manage invites
echo   /operator/matches         View matched startups
echo   /operator/diagnoses       Talent pre-screen tasks
echo   /operator/contracts       View + sign SoW
echo   /operator/engagements     Active engagements
echo   /operator/engagements/[id]           Engagement workspace
echo   /operator/engagements/[id]/closeout  Submit closeout + rating
echo.
echo   [PUBLIC PAGES]  no login required
echo   ─────────────────────────────────────────────────────────────
echo   /                         Landing page
echo   /for-companies            Startup marketplace page
echo   /for-talent               Operator marketplace page
echo   /blog                     Blog listing
echo   /auth/login               Login page
echo   /auth/magic               Magic-link login
echo   /application/status       Application status tracker
echo.
echo   [NOTES]
echo   - Payments run in DUMMY mode (no real Stripe/Razorpay needed)
echo   - AI features need OPENAI_API_KEY set in backend\.env
echo   - Email features need EMAIL_API_KEY set in backend\.env
echo   - Two extra windows are open: Backend (port 4000), Frontend (port 3000)
echo ===================================================================
echo.
echo Press any key to close this launcher (servers keep running)...
pause >nul

exit /b 0
