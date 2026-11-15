import os
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.patient import PatientProfile
from app.models.document import MedicalDocument, Prescription, DischargeSummary, MedicalReport
from app.models.medical_record import PatientHistory
from app.schemas.document import DocumentResponse
from app.services.file_service import save_uploaded_file, delete_stored_file
from app.services.audit_service import log_activity
from datetime import datetime

router = APIRouter(prefix="/medical-documents", tags=["Medical Documents"])

def map_document_response(doc: MedicalDocument) -> DocumentResponse:
    uploaded_name = "System"
    if doc.uploader:
        if doc.uploader.worker_profile:
            uploaded_name = doc.uploader.worker_profile.full_name
        elif doc.uploader.patient_profile:
            uploaded_name = doc.uploader.patient_profile.full_name
        elif doc.uploader.role == UserRole.ADMIN.value:
            uploaded_name = "Administrator"
        else:
            uploaded_name = doc.uploader.email

    return DocumentResponse(
        id=doc.id,
        patient_id=doc.patient_id,
        patient_name=doc.patient.full_name if doc.patient else "Unknown",
        uploaded_by_id=doc.uploaded_by_id,
        uploaded_by_name=uploaded_name,
        document_type=doc.document_type,
        title=doc.title,
        description=doc.description,
        file_name=doc.file_name,
        original_filename=doc.original_filename,
        file_size=doc.file_size,
        mime_type=doc.mime_type,
        status=doc.status,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
    )

@router.get("/", response_model=List[DocumentResponse])
def list_documents(
    patient_id: Optional[int] = Query(None, description="Filter by patient ID"),
    document_type: Optional[str] = Query(None, description="Filter by type: prescription, discharge_summary, medical_report, other"),
    search: Optional[str] = Query(None, description="Search title or filename"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(MedicalDocument)

    # Permission check: Patient can only view their own documents
    if current_user.role == UserRole.PATIENT.value:
        if not current_user.patient_profile:
            return []
        query = query.filter(MedicalDocument.patient_id == current_user.patient_profile.id)
    elif patient_id:
        query = query.filter(MedicalDocument.patient_id == patient_id)

    if document_type:
        query = query.filter(MedicalDocument.document_type == document_type)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            (MedicalDocument.title.ilike(search_fmt)) |
            (MedicalDocument.original_filename.ilike(search_fmt))
        )

    docs = query.order_by(MedicalDocument.created_at.desc()).all()
    return [map_document_response(d) for d in docs]

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form(..., description="prescription, discharge_summary, medical_report, or other"),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    patient_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Resolve target patient
    target_patient_id = None
    if current_user.role == UserRole.PATIENT.value:
        if not current_user.patient_profile:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No patient profile found for this account.")
        target_patient_id = current_user.patient_profile.id
    else:
        # Worker or Admin must provide or target patient_id
        if not patient_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="patient_id is required when uploading as healthcare staff.")
        target_patient_id = patient_id

    # Verify patient exists
    patient = db.query(PatientProfile).filter(PatientProfile.id == target_patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target patient not found.")

    # Save file securely
    stored_name, file_path, file_size = await save_uploaded_file(file)

    doc = MedicalDocument(
        patient_id=target_patient_id,
        uploaded_by_id=current_user.id,
        document_type=document_type.lower().strip(),
        title=title.strip(),
        description=description.strip() if description else None,
        file_name=stored_name,
        original_filename=file.filename or stored_name,
        file_path=file_path,
        file_size=file_size,
        mime_type=file.content_type or "application/octet-stream",
        status="Verified",
    )
    db.add(doc)
    db.flush()

    # Create patient history event
    type_labels = {
        "prescription": "Prescription Uploaded",
        "discharge_summary": "Discharge Summary Uploaded",
        "medical_report": "Medical Lab Report Uploaded",
        "other": "Medical Document Uploaded",
    }
    history = PatientHistory(
        patient_id=target_patient_id,
        recorded_by_id=current_user.id,
        event_type="Document Upload",
        title=type_labels.get(doc.document_type, "Document Uploaded"),
        description=f"Uploaded '{doc.title}' ({doc.original_filename})",
        event_date=datetime.now().strftime("%Y-%m-%d"),
    )
    db.add(history)
    db.commit()
    db.refresh(doc)

    log_activity(db, current_user.id, "UPLOAD_DOCUMENT", "document", str(doc.id), f"Uploaded {doc.document_type}: {doc.title}")
    return map_document_response(doc)

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document_details(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(MedicalDocument).filter(MedicalDocument.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    if current_user.role == UserRole.PATIENT.value:
        if not current_user.patient_profile or current_user.patient_profile.id != doc.patient_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    return map_document_response(doc)

@router.get("/{document_id}/download")
def download_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(MedicalDocument).filter(MedicalDocument.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    if current_user.role == UserRole.PATIENT.value:
        if not current_user.patient_profile or current_user.patient_profile.id != doc.patient_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found on storage server.")

    log_activity(db, current_user.id, "DOWNLOAD_DOCUMENT", "document", str(doc.id), f"Downloaded {doc.original_filename}")
    return FileResponse(
        path=doc.file_path,
        filename=doc.original_filename,
        media_type=doc.mime_type,
        headers={"Content-Disposition": f'attachment; filename="{doc.original_filename}"'}
    )

@router.get("/{document_id}/view")
def view_document_inline(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(MedicalDocument).filter(MedicalDocument.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    if current_user.role == UserRole.PATIENT.value:
        if not current_user.patient_profile or current_user.patient_profile.id != doc.patient_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found on storage server.")

    log_activity(db, current_user.id, "VIEW_DOCUMENT", "document", str(doc.id), f"Viewed inline {doc.original_filename}")
    return FileResponse(
        path=doc.file_path,
        media_type=doc.mime_type,
        headers={"Content-Disposition": f'inline; filename="{doc.original_filename}"'}
    )

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(MedicalDocument).filter(MedicalDocument.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    # Permissions: Admin or the uploader can delete
    is_admin = (current_user.role == UserRole.ADMIN.value)
    is_uploader = (doc.uploaded_by_id == current_user.id)
    if not (is_admin or is_uploader):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to delete this document.")

    delete_stored_file(doc.file_path)
    db.delete(doc)
    db.commit()

    log_activity(db, current_user.id, "DELETE_DOCUMENT", "document", str(document_id), f"Deleted document {doc.title}")
    return {"message": "Document deleted successfully."}

