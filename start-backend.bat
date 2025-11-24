@echo off
echo ========================================
echo    Starting HR SARTHI Backend Server
echo ========================================
echo.

echo Checking if MongoDB is running...
echo Please make sure MongoDB is running on your system
echo.

echo Installing dependencies (if needed)...
cd backend
call npm install
echo.

echo Seeding database with sample data...
node utils/seedData.js
echo.

echo Starting backend server...
echo Server will run on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
npm run dev