import os
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.database.session import get_db
from app.core.dependencies import get_current_user, get_current_active_user, get_admin_user
from app.models.user import User, UserRole
from app.models.document import MedicalDocument
from app.models.patient import PatientProfile
from app.models.ai_engine import (
    TranslationHistory,
    ExtractedMedicalEntity,
    SymptomInformation,
    HealthcareKnowledgeBase,
    MedicalTerminology,
)
from app.schemas.ai_engine import (
    TextExtractionResponse,
    TranslationRequest,
    TranslationResponse,
    TranslationHistoryResponse,
    SimplificationRequest,
    SimplificationResponse,
    EntityExtractionRequest,
    EntityExtractionResponse,
    MedicationEntity,
    SymptomSummary,
    SymptomDetailResponse,
    KnowledgeBaseArticleCreate,
    KnowledgeBaseArticleUpdate,
    KnowledgeBaseArticleResponse,
    MedicalTerminologyResponse,
    AIDashboardStats,
)
from app.services.ocr_service import extract_text_from_file, detect_language_robust
from app.services.translation_service import MedicalTranslator
from app.services.simplification_service import MedicalSimplifier
from app.services.ner_service import MedicalNEREngine
from app.services.audit_service import log_activity

router = APIRouter(prefix="/ai", tags=["AI Medical Assistant"])

