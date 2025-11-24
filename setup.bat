@echo off
echo ========================================
echo    HR SARTHI - Complete Setup
echo ========================================
echo.

echo Installing Frontend Dependencies...
npm install
echo.

echo Installing Backend Dependencies...
cd backend
npm install
cd ..
echo.

echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure MongoDB is running
echo 2. Start backend: cd backend && npm run dev
echo 3. Start frontend: npm run dev
echo 4. Seed sample data: cd backend && node utils/seedData.js
echo.
echo Demo Login Credentials:
echo - Admin: admin@hrsarthi.com / admin123
echo - HR: hr@hrsarthi.com / hr123  
echo - Employee: sarah.j@hrsarthi.com / password123
echo.
pause