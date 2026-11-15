@echo off
echo ========================================================
echo Starting AarogyaSeva Vite React Frontend on port 5173...
echo Application URL: http://localhost:5173
echo ========================================================
cd /d "%~dp0frontend"
npm run dev -- --host
pause

