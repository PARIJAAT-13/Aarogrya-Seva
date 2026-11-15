from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.database.session import Base

class HealthcareWorkerProfile(Base):
    __tablename__ = "healthcare_worker_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    full_name = Column(String(200), nullable=False, index=True)
    phone_number = Column(String(20), nullable=False, index=True)
    qualification = Column(String(100), nullable=False) # MBBS, BAMS, BHMS, GNM, ANM, ASHA, etc.
    healthcare_facility = Column(String(200), nullable=False, index=True) # Primary Health Centre (PHC), Community Health Centre (CHC), etc.
    designation = Column(String(100), nullable=False) # Medical Officer, Staff Nurse, CHO, etc.
    license_number = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    preferred_language = Column(String(50), default="English", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="worker_profile")

