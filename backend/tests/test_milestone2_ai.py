import io
import json
import pytest
from PIL import Image, ImageDraw
import fitz
from fastapi.testclient import TestClient

from app.main import app
from app.services.ocr_service import extract_text_from_file, detect_language_robust
from app.services.translation_service import MedicalTranslator
from app.services.simplification_service import MedicalSimplifier
from app.services.ner_service import MedicalNEREngine
from app.database.session import SessionLocal
from app.models.ai_engine import (
    TranslationHistory,
    ExtractedMedicalEntity,
    SymptomInformation,
    HealthcareKnowledgeBase,
    MedicalTerminology,
)

client = TestClient(app)

# Helper to get auth token
def get_auth_token(email="admin@ruralhealth.org", password="Admin@12345"):
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    return res.json()["access_token"]

# 1. Test PDF Text Extraction
def test_pdf_text_extraction(tmp_path):
    pdf_path = str(tmp_path / "test_prescription.pdf")
    doc = fitz.open()
    page = doc.new_page()
    sample_text = "Dr. Rajesh Sharma, MBBS\nPatient: Ramesh Kumar\nRx: Tab Amlodipine 5mg once daily."
    page.insert_text((50, 72), sample_text)
    doc.save(pdf_path)
    doc.close()

    result = extract_text_from_file(pdf_path, "application/pdf")
    assert "Amlodipine" in result["text"]
    assert result["page_count"] == 1
    assert result["detected_language"] == "English"

# 2. Test Image OCR
def test_image_ocr(tmp_path):
    img_path = str(tmp_path / "test_rx_ocr.png")
    img = Image.new("RGB", (500, 150), color=(255, 255, 255))
    d = ImageDraw.Draw(img)
    d.text((20, 40), "Metformin 500mg BD after meals", fill=(0, 0, 0))
    img.save(img_path)

    result = extract_text_from_file(img_path, "image/png")
    assert "500" in result["text"] or "Metformin" in result["text"] or len(result["text"]) > 0

# 3. Test English-to-Hindi Translation
def test_english_to_hindi_translation():
    text = "Patient diagnosed with hypertension and diabetes."
    res = MedicalTranslator.translate_medical_text(text, "Hindi", "English")
    assert res["target_language"] == "Hindi"
    assert len(res["translated_text"]) > 0
    # Must contain Devanagari characters
    assert any('\u0900' <= char <= '\u097F' for char in res["translated_text"])

# 4. Test English-to-Telugu Translation
def test_english_to_telugu_translation():
    text = "Take one tablet daily in the morning."
    res = MedicalTranslator.translate_medical_text(text, "Telugu", "English")
    assert res["target_language"] == "Telugu"
    assert len(res["translated_text"]) > 0
    # Must contain Telugu characters
    assert any('\u0C00' <= char <= '\u0C7F' for char in res["translated_text"])

# 5. Test Medical Terminology Simplification
def test_medical_simplification():
    text = "Patient diagnosed with hypertension. Administer medication orally. Prescribed Amlodipine 5 mg PO once daily."
    res = MedicalSimplifier.simplify_text(text, "English")
    simplified = res["simplified_text"].lower()

    # Must explain hypertension
    assert "high blood pressure" in simplified or len(res["identified_terms"]) > 0
    # Must explain orally
    assert "by mouth" in simplified or "swallow" in simplified
    # Must preserve medicine name and dosage
    assert "amlodipine" in simplified
    assert "5 mg" in simplified

# 6. Test Disease Entity Extraction
def test_disease_entity_extraction():
    text = "Patient diagnosed with hypertension, asthma and type 2 diabetes mellitus."
    entities = MedicalNEREngine.extract_entities(text)
    diseases = [d.lower() for d in entities["diseases"]]
    assert "hypertension" in diseases
    assert "asthma" in diseases
    assert any("diabetes" in d for d in diseases)

# 7. Test Medicine and Dosage Extraction (User's Exact Example)
def test_medicine_and_dosage_extraction():
    text = "Patient diagnosed with hypertension and prescribed Amlodipine 5 mg once daily."
    entities = MedicalNEREngine.extract_entities(text)
    
    assert "Hypertension" in entities["diseases"]
    assert len(entities["medications"]) >= 1
    med = entities["medications"][0]
    assert med["name"] == "Amlodipine"
    assert "5 mg" in med["dosage"]
    assert "Once daily" in med["frequency"]
    assert len(entities["treatment_instructions"]) >= 1
    assert "Amlodipine" in entities["treatment_instructions"][0]

# 8. Test Symptom Information Search API
def test_symptom_information_search():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Search fever
    res = client.get("/api/ai/symptoms?query=fever&language=English", headers=headers)
    assert res.status_code == 200
    symptoms = res.json()
    assert len(symptoms) >= 1
    assert "Fever" in symptoms[0]["symptom_name"]

    # Search in Hindi
    res_hi = client.get("/api/ai/symptoms?query=बुखार&language=Hindi", headers=headers)
    assert res_hi.status_code == 200
    assert len(res_hi.json()) >= 1

# 9. Test Healthcare Knowledge Base Search API
def test_healthcare_knowledge_base_search():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    res = client.get("/api/ai/knowledge-base?query=hypertension", headers=headers)
    assert res.status_code == 200
    articles = res.json()
    assert len(articles) >= 1
    assert "Hypertension" in articles[0]["title_en"]

# 10. Test Database Persistence for Translations and NER
def test_database_persistence():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Run translation
    payload = {
        "text": "Tab Metformin 500 mg twice daily after meals.",
        "target_language": "Hindi",
        "source_language": "English"
    }
    res = client.post("/api/ai/translate", json=payload, headers=headers)
    assert res.status_code == 200
    trans_id = res.json()["id"]
    assert trans_id is not None

    # Verify history
    hist_res = client.get(f"/api/ai/translations/{trans_id}", headers=headers)
    assert hist_res.status_code == 200
    assert hist_res.json()["id"] == trans_id
    assert "500" in hist_res.json()["original_text"]

# 11. Test AI Assistant Dashboard Stats API
def test_ai_dashboard_stats():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    res = client.get("/api/ai/stats", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_translations" in data
    assert "supported_languages" in data
    assert "English" in data["supported_languages"]
    assert "Hindi" in data["supported_languages"]
    assert "Telugu" in data["supported_languages"]
