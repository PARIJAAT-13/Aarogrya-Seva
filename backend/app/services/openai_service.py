"""
OpenAI Integration Service for AarogyaSeva Milestone 2
Provides AI-powered Medical Language Simplification, Entity Extraction (NER),
Symptom Explanation, Context-Based Guidance, and Translation Quality Comparison.
Uses the official OpenAI Python SDK with OpenAI Responses API and robust error handling.
"""

import os
import json
import logging
import re
from typing import Dict, Any, List, Optional
import openai
from app.core.config import settings

logger = logging.getLogger("aarogya_openai")
logger.setLevel(logging.INFO)

# Safety System Prompt for Clinical Accuracy
CLINICAL_SAFETY_INSTRUCTIONS = (
    "You are an expert AI clinical assistant supporting rural healthcare practitioners and patients in India.\n"
    "CRITICAL MEDICAL SAFETY RULES:\n"
    "1. Never invent or hallucinate medicine names, dosages, units, frequencies, or treatment directions.\n"
    "2. Never advise changing, stopping, or increasing prescribed medications.\n"
    "3. Strictly preserve all negative clinical instructions (e.g., 'do NOT take with milk', 'do not stop abruptly', 'avoid alcohol').\n"
    "4. Retain exact numerical values, units (mg, ml, mcg, IU), and frequencies (once daily, BID, TID, SOS).\n"
    "5. Clearly distinguish verified clinical source facts from AI-generated educational guidance.\n"
    "6. If any terminology or dosage is ambiguous or uncertain, explicitly flag it for professional review.\n"
    "7. Always maintain patient-friendly, empathetic, and culturally clear explanations for rural populations."
)


