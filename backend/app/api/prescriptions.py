from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_user, require_worker_or_admin
from app.models.user import User, UserRole
from app.models.patient import PatientProfile
from app.models.document import Prescription, MedicalDocument
from app.models.medical_record import PatientHistory
from app.schemas.document import PrescriptionResponse, PrescriptionCreate
from app.services.audit_service import log_activity
from datetime import datetime

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])

def map_prescription_response(p: Prescription) -> PrescriptionResponse:
    doc_title = None
    orig_name = None
    if p.document:
        doc_title = p.document.title
        orig_name = p.document.original_filename

    return PrescriptionResponse(
        id=p.id,
        patient_id=p.patient_id,
        patient_name=p.patient.full_name if p.patient else "Unknown",
        document_id=p.document_id,
        document_title=doc_title,
        original_filename=orig_name,
        doctor_name=p.doctor_name,
        facility_name=p.facility_name,
        prescription_date=p.prescription_date,
        diagnosis=p.diagnosis,
        medications_text=p.medications_text,
        dosage_instructions=p.dosage_instructions,
        notes=p.notes,
        created_at=p.created_at,
        updated_at=p.updated_at,
    )

@router.get("/", response_model=List[PrescriptionResponse])
def list_prescriptions(
    patient_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Prescription)

    if current_user.role == UserRole.PATIENT.value:
        if not current_user.patient_profile:
            return []
        query = query.filter(Prescription.patient_id == current_user.patient_profile.id)
    elif patient_id:
        query = query.filter(Prescription.patient_id == patient_id)

    prescriptions = query.order_by(Prescription.prescription_date.desc(), Prescription.created_at.desc()).all()
    return [map_prescription_response(p) for p in prescriptions]

@router.post("/", response_model=PrescriptionResponse, status_code=status.HTTP_201_CREATED)
def create_prescription(
    payload: PrescriptionCreate,
    current_user: User = Depends(require_worker_or_admin),
    db: Session = Depends(get_db),
):
    patient = db.query(PatientProfile).filter(PatientProfile.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found.")

    prescription = Prescription(
        patient_id=payload.patient_id,
        document_id=payload.document_id,
        doctor_name=payload.doctor_name.strip(),
        facility_name=payload.facility_name.strip(),
        prescription_date=payload.prescription_date,
        diagnosis=payload.diagnosis.strip(),
        medications_text=payload.medications_text.strip(),
        dosage_instructions=payload.dosage_instructions,
        notes=payload.notes,
    )
    db.add(prescription)
    db.flush()

    # Add patient history
    history = PatientHistory(
        patient_id=payload.patient_id,
        recorded_by_id=current_user.id,
        event_type="Prescription Added",
        title=f"Prescription: {payload.diagnosis}",
        description=f"Prescribed by Dr. {payload.doctor_name} at {payload.facility_name}. Meds: {payload.medications_text[:100]}...",
        event_date=payload.prescription_date,
    )
    db.add(history)
    db.commit()
    db.refresh(prescription)

    log_activity(db, current_user.id, "CREATE_PRESCRIPTION", "prescription", str(prescription.id), f"Prescription for {patient.full_name} ({payload.diagnosis})")
    return map_prescription_response(prescription)

@router.get("/{prescription_id}", response_model=PrescriptionResponse)
def get_prescription(
    prescription_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    p = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not p:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found.")

    if current_user.role == UserRole.PATIENT.value:
        if not current_user.patient_profile or current_user.patient_profile.id != p.patient_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    return map_prescription_response(p)

