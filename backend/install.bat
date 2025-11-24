@echo off
echo Installing HR SARTHI Backend Dependencies...
cd backend
npm install
echo.
echo Dependencies installed successfully!
echo.
echo To start the backend server:
echo 1. Make sure MongoDB is running
echo 2. Run: npm run dev
echo.
echo To seed sample data:
echo Run: node utils/seedData.js
pause