from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.database.session import Base

class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    recorded_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    record_type = Column(String(100), nullable=False, index=True) # General Checkup, Follow-up, Antenatal Care, Immunization, Emergency
    diagnosis_summary = Column(String(255), nullable=False)
    symptoms = Column(Text, nullable=False)
    vital_signs = Column(Text, nullable=True) # e.g. "BP: 120/80 mmHg, Pulse: 72 bpm, Temp: 98.6 F, SpO2: 98%"
    clinical_notes = Column(Text, nullable=True)
    treatment_plan = Column(Text, nullable=True)
    record_date = Column(String(50), nullable=False) # YYYY-MM-DD
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    patient = relationship("PatientProfile", back_populates="medical_records")
    recorded_by = relationship("User", foreign_keys=[recorded_by_id])

class PatientHistory(Base):
    __tablename__ = "patient_histories"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    recorded_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    event_type = Column(String(100), nullable=False, index=True) # Consultation, Document Upload, Prescription Added, Condition Diagnosed, Lab Report
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    event_date = Column(String(50), nullable=False) # YYYY-MM-DD
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    patient = relationship("PatientProfile", back_populates="history_events")
    recorded_by = relationship("User", foreign_keys=[recorded_by_id])

