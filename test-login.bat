@echo off
echo Testing Admin Login API...
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@hrsarthi.com\",\"password\":\"admin123\"}"
echo.
echo.
echo Testing HR Login API...
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"hr@hrsarthi.com\",\"password\":\"hr123\"}"
pause