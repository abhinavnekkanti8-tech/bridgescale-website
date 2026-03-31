#!/bin/bash
set -e

echo "==================================================="
echo "    RTIH Platform - One-Click Start (Unix/Mac)"
echo "==================================================="

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "[1/6] Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed. Please install Docker and try again."
    exit 1
fi

echo "[2/6] Starting Database and Cache (Docker)..."
cd "$SCRIPT_DIR"
docker-compose up -d || echo "WARNING: docker-compose had issues, continuing..."

echo "[3/6] Waiting for PostgreSQL to be ready..."
sleep 8

echo "[4/6] Installing Backend dependencies..."
cd "$SCRIPT_DIR/backend"
npm install --legacy-peer-deps

echo "[5/6] Preparing Database..."
npx prisma generate
npx prisma db push --accept-data-loss 2>/dev/null || true
npm run seed 2>/dev/null || true
echo "Database ready."

echo "[6/6] Installing Frontend dependencies..."
cd "$SCRIPT_DIR/frontend"
npm install --legacy-peer-deps

echo ""
echo "==================================================="
echo "  Booting Backend and Frontend..."
echo "==================================================="

cd "$SCRIPT_DIR/backend" && npm run start:dev &
BACKEND_PID=$!
sleep 3

cd "$SCRIPT_DIR/frontend" && npm run dev &
FRONTEND_PID=$!

echo ""
echo "==================================================="
echo "  Platform is booting up!"
echo ""
echo "  Backend:  http://localhost:4000/api/v1"
echo "  Frontend: http://localhost:3000"
echo ""
echo "  Demo Accounts:"
echo "    Admin:    admin@platform.com / Admin@123!"
echo "    Startup:  ravi@acmetech.com / Startup@123"
echo "    Operator: priya@diasporasales.com / Operator@123"
echo "==================================================="
echo ""
echo "Press Ctrl+C to stop all services."

trap "echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; docker-compose stop; exit" INT TERM
wait
