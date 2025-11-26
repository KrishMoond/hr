@echo off
echo Starting HR SARTHI Demo Setup...

echo.
echo [1/4] Starting MongoDB...
net start MongoDB

echo.
echo [2/4] Installing dependencies...
call npm install
cd backend
call npm install
cd ..

echo.
echo [3/4] Seeding database with demo data...
cd backend
call node utils/seedData.js
call node utils/createSampleLeaves.js
call node utils/initializeLeaveBalances.js
cd ..

echo.
echo [4/4] Starting servers...
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ HR SARTHI is ready for demo!
echo 📱 Frontend: http://localhost:5173
echo 🔧 Backend: http://localhost:5000
echo.
echo Login Credentials:
echo Admin: admin@hrsarthi.com / admin123
echo HR: hr@hrsarthi.com / hr123
echo Employee: sarah.j@hrsarthi.com / password123
echo.
pause