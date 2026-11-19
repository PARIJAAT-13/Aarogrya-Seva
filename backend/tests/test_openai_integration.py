"""
Comprehensive Test Suite for OpenAI Integration in AarogyaSeva Milestone 2
Tests:
- API configuration and environment loading
- Medical text simplification with dosage and medication preservation
- Clinical entity extraction (diseases, medications, dosages, frequency, instructions)
- Multilingual explanations (English, Hindi, Telugu)
- Symptom explanation (educational, non-diagnostic)
- Context-based medical guidance
- Translation quality comparison
- Error handling: Missing key, Invalid key (AuthenticationError), Rate limit simulation
- Live API testing when valid key is present
"""

import os
import pytest
from unittest.mock import patch, MagicMock
import openai

from app.core.config import settings
from app.services.openai_service import OpenAIService
from app.services.simplification_service import MedicalSimplifier
from app.services.ner_service import MedicalNEREngine


# Sample clinical test text
SAMPLE_CLINICAL_PRESCRIPTION = (
    "Patient is diagnosed with Essential Hypertension and Type 2 Diabetes Mellitus. "
    "Prescribed Tab Metformin 500 mg orally twice daily after meals. "
    "Prescribed Tab Amlodipine 5 mg orally once daily in the morning. "
    "Advice: Follow low sodium diet, avoid alcohol, do NOT stop medication abruptly. "
    "Follow up after 4 weeks."
)

SAMPLE_COMPLEX_REPORT = (
    "Patient presents with acute dyspnea, tachycardia, and peripheral edema. "
    "Suspected congestive heart failure. Administer Tab Furosemide 40 mg IV stat. "
    "Monitor oxygen saturation continuously."
)


def test_openai_service_configuration_detection():
    """Verifies that OpenAIService accurately detects whether a valid key is set."""
    # When key is placeholder
    with patch.object(settings, "OPENAI_API_KEY", "your_key_here"):
        assert OpenAIService.is_configured() is False

    # When key is empty
    with patch.object(settings, "OPENAI_API_KEY", ""):
        assert OpenAIService.is_configured() is False

    # When key is valid format
    with patch.object(settings, "OPENAI_API_KEY", "sk-proj-test1234567890abcdef"):
        assert OpenAIService.is_configured() is True


def test_openai_model_configuration():
    """Verifies that the target model is read from configuration."""
    model = OpenAIService.get_model()
    assert model in ["gpt-5.4-mini", "gpt-4o-mini"]


def test_invalid_api_key_handling():
    """
    Verifies that passing an invalid API key to OpenAIService raises AuthenticationError
    and that calling MedicalSimplifier / MedicalNEREngine with an invalid key safely catches it
    and falls back to the deterministic clinical engine without crashing.
    """
    invalid_key = "sk-invalid-test-key-0000000000"

    # Direct OpenAIService call raises AuthenticationError
    with pytest.raises(openai.AuthenticationError):
        OpenAIService.simplify_medical_text(SAMPLE_CLINICAL_PRESCRIPTION, custom_key=invalid_key)

    # High-level MedicalSimplifier catches it and falls back safely
    res = MedicalSimplifier.simplify_text(SAMPLE_CLINICAL_PRESCRIPTION, target_lang="English", custom_key=invalid_key)
    assert res is not None
    assert "simplified_text" in res
    assert "500 mg" in str(res.get("preserved_elements", {}))
    assert "Fallback: OpenAI API AuthenticationError" in res.get("ai_engine", "")

    # High-level MedicalNEREngine catches it and falls back safely
    ner_res = MedicalNEREngine.extract_entities(SAMPLE_CLINICAL_PRESCRIPTION, custom_key=invalid_key)
    assert ner_res is not None
    assert "diseases" in ner_res
    assert len(ner_res["diseases"]) > 0
    assert "Fallback: OpenAI API AuthenticationError" in ner_res.get("ai_engine", "")


