@echo off
echo ========================================================
echo Starting AarogyaSeva FastAPI Backend on port 8000...
echo Swagger API Docs: http://localhost:8000/docs
echo ========================================================
cd /d "%~dp0backend"
set PYTHONPATH=.
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause

