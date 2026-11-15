from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database.session import get_db
from app.core.dependencies import get_current_user, require_admin, require_worker_or_admin
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.worker import HealthcareWorkerProfile
from app.schemas.worker import WorkerResponse, WorkerCreate, WorkerUpdate, WorkerListResponse
from app.services.audit_service import log_activity

router = APIRouter(prefix="/healthcare-workers", tags=["Healthcare Workers"])

def map_worker_response(w: HealthcareWorkerProfile) -> WorkerResponse:
    return WorkerResponse(
        id=w.id,
        user_id=w.user_id,
        email=w.user.email if w.user else None,
        full_name=w.full_name,
        phone_number=w.phone_number,
        qualification=w.qualification,
        healthcare_facility=w.healthcare_facility,
        designation=w.designation,
        license_number=w.license_number,
        address=w.address,
        preferred_language=w.preferred_language,
        is_active=w.user.is_active if w.user else True,
        created_at=w.created_at,
        updated_at=w.updated_at,
    )

@router.get("/", response_model=WorkerListResponse)
def list_healthcare_workers(
    search: Optional[str] = Query(None, description="Search by name, qualification, facility, designation"),
    facility: Optional[str] = Query(None, description="Filter by healthcare facility"),
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(require_worker_or_admin),
    db: Session = Depends(get_db),
):
    query = db.query(HealthcareWorkerProfile).join(User)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                HealthcareWorkerProfile.full_name.ilike(search_fmt),
                HealthcareWorkerProfile.qualification.ilike(search_fmt),
                HealthcareWorkerProfile.healthcare_facility.ilike(search_fmt),
                HealthcareWorkerProfile.designation.ilike(search_fmt),
                HealthcareWorkerProfile.phone_number.ilike(search_fmt),
            )
        )

    if facility:
        query = query.filter(HealthcareWorkerProfile.healthcare_facility == facility)

    total = query.count()
    workers = query.order_by(HealthcareWorkerProfile.created_at.desc()).offset(offset).limit(limit).all()

    return WorkerListResponse(
        total=total,
        items=[map_worker_response(w) for w in workers]
    )

@router.post("/", response_model=WorkerResponse, status_code=status.HTTP_201_CREATED)
def create_healthcare_worker(
    payload: WorkerCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    existing = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists.",
        )

    user = User(
        email=payload.email.lower().strip(),
        hashed_password=hash_password(payload.password),
        role=UserRole.HEALTHCARE_WORKER.value,
        is_active=True,
    )
    db.add(user)
    db.flush()

    worker = HealthcareWorkerProfile(
        user_id=user.id,
        full_name=payload.full_name.strip(),
        phone_number=payload.phone_number.strip(),
        qualification=payload.qualification.strip(),
        healthcare_facility=payload.healthcare_facility.strip(),
        designation=payload.designation.strip(),
        license_number=payload.license_number,
        address=payload.address,
        preferred_language=payload.preferred_language,
    )
    db.add(worker)
    db.commit()
    db.refresh(worker)

    log_activity(db, current_user.id, "CREATE_WORKER", "worker", str(worker.id), f"Admin created worker {worker.full_name}")
    return map_worker_response(worker)

@router.get("/{worker_id}", response_model=WorkerResponse)
def get_healthcare_worker(
    worker_id: int,
    current_user: User = Depends(require_worker_or_admin),
    db: Session = Depends(get_db),
):
    worker = db.query(HealthcareWorkerProfile).filter(HealthcareWorkerProfile.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Healthcare worker not found.")
    return map_worker_response(worker)

@router.put("/{worker_id}", response_model=WorkerResponse)
def update_healthcare_worker(
    worker_id: int,
    payload: WorkerUpdate,
    current_user: User = Depends(require_worker_or_admin),
    db: Session = Depends(get_db),
):
    worker = db.query(HealthcareWorkerProfile).filter(HealthcareWorkerProfile.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Healthcare worker not found.")

    # Only admin or self can update
    if current_user.role != UserRole.ADMIN.value:
        if not current_user.worker_profile or current_user.worker_profile.id != worker.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    for field, val in payload.dict(exclude_unset=True).items():
        if val is not None:
            setattr(worker, field, val)

    db.commit()
    db.refresh(worker)
    log_activity(db, current_user.id, "UPDATE_WORKER", "worker", str(worker.id), f"Updated worker profile {worker.full_name}")
    return map_worker_response(worker)

@router.patch("/{worker_id}/toggle-status")
def toggle_worker_status(
    worker_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    worker = db.query(HealthcareWorkerProfile).filter(HealthcareWorkerProfile.id == worker_id).first()
    if not worker or not worker.user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Healthcare worker not found.")

    worker.user.is_active = not worker.user.is_active
    db.commit()

    action_label = "activated" if worker.user.is_active else "deactivated"
    log_activity(db, current_user.id, "TOGGLE_USER_STATUS", "user", str(worker.user.id), f"Worker account {action_label}")
    return {"message": f"Worker account successfully {action_label}.", "is_active": worker.user.is_active}

