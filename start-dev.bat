@echo off
echo ===================================================
echo   FlowPilot AI - Startup Launcher (Dev Mode)
echo ===================================================
echo.

:: Check for backend virtual env if applicable, otherwise prompt install
if not exist "backend\requirements.txt" (
    echo [ERROR] backend/requirements.txt not found! Make sure you are in the project root folder.
    pause
    exit /b
)

echo Starting FastAPI Backend Server on port 8000...
start "FlowPilot AI - Backend REST Server" cmd /k "cd backend && pip install -r requirements.txt && python -m uvicorn app.main:app --reload --port 8000"

echo Starting Next.js Frontend Dev Server on port 3000...
start "FlowPilot AI - Frontend UI Dev Server" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo ===================================================
echo   FlowPilot AI servers are launching!
echo   - Backend API: http://127.0.0.1:8000/docs
echo   - Frontend App: http://localhost:3000
echo ===================================================
echo.
pause
