from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class RegistrationTrendPoint(BaseModel):
    month: str
    patients: int
    workers: int

class CategoryDistribution(BaseModel):
    name: str
    value: int
    color: Optional[str] = None

class RecentActivityItem(BaseModel):
    id: int
    action: str
    resource_type: Optional[str] = None
    details: Optional[str] = None
    user_name: Optional[str] = None
    user_role: Optional[str] = None
    timestamp: datetime

class RecentDocumentItem(BaseModel):
    id: int
    title: str
    document_type: str
    patient_name: str
    original_filename: str
    upload_date: datetime
    file_size: int

class DashboardStatsResponse(BaseModel):
    total_patients: int
    total_healthcare_workers: int
    total_medical_documents: int
    total_prescriptions: int
    total_discharge_summaries: int
    total_medical_reports: int
    total_articles: int
    registration_trend: List[RegistrationTrendPoint]
    document_distribution: List[CategoryDistribution]
    recent_activities: List[RecentActivityItem]
    recent_documents: List[RecentDocumentItem]