def test_missing_api_key_graceful_fallback():
    """
    Verifies that when OPENAI_API_KEY is missing or placeholder,
    the application functions perfectly using the built-in clinical AI engine.
    """
    with patch.object(OpenAIService, "is_configured", return_value=False):
        # 1. Simplification fallback
        simp = MedicalSimplifier.simplify_text(SAMPLE_CLINICAL_PRESCRIPTION, target_lang="English")
        assert simp["simplified_text"] != ""
        assert "AarogyaSeva Clinical Lexicon" in simp["ai_engine"]
        assert "Amlodipine" in simp["preserved_elements"]["medications"]

        # 2. Hindi simplification fallback
        simp_hi = MedicalSimplifier.simplify_text(SAMPLE_CLINICAL_PRESCRIPTION, target_lang="Hindi")
        assert simp_hi["target_language"] == "Hindi"
        assert len(simp_hi["simplified_text"]) > 10

        # 3. Telugu simplification fallback
        simp_te = MedicalSimplifier.simplify_text(SAMPLE_CLINICAL_PRESCRIPTION, target_lang="Telugu")
        assert simp_te["target_language"] == "Telugu"
        assert len(simp_te["simplified_text"]) > 10

        # 4. NER extraction fallback
        ner = MedicalNEREngine.extract_entities(SAMPLE_CLINICAL_PRESCRIPTION)
        assert "Hypertension" in [d.title() for d in ner["diseases"]]
        med_names = [m["name"].lower() for m in ner["medications"]]
        assert "metformin" in med_names
        assert "amlodipine" in med_names
        assert ner["total_entities_count"] >= 4


def test_rate_limit_error_handling():
    """Verifies that RateLimitError is caught and handled safely."""
    with patch.object(OpenAIService, "_call_openai_responses_api", side_effect=openai.RateLimitError(
        message="Rate limit exceeded", response=MagicMock(status_code=429), body=None
    )):
        res = MedicalSimplifier.simplify_text(SAMPLE_CLINICAL_PRESCRIPTION, custom_key="sk-mock-rate-limit")
        assert res is not None
        assert "simplified_text" in res
        assert "RateLimitError" in res.get("ai_engine", "")


def test_mocked_openai_successful_simplification():
    """
    Tests end-to-end OpenAI simplification workflow with mock LLM response
    validating structured JSON parsing and safety disclaimer.
    """
    mock_llm_json = """
    {
      "simplified_text": "You have high blood pressure and sugar problem (diabetes). Take Metformin 500 mg twice a day after food. Take Amlodipine 5 mg every morning. Eat less salt and never stop medicines suddenly.",
      "identified_terms": [
        {
          "term": "Essential Hypertension",
          "category": "Cardiovascular",
          "simple_explanation_en": "High blood pressure",
          "simple_explanation_hi": "उच्च रक्तचाप",
          "simple_explanation_te": "అధిక రక్తపోటు",
          "clinical_context": "Elevated arterial blood pressure"
        }
      ],
      "preserved_elements": {
        "medications": ["Metformin", "Amlodipine"],
        "dosages": ["500 mg", "5 mg"]
      },
      "uncertain_flags": []
    }
    """
    with patch.object(OpenAIService, "_call_openai_responses_api", return_value=mock_llm_json):
        res = OpenAIService.simplify_medical_text(SAMPLE_CLINICAL_PRESCRIPTION, target_language="English")
        assert "You have high blood pressure" in res["simplified_text"]
        assert len(res["identified_terms"]) == 1
        assert res["identified_terms"][0]["term"] == "Essential Hypertension"
        assert "Metformin" in res["preserved_elements"]["medications"]
        assert "500 mg" in res["preserved_elements"]["dosages"]
        assert res["ai_generated"] is True
        assert "does not replace clinical consultation" in res["medical_disclaimer"]


def test_mocked_openai_successful_ner_extraction():
    """
    Tests end-to-end OpenAI NER extraction workflow validating disease,
    medication, dosage, route, and instruction extraction.
    """
    mock_llm_json = """
    {
      "diseases": ["Essential Hypertension", "Type 2 Diabetes Mellitus"],
      "medications": [
        {
          "name": "Metformin",
          "dosage": "500 mg",
          "frequency": "Twice daily after meals",
          "route": "Oral"
        },
        {
          "name": "Amlodipine",
          "dosage": "5 mg",
          "frequency": "Once daily morning",
          "route": "Oral"
        }
      ],
      "treatment_instructions": [
        "Follow low sodium diet",
        "Avoid alcohol",
        "Do not stop medication abruptly"
      ],
      "symptoms": [],
      "medical_terms": ["Essential Hypertension", "Type 2 Diabetes Mellitus"],
      "confidence_score": 0.98,
      "uncertain_flags": []
    }
    """
    with patch.object(OpenAIService, "_call_openai_responses_api", return_value=mock_llm_json):
        res = OpenAIService.extract_medical_entities(SAMPLE_CLINICAL_PRESCRIPTION)
        assert len(res["diseases"]) == 2
        assert "Essential Hypertension" in res["diseases"]
        assert len(res["medications"]) == 2
        assert res["medications"][0]["dosage"] == "500 mg"
        assert res["medications"][0]["route"] == "Oral"
        assert len(res["treatment_instructions"]) == 3
        assert any("low sodium" in t.lower() for t in res["treatment_instructions"])
        assert res["confidence_score"] == 0.98


def test_symptom_explanation_safety():
    """
    Verifies educational, non-diagnostic symptom explanation structure.
    """
    mock_symptom_json = """
    {
      "symptom_name": "Chest Pain",
      "plain_language_explanation": "Chest pain is any discomfort felt anywhere from your neck to your upper abdomen.",
      "possible_associated_conditions": ["Angina", "Heart Attack", "Acid Reflux", "Muscle Strain"],
      "preventive_and_self_care_measures": ["Rest immediately in a comfortable sitting position", "Loosen tight clothing"],
      "red_flag_warning_signs": ["Pain radiating to left arm or jaw", "Shortness of breath", "Cold sweating", "Dizziness"],
      "when_to_see_doctor": "Seek emergency medical care immediately at the nearest hospital or PHC."
    }
    """
    with patch.object(OpenAIService, "_call_openai_responses_api", return_value=mock_symptom_json):
        res = OpenAIService.explain_symptom("Chest Pain", language="English")
        assert res["symptom_name"] == "Chest Pain"
        assert len(res["possible_associated_conditions"]) >= 2
        assert len(res["red_flag_warning_signs"]) >= 2
        assert "This is not a diagnosis" in res["medical_disclaimer"]


def test_contextual_medical_guidance():
    """
    Verifies that context-based medical guidance distinguishes source facts from AI guidance.
    """
    mock_guidance_json = """
    {
      "verified_source_facts": "Doctor prescribed Metformin 500 mg and Amlodipine 5 mg for hypertension and diabetes.",
      "ai_educational_guidance": "These medicines work together to protect your kidneys, heart, and blood vessels.",
      "lifestyle_and_diet_recommendations": ["Reduce salt intake in cooking", "Engage in 30 minutes of brisk walking"],
      "important_precautions": ["Never skip morning doses", "Do not consume alcohol"],
      "follow_up_advice": "Return to the clinic after 4 weeks for blood pressure and glucose check."
    }
    """
    with patch.object(OpenAIService, "_call_openai_responses_api", return_value=mock_guidance_json):
        res = OpenAIService.generate_medical_guidance(SAMPLE_CLINICAL_PRESCRIPTION, language="English")
        assert "Doctor prescribed Metformin" in res["source_facts"]
        assert "These medicines work together" in res["ai_educational_guidance"]
        assert len(res["lifestyle_and_diet"]) == 2
        assert res["ai_generated"] is True


def test_translation_quality_comparison():
    """
    Verifies translation quality comparison between local service and OpenAI.
    """
    orig_text = "Take Tab Metformin 500 mg twice daily. Do not stop without doctor advice."
    existing_trans = "टैब मेटफॉर्मिन 500 mg दिन में दो बार लें। डॉक्टर की सलाह के बिना बंद न करें।"
    openai_trans = "गोली मेटफॉर्मिन 500 mg दिन में दो बार भोजन के बाद लें। डॉक्टर की सलाह के बिना दवा लेना बंद न करें।"

    comparison = OpenAIService.compare_translations(
        text=orig_text,
        target_language="Hindi",
        existing_translation=existing_trans,
        openai_translation=openai_trans,
    )
    assert comparison["original_text"] == orig_text
    assert comparison["target_language"] == "Hindi"
    assert comparison["existing_service_translation"] == existing_trans
    assert comparison["openai_translation"] == openai_trans
    assert "500 mg" in str(comparison["metrics"]["original_dosages_found"])


def test_live_openai_api_call_if_key_available():
    """
    Tests an actual live call to OpenAI API if a real, valid API key is present in environment.
    If only placeholder is present, verifies that the placeholder is safely skipped.
    """
    if OpenAIService.is_configured():
        print(f"\n[LIVE TEST] Executing live OpenAI call with model '{OpenAIService.get_model()}'...")
        try:
            live_res = OpenAIService.simplify_medical_text(
                "Patient with hypertension. Prescribed Amlodipine 5 mg once daily.",
                target_language="English"
            )
            assert live_res is not None
            assert len(live_res.get("simplified_text", "")) > 10
            print(f"[LIVE TEST SUCCESS] OpenAI simplified text: {live_res['simplified_text']}")
        except openai.AuthenticationError:
            pytest.fail("Live test failed: Configured OPENAI_API_KEY was rejected by OpenAI.")
    else:
        print("\n[NOTE] No real OpenAI API key detected in environment; live network call skipped as expected.")
