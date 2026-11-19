from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

# --- Document Extraction & Language Detection ---
class TextExtractionResponse(BaseModel):
    document_id: Optional[int] = None
    filename: Optional[str] = None
    extracted_text: str
    detected_language: str
    confidence: float
    page_count: int = 1
    method: str = "PyMuPDF / OCR"
    warning: Optional[str] = None

# --- Medical Translation ---
class TranslationRequest(BaseModel):
    text: str = Field(..., min_length=2, description="Medical text to translate")
    target_language: str = Field(..., description="Target language: Hindi, Telugu, or English")
    source_language: Optional[str] = Field("auto", description="Source language: auto, English, Hindi, Telugu")
    patient_id: Optional[int] = None
    document_id: Optional[int] = None
    document_type: Optional[str] = "medical_text"

class TranslationResponse(BaseModel):
    id: Optional[int] = None
    original_text: str
    translated_text: str
    source_language: str
    target_language: str
    confidence_score: float
    status: str
    engine: str
    patient_id: Optional[int] = None
    document_id: Optional[int] = None
    created_at: Optional[datetime] = None

class TranslationHistoryResponse(BaseModel):
    id: int
    patient_id: Optional[int] = None
    patient_name: Optional[str] = None
    document_id: Optional[int] = None
    document_title: Optional[str] = None
    document_type: Optional[str] = None
    source_language: str
    target_language: str
    original_text: str
    translated_text: str
    confidence_score: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Medical Terminology Simplification ---
class SimplifiedTermItem(BaseModel):
    term: str
    category: str
    simple_explanation_en: str
    simple_explanation_hi: str
    simple_explanation_te: str
    clinical_context: Optional[str] = None

class SimplificationRequest(BaseModel):
    text: str = Field(..., min_length=2, description="Medical text or clinical notes to simplify")
    target_language: Optional[str] = Field("English", description="Target language: English, Hindi, Telugu")
    patient_id: Optional[int] = None
    document_id: Optional[int] = None

class SimplificationResponse(BaseModel):
    original_text: str
    simplified_text: str
    target_language: str
    identified_terms: List[SimplifiedTermItem]
    preserved_elements: Dict[str, List[str]] # medicines, dosages, frequencies preserved
    medical_disclaimer: str = (
        "This simplified summary is generated to aid understanding. "
        "It does not replace clinical consultation or alter prescribed medical instructions."
    )

# --- Medical Information Extraction (NER) ---
class MedicationEntity(BaseModel):
    name: str
    dosage: str = "Not specified"
    frequency: str = "As directed"
    route: str = "Oral"
    duration: Optional[str] = None

class EntityExtractionRequest(BaseModel):
    text: str = Field(..., min_length=2, description="Clinical text, prescription, or report text to extract entities from")
    patient_id: Optional[int] = None
    document_id: Optional[int] = None
    source_type: Optional[str] = "prescription"

class EntityExtractionResponse(BaseModel):
    id: Optional[int] = None
    patient_id: Optional[int] = None
    document_id: Optional[int] = None
    diseases: List[str]
    medications: List[MedicationEntity]
    treatment_instructions: List[str]
    symptoms: List[str] = []
    medical_terms: List[str] = []
    total_entities_count: int
    confidence_score: float
    created_at: Optional[datetime] = None

# --- Symptom Information ---
class SymptomSummary(BaseModel):
    id: int
    symptom_name: str
    symptom_name_hi: Optional[str] = None
    symptom_name_te: Optional[str] = None
    category: str
    urgency_level: str
    description: str # localized based on requested language

class SymptomDetailResponse(BaseModel):
    id: int
    symptom_name: str
    symptom_name_hi: Optional[str] = None
    symptom_name_te: Optional[str] = None
    category: str
    urgency_level: str
    
    description_en: str
    description_hi: Optional[str] = None
    description_te: Optional[str] = None
    
    possible_causes_en: str
    possible_causes_hi: Optional[str] = None
    possible_causes_te: Optional[str] = None
    
    self_care_advice_en: Optional[str] = None
    self_care_advice_hi: Optional[str] = None
    self_care_advice_te: Optional[str] = None
    
    when_to_see_doctor_en: str
    when_to_see_doctor_hi: Optional[str] = None
    when_to_see_doctor_te: Optional[str] = None
    
    related_faqs: List[Dict[str, str]]
    reference_source: str
    medical_disclaimer: str = (
        "Educational awareness only. This information does NOT constitute medical diagnosis "
        "or replace formal consultation with a certified doctor."
    )

    class Config:
        from_attributes = True

# --- Healthcare Knowledge Base ---
class KnowledgeBaseArticleCreate(BaseModel):
    title_en: str
    title_hi: Optional[str] = None
    title_te: Optional[str] = None
    category: str
    tags: Optional[str] = None
    summary_en: Optional[str] = None
    summary_hi: Optional[str] = None
    summary_te: Optional[str] = None
    content_en: str
    content_hi: Optional[str] = None
    content_te: Optional[str] = None
    reference_source: Optional[str] = "MoHFW / WHO / AIIMS Guidelines"

class KnowledgeBaseArticleUpdate(BaseModel):
    title_en: Optional[str] = None
    title_hi: Optional[str] = None
    title_te: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    summary_en: Optional[str] = None
    summary_hi: Optional[str] = None
    summary_te: Optional[str] = None
    content_en: Optional[str] = None
    content_hi: Optional[str] = None
    content_te: Optional[str] = None
    reference_source: Optional[str] = None

class KnowledgeBaseArticleResponse(BaseModel):
    id: int
    title_en: str
    title_hi: Optional[str] = None
    title_te: Optional[str] = None
    category: str
    tags: Optional[str] = None
    summary_en: Optional[str] = None
    summary_hi: Optional[str] = None
    summary_te: Optional[str] = None
    content_en: str
    content_hi: Optional[str] = None
    content_te: Optional[str] = None
    reference_source: str
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Clinical Terminology Entry ---
class MedicalTerminologyResponse(BaseModel):
    id: int
    term: str
    category: str
    simple_explanation_en: str
    simple_explanation_hi: str
    simple_explanation_te: str
    clinical_context: Optional[str] = None
    example_usage: Optional[str] = None

    class Config:
        from_attributes = True

# --- AI Assistant Dashboard Stats ---
class AIDashboardStats(BaseModel):
    total_documents_processed: int
    total_translations: int
    total_entities_extracted: int
    supported_languages: List[str]
    recent_translations: List[TranslationHistoryResponse]
    recent_extractions: List[EntityExtractionResponse]
    knowledge_base_article_count: int
    symptom_topics_count: int
