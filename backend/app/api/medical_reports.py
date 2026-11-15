from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_user, require_worker_or_admin
from app.models.user import User, UserRole
from app.models.patient import PatientProfile
from app.models.document import MedicalReport
from app.models.medical_record import PatientHistory
from app.schemas.document import MedicalReportResponse, MedicalReportCreate
from app.services.audit_service import log_activity

router = APIRouter(prefix="/medical-reports", tags=["Medical Reports"])

def map_report_response(r: MedicalReport) -> MedicalReportResponse:
    doc_title = None
    orig_name = None
    if r.document:
        doc_title = r.document.title
        orig_name = r.document.original_filename

    return MedicalReportResponse(
        id=r.id,
        patient_id=r.patient_id,
        patient_name=r.patient.full_name if r.patient else "Unknown",
        document_id=r.document_id,
        document_title=doc_title,
        original_filename=orig_name,
        lab_name=r.lab_name,
        report_type=r.report_type,
        test_date=r.test_date,
        key_findings=r.key_findings,
        results_summary=r.results_summary,
        is_normal=r.is_normal,
        created_at=r.created_at,
        updated_at=r.updated_at,
    )

@router.get("/", response_model=List[MedicalReportResponse])
def list_medical_reports(
    patient_id: Optional[int] = Query(None),
    report_type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(MedicalReport)

    if current_user.role == UserRole.PATIENT.value:
        if not current_user.patient_profile:
            return []
        query = query.filter(MedicalReport.patient_id == current_user.patient_profile.id)
    elif patient_id:
        query = query.filter(MedicalReport.patient_id == patient_id)

    if report_type:
        query = query.filter(MedicalReport.report_type == report_type)

    reports = query.order_by(MedicalReport.test_date.desc(), MedicalReport.created_at.desc()).all()
    return [map_report_response(r) for r in reports]

@router.post("/", response_model=MedicalReportResponse, status_code=status.HTTP_201_CREATED)
def create_medical_report(
    payload: MedicalReportCreate,
    current_user: User = Depends(require_worker_or_admin),
    db: Session = Depends(get_db),
):
    patient = db.query(PatientProfile).filter(PatientProfile.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found.")

    report = MedicalReport(
        patient_id=payload.patient_id,
        document_id=payload.document_id,
        lab_name=payload.lab_name.strip(),
        report_type=payload.report_type.strip(),
        test_date=payload.test_date,
        key_findings=payload.key_findings.strip(),
        results_summary=payload.results_summary,
        is_normal=payload.is_normal,
    )
    db.add(report)
    db.flush()

    status_tag = "Normal" if payload.is_normal else "Abnormal / Requires Attention"
    history = PatientHistory(
        patient_id=payload.patient_id,
        recorded_by_id=current_user.id,
        event_type="Lab Report",
        title=f"Lab Report: {payload.report_type}",
        description=f"Tested at {payload.lab_name}. Status: {status_tag}. Findings: {payload.key_findings[:120]}...",
        event_date=payload.test_date,
    )
    db.add(history)
    db.commit()
    db.refresh(report)

    log_activity(db, current_user.id, "CREATE_MEDICAL_REPORT", "medical_report", str(report.id), f"Report {payload.report_type} for {patient.full_name}")
    return map_report_response(report)

@router.get("/{report_id}", response_model=MedicalReportResponse)
def get_medical_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    r = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medical report not found.")

    if current_user.role == UserRole.PATIENT.value:
        if not current_user.patient_profile or current_user.patient_profile.id != r.patient_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    return map_report_response(r)

