@echo off
echo Starting HR SARTHI Application...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ✅ Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo 🔑 Login Credentials:
echo Admin: admin@hrsarthi.com / admin123
echo HR: hr@hrsarthi.com / hr123
echo Employee: sarah.j@hrsarthi.com / password123
echo.
pause