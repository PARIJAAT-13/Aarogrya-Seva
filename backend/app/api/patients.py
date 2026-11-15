from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database.session import get_db
from app.core.dependencies import get_current_user, require_worker_or_admin
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.patient import PatientProfile
from app.models.medical_record import PatientHistory
from app.schemas.patient import PatientResponse, PatientCreate, PatientUpdate, PatientListResponse
from app.schemas.medical_record import PatientHistoryResponse, PatientHistoryCreate
from app.services.audit_service import log_activity

router = APIRouter(prefix="/patients", tags=["Patients"])

def map_patient_response(p: PatientProfile) -> PatientResponse:
    return PatientResponse(
        id=p.id,
        user_id=p.user_id,
        email=p.user.email if p.user else None,
        full_name=p.full_name,
        phone_number=p.phone_number,
        date_of_birth=p.date_of_birth,
        gender=p.gender,
        address=p.address,
        village=p.village,
        district=p.district,
        state=p.state,
        preferred_language=p.preferred_language,
        blood_group=p.blood_group,
        emergency_contact=p.emergency_contact,
        medical_documents_count=len(p.documents) if p.documents else 0,
        prescriptions_count=len(p.prescriptions) if p.prescriptions else 0,
        created_at=p.created_at,
        updated_at=p.updated_at,
    )

@router.get("/", response_model=PatientListResponse)
def list_patients(
    search: Optional[str] = Query(None, description="Search by name, phone, village, district"),
    language: Optional[str] = Query(None, description="Filter by preferred language"),
    gender: Optional[str] = Query(None, description="Filter by gender"),
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(require_worker_or_admin),
    db: Session = Depends(get_db),
):
    query = db.query(PatientProfile)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                PatientProfile.full_name.ilike(search_fmt),
                PatientProfile.phone_number.ilike(search_fmt),
                PatientProfile.village.ilike(search_fmt),
                PatientProfile.district.ilike(search_fmt),
            )
        )

    if language:
        query = query.filter(PatientProfile.preferred_language == language)
    if gender:
        query = query.filter(PatientProfile.gender == gender)

    total = query.count()
    patients = query.order_by(PatientProfile.created_at.desc()).offset(offset).limit(limit).all()

    return PatientListResponse(
        total=total,
        items=[map_patient_response(p) for p in patients]
    )

@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient_by_staff(
    payload: PatientCreate,
    current_user: User = Depends(require_worker_or_admin),
    db: Session = Depends(get_db),
):
    # Check if email exists
    existing = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists.",
        )

    user = User(
        email=payload.email.lower().strip(),
        hashed_password=hash_password(payload.password),
        role=UserRole.PATIENT.value,
        is_active=True,
    )
    db.add(user)
    db.flush()

    patient = PatientProfile(
        user_id=user.id,
        full_name=payload.full_name.strip(),
        phone_number=payload.phone_number.strip(),
        date_of_birth=payload.date_of_birth,
        gender=payload.gender,
        address=payload.address,
        village=payload.village.strip(),
        district=payload.district.strip(),
        state=payload.state.strip(),
        preferred_language=payload.preferred_language,
        blood_group=payload.blood_group,
        emergency_contact=payload.emergency_contact,
    )
    db.add(patient)
    db.flush()

    # Log initial history entry
    history = PatientHistory(
        patient_id=patient.id,
        recorded_by_id=current_user.id,
        event_type="Registration",
        title="Patient Registered by Healthcare Staff",
        description=f"Registered by {current_user.email} into facility records.",
        event_date=payload.date_of_birth or "2026-11-13",
    )
    db.add(history)
    db.commit()
    db.refresh(patient)

    log_activity(db, current_user.id, "CREATE_PATIENT", "patient", str(patient.id), f"Created patient {patient.full_name}")
    return map_patient_response(patient)

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    patient = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found.")

    # Authorization: Patient can only access own profile, staff can access all
    if current_user.role == UserRole.PATIENT.value and current_user.patient_profile:
        if current_user.patient_profile.id != patient.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this patient profile.")

    return map_patient_response(patient)

@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: int,
    payload: PatientUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    patient = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found.")

    if current_user.role == UserRole.PATIENT.value:
        if not current_user.patient_profile or current_user.patient_profile.id != patient.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    for field, val in payload.dict(exclude_unset=True).items():
        if val is not None:
            setattr(patient, field, val)

    db.commit()
    db.refresh(patient)
    log_activity(db, current_user.id, "UPDATE_PATIENT", "patient", str(patient.id), f"Updated patient {patient.full_name}")
    return map_patient_response(patient)

@router.get("/{patient_id}/history", response_model=List[PatientHistoryResponse])
def get_patient_history(
    patient_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    patient = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found.")

    if current_user.role == UserRole.PATIENT.value:
        if not current_user.patient_profile or current_user.patient_profile.id != patient.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    history_items = db.query(PatientHistory).filter(
        PatientHistory.patient_id == patient_id
    ).order_by(PatientHistory.event_date.desc(), PatientHistory.created_at.desc()).all()

    res = []
    for h in history_items:
        rec_name = "System"
        if h.recorded_by:
            if h.recorded_by.worker_profile:
                rec_name = h.recorded_by.worker_profile.full_name
            elif h.recorded_by.patient_profile:
                rec_name = h.recorded_by.patient_profile.full_name
            else:
                rec_name = h.recorded_by.email

        res.append(
            PatientHistoryResponse(
                id=h.id,
                patient_id=h.patient_id,
                event_type=h.event_type,
                title=h.title,
                description=h.description,
                event_date=h.event_date,
                recorded_by_id=h.recorded_by_id,
                recorded_by_name=rec_name,
                metadata_json=h.metadata_json,
                created_at=h.created_at,
            )
        )
    return res

@router.post("/{patient_id}/history", response_model=PatientHistoryResponse, status_code=status.HTTP_201_CREATED)
def add_patient_history(
    patient_id: int,
    payload: PatientHistoryCreate,
    current_user: User = Depends(require_worker_or_admin),
    db: Session = Depends(get_db),
):
    patient = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found.")

    history = PatientHistory(
        patient_id=patient_id,
        recorded_by_id=current_user.id,
        event_type=payload.event_type,
        title=payload.title,
        description=payload.description,
        event_date=payload.event_date,
        metadata_json=payload.metadata_json,
    )
    db.add(history)
    db.commit()
    db.refresh(history)

    log_activity(db, current_user.id, "ADD_PATIENT_HISTORY", "patient_history", str(history.id), f"Added history event '{payload.title}' for patient {patient.full_name}")

    rec_name = current_user.worker_profile.full_name if current_user.worker_profile else current_user.email
    return PatientHistoryResponse(
        id=history.id,
        patient_id=history.patient_id,
        event_type=history.event_type,
        title=history.title,
        description=history.description,
        event_date=history.event_date,
        recorded_by_id=history.recorded_by_id,
        recorded_by_name=rec_name,
        metadata_json=history.metadata_json,
        created_at=history.created_at,
    )