# =========================================================================
# 1. Document OCR & Text Extraction
# =========================================================================
@router.post("/extract-text", response_model=TextExtractionResponse)
async def extract_document_text(
    document_id: Optional[int] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Extracts text from uploaded PDF/Image or existing stored MedicalDocument using OCR/PyMuPDF.
    """
    temp_path = None
    target_path = None
    mime_type = ""
    filename = ""

    if document_id:
        doc = db.query(MedicalDocument).filter(MedicalDocument.id == document_id).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Medical document not found")
        # RBAC Check
        if current_user.role == UserRole.PATIENT:
            patient_profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
            if not patient_profile or doc.patient_id != patient_profile.id:
                raise HTTPException(status_code=403, detail="Unauthorized access to document")
        target_path = doc.file_path
        mime_type = doc.mime_type
        filename = doc.original_filename
    elif file:
        filename = file.filename or "upload"
        ext = os.path.splitext(filename)[1].lower()
        if ext not in [".pdf", ".jpg", ".jpeg", ".png", ".bmp"]:
            raise HTTPException(status_code=400, detail="Only PDF, JPG, JPEG, and PNG files are supported for OCR")
        
        # Save temporarily
        os.makedirs("./uploads/temp", exist_ok=True)
        temp_path = f"./uploads/temp/temp_{current_user.id}_{int(os.times()[4])}{ext}"
        content = await file.read()
        with open(temp_path, "wb") as f:
            f.write(content)
        target_path = temp_path
        mime_type = file.content_type or ""
    else:
        raise HTTPException(status_code=400, detail="Either a document_id or a file must be provided")

    try:
        extraction_res = extract_text_from_file(target_path, mime_type)
        return TextExtractionResponse(
            document_id=document_id,
            filename=filename,
            extracted_text=extraction_res["text"],
            detected_language=extraction_res["detected_language"],
            confidence=extraction_res["confidence"],
            page_count=extraction_res["page_count"],
            method=extraction_res["method"],
            warning=None if extraction_res["text"] else "No legible text could be extracted. Please check image clarity."
        )
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

# =========================================================================
# 2. Medical Language Translation
# =========================================================================
@router.post("/translate", response_model=TranslationResponse)
def translate_medical_text(
    payload: TranslationRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Translates medical text between English, Hindi, and Telugu while preserving critical clinical tokens.
    Saves translation to history.
    """
    # RBAC Check for patient_id if provided
    if payload.patient_id and current_user.role == UserRole.PATIENT:
        patient_profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
        if not patient_profile or payload.patient_id != patient_profile.id:
            raise HTTPException(status_code=403, detail="Unauthorized access to patient record")

    trans_res = MedicalTranslator.translate_medical_text(
        text=payload.text,
        target_lang=payload.target_language,
        source_lang=payload.source_language or "auto"
    )

    # Persist translation history
    record = TranslationHistory(
        patient_id=payload.patient_id,
        document_id=payload.document_id,
        user_id=current_user.id,
        document_type=payload.document_type or "medical_text",
        source_language=trans_res["source_language"],
        target_language=trans_res["target_language"],
        original_text=payload.text,
        translated_text=trans_res["translated_text"],
        confidence_score=trans_res["confidence"],
        translation_engine=trans_res["engine"],
        status=trans_res["status"],
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    log_activity(
        db, user_id=current_user.id, action="AI_TRANSLATION",
        details=f"Translated medical text ({trans_res['source_language']} -> {trans_res['target_language']})",
        resource_type="translation", resource_id=record.id
    )

    return TranslationResponse(
        id=record.id,
        original_text=record.original_text,
        translated_text=record.translated_text,
        source_language=record.source_language,
        target_language=record.target_language,
        confidence_score=record.confidence_score,
        status=record.status,
        engine=record.translation_engine,
        patient_id=record.patient_id,
        document_id=record.document_id,
        created_at=record.created_at,
    )

@router.get("/translations", response_model=List[TranslationHistoryResponse])
def get_translations_history(
    patient_id: Optional[int] = Query(None),
    document_id: Optional[int] = Query(None),
    limit: int = Query(50, le=200),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(TranslationHistory)

    if current_user.role == UserRole.PATIENT:
        patient_profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
        if not patient_profile:
            return []
        query = query.filter(TranslationHistory.patient_id == patient_profile.id)
    elif patient_id:
        query = query.filter(TranslationHistory.patient_id == patient_id)

    if document_id:
        query = query.filter(TranslationHistory.document_id == document_id)

    records = query.order_by(TranslationHistory.created_at.desc()).limit(limit).all()
    
    result = []
    for r in records:
        p_name = r.patient.full_name if r.patient else None
        d_title = r.document.title if r.document else None
        result.append(
            TranslationHistoryResponse(
                id=r.id,
                patient_id=r.patient_id,
                patient_name=p_name,
                document_id=r.document_id,
                document_title=d_title,
                document_type=r.document_type,
                source_language=r.source_language,
                target_language=r.target_language,
                original_text=r.original_text,
                translated_text=r.translated_text,
                confidence_score=r.confidence_score,
                status=r.status,
                created_at=r.created_at,
            )
        )
    return result

@router.get("/translations/{id}", response_model=TranslationHistoryResponse)
def get_translation_detail(
    id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    r = db.query(TranslationHistory).filter(TranslationHistory.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Translation record not found")
    if current_user.role == UserRole.PATIENT:
        patient_profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
        if not patient_profile or r.patient_id != patient_profile.id:
            raise HTTPException(status_code=403, detail="Unauthorized access to record")
    p_name = r.patient.full_name if r.patient else None
    d_title = r.document.title if r.document else None
    return TranslationHistoryResponse(
        id=r.id,
        patient_id=r.patient_id,
        patient_name=p_name,
        document_id=r.document_id,
        document_title=d_title,
        document_type=r.document_type,
        source_language=r.source_language,
        target_language=r.target_language,
        original_text=r.original_text,
        translated_text=r.translated_text,
        confidence_score=r.confidence_score,
        status=r.status,
        created_at=r.created_at,
    )

# =========================================================================
# 3. Medical Terminology Simplification
# =========================================================================
@router.post("/simplify", response_model=SimplificationResponse)
def simplify_medical_text(
    payload: SimplificationRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Simplifies clinical terminology and instructions into patient-friendly explanations.
    Preserves exact medications, dosages, units, and critical directives.
    """
    res = MedicalSimplifier.simplify_text(
        text=payload.text,
        target_lang=payload.target_language or "English"
    )

    log_activity(
        db, user_id=current_user.id, action="AI_SIMPLIFICATION",
        details=f"Simplified medical text into {res['target_language']}",
        resource_type="simplification", resource_id=None
    )

    return SimplificationResponse(**res)

# =========================================================================
# 4. Medical Named Entity Recognition (NER)
# =========================================================================
@router.post("/extract-entities", response_model=EntityExtractionResponse)
def extract_medical_entities(
    payload: EntityExtractionRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Extracts structured clinical entities: diseases, medications (name, dosage, frequency, route),
    and treatment instructions.
    """
    # RBAC check for patient_id
    if payload.patient_id and current_user.role == UserRole.PATIENT:
        patient_profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
        if not patient_profile or payload.patient_id != patient_profile.id:
            raise HTTPException(status_code=403, detail="Unauthorized access to patient profile")

    extracted = MedicalNEREngine.extract_entities(payload.text)

    # Persist extraction record
    record = ExtractedMedicalEntity(
        patient_id=payload.patient_id,
        document_id=payload.document_id,
        user_id=current_user.id,
        source_type=payload.source_type or "prescription",
        source_text=payload.text,
        diseases_json=json.dumps(extracted["diseases"]),
        medications_json=json.dumps(extracted["medications"]),
        treatment_instructions_json=json.dumps(extracted["treatment_instructions"]),
        symptoms_json=json.dumps(extracted["symptoms"]),
        medical_terms_json=json.dumps(extracted["medical_terms"]),
        total_entities_count=extracted["total_entities_count"],
        confidence_score=extracted["confidence_score"],
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    log_activity(
        db, user_id=current_user.id, action="AI_NER_EXTRACTION",
        details=f"Extracted {record.total_entities_count} medical entities",
        resource_type="medical_ner", resource_id=record.id
    )

    med_list = [MedicationEntity(**m) for m in extracted["medications"]]

    return EntityExtractionResponse(
        id=record.id,
        patient_id=record.patient_id,
        document_id=record.document_id,
        diseases=extracted["diseases"],
        medications=med_list,
        treatment_instructions=extracted["treatment_instructions"],
        symptoms=extracted["symptoms"],
        medical_terms=extracted["medical_terms"],
        total_entities_count=record.total_entities_count,
        confidence_score=record.confidence_score,
        created_at=record.created_at,
    )

@router.get("/extracted-entities", response_model=List[EntityExtractionResponse])
def get_extracted_entities_history(
    patient_id: Optional[int] = Query(None),
    document_id: Optional[int] = Query(None),
    limit: int = Query(50, le=200),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(ExtractedMedicalEntity)
    if current_user.role == UserRole.PATIENT:
        patient_profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
        if not patient_profile:
            return []
        query = query.filter(ExtractedMedicalEntity.patient_id == patient_profile.id)
    elif patient_id:
        query = query.filter(ExtractedMedicalEntity.patient_id == patient_id)

    if document_id:
        query = query.filter(ExtractedMedicalEntity.document_id == document_id)

    records = query.order_by(ExtractedMedicalEntity.created_at.desc()).limit(limit).all()

    result = []
    for r in records:
        meds_raw = json.loads(r.medications_json or "[]")
        med_objs = [MedicationEntity(**m) for m in meds_raw]
        result.append(
            EntityExtractionResponse(
                id=r.id,
                patient_id=r.patient_id,
                document_id=r.document_id,
                diseases=json.loads(r.diseases_json or "[]"),
                medications=med_objs,
                treatment_instructions=json.loads(r.treatment_instructions_json or "[]"),
                symptoms=json.loads(r.symptoms_json or "[]"),
                medical_terms=json.loads(r.medical_terms_json or "[]"),
                total_entities_count=r.total_entities_count,
                confidence_score=r.confidence_score,
                created_at=r.created_at,
            )
        )
    return result

# =========================================================================
# 5. Symptom Information Module
# =========================================================================
@router.get("/symptoms", response_model=List[SymptomSummary])
def get_symptoms_list(
    query: Optional[str] = Query(None, description="Search keyword in English, Hindi, or Telugu"),
    category: Optional[str] = Query(None),
    language: Optional[str] = Query("English"),
    db: Session = Depends(get_db)
):
    """
    Search and retrieve symptoms with localized summaries.
    """
    q = db.query(SymptomInformation)

    if category and category != "All":
        q = q.filter(SymptomInformation.category == category)

    if query:
        search_term = f"%{query}%"
        q = q.filter(
            or_(
                SymptomInformation.symptom_name.ilike(search_term),
                SymptomInformation.symptom_name_hi.ilike(search_term),
                SymptomInformation.symptom_name_te.ilike(search_term),
                SymptomInformation.description_en.ilike(search_term),
            )
        )

    symptoms = q.order_by(SymptomInformation.symptom_name).all()
    lang_clean = (language or "English").lower()

    result = []
    for s in symptoms:
        desc = s.description_en
        if "hi" in lang_clean and s.description_hi:
            desc = s.description_hi
        elif "te" in lang_clean and s.description_te:
            desc = s.description_te

        result.append(
            SymptomSummary(
                id=s.id,
                symptom_name=s.symptom_name,
                symptom_name_hi=s.symptom_name_hi,
                symptom_name_te=s.symptom_name_te,
                category=s.category,
                urgency_level=s.urgency_level,
                description=desc,
            )
        )
    return result

@router.get("/symptoms/{id}", response_model=SymptomDetailResponse)
def get_symptom_detail(
    id: int,
    db: Session = Depends(get_db)
):
    s = db.query(SymptomInformation).filter(SymptomInformation.id == id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Symptom not found")
    
    faqs = json.loads(s.related_faqs_json or "[]")
    return SymptomDetailResponse(
        id=s.id,
        symptom_name=s.symptom_name,
        symptom_name_hi=s.symptom_name_hi,
        symptom_name_te=s.symptom_name_te,
        category=s.category,
        urgency_level=s.urgency_level,
        description_en=s.description_en,
        description_hi=s.description_hi,
        description_te=s.description_te,
        possible_causes_en=s.possible_causes_en,
        possible_causes_hi=s.possible_causes_hi,
        possible_causes_te=s.possible_causes_te,
        self_care_advice_en=s.self_care_advice_en,
        self_care_advice_hi=s.self_care_advice_hi,
        self_care_advice_te=s.self_care_advice_te,
        when_to_see_doctor_en=s.when_to_see_doctor_en,
        when_to_see_doctor_hi=s.when_to_see_doctor_hi,
        when_to_see_doctor_te=s.when_to_see_doctor_te,
        related_faqs=faqs,
        reference_source=s.reference_source,
    )

# =========================================================================
# 6. Multilingual Healthcare Knowledge Base
# =========================================================================
@router.get("/knowledge-base", response_model=List[KnowledgeBaseArticleResponse])
def get_knowledge_base_articles(
    query: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    q = db.query(HealthcareKnowledgeBase)

    if category and category != "All":
        q = q.filter(HealthcareKnowledgeBase.category == category)

    if query:
        term = f"%{query}%"
        q = q.filter(
            or_(
                HealthcareKnowledgeBase.title_en.ilike(term),
                HealthcareKnowledgeBase.title_hi.ilike(term),
                HealthcareKnowledgeBase.title_te.ilike(term),
                HealthcareKnowledgeBase.content_en.ilike(term),
                HealthcareKnowledgeBase.tags.ilike(term),
            )
        )

    return q.order_by(HealthcareKnowledgeBase.created_at.desc()).all()

@router.get("/knowledge-base/{id}", response_model=KnowledgeBaseArticleResponse)
def get_knowledge_base_article(id: int, db: Session = Depends(get_db)):
    article = db.query(HealthcareKnowledgeBase).filter(HealthcareKnowledgeBase.id == id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Knowledge base article not found")
    return article

@router.post("/knowledge-base", response_model=KnowledgeBaseArticleResponse, status_code=status.HTTP_201_CREATED)
def create_knowledge_base_article(
    payload: KnowledgeBaseArticleCreate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    article = HealthcareKnowledgeBase(
        title_en=payload.title_en,
        title_hi=payload.title_hi,
        title_te=payload.title_te,
        category=payload.category,
        tags=payload.tags,
        summary_en=payload.summary_en,
        summary_hi=payload.summary_hi,
        summary_te=payload.summary_te,
        content_en=payload.content_en,
        content_hi=payload.content_hi,
        content_te=payload.content_te,
        reference_source=payload.reference_source or "MoHFW / WHO Guidelines",
        created_by_id=current_user.id,
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    return article

@router.put("/knowledge-base/{id}", response_model=KnowledgeBaseArticleResponse)
def update_knowledge_base_article(
    id: int,
    payload: KnowledgeBaseArticleUpdate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    article = db.query(HealthcareKnowledgeBase).filter(HealthcareKnowledgeBase.id == id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    update_data = payload.dict(exclude_unset=True)
    for k, v in update_data.items():
        setattr(article, k, v)

    db.commit()
    db.refresh(article)
    return article

@router.delete("/knowledge-base/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_knowledge_base_article(
    id: int,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    article = db.query(HealthcareKnowledgeBase).filter(HealthcareKnowledgeBase.id == id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    db.delete(article)
    db.commit()
    return None

# =========================================================================
# 7. Clinical Terminology Dictionary Lookup
# =========================================================================
@router.get("/terminology", response_model=List[MedicalTerminologyResponse])
def get_medical_terminology(
    query: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    q = db.query(MedicalTerminology)
    if category and category != "All":
        q = q.filter(MedicalTerminology.category == category)
    if query:
        term = f"%{query}%"
        q = q.filter(
            or_(
                MedicalTerminology.term.ilike(term),
                MedicalTerminology.simple_explanation_en.ilike(term),
                MedicalTerminology.simple_explanation_hi.ilike(term),
                MedicalTerminology.simple_explanation_te.ilike(term),
            )
        )
    return q.order_by(MedicalTerminology.term).all()

# =========================================================================
# 8. AI Assistant Dashboard Stats
# =========================================================================
@router.get("/stats", response_model=AIDashboardStats)
def get_ai_dashboard_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    total_docs = db.query(func.count(MedicalDocument.id)).scalar() or 0
    total_translations = db.query(func.count(TranslationHistory.id)).scalar() or 0
    total_entities = db.query(func.sum(ExtractedMedicalEntity.total_entities_count)).scalar() or 0
    kb_count = db.query(func.count(HealthcareKnowledgeBase.id)).scalar() or 0
    symptoms_count = db.query(func.count(SymptomInformation.id)).scalar() or 0

    recent_translations_q = db.query(TranslationHistory).order_by(TranslationHistory.created_at.desc()).limit(5).all()
    recent_extractions_q = db.query(ExtractedMedicalEntity).order_by(ExtractedMedicalEntity.created_at.desc()).limit(5).all()

    recent_trans = [
        TranslationHistoryResponse(
            id=t.id,
            patient_id=t.patient_id,
            patient_name=t.patient.full_name if t.patient else None,
            document_id=t.document_id,
            document_title=t.document.title if t.document else None,
            document_type=t.document_type,
            source_language=t.source_language,
            target_language=t.target_language,
            original_text=t.original_text,
            translated_text=t.translated_text,
            confidence_score=t.confidence_score,
            status=t.status,
            created_at=t.created_at,
        )
        for t in recent_translations_q
    ]

    recent_ext = [
        EntityExtractionResponse(
            id=e.id,
            patient_id=e.patient_id,
            document_id=e.document_id,
            diseases=json.loads(e.diseases_json or "[]"),
            medications=[MedicationEntity(**m) for m in json.loads(e.medications_json or "[]")],
            treatment_instructions=json.loads(e.treatment_instructions_json or "[]"),
            symptoms=json.loads(e.symptoms_json or "[]"),
            medical_terms=json.loads(e.medical_terms_json or "[]"),
            total_entities_count=e.total_entities_count,
            confidence_score=e.confidence_score,
            created_at=e.created_at,
        )
        for e in recent_extractions_q
    ]

    return AIDashboardStats(
        total_documents_processed=total_docs,
        total_translations=total_translations,
        total_entities_extracted=int(total_entities),
        supported_languages=["English", "Hindi", "Telugu"],
        recent_translations=recent_trans,
        recent_extractions=recent_ext,
        knowledge_base_article_count=kb_count,
        symptom_topics_count=symptoms_count,
    )
