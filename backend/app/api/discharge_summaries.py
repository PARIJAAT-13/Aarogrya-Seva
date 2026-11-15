from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_user, require_worker_or_admin
from app.models.user import User, UserRole
from app.models.patient import PatientProfile
from app.models.document import DischargeSummary
from app.models.medical_record import PatientHistory
from app.schemas.document import DischargeSummaryResponse, DischargeSummaryCreate
from app.services.audit_service import log_activity

router = APIRouter(prefix="/discharge-summaries", tags=["Discharge Summaries"])

def map_discharge_response(d: DischargeSummary) -> DischargeSummaryResponse:
    doc_title = None
    orig_name = None
    if d.document:
        doc_title = d.document.title
        orig_name = d.document.original_filename

    return DischargeSummaryResponse(
        id=d.id,
        patient_id=d.patient_id,
        patient_name=d.patient.full_name if d.patient else "Unknown",
        document_id=d.document_id,
        document_title=doc_title,
        original_filename=orig_name,
        hospital_name=d.hospital_name,
        doctor_name=d.doctor_name,
        admission_date=d.admission_date,
        discharge_date=d.discharge_date,
        admission_reason=d.admission_reason,
        final_diagnosis=d.final_diagnosis,
        treatment_summary=d.treatment_summary,
        discharge_advice=d.discharge_advice,
        created_at=d.created_at,
        updated_at=d.updated_at,
    )

@router.get("/", response_model=List[DischargeSummaryResponse])
def list_discharge_summaries(
    patient_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(DischargeSummary)

    if current_user.role == UserRole.PATIENT.value:
        if not current_user.patient_profile:
            return []
        query = query.filter(DischargeSummary.patient_id == current_user.patient_profile.id)
    elif patient_id:
        query = query.filter(DischargeSummary.patient_id == patient_id)

    summaries = query.order_by(DischargeSummary.discharge_date.desc(), DischargeSummary.created_at.desc()).all()
    return [map_discharge_response(s) for s in summaries]

@router.post("/", response_model=DischargeSummaryResponse, status_code=status.HTTP_201_CREATED)
def create_discharge_summary(
    payload: DischargeSummaryCreate,
    current_user: User = Depends(require_worker_or_admin),
    db: Session = Depends(get_db),
):
    patient = db.query(PatientProfile).filter(PatientProfile.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found.")

    discharge = DischargeSummary(
        patient_id=payload.patient_id,
        document_id=payload.document_id,
        hospital_name=payload.hospital_name.strip(),
        doctor_name=payload.doctor_name.strip(),
        admission_date=payload.admission_date,
        discharge_date=payload.discharge_date,
        admission_reason=payload.admission_reason,
        final_diagnosis=payload.final_diagnosis.strip(),
        treatment_summary=payload.treatment_summary.strip(),
        discharge_advice=payload.discharge_advice.strip(),
    )
    db.add(discharge)
    db.flush()

    history = PatientHistory(
        patient_id=payload.patient_id,
        recorded_by_id=current_user.id,
        event_type="Hospital Discharge",
        title=f"Discharge from {payload.hospital_name}",
        description=f"Admitted: {payload.admission_date}, Discharged: {payload.discharge_date}. Diagnosis: {payload.final_diagnosis}",
        event_date=payload.discharge_date,
    )
    db.add(history)
    db.commit()
    db.refresh(discharge)

    log_activity(db, current_user.id, "CREATE_DISCHARGE_SUMMARY", "discharge_summary", str(discharge.id), f"Discharge for {patient.full_name} ({payload.hospital_name})")
    return map_discharge_response(discharge)

@router.get("/{summary_id}", response_model=DischargeSummaryResponse)
def get_discharge_summary(
    summary_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    d = db.query(DischargeSummary).filter(DischargeSummary.id == summary_id).first()
    if not d:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Discharge summary not found.")

    if current_user.role == UserRole.PATIENT.value:
        if not current_user.patient_profile or current_user.patient_profile.id != d.patient_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    return map_discharge_response(d)

