from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class MedicalRecordCreate(BaseModel):
    patient_id: int
    record_type: str # General Checkup, Follow-up, Antenatal Care, Immunization, Emergency
    diagnosis_summary: str
    symptoms: str
    vital_signs: Optional[str] = None
    clinical_notes: Optional[str] = None
    treatment_plan: Optional[str] = None
    record_date: str # YYYY-MM-DD

class MedicalRecordResponse(BaseModel):
    id: int
    patient_id: int
    patient_name: Optional[str] = None
    recorded_by_id: Optional[int] = None
    recorded_by_name: Optional[str] = None
    record_type: str
    diagnosis_summary: str
    symptoms: str
    vital_signs: Optional[str] = None
    clinical_notes: Optional[str] = None
    treatment_plan: Optional[str] = None
    record_date: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PatientHistoryCreate(BaseModel):
    patient_id: int
    event_type: str
    title: str
    description: str
    event_date: str
    metadata_json: Optional[str] = None

class PatientHistoryResponse(BaseModel):
    id: int
    patient_id: int
    event_type: str
    title: str
    description: str
    event_date: str
    recorded_by_id: Optional[int] = None
    recorded_by_name: Optional[str] = None
    metadata_json: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

