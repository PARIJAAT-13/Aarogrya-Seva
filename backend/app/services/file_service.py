import os
import uuid
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings

ALLOWED_EXTENSIONS = {"pdf", "jpg", "jpeg", "png"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
}

MAX_FILE_SIZE = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

def validate_file(file: UploadFile):
    """Validate file extension and content type."""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file has no filename."
        )
    
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )
    
    if file.content_type and file.content_type.lower() not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file MIME type '{file.content_type}'. Allowed types: PDF, JPEG, PNG",
        )

async def save_uploaded_file(file: UploadFile) -> tuple[str, str, int]:
    """
    Saves an uploaded file to storage directory with a unique UUID filename.
    Returns: (stored_filename, absolute_filepath, file_size_in_bytes)
    """
    validate_file(file)

    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "dat"
    unique_filename = f"{uuid.uuid4().hex}.{ext}"
    destination_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    file_size = 0
    # Read and write in chunks to handle memory safely
    with open(destination_path, "wb") as out_file:
        while content := await file.read(1024 * 1024):  # 1MB chunk
            file_size += len(content)
            if file_size > MAX_FILE_SIZE:
                out_file.close()
                if os.path.exists(destination_path):
                    os.remove(destination_path)
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB.",
                )
            out_file.write(content)

    return unique_filename, destination_path, file_size

def delete_stored_file(filepath: str):
    """Safely delete file from disk if it exists."""
    try:
        if filepath and os.path.exists(filepath):
            os.remove(filepath)
    except Exception:
        pass
