@echo off
echo ========================================
echo  KK VERIFIER - Starting Development Server
echo ========================================
echo.
echo Server will start at: http://localhost:3000
echo.
echo IMPORTANT: Keep this window open!
echo Do not close this window while using the application.
echo.
echo Press Ctrl+C to stop the server.
echo ========================================
echo.

cd /d "%~dp0"
npm run dev

pause
