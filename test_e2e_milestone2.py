"""
End-to-End Automated Demonstration Verification for AarogyaSeva Milestone 2:
AI-Powered Medical Language Translation & Simplification Engine
"""
import io
import json
import fitz
from PIL import Image, ImageDraw
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import SessionLocal
from app.models.patient import PatientProfile

client = TestClient(app)

def run_e2e_demo_flow():
    print("==================================================================")
    print(" AAROGYASEVA MILESTONE 2: INFOSYS MENTOR DEMONSTRATION WORKFLOW")
    print("==================================================================")

    # STEP 1: Login to AarogyaSeva
    print("\n[STEP 1] Logging in as Doctor / Healthcare Worker...")
    login_res = client.post("/api/auth/login", json={
        "email": "dr.rajesh@phc.in",
        "password": "Doctor@12345"
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f" -> SUCCESS: Logged in as Dr. Rajesh Sharma. JWT token obtained.")

    # STEP 2: Open an existing patient's medical record
    print("\n[STEP 2] Fetching existing patient records...")
    patients_res = client.get("/api/patients/", headers=headers)
    assert patients_res.status_code == 200
    res_json = patients_res.json()
    patients = res_json.get("items", res_json if isinstance(res_json, list) else [])
    assert len(patients) > 0
    patient = patients[0]
    print(f" -> SUCCESS: Retrieved patient '{patient['full_name']}' (ID: {patient['id']}, Village: {patient['village']}, Preferred Lang: {patient['preferred_language']}).")

    # STEP 3: Create and Upload a sample prescription document
    print("\n[STEP 3] Uploading a sample clinical prescription document (PDF with OCR text)...")
    sample_rx_text = (
        f"PRIMARY HEALTH CENTRE (PHC) RAMPUR\n"
        f"Dr. Rajesh Sharma, MBBS, MD\n"
        f"Date: 2026-11-19\n"
        f"Patient: {patient['full_name']} | Age: 52 | Gender: Male\n"
        f"Diagnosis: Essential Hypertension and Type 2 Diabetes Mellitus.\n"
        f"Prescription (Rx):\n"
        f"1. Tab Amlodipine 5 mg PO Once daily in the morning.\n"
        f"2. Tab Metformin 500 mg PO Twice daily after meals.\n"
        f"3. Tab Paracetamol 650 mg SOS for headache.\n"
        f"Clinical Advice: Administer medication orally. Avoid high sodium and salty pickles. Walk 30 minutes daily. Follow up in 2 weeks."
    )
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), sample_rx_text)
    pdf_bytes = doc.write()
    doc.close()

    upload_res = client.post(
        "/api/medical-documents/upload",
        data={
            "patient_id": patient["id"],
            "title": "Clinical Rx - Dr Rajesh Sharma",
            "document_type": "prescription",
            "description": "Prescription for Hypertension and Diabetes management",
        },
        files={"file": ("sample_rx.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
        headers=headers,
    )
    assert upload_res.status_code == 201, f"Upload failed: {upload_res.text}"
    uploaded_doc = upload_res.json()
    print(f" -> SUCCESS: Prescription uploaded successfully (Doc ID: {uploaded_doc['id']}, Title: '{uploaded_doc['title']}').")

    # STEP 4: Extract medical text from the document (OCR / PyMuPDF)
    print("\n[STEP 4] Extracting text from the uploaded document using PyMuPDF & OCR...")
    ocr_res = client.post(
        "/api/ai/extract-text",
        data={"document_id": uploaded_doc["id"]},
        headers=headers,
    )
    assert ocr_res.status_code == 200, f"Extraction failed: {ocr_res.text}"
    extracted_data = ocr_res.json()
    extracted_text = extracted_data["extracted_text"]
    assert "Amlodipine" in extracted_text
    print(f" -> SUCCESS: Extracted {len(extracted_text)} characters.")
    print(f"    Method: {extracted_data['method']} | Detected Language: {extracted_data['detected_language']}")

    # STEP 5: Display identified diseases, medicines, and dosages (NER Extraction)
    print("\n[STEP 5] Running Medical NER extraction on prescription text...")
    ner_res = client.post(
        "/api/ai/extract-entities",
        json={
            "text": extracted_text,
            "patient_id": patient["id"],
            "document_id": uploaded_doc["id"],
            "source_type": "prescription",
        },
        headers=headers,
    )
    assert ner_res.status_code == 200
    ner_data = ner_res.json()
    print(f" -> SUCCESS: Extracted Medical Entities:")
    print(f"    Diseases Identified: {ner_data['diseases']}")
    print(f"    Medications Identified:")
    for m in ner_data["medications"]:
        print(f"      - {m['name']} | Dosage: {m['dosage']} | Frequency: {m['frequency']} | Route: {m['route']}")
    print(f"    Treatment Directives: {ner_data['treatment_instructions']}")

    # STEP 6: Translate the medical information into Hindi and Telugu
    print("\n[STEP 6A] Translating prescription into Hindi (हिन्दी)...")
    trans_hi = client.post(
        "/api/ai/translate",
        json={
            "text": extracted_text,
            "target_language": "Hindi",
            "patient_id": patient["id"],
            "document_id": uploaded_doc["id"],
        },
        headers=headers,
    )
    assert trans_hi.status_code == 200
    hi_data = trans_hi.json()
    print(f" -> SUCCESS: Hindi Translation:")
    print(f"    Confidence: {(hi_data['confidence_score'] * 100):.0f}% | Engine: {hi_data['engine']}")
    print(f"    Hindi Preview:\n{hi_data['translated_text'][:180]}...")

    print("\n[STEP 6B] Translating prescription into Telugu (తెలుగు)...")
    trans_te = client.post(
        "/api/ai/translate",
        json={
            "text": extracted_text,
            "target_language": "Telugu",
            "patient_id": patient["id"],
            "document_id": uploaded_doc["id"],
        },
        headers=headers,
    )
    assert trans_te.status_code == 200
    te_data = trans_te.json()
    print(f" -> SUCCESS: Telugu Translation:")
    print(f"    Telugu Preview:\n{te_data['translated_text'][:180]}...")

    # STEP 7: Generate a simplified explanation
    print("\n[STEP 7] Generating patient-friendly simplified explanation...")
    simp_res = client.post(
        "/api/ai/simplify",
        json={
            "text": extracted_text,
            "target_language": "English",
        },
        headers=headers,
    )
    assert simp_res.status_code == 200
    simp_data = simp_res.json()
    print(f" -> SUCCESS: Simplified Medical Guidance:")
    print(f"    Identified Clinical Terms: {[t['term'] for t in simp_data['identified_terms']]}")
    print(f"    Simplified Text Preview:\n{simp_data['simplified_text'][:200]}...")

    # STEP 8 & 9: Open Symptom Explorer and search common symptoms
    print("\n[STEP 8 & 9] Searching Symptom Explorer for 'fever'...")
    symp_res = client.get("/api/ai/symptoms?query=fever&language=English", headers=headers)
    assert symp_res.status_code == 200
    symptoms = symp_res.json()
    assert len(symptoms) > 0
    fever = symptoms[0]
    print(f" -> SUCCESS: Symptom Found: '{fever['symptom_name']}' (Urgency: {fever['urgency_level']})")
    
    # Detailed symptom query with red flags
    fever_detail = client.get(f"/api/ai/symptoms/{fever['id']}", headers=headers).json()
    print(f"    Emergency Red Flags: {fever_detail['when_to_see_doctor_en'][:120]}...")
    print(f"    Self Care Guidance: {fever_detail['self_care_advice_en'][:120]}...")

    # STEP 10: Open Multilingual Healthcare Knowledge Base and search
    print("\n[STEP 10] Searching Multilingual Knowledge Base for 'Hypertension'...")
    kb_res = client.get("/api/ai/knowledge-base?query=hypertension", headers=headers)
    assert kb_res.status_code == 200
    articles = kb_res.json()
    assert len(articles) > 0
    art = articles[0]
    print(f" -> SUCCESS: Found Knowledge Base Article: '{art['title_en']}'")
    print(f"    Category: {art['category']} | Verified Source: {art['reference_source']}")
    print(f"    Available Titles: EN: '{art['title_en']}' | HI: '{art['title_hi']}' | TE: '{art['title_te']}'")

    print("\n==================================================================")
    print(" ALL 10 DEMONSTRATION WORKFLOW STEPS VERIFIED & PASSED 100%!")
    print("==================================================================")

if __name__ == "__main__":
    run_e2e_demo_flow()
