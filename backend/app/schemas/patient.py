from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr

class PatientCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone_number: str
    date_of_birth: Optional[str] = None
    gender: str = "Male"
    address: Optional[str] = None
    village: str
    district: str
    state: str
    preferred_language: str = "English"
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None

class PatientUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    preferred_language: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None

class PatientResponse(BaseModel):
    id: int
    user_id: int
    email: Optional[str] = None
    full_name: str
    phone_number: str
    date_of_birth: Optional[str] = None
    gender: str
    address: Optional[str] = None
    village: str
    district: str
    state: str
    preferred_language: str
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    medical_documents_count: Optional[int] = 0
    prescriptions_count: Optional[int] = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PatientListResponse(BaseModel):
    total: int
    items: List[PatientResponse]