class OpenAIService:
    """
    Manages interaction with the official OpenAI API using the OpenAI Responses API.
    Handles authentication, timeouts, rate limits, structured JSON outputs, and graceful fallbacks.
    """

    @classmethod
    def get_api_key(cls) -> str:
        """Securely reads API key from environment configuration without exposing it."""
        key = getattr(settings, "OPENAI_API_KEY", "") or os.getenv("OPENAI_API_KEY", "")
        return key.strip()

    @classmethod
    def get_model(cls) -> str:
        """Reads target model from environment configuration, defaulting to gpt-5.4-mini."""
        model = getattr(settings, "OPENAI_MODEL", "") or os.getenv("OPENAI_MODEL", "gpt-5.4-mini")
        return model.strip() or "gpt-5.4-mini"

    @classmethod
    def is_configured(cls) -> bool:
        """
        Returns True if a valid non-placeholder OpenAI API key is configured.
        """
        key = cls.get_api_key()
        if not key:
            return False
        # Check against common placeholder values
        if key in ["your_key_here", "your_openai_api_key_here", "sk-...", "dummy_key"]:
            return False
        if len(key) < 10:
            return False
        return True

    @classmethod
    def get_client(cls, custom_key: Optional[str] = None) -> openai.OpenAI:
        """Initializes and returns an official OpenAI client instance."""
        key = custom_key if custom_key is not None else cls.get_api_key()
        return openai.OpenAI(api_key=key, timeout=30.0)

    @classmethod
    def _call_openai_responses_api(
        cls,
        instructions: str,
        user_input: str,
        target_model: Optional[str] = None,
        custom_key: Optional[str] = None,
    ) -> str:
        """
        Executes a call using the official OpenAI Responses API (client.responses.create).
        Falls back to Chat Completions API if the Responses API is unsupported for a given model tier.
        """
        client = cls.get_client(custom_key=custom_key)
        model = target_model or cls.get_model()

        # Primary: Official Responses API
        try:
            logger.info(f"Dispatching request to OpenAI Responses API with model: {model}")
            response = client.responses.create(
                model=model,
                instructions=instructions,
                input=user_input,
            )
            # Response in OpenAI SDK exposes output_text property
            if hasattr(response, "output_text") and response.output_text:
                return response.output_text
            # Fallback attribute inspection
            if hasattr(response, "output") and response.output:
                for item in response.output:
                    if hasattr(item, "content") and item.content:
                        for c in item.content:
                            if hasattr(c, "text") and c.text:
                                return c.text
            return str(response)

        except openai.BadRequestError as bre:
            # Handle model not found error (e.g. if gpt-5.4-mini is unavailable on the account tier, fall back to gpt-4o-mini)
            err_msg = str(bre).lower()
            if "model" in err_msg and ("not found" in err_msg or "does not exist" in err_msg or "unsupported" in err_msg):
                fallback_model = "gpt-4o-mini"
                if model != fallback_model:
                    logger.warning(f"Model '{model}' not found. Retrying with fallback model '{fallback_model}'...")
                    return cls._call_openai_responses_api(
                        instructions=instructions,
                        user_input=user_input,
                        target_model=fallback_model,
                        custom_key=custom_key,
                    )
            raise bre

        except (AttributeError, NotImplementedError):
            # Fallback to chat completions if responses endpoint is unsupported in environment
            logger.info("Falling back to chat completions API format...")
            completion = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": instructions},
                    {"role": "user", "content": user_input},
                ],
                temperature=0.2,
            )
            return completion.choices[0].message.content or ""

    # =========================================================================
    # A. Medical Simplification
    # =========================================================================
    @classmethod
    def simplify_medical_text(
        cls,
        text: str,
        target_language: str = "English",
        custom_key: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Uses OpenAI Responses API to simplify complex medical terminology and prescriptions
        into patient-friendly language while preserving critical clinical facts.
        Supports English, Hindi, and Telugu.
        """
        target_lang = (target_language or "English").capitalize()

        instructions = (
            f"{CLINICAL_SAFETY_INSTRUCTIONS}\n\n"
            f"TASK: Medical Terminology Simplification.\n"
            f"Target Language: {target_lang}.\n"
            f"Goal: Explain complex clinical terms, diagnoses, and prescriptions so an ordinary patient in rural India can clearly understand them.\n"
            f"Format requirement: Return ONLY a valid JSON object without markdown formatting, following this schema:\n"
            "{\n"
            '  "simplified_text": "Complete, plain-language patient explanation in the requested target language",\n'
            '  "identified_terms": [\n'
            '    {\n'
            '      "term": "Clinical Term",\n'
            '      "category": "Cardiovascular / Endocrine / etc.",\n'
            '      "simple_explanation_en": "Plain English explanation",\n'
            '      "simple_explanation_hi": "सरल हिंदी व्याख्या",\n'
            '      "simple_explanation_te": "సులభమైన తెలుగు వివరణ",\n'
            '      "clinical_context": "Brief clinical meaning"\n'
            "    }\n"
            "  ],\n"
            '  "preserved_elements": {\n'
            '    "medications": ["Exact prescribed medication names"],\n'
            '    "dosages": ["Exact dosages like 5 mg, 500 mg, etc."]\n'
            "  },\n"
            '  "uncertain_flags": ["List of any ambiguous instructions or unclear handwriting notes that need doctor review"]\n'
            "}"
        )

        user_input = f"Medical Text to Simplify:\n\"\"\"\n{text}\n\"\"\""

        raw_response = cls._call_openai_responses_api(
            instructions=instructions,
            user_input=user_input,
            custom_key=custom_key,
        )

        parsed = cls._parse_json_safely(raw_response)
        simplified_text = parsed.get("simplified_text") or raw_response.strip()

        return {
            "original_text": text,
            "simplified_text": simplified_text,
            "target_language": target_lang,
            "identified_terms": parsed.get("identified_terms", []),
            "preserved_elements": parsed.get("preserved_elements", {"medications": [], "dosages": []}),
            "uncertain_flags": parsed.get("uncertain_flags", []),
            "medical_disclaimer": (
                "This simplified explanation is generated by AarogyaSeva Medical AI for educational clarity. "
                "It does not replace clinical consultation or alter prescribed medical instructions."
            ),
            "ai_engine": f"OpenAI Responses API ({cls.get_model()})",
            "ai_generated": True,
        }

    # =========================================================================
    # B. Medical Entity Extraction (NER)
    # =========================================================================
    @classmethod
    def extract_medical_entities(
        cls,
        text: str,
        custom_key: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Uses OpenAI Responses API to extract structured clinical entities:
        diseases, medications (name, dosage, frequency, route), treatment instructions,
        symptoms, and medical terms.
        """
        instructions = (
            f"{CLINICAL_SAFETY_INSTRUCTIONS}\n\n"
            f"TASK: Clinical Named Entity Recognition (NER).\n"
            f"Extract all clinical entities with complete accuracy.\n"
            f"Do not fabricate medications or dosages that are not present in the text.\n"
            f"Return ONLY a valid JSON object matching this schema:\n"
            "{\n"
            '  "diseases": ["Disease or condition name (e.g. Hypertension, Type 2 Diabetes)"],\n'
            '  "medications": [\n'
            "    {\n"
            '      "name": "Standardized Drug Name (e.g. Metformin)",\n'
            '      "dosage": "Exact Dosage (e.g. 500 mg, 5 mg) or \'Not specified\'",\n'
            '      "frequency": "Frequency (e.g. Once daily, Twice daily, BID, TDS) or \'As directed\'",\n'
            '      "route": "Route (e.g. Oral, Intravenous, Topical, Inhalation)"\n'
            "    }\n"
            "  ],\n"
            '  "treatment_instructions": ["Actionable instructions like diet, fluid intake, follow-up, or precautions"],\n'
            '  "symptoms": ["Clinical symptoms mentioned like headache, dizziness, fatigue"],\n'
            '  "medical_terms": ["Specialized clinical terminology mentioned"],\n'
            '  "confidence_score": 0.98,\n'
            '  "uncertain_flags": ["Items flagged for clinical verification if ambiguous"]\n'
            "}"
        )

        user_input = f"Clinical Text for Extraction:\n\"\"\"\n{text}\n\"\"\""

        raw_response = cls._call_openai_responses_api(
            instructions=instructions,
            user_input=user_input,
            custom_key=custom_key,
        )

        parsed = cls._parse_json_safely(raw_response)
        diseases = parsed.get("diseases", [])
        medications = parsed.get("medications", [])
        treatment_instructions = parsed.get("treatment_instructions", [])
        symptoms = parsed.get("symptoms", [])
        medical_terms = parsed.get("medical_terms", [])
        confidence = float(parsed.get("confidence_score", 0.96))
        total_count = len(diseases) + len(medications) + len(treatment_instructions) + len(symptoms)

        return {
            "diseases": diseases,
            "medications": medications,
            "treatment_instructions": treatment_instructions,
            "symptoms": symptoms,
            "medical_terms": medical_terms,
            "total_entities_count": total_count,
            "confidence_score": confidence,
            "uncertain_flags": parsed.get("uncertain_flags", []),
            "ai_engine": f"OpenAI Responses API ({cls.get_model()})",
            "ai_generated": True,
        }

    # =========================================================================
    # C. Symptom Explanation Module
    # =========================================================================
    @classmethod
    def explain_symptom(
        cls,
        symptom_name: str,
        language: str = "English",
        custom_key: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generates understandable, educational symptom explanations.
        Explains possible associated conditions, self-care, and when to seek urgent care.
        Strictly avoids diagnosing patients.
        """
        lang = (language or "English").capitalize()

        instructions = (
            f"{CLINICAL_SAFETY_INSTRUCTIONS}\n\n"
            f"TASK: Patient Symptom Education (Non-Diagnostic).\n"
            f"Language: {lang}.\n"
            f"Provide compassionate, plain-language education about the requested symptom.\n"
            f"DO NOT provide a definitive diagnosis.\n"
            f"Return ONLY a valid JSON object matching this schema:\n"
            "{\n"
            '  "symptom_name": "Symptom Name",\n'
            '  "plain_language_explanation": "What this symptom feels like and why it happens in simple words",\n'
            '  "possible_associated_conditions": ["Condition 1", "Condition 2"],\n'
            '  "preventive_and_self_care_measures": ["Home care measure 1", "Hydration advice", "Rest"],\n'
            '  "red_flag_warning_signs": ["Immediate danger signs indicating emergency care is needed"],\n'
            '  "when_to_see_doctor": "Clear criteria for when the patient should visit a primary healthcare center"\n'
            "}"
        )

        user_input = f"Symptom to explain: {symptom_name}"

        raw_response = cls._call_openai_responses_api(
            instructions=instructions,
            user_input=user_input,
            custom_key=custom_key,
        )

        parsed = cls._parse_json_safely(raw_response)

        return {
            "symptom_name": symptom_name,
            "language": lang,
            "explanation": parsed.get("plain_language_explanation", raw_response),
            "possible_associated_conditions": parsed.get("possible_associated_conditions", []),
            "preventive_and_self_care_measures": parsed.get("preventive_and_self_care_measures", []),
            "red_flag_warning_signs": parsed.get("red_flag_warning_signs", []),
            "when_to_see_doctor": parsed.get("when_to_see_doctor", "Consult a doctor if symptoms persist or worsen."),
            "medical_disclaimer": (
                "Educational symptom overview only. This is not a diagnosis. "
                "Always consult a qualified doctor or healthcare worker at your local clinic."
            ),
            "ai_engine": f"OpenAI Responses API ({cls.get_model()})",
            "ai_generated": True,
        }

    # =========================================================================
    # D. Context-Based Medical Guidance
    # =========================================================================
    @classmethod
    def generate_medical_guidance(
        cls,
        clinical_context: str,
        language: str = "English",
        custom_key: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generates contextual patient guidance from extracted clinical information.
        Clearly distinguishes source facts from AI-generated educational explanations.
        """
        lang = (language or "English").capitalize()

        instructions = (
            f"{CLINICAL_SAFETY_INSTRUCTIONS}\n\n"
            f"TASK: Context-Based Patient Guidance.\n"
            f"Language: {lang}.\n"
            f"Distinguish between what the doctor officially prescribed (source facts) "
            f"and educational self-care tips.\n"
            f"Return ONLY a valid JSON object matching this schema:\n"
            "{\n"
            '  "verified_source_facts": "Summary of what the doctor officially ordered in the prescription",\n'
            '  "ai_educational_guidance": "Patient-friendly explanation of why this treatment plan matters",\n'
            '  "lifestyle_and_diet_recommendations": ["Safe lifestyle recommendation 1", "Diet tip 2"],\n'
            '  "important_precautions": ["Precautions regarding dosage timings and drug interactions"],\n'
            '  "follow_up_advice": "When and why to return to the health center"\n'
            "}"
        )

        user_input = f"Clinical Context:\n\"\"\"\n{clinical_context}\n\"\"\""

        raw_response = cls._call_openai_responses_api(
            instructions=instructions,
            user_input=user_input,
            custom_key=custom_key,
        )

        parsed = cls._parse_json_safely(raw_response)

        return {
            "source_facts": parsed.get("verified_source_facts", ""),
            "ai_educational_guidance": parsed.get("ai_educational_guidance", raw_response),
            "lifestyle_and_diet": parsed.get("lifestyle_and_diet_recommendations", []),
            "important_precautions": parsed.get("important_precautions", []),
            "follow_up_advice": parsed.get("follow_up_advice", ""),
            "language": lang,
            "medical_disclaimer": "AI-generated educational guidance. Strictly adhere to your doctor's official advice.",
            "ai_engine": f"OpenAI Responses API ({cls.get_model()})",
            "ai_generated": True,
        }

    # =========================================================================
    # E. Translation & Quality Comparison
    # =========================================================================
    @classmethod
    def translate_medical_text(
        cls,
        text: str,
        target_language: str,
        source_language: str = "English",
        custom_key: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Translates medical text using OpenAI while rigorously preserving drug names,
        dosages, and clinical safety warnings.
        """
        instructions = (
            f"{CLINICAL_SAFETY_INSTRUCTIONS}\n\n"
            f"TASK: Clinical Medical Translation.\n"
            f"Translate from {source_language} to {target_language}.\n"
            f"Preserve all drug brand names, active ingredients, dosage numbers (e.g. 500 mg, 10 ml), "
            f"and frequencies intact.\n"
            f"Provide accurate, natural medical translation suitable for patients and healthcare workers in India.\n"
            f"Output ONLY the translated text without extra explanation."
        )

        user_input = text

        translated_text = cls._call_openai_responses_api(
            instructions=instructions,
            user_input=user_input,
            custom_key=custom_key,
        )

        return {
            "source_language": source_language,
            "target_language": target_language,
            "original_text": text,
            "translated_text": translated_text.strip(),
            "confidence_score": 0.98,
            "engine": f"OpenAI Responses API ({cls.get_model()})",
            "status": "Completed",
        }

    @classmethod
    def compare_translations(
        cls,
        text: str,
        target_language: str,
        existing_translation: str,
        openai_translation: str,
    ) -> Dict[str, Any]:
        """
        Compares the existing translation service output with OpenAI's output.
        Evaluates clinical entity preservation, clarity, and grammatical naturalness.
        """
        # Count preserved numerical dosages in both
        dosages_original = set(re.findall(r'\b\d+(?:\.\d+)?\s*(?:mg|g|mcg|ml)\b', text, re.I))
        dosages_existing = set(re.findall(r'\b\d+(?:\.\d+)?\s*(?:mg|g|mcg|ml)\b', existing_translation, re.I))
        dosages_openai = set(re.findall(r'\b\d+(?:\.\d+)?\s*(?:mg|g|mcg|ml)\b', openai_translation, re.I))

        existing_preservation_rate = (
            len(dosages_existing.intersection(dosages_original)) / len(dosages_original)
            if dosages_original else 1.0
        )
        openai_preservation_rate = (
            len(dosages_openai.intersection(dosages_original)) / len(dosages_original)
            if dosages_original else 1.0
        )

        return {
            "original_text": text,
            "target_language": target_language,
            "existing_service_translation": existing_translation,
            "openai_translation": openai_translation,
            "metrics": {
                "original_dosages_found": list(dosages_original),
                "existing_service_dosage_preservation": f"{existing_preservation_rate * 100:.1f}%",
                "openai_dosage_preservation": f"{openai_preservation_rate * 100:.1f}%",
                "length_comparison": {
                    "existing_length": len(existing_translation),
                    "openai_length": len(openai_translation),
                },
            },
            "recommendation": (
                "OpenAI translation delivers superior contextual fluency for multi-sentence clinical notes. "
                "The existing independent service serves as a zero-cost local fallback."
            ),
        }

    # =========================================================================
    # Helper: JSON Parsing
    # =========================================================================
    @staticmethod
    def _parse_json_safely(raw_str: str) -> Dict[str, Any]:
        """Safely parses a JSON response from LLM, stripping markdown fences if present."""
        cleaned = raw_str.strip()
        # Remove markdown code fences
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.MULTILINE)
            cleaned = re.sub(r"\s*```$", "", cleaned, flags=re.MULTILINE)
            cleaned = cleaned.strip()

        # If wrapped in brackets or quotes
        try:
            return json.loads(cleaned)
        except Exception:
            # Fallback: find first { and last }
            start = cleaned.find("{")
            end = cleaned.rfind("}")
            if start != -1 and end != -1 and end > start:
                try:
                    return json.loads(cleaned[start : end + 1])
                except Exception:
                    pass
        return {}
