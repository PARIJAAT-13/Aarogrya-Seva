from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_user, require_worker_or_admin
from app.models.user import User, UserRole
from app.models.patient import PatientProfile
from app.models.medical_record import MedicalRecord, PatientHistory
from app.schemas.medical_record import MedicalRecordResponse, MedicalRecordCreate
from app.services.audit_service import log_activity

router = APIRouter(prefix="/medical-records", tags=["Medical Records"])

def map_record_response(r: MedicalRecord) -> MedicalRecordResponse:
    rec_name = "Unknown"
    if r.recorded_by:
        if r.recorded_by.worker_profile:
            rec_name = r.recorded_by.worker_profile.full_name
        else:
            rec_name = r.recorded_by.email

    return MedicalRecordResponse(
        id=r.id,
        patient_id=r.patient_id,
        patient_name=r.patient.full_name if r.patient else "Unknown",
        recorded_by_id=r.recorded_by_id,
        recorded_by_name=rec_name,
        record_type=r.record_type,
        diagnosis_summary=r.diagnosis_summary,
        symptoms=r.symptoms,
        vital_signs=r.vital_signs,
        clinical_notes=r.clinical_notes,
        treatment_plan=r.treatment_plan,
        record_date=r.record_date,
        created_at=r.created_at,
        updated_at=r.updated_at,
    )

@router.get("/", response_model=List[MedicalRecordResponse])
def list_medical_records(
    patient_id: Optional[int] = Query(None),
    record_type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(MedicalRecord)

    if current_user.role == UserRole.PATIENT.value:
        if not current_user.patient_profile:
            return []
        query = query.filter(MedicalRecord.patient_id == current_user.patient_profile.id)
    elif patient_id:
        query = query.filter(MedicalRecord.patient_id == patient_id)

    if record_type:
        query = query.filter(MedicalRecord.record_type == record_type)

    records = query.order_by(MedicalRecord.record_date.desc(), MedicalRecord.created_at.desc()).all()
    return [map_record_response(r) for r in records]

@router.post("/", response_model=MedicalRecordResponse, status_code=status.HTTP_201_CREATED)
def create_medical_record(
    payload: MedicalRecordCreate,
    current_user: User = Depends(require_worker_or_admin),
    db: Session = Depends(get_db),
):
    patient = db.query(PatientProfile).filter(PatientProfile.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found.")

    record = MedicalRecord(
        patient_id=payload.patient_id,
        recorded_by_id=current_user.id,
        record_type=payload.record_type.strip(),
        diagnosis_summary=payload.diagnosis_summary.strip(),
        symptoms=payload.symptoms.strip(),
        vital_signs=payload.vital_signs,
        clinical_notes=payload.clinical_notes,
        treatment_plan=payload.treatment_plan,
        record_date=payload.record_date,
    )
    db.add(record)
    db.flush()

    history = PatientHistory(
        patient_id=payload.patient_id,
        recorded_by_id=current_user.id,
        event_type="Clinical Consultation",
        title=f"{payload.record_type}: {payload.diagnosis_summary}",
        description=f"Symptoms: {payload.symptoms[:80]}. Notes: {payload.clinical_notes or 'Recorded by healthcare worker'}",
        event_date=payload.record_date,
    )
    db.add(history)
    db.commit()
    db.refresh(record)

    log_activity(db, current_user.id, "CREATE_MEDICAL_RECORD", "medical_record", str(record.id), f"Record {payload.record_type} for {patient.full_name}")
    return map_record_response(record)

@router.get("/{record_id}", response_model=MedicalRecordResponse)
def get_medical_record(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    r = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medical record not found.")

    if current_user.role == UserRole.PATIENT.value:
        if not current_user.patient_profile or current_user.patient_profile.id != r.patient_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    return map_record_response(r)

