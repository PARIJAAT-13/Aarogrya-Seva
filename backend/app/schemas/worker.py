from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr

class WorkerCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone_number: str
    qualification: str
    healthcare_facility: str
    designation: str
    license_number: Optional[str] = None
    address: Optional[str] = None
    preferred_language: str = "English"

class WorkerUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    qualification: Optional[str] = None
    healthcare_facility: Optional[str] = None
    designation: Optional[str] = None
    license_number: Optional[str] = None
    address: Optional[str] = None
    preferred_language: Optional[str] = None

class WorkerResponse(BaseModel):
    id: int
    user_id: int
    email: Optional[str] = None
    full_name: str
    phone_number: str
    qualification: str
    healthcare_facility: str
    designation: str
    license_number: Optional[str] = None
    address: Optional[str] = None
    preferred_language: str
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class WorkerListResponse(BaseModel):
    total: int
    items: List[WorkerResponse]

