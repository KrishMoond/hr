@echo off
echo ========================================
echo    Starting HR SARTHI Frontend
echo ========================================
echo.

echo Installing dependencies (if needed)...
call npm install
echo.

echo Starting frontend development server...
echo App will run on http://localhost:5173
echo Press Ctrl+C to stop the server
echo.
npm run dev