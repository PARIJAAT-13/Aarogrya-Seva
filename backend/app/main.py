import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.database.session import engine, SessionLocal, Base
from app.database.seed import seed_database
from app.database.seed_ai import seed_ai_engine_data
import app.models # Ensure all models are registered

# Import all API routers
from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.patients import router as patients_router
from app.api.workers import router as workers_router
from app.api.documents import router as documents_router
from app.api.prescriptions import router as prescriptions_router
from app.api.discharge_summaries import router as discharge_summaries_router
from app.api.medical_reports import router as medical_reports_router
from app.api.medical_records import router as medical_records_router
from app.api.content import router as content_router
from app.api.users import router as users_router
from app.api.ai_engine import router as ai_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and seed demo data
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            seed_database(db)
            seed_ai_engine_data(db)
        finally:
            db.close()
    except Exception as e:
        print(f"Startup database initialization error: {e}")
    yield
    # Shutdown logic if needed

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Rural Healthcare Assistance Platform - Patient & Healthcare Information Management System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(patients_router, prefix=settings.API_V1_STR)
app.include_router(workers_router, prefix=settings.API_V1_STR)
app.include_router(documents_router, prefix=settings.API_V1_STR)
app.include_router(prescriptions_router, prefix=settings.API_V1_STR)
app.include_router(discharge_summaries_router, prefix=settings.API_V1_STR)
app.include_router(medical_reports_router, prefix=settings.API_V1_STR)
app.include_router(medical_records_router, prefix=settings.API_V1_STR)
app.include_router(content_router, prefix=settings.API_V1_STR)
app.include_router(users_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "status": "Operational",
        "system": "Patient & Healthcare Information Management System",
        "docs_url": "/docs",
        "api_prefix": settings.API_V1_STR,
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "environment": settings.ENVIRONMENT,
    }

