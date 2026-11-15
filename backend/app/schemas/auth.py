from typing import Optional, Any
from pydantic import BaseModel, EmailStr, Field

class PatientRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password at least 6 characters")
    full_name: str = Field(..., min_length=2)
    phone_number: str = Field(..., min_length=7)
    date_of_birth: Optional[str] = None # YYYY-MM-DD
    gender: str = Field(default="Male") # Male, Female, Other
    address: Optional[str] = None
    village: str = Field(..., min_length=2)
    district: str = Field(..., min_length=2)
    state: str = Field(..., min_length=2)
    preferred_language: str = Field(default="English") # English, Hindi, Telugu, Tamil, Kannada, Bengali
    emergency_contact: Optional[str] = None
    blood_group: Optional[str] = None

class WorkerRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    phone_number: str = Field(..., min_length=7)
    qualification: str = Field(..., min_length=2) # MBBS, BAMS, BHMS, GNM, ANM, ASHA, etc.
    healthcare_facility: str = Field(..., min_length=2) # Primary Health Centre (PHC), etc.
    designation: str = Field(..., min_length=2) # Medical Officer, Staff Nurse, etc.
    license_number: Optional[str] = None
    address: Optional[str] = None
    preferred_language: str = Field(default="English")

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserSummary(BaseModel):
    id: int
    email: str
    role: str
    is_active: bool
    full_name: Optional[str] = None
    preferred_language: Optional[str] = "English"
    facility_or_village: Optional[str] = None
    profile_id: Optional[int] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserSummary

class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    preferred_language: Optional[str] = None
    address: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    healthcare_facility: Optional[str] = None
    designation: Optional[str] = None
    qualification: Optional[str] = None
    emergency_contact: Optional[str] = None
    blood_group: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)

