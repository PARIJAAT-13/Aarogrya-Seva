from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database.session import get_db
from app.core.dependencies import require_admin
from app.models.user import User
from app.models.activity import ActivityLog
from app.schemas.dashboard import RecentActivityItem
from app.services.audit_service import log_activity

router = APIRouter(prefix="/users", tags=["User Management"])

class AdminUserResponse(BaseModel):
    id: int
    email: str
    role: str
    is_active: bool
    full_name: Optional[str] = None
    facility_or_village: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

@router.get("/", response_model=List[AdminUserResponse])
def list_all_users(
    role: Optional[str] = Query(None, description="Filter by role: patient, healthcare_worker, admin"),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)

    users = query.order_by(User.created_at.desc()).all()
    results = []
    for u in users:
        full_name = None
        facility_or_village = None
        if u.patient_profile:
            full_name = u.patient_profile.full_name
            facility_or_village = f"{u.patient_profile.village}, {u.patient_profile.district}"
        elif u.worker_profile:
            full_name = u.worker_profile.full_name
            facility_or_village = u.worker_profile.healthcare_facility
        elif u.role == "admin":
            full_name = "System Admin"
            facility_or_village = "Central Directorate"

        results.append(
            AdminUserResponse(
                id=u.id,
                email=u.email,
                role=u.role,
                is_active=u.is_active,
                full_name=full_name,
                facility_or_village=facility_or_village,
                created_at=u.created_at,
                updated_at=u.updated_at,
            )
        )
    return results

@router.patch("/{user_id}/toggle-active")
def toggle_user_active_status(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if user.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot deactivate your own administrator account.")

    user.is_active = not user.is_active
    db.commit()

    action = "activated" if user.is_active else "deactivated"
    log_activity(db, current_user.id, "TOGGLE_USER_ACTIVE", "user", str(user.id), f"Account {action}: {user.email}")
    return {"message": f"User account has been {action}.", "is_active": user.is_active}

@router.get("/activity-logs", response_model=List[RecentActivityItem])
def list_activity_logs(
    limit: int = 100,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    logs = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(limit).all()
    res = []
    for act in logs:
        u_name = "System"
        u_role = "system"
        if act.user:
            u_role = act.user.role
            if act.user.patient_profile:
                u_name = act.user.patient_profile.full_name
            elif act.user.worker_profile:
                u_name = act.user.worker_profile.full_name
            elif act.user.role == "admin":
                u_name = "Administrator"

        res.append(
            RecentActivityItem(
                id=act.id,
                action=act.action,
                resource_type=act.resource_type,
                details=act.details or f"{act.action} event",
                user_name=u_name,
                user_role=u_role,
                timestamp=act.created_at
            )
        )
    return res

