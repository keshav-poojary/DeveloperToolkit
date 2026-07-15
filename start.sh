#!/usr/bin/env bash
# DevToolkit - start both backend and frontend dev servers

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Starting DevToolkit..."
echo ""

# Start backend
echo "📡 Starting NestJS backend on http://localhost:3001 ..."
cd "$ROOT/backend" && npm run start:dev &
BACKEND_PID=$!

sleep 3

# Start frontend
echo "🎨 Starting React frontend on http://localhost:5173 ..."
cd "$ROOT/frontend" && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ DevToolkit is running!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo "   API Docs: http://localhost:3001/api/docs"
echo ""
echo "Press Ctrl+C to stop all servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
