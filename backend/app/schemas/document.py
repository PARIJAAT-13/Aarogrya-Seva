from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class DocumentResponse(BaseModel):
    id: int
    patient_id: int
    patient_name: Optional[str] = None
    uploaded_by_id: Optional[int] = None
    uploaded_by_name: Optional[str] = None
    document_type: str # prescription, discharge_summary, medical_report, other
    title: str
    description: Optional[str] = None
    file_name: str
    original_filename: str
    file_size: int
    mime_type: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PrescriptionCreate(BaseModel):
    patient_id: int
    document_id: Optional[int] = None
    doctor_name: str
    facility_name: str
    prescription_date: str # YYYY-MM-DD
    diagnosis: str
    medications_text: str
    dosage_instructions: Optional[str] = None
    notes: Optional[str] = None

class PrescriptionResponse(BaseModel):
    id: int
    patient_id: int
    patient_name: Optional[str] = None
    document_id: Optional[int] = None
    document_title: Optional[str] = None
    original_filename: Optional[str] = None
    doctor_name: str
    facility_name: str
    prescription_date: str
    diagnosis: str
    medications_text: str
    dosage_instructions: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DischargeSummaryCreate(BaseModel):
    patient_id: int
    document_id: Optional[int] = None
    hospital_name: str
    doctor_name: str
    admission_date: str
    discharge_date: str
    admission_reason: Optional[str] = None
    final_diagnosis: str
    treatment_summary: str
    discharge_advice: str

class DischargeSummaryResponse(BaseModel):
    id: int
    patient_id: int
    patient_name: Optional[str] = None
    document_id: Optional[int] = None
    document_title: Optional[str] = None
    original_filename: Optional[str] = None
    hospital_name: str
    doctor_name: str
    admission_date: str
    discharge_date: str
    admission_reason: Optional[str] = None
    final_diagnosis: str
    treatment_summary: str
    discharge_advice: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MedicalReportCreate(BaseModel):
    patient_id: int
    document_id: Optional[int] = None
    lab_name: str
    report_type: str
    test_date: str
    key_findings: str
    results_summary: Optional[str] = None
    is_normal: bool = True

class MedicalReportResponse(BaseModel):
    id: int
    patient_id: int
    patient_name: Optional[str] = None
    document_id: Optional[int] = None
    document_title: Optional[str] = None
    original_filename: Optional[str] = None
    lab_name: str
    report_type: str
    test_date: str
    key_findings: str
    results_summary: Optional[str] = None
    is_normal: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

