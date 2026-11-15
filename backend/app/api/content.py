from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_user, require_admin
from app.models.user import User, UserRole
from app.models.content import HealthcareContent
from app.schemas.content import ContentResponse, ContentCreate, ContentUpdate, ContentListResponse
from app.services.audit_service import log_activity

router = APIRouter(prefix="/healthcare-content", tags=["Healthcare Content"])

def map_content_response(c: HealthcareContent) -> ContentResponse:
    author_name = "Rural Health Directorate"
    if c.author and c.author.worker_profile:
        author_name = c.author.worker_profile.full_name
    elif c.author and c.author.role == UserRole.ADMIN.value:
        author_name = "Health Editorial Board"

    return ContentResponse(
        id=c.id,
        author_id=c.author_id,
        author_name=author_name,
        title=c.title,
        category=c.category,
        summary=c.summary,
        content=c.content,
        language=c.language,
        read_time_minutes=c.read_time_minutes,
        is_published=c.is_published,
        tags=c.tags,
        created_at=c.created_at,
        updated_at=c.updated_at,
    )

@router.get("/", response_model=ContentListResponse)
def list_healthcare_content(
    category: Optional[str] = Query(None, description="Category filter"),
    language: Optional[str] = Query(None, description="Language filter"),
    search: Optional[str] = Query(None, description="Search title, summary, or content"),
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(HealthcareContent)

    # Non-admins see only published content
    if current_user.role != UserRole.ADMIN.value:
        query = query.filter(HealthcareContent.is_published == True)

    if category:
        query = query.filter(HealthcareContent.category == category)

    if language:
        query = query.filter(HealthcareContent.language == language)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            (HealthcareContent.title.ilike(search_fmt)) |
            (HealthcareContent.summary.ilike(search_fmt)) |
            (HealthcareContent.content.ilike(search_fmt))
        )

    total = query.count()
    items = query.order_by(HealthcareContent.created_at.desc()).offset(offset).limit(limit).all()

    return ContentListResponse(
        total=total,
        items=[map_content_response(i) for i in items]
    )

@router.get("/{content_id}", response_model=ContentResponse)
def get_content_item(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(HealthcareContent).filter(HealthcareContent.id == content_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content article not found.")

    if not item.is_published and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Article is currently unpublished.")

    return map_content_response(item)

@router.post("/", response_model=ContentResponse, status_code=status.HTTP_201_CREATED)
def create_content_item(
    payload: ContentCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    item = HealthcareContent(
        author_id=current_user.id,
        title=payload.title.strip(),
        category=payload.category.strip(),
        summary=payload.summary.strip(),
        content=payload.content.strip(),
        language=payload.language or "English",
        read_time_minutes=payload.read_time_minutes,
        is_published=payload.is_published,
        tags=payload.tags,
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    log_activity(db, current_user.id, "CREATE_HEALTHCARE_CONTENT", "content", str(item.id), f"Created article: {item.title}")
    return map_content_response(item)

@router.put("/{content_id}", response_model=ContentResponse)
def update_content_item(
    content_id: int,
    payload: ContentUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    item = db.query(HealthcareContent).filter(HealthcareContent.id == content_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content article not found.")

    for field, val in payload.dict(exclude_unset=True).items():
        if val is not None:
            setattr(item, field, val)

    db.commit()
    db.refresh(item)
    log_activity(db, current_user.id, "UPDATE_HEALTHCARE_CONTENT", "content", str(item.id), f"Updated article: {item.title}")
    return map_content_response(item)

@router.delete("/{content_id}")
def delete_content_item(
    content_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    item = db.query(HealthcareContent).filter(HealthcareContent.id == content_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content article not found.")

    db.delete(item)
    db.commit()
    log_activity(db, current_user.id, "DELETE_HEALTHCARE_CONTENT", "content", str(content_id), f"Deleted article: {item.title}")
    return {"message": "Article deleted successfully."}

@router.patch("/{content_id}/publish")
def toggle_publish_status(
    content_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    item = db.query(HealthcareContent).filter(HealthcareContent.id == content_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content article not found.")

    item.is_published = not item.is_published
    db.commit()

    action = "published" if item.is_published else "unpublished"
    log_activity(db, current_user.id, "PUBLISH_HEALTHCARE_CONTENT", "content", str(item.id), f"Article '{item.title}' {action}")
    return {"message": f"Article {action}.", "is_published": item.is_published}

