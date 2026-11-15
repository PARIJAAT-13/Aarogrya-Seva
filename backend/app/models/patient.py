from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.database.session import Base

class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    full_name = Column(String(200), nullable=False, index=True)
    phone_number = Column(String(20), nullable=False, index=True)
    date_of_birth = Column(String(50), nullable=True) # ISO Date string or format YYYY-MM-DD
    gender = Column(String(20), nullable=False) # Male, Female, Other
    address = Column(Text, nullable=True)
    village = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    preferred_language = Column(String(50), default="English", nullable=False) # English, Hindi, Telugu, Tamil, Kannada, Bengali
    blood_group = Column(String(10), nullable=True)
    emergency_contact = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="patient_profile")
    medical_records = relationship("MedicalRecord", back_populates="patient", cascade="all, delete-orphan")
    documents = relationship("MedicalDocument", back_populates="patient", cascade="all, delete-orphan")
    prescriptions = relationship("Prescription", back_populates="patient", cascade="all, delete-orphan")
    discharge_summaries = relationship("DischargeSummary", back_populates="patient", cascade="all, delete-orphan")
    medical_reports = relationship("MedicalReport", back_populates="patient", cascade="all, delete-orphan")
    history_events = relationship("PatientHistory", back_populates="patient", cascade="all, delete-orphan")

