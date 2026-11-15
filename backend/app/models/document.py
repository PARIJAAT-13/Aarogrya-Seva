from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, BigInteger, func
from sqlalchemy.orm import relationship
from app.database.session import Base

class MedicalDocument(Base):
    __tablename__ = "medical_documents"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    uploaded_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    document_type = Column(String(50), nullable=False, index=True) # prescription, discharge_summary, medical_report, other
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    file_name = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(BigInteger, nullable=False) # bytes
    mime_type = Column(String(100), nullable=False) # application/pdf, image/jpeg, image/png
    status = Column(String(50), default="Verified", nullable=False) # Verified, Pending Review, Archived
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    patient = relationship("PatientProfile", back_populates="documents")
    uploader = relationship("User", foreign_keys=[uploaded_by_id])
    prescription = relationship("Prescription", back_populates="document", uselist=False, cascade="all, delete-orphan")
    discharge_summary = relationship("DischargeSummary", back_populates="document", uselist=False, cascade="all, delete-orphan")
    medical_report = relationship("MedicalReport", back_populates="document", uselist=False, cascade="all, delete-orphan")

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(Integer, ForeignKey("medical_documents.id", ondelete="SET NULL"), nullable=True, index=True)
    doctor_name = Column(String(200), nullable=False)
    facility_name = Column(String(200), nullable=False)
    prescription_date = Column(String(50), nullable=False) # YYYY-MM-DD
    diagnosis = Column(String(255), nullable=False)
    medications_text = Column(Text, nullable=False)
    dosage_instructions = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    patient = relationship("PatientProfile", back_populates="prescriptions")
    document = relationship("MedicalDocument", back_populates="prescription")

class DischargeSummary(Base):
    __tablename__ = "discharge_summaries"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(Integer, ForeignKey("medical_documents.id", ondelete="SET NULL"), nullable=True, index=True)
    hospital_name = Column(String(200), nullable=False)
    doctor_name = Column(String(200), nullable=False)
    admission_date = Column(String(50), nullable=False)
    discharge_date = Column(String(50), nullable=False)
    admission_reason = Column(String(255), nullable=True)
    final_diagnosis = Column(String(255), nullable=False)
    treatment_summary = Column(Text, nullable=False)
    discharge_advice = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    patient = relationship("PatientProfile", back_populates="discharge_summaries")
    document = relationship("MedicalDocument", back_populates="discharge_summary")

class MedicalReport(Base):
    __tablename__ = "medical_reports"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(Integer, ForeignKey("medical_documents.id", ondelete="SET NULL"), nullable=True, index=True)
    lab_name = Column(String(200), nullable=False)
    report_type = Column(String(100), nullable=False, index=True) # Blood Test, Ultrasound, X-Ray, ECG, etc.
    test_date = Column(String(50), nullable=False)
    key_findings = Column(Text, nullable=False)
    results_summary = Column(Text, nullable=True)
    is_normal = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    patient = relationship("PatientProfile", back_populates="medical_reports")
    document = relationship("MedicalDocument", back_populates="medical_report")

