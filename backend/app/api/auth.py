from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.patient import PatientProfile
from app.models.worker import HealthcareWorkerProfile
from app.models.medical_record import PatientHistory
from app.schemas.auth import (
    PatientRegisterRequest,
    WorkerRegisterRequest,
    LoginRequest,
    TokenResponse,
    UserSummary,
    UpdateProfileRequest,
    ChangePasswordRequest
)
from app.services.audit_service import log_activity
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_user_summary(user: User, db: Session) -> UserSummary:
    full_name = None
    facility_or_village = None
    pref_lang = "English"
    profile_id = None

    if user.role == UserRole.PATIENT.value and user.patient_profile:
        full_name = user.patient_profile.full_name
        facility_or_village = f"{user.patient_profile.village}, {user.patient_profile.district}"
        pref_lang = user.patient_profile.preferred_language
        profile_id = user.patient_profile.id
    elif user.role == UserRole.HEALTHCARE_WORKER.value and user.worker_profile:
        full_name = user.worker_profile.full_name
        facility_or_village = user.worker_profile.healthcare_facility
        pref_lang = user.worker_profile.preferred_language
        profile_id = user.worker_profile.id
    elif user.role == UserRole.ADMIN.value:
        full_name = "Administrator"
        facility_or_village = "Central Health Directorate"
        pref_lang = "English"

    return UserSummary(
        id=user.id,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        full_name=full_name,
        preferred_language=pref_lang,
        facility_or_village=facility_or_village,
        profile_id=profile_id,
    )

@router.post("/register/patient", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_patient(payload: PatientRegisterRequest, request: Request, db: Session = Depends(get_db)):
    clean_email = payload.email.lower().strip()
    # Check if user already exists
    existing = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )
    
    # Create user
    user = User(
        email=payload.email.lower().strip(),
        hashed_password=hash_password(payload.password),
        role=UserRole.PATIENT.value,
        is_active=True,
    )
    db.add(user)
    db.flush()

    # Create patient profile
    profile = PatientProfile(
        user_id=user.id,
        full_name=payload.full_name.strip(),
        phone_number=payload.phone_number.strip(),
        date_of_birth=payload.date_of_birth,
        gender=payload.gender,
        address=payload.address,
        village=payload.village.strip(),
        district=payload.district.strip(),
        state=payload.state.strip(),
        preferred_language=payload.preferred_language or "English",
        emergency_contact=payload.emergency_contact,
        blood_group=payload.blood_group,
    )
    db.add(profile)
    db.flush()

    # Create initial patient history entry
    history = PatientHistory(
        patient_id=profile.id,
        recorded_by_id=user.id,
        event_type="Registration",
        title="Patient Account Registered",
        description=f"Patient registered in system from village {payload.village}, {payload.district}.",
        event_date=datetime.now().strftime("%Y-%m-%d"),
    )
    db.add(history)
    db.commit()
    db.refresh(user)

    client_ip = request.client.host if request.client else None
    log_activity(db, user.id, "REGISTER_PATIENT", "user", str(user.id), f"Patient registered: {payload.full_name}", client_ip)

    token = create_access_token(subject=user.id, role=user.role)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=get_user_summary(user, db)
    )

@router.post("/register/healthcare-worker", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_healthcare_worker(payload: WorkerRegisterRequest, request: Request, db: Session = Depends(get_db)):
    clean_email = payload.email.lower().strip()
    existing = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )
    
    user = User(
        email=payload.email.lower().strip(),
        hashed_password=hash_password(payload.password),
        role=UserRole.HEALTHCARE_WORKER.value,
        is_active=True,
    )
    db.add(user)
    db.flush()

    profile = HealthcareWorkerProfile(
        user_id=user.id,
        full_name=payload.full_name.strip(),
        phone_number=payload.phone_number.strip(),
        qualification=payload.qualification.strip(),
        healthcare_facility=payload.healthcare_facility.strip(),
        designation=payload.designation.strip(),
        license_number=payload.license_number,
        address=payload.address,
        preferred_language=payload.preferred_language or "English",
    )
    db.add(profile)
    db.commit()
    db.refresh(user)

    client_ip = request.client.host if request.client else None
    log_activity(db, user.id, "REGISTER_WORKER", "user", str(user.id), f"Worker registered: {payload.full_name} ({payload.designation})", client_ip)

    token = create_access_token(subject=user.id, role=user.role)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=get_user_summary(user, db)
    )

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    clean_email = payload.email.lower().strip()
    user = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact an administrator.",
        )
    
    client_ip = request.client.host if request.client else None
    log_activity(db, user.id, "LOGIN", "auth", str(user.id), f"Successful login as {user.role}", client_ip)

    token = create_access_token(subject=user.id, role=user.role)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=get_user_summary(user, db)
    )

@router.get("/me", response_model=UserSummary)
def get_current_user_info(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_user_summary(current_user, db)

@router.put("/profile", response_model=UserSummary)
def update_profile(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == UserRole.PATIENT.value and current_user.patient_profile:
        p = current_user.patient_profile
        if payload.full_name is not None: p.full_name = payload.full_name
        if payload.phone_number is not None: p.phone_number = payload.phone_number
        if payload.preferred_language is not None: p.preferred_language = payload.preferred_language
        if payload.address is not None: p.address = payload.address
        if payload.village is not None: p.village = payload.village
        if payload.district is not None: p.district = payload.district
        if payload.state is not None: p.state = payload.state
        if payload.emergency_contact is not None: p.emergency_contact = payload.emergency_contact
        if payload.blood_group is not None: p.blood_group = payload.blood_group
    elif current_user.role == UserRole.HEALTHCARE_WORKER.value and current_user.worker_profile:
        w = current_user.worker_profile
        if payload.full_name is not None: w.full_name = payload.full_name
        if payload.phone_number is not None: w.phone_number = payload.phone_number
        if payload.preferred_language is not None: w.preferred_language = payload.preferred_language
        if payload.address is not None: w.address = payload.address
        if payload.healthcare_facility is not None: w.healthcare_facility = payload.healthcare_facility
        if payload.designation is not None: w.designation = payload.designation
        if payload.qualification is not None: w.qualification = payload.qualification
    
    db.commit()
    db.refresh(current_user)
    log_activity(db, current_user.id, "UPDATE_PROFILE", "user", str(current_user.id), "User updated profile details")
    return get_user_summary(current_user, db)

@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )
    
    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()
    log_activity(db, current_user.id, "CHANGE_PASSWORD", "auth", str(current_user.id), "Password changed")
    return {"message": "Password updated successfully."}

