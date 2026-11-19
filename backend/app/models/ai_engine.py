from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, Float, func
from sqlalchemy.orm import relationship
from app.database.session import Base

class TranslationHistory(Base):
    __tablename__ = "translation_histories"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=True, index=True)
    document_id = Column(Integer, ForeignKey("medical_documents.id", ondelete="SET NULL"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    document_title = Column(String(255), nullable=True)
    document_type = Column(String(50), nullable=True) # prescription, discharge_summary, medical_report, healthcare_instruction, raw_text
    source_language = Column(String(50), default="English", nullable=False)
    target_language = Column(String(50), nullable=False) # Hindi, Telugu, English
    
    original_text = Column(Text, nullable=False)
    translated_text = Column(Text, nullable=False)
    
    confidence_score = Column(Float, default=0.95, nullable=False)
    translation_engine = Column(String(100), default="AarogyaSeva Neural Translator", nullable=False)
    status = Column(String(50), default="Completed", nullable=False) # Completed, Flagged for Review, Failed
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    patient = relationship("PatientProfile", backref="translations")
    document = relationship("MedicalDocument", backref="translations")
    user = relationship("User", foreign_keys=[user_id])


class ExtractedMedicalEntity(Base):
    __tablename__ = "extracted_medical_entities"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=True, index=True)
    document_id = Column(Integer, ForeignKey("medical_documents.id", ondelete="SET NULL"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    source_type = Column(String(50), default="prescription", nullable=False) # prescription, discharge_summary, report, raw_text
    source_text = Column(Text, nullable=False)
    
    # Structured JSON stored as Text for SQLite and Postgres compatibility
    diseases_json = Column(Text, nullable=False, default="[]")
    medications_json = Column(Text, nullable=False, default="[]")
    treatment_instructions_json = Column(Text, nullable=False, default="[]")
    symptoms_json = Column(Text, nullable=True, default="[]")
    medical_terms_json = Column(Text, nullable=True, default="[]")
    
    total_entities_count = Column(Integer, default=0, nullable=False)
    confidence_score = Column(Float, default=0.92, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    patient = relationship("PatientProfile", backref="extracted_entities")
    document = relationship("MedicalDocument", backref="extracted_entities")
    user = relationship("User", foreign_keys=[user_id])


class SymptomInformation(Base):
    __tablename__ = "symptom_information"

    id = Column(Integer, primary_key=True, index=True)
    symptom_name = Column(String(200), nullable=False, unique=True, index=True)
    symptom_name_hi = Column(String(200), nullable=True)
    symptom_name_te = Column(String(200), nullable=True)
    
    category = Column(String(100), default="General", nullable=False, index=True) # Respiratory, Cardiovascular, Digestive, Neurological, etc.
    urgency_level = Column(String(50), default="Moderate", nullable=False) # Low, Moderate, High / Urgent
    
    description_en = Column(Text, nullable=False)
    description_hi = Column(Text, nullable=True)
    description_te = Column(Text, nullable=True)
    
    possible_causes_en = Column(Text, nullable=False)
    possible_causes_hi = Column(Text, nullable=True)
    possible_causes_te = Column(Text, nullable=True)
    
    self_care_advice_en = Column(Text, nullable=True)
    self_care_advice_hi = Column(Text, nullable=True)
    self_care_advice_te = Column(Text, nullable=True)
    
    when_to_see_doctor_en = Column(Text, nullable=False)
    when_to_see_doctor_hi = Column(Text, nullable=True)
    when_to_see_doctor_te = Column(Text, nullable=True)
    
    related_faqs_json = Column(Text, nullable=True, default="[]")
    is_verified = Column(Boolean, default=True, nullable=False)
    reference_source = Column(String(255), default="National Health Portal / WHO / AIIMS Clinical Guidelines", nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class HealthcareKnowledgeBase(Base):
    __tablename__ = "healthcare_knowledge_base"

    id = Column(Integer, primary_key=True, index=True)
    title_en = Column(String(255), nullable=False, index=True)
    title_hi = Column(String(255), nullable=True)
    title_te = Column(String(255), nullable=True)
    
    category = Column(String(100), nullable=False, index=True) # Preventive Care, Maternal & Child, Infectious Diseases, Chronic Conditions, First Aid, Nutrition & Sanitation
    tags = Column(String(255), nullable=True) # comma separated
    
    summary_en = Column(Text, nullable=True)
    summary_hi = Column(Text, nullable=True)
    summary_te = Column(Text, nullable=True)
    
    content_en = Column(Text, nullable=False)
    content_hi = Column(Text, nullable=True)
    content_te = Column(Text, nullable=True)
    
    reference_source = Column(String(255), default="Ministry of Health and Family Welfare (MoHFW) / WHO", nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)
    
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    author = relationship("User", foreign_keys=[created_by_id])


class MedicalTerminology(Base):
    __tablename__ = "medical_terminology"

    id = Column(Integer, primary_key=True, index=True)
    term = Column(String(200), nullable=False, unique=True, index=True)
    category = Column(String(100), default="General Clinical", nullable=False, index=True)
    
    simple_explanation_en = Column(Text, nullable=False)
    simple_explanation_hi = Column(Text, nullable=False)
    simple_explanation_te = Column(Text, nullable=False)
    
    clinical_context = Column(Text, nullable=True)
    example_usage = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
