import re
from typing import Dict, Any, List, Optional
from app.services.translation_service import MedicalTranslator

# Comprehensive clinical terms database with explanations across English, Hindi, and Telugu
MEDICAL_DICTIONARY: Dict[str, Dict[str, Any]] = {
    "hypertension": {
        "category": "Cardiovascular",
        "simple_en": "high blood pressure (the force of blood flowing through your blood vessels is consistently too high)",
        "simple_hi": "उच्च रक्तचाप (नसों में खून का दबाव सामान्य से अधिक होना)",
        "simple_te": "అధిక రక్తపోటు (రక్తనాళాలలో రక్తం ఒత్తిడి సాధారణం కంటే ఎక్కువగా ఉండటం)",
        "clinical_context": "Elevated systolic or diastolic arterial pressure requiring lifestyle moderation or antihypertensive medication.",
    },
    "hyperglycemia": {
        "category": "Endocrine / Diabetes",
        "simple_en": "higher than normal blood sugar levels",
        "simple_hi": "रक्त में शर्करा (शुगर) का स्तर सामान्य से अधिक होना",
        "simple_te": "రక్తంలో చక్కెర (షుగర్) స్థాయి సాధారణం కంటే ఎక్కువగా ఉండటం",
        "clinical_context": "Elevated blood glucose, common in diabetes mellitus.",
    },
    "hypoglycemia": {
        "category": "Endocrine / Diabetes",
        "simple_en": "lower than normal blood sugar levels (can cause shakiness, sweating, and dizziness)",
        "simple_hi": "रक्त में शुगर का स्तर बहुत कम हो जाना (जिससे चक्कर या घबराहट हो सकती है)",
        "simple_te": "రక్తంలో చక్కెర శాతం బాగా తగ్గిపోవడం (దీనివల్ల వణుకు, చెమటలు రావచ్చు)",
        "clinical_context": "Blood sugar dropping below 70 mg/dL requiring immediate glucose intake.",
    },
    "administer medication orally": {
        "category": "Instructions",
        "simple_en": "take the medicine by mouth (swallow with water)",
        "simple_hi": "दवा को मुंह से पानी के साथ निगलकर लें",
        "simple_te": "మందును నోటి ద్వారా నీటితో మింగండి",
        "clinical_context": "Oral ingestion route for pharmacological agents.",
    },
    "dyspnea": {
        "category": "Respiratory",
        "simple_en": "shortness of breath or difficulty breathing",
        "simple_hi": "सांस फूलना या सांस लेने में कठिनाई होना",
        "simple_te": "శ్వాస తీసుకోవడంలో ఇబ్బంది లేదా ఆయాసం",
        "clinical_context": "Subjective feeling of breathing discomfort.",
    },
    "tachycardia": {
        "category": "Cardiovascular",
        "simple_en": "abnormally fast heart rate (heart beating faster than 100 beats per minute)",
        "simple_hi": "दिल की धड़कन का बहुत तेज होना",
        "simple_te": "గుండె వేగంగా కొట్టుకోవడం",
        "clinical_context": "Resting heart rate above 100 bpm.",
    },
    "bradycardia": {
        "category": "Cardiovascular",
        "simple_en": "abnormally slow heart rate (heart beating slower than 60 beats per minute)",
        "simple_hi": "दिल की धड़कन का बहुत धीमा होना",
        "simple_te": "గుండె నెమ్మదిగా కొట్టుకోవడం",
        "clinical_context": "Resting heart rate below 60 bpm.",
    },
    "edema": {
        "category": "General Clinical",
        "simple_en": "swelling caused by excess fluid trapped in body tissues (often in ankles, legs, or feet)",
        "simple_hi": "शरीर के अंगों (विशेषकर पैरों और टखनों) में पानी जमा होने से सूजन आना",
        "simple_te": "శరీర భాగాలలో (ముఖ్యంగా పాదాలు, కాళ్ళలో) నీరు చేరి వాపు రావడం",
        "clinical_context": "Fluid retention in interstitial spaces.",
    },
    "analgesic": {
        "category": "Pharmacology",
        "simple_en": "pain-relieving medicine",
        "simple_hi": "दर्द कम करने वाली दवा",
        "simple_te": "నొప్పి నివారణ మందు",
        "clinical_context": "Agent that selectively relieves pain without causing loss of consciousness.",
    },
    "antipyretic": {
        "category": "Pharmacology",
        "simple_en": "fever-reducing medicine",
        "simple_hi": "बुखार कम करने वाली दवा",
        "simple_te": "జ్వరం తగ్గించే మందు",
        "clinical_context": "Medication that lowers elevated body temperature.",
    },
    "antibiotic": {
        "category": "Pharmacology",
        "simple_en": "medicine that destroys or slows down the growth of bacteria (must complete the full course)",
        "simple_hi": "बैक्टीरिया के संक्रमण को खत्म करने वाली दवा (पूरा कोर्स लेना जरूरी है)",
        "simple_te": "బాక్టీరియా ఇన్ఫెక్షన్లను తగ్గించే యాంటీబయాటిక్ మందు",
        "clinical_context": "Antimicrobial substance active against bacteria.",
    },
    "contraindication": {
        "category": "Safety",
        "simple_en": "a specific medical reason why a certain medicine or treatment should NOT be used",
        "simple_hi": "ऐसी स्थिति जिसमें किसी दवा या इलाज का इस्तेमाल पूरी तरह मना होता है",
        "simple_te": "ఏదైనా మందు లేదా చికిత్సను అస్సలు ఉపయోగించకూడదని సూచించే కారణం",
        "clinical_context": "Condition serving as reason not to take a certain medical treatment.",
    },
    "myocardial infarction": {
        "category": "Cardiovascular",
        "simple_en": "heart attack (blood flow to a part of the heart muscle was blocked)",
        "simple_hi": "दिल का दौरा (हार्ट अटैक)",
        "simple_te": "గుండెపోటు (హార్ట్ ఎటాక్)",
        "clinical_context": "Necrosis of heart muscle resulting from ischemia.",
    },
    "cerebrovascular accident": {
        "category": "Neurological",
        "simple_en": "stroke (interrupted blood supply to part of the brain)",
        "simple_hi": "लकवा या ब्रेन स्ट्रोक (मस्तिष्क में खून का बहाव रुकना)",
        "simple_te": "పక్షవాతం లేదా బ్రెయిన్ స్ట్రోక్",
        "clinical_context": "Acute neurologic injury following ischemia or hemorrhage.",
    },
    "sublingual": {
        "category": "Instructions",
        "simple_en": "placed under the tongue to dissolve",
        "simple_hi": "जीभ के नीचे रखकर घुलने दी जाने वाली दवा",
        "simple_te": "నాలుక క్రింద ఉంచి కరగనివ్వాల్సిన ఔషధం",
        "clinical_context": "Under the tongue pharmacological absorption.",
    },
    "prn": {
        "category": "Prescription Code",
        "simple_en": "as needed or when required",
        "simple_hi": "जरूरत पड़ने पर ही लें",
        "simple_te": "అవసరమైనప్పుడు మాత్రమే తీసుకోవాలి",
        "clinical_context": "Pro re nata (as needed).",
    },
    "bid": {
        "category": "Prescription Code",
        "simple_en": "twice a day",
        "simple_hi": "दिन में दो बार",
        "simple_te": "రోజుకు రెండుసార్లు",
        "clinical_context": "Bis in die (twice daily).",
    },
    "tid": {
        "category": "Prescription Code",
        "simple_en": "three times a day",
        "simple_hi": "दिन में तीन बार",
        "simple_te": "రోజుకు మూడుసార్లు",
        "clinical_context": "Ter in die (three times daily).",
    },
    "qid": {
        "category": "Prescription Code",
        "simple_en": "four times a day",
        "simple_hi": "दिन में चार बार",
        "simple_te": "రోజుకు నాలుగుసార్లు",
        "clinical_context": "Quater in die (four times daily).",
    },
    "od": {
        "category": "Prescription Code",
        "simple_en": "once daily",
        "simple_hi": "दिन में एक बार",
        "simple_te": "రోజుకు ఒకసారి",
        "clinical_context": "Omni die (once a day).",
    },
    "po": {
        "category": "Prescription Code",
        "simple_en": "by mouth",
        "simple_hi": "मुंह के द्वारा लें",
        "simple_te": "నోటి ద్వారా తీసుకోవాలి",
        "clinical_context": "Per os (orally).",
    },
    "ac": {
        "category": "Prescription Code",
        "simple_en": "before food / meals",
        "simple_hi": "भोजन से पहले",
        "simple_te": "భోజనానికి ముందు",
        "clinical_context": "Ante cibum (before meals).",
    },
    "pc": {
        "category": "Prescription Code",
        "simple_en": "after food / meals",
        "simple_hi": "भोजन के बाद",
        "simple_te": "భోజనం తర్వాత",
        "clinical_context": "Post cibum (after meals).",
    },
    "hs": {
        "category": "Prescription Code",
        "simple_en": "at bedtime / before sleeping",
        "simple_hi": "रात को सोने से पहले",
        "simple_te": "రాత్రి పడుకునే ముందు",
        "clinical_context": "Hora somni (at bedtime).",
    },
    "nephropathy": {
        "category": "Renal",
        "simple_en": "kidney disease or damage",
        "simple_hi": "गुर्दे (किडनी) की बीमारी या क्षति",
        "simple_te": "మూత్రపిండాల (కిడ్నీ) సమస్య లేదా దెబ్బతినడం",
        "clinical_context": "Deterioration of kidney function.",
    },
    "neuropathy": {
        "category": "Neurological",
        "simple_en": "nerve damage (causing numbness, tingling, or burning sensation)",
        "simple_hi": "नसों की कमजोरी या क्षति (जिससे सुन्नपन या झुनझुनी होती है)",
        "simple_te": "నరాలు దెబ్బతినడం (తిమ్మిర్లు లేదా మంటలు రావడం)",
        "clinical_context": "Pathology affecting peripheral nerves.",
    },
    "retinopathy": {
        "category": "Ophthalmology",
        "simple_en": "damage to the retina in the eyes (can affect vision)",
        "simple_hi": "आंखों के पर्दे (रेटिना) की क्षति, जिससे दृष्टि कमजोर हो सकती है",
        "simple_te": "కంటి రెటీనా దెబ్బతినడం (చూపుపై ప్రభావం చూపవచ్చు)",
        "clinical_context": "Damage to retinal microvasculature.",
    },
    "hyperlipidemia": {
        "category": "Cardiovascular",
        "simple_en": "high cholesterol or fat levels in the blood",
        "simple_hi": "खून में कोलेस्ट्रॉल और फैट की अधिक मात्रा",
        "simple_te": "రక్తంలో కొలెస్ట్రాల్ లేదా కొవ్వు శాతం ఎక్కువగా ఉండటం",
        "clinical_context": "High concentration of lipids in blood.",
    },
    "gastroenteritis": {
        "category": "Digestive",
        "simple_en": "stomach and bowel infection (often causes vomiting, loose motions, and stomach cramps)",
        "simple_hi": "पेट और आंतों का संक्रमण (उल्टी और दस्त की समस्या)",
        "simple_te": "కడుపు మరియు పేగుల ఇన్ఫెక్షన్ (వాంతులు మరియు విరేచనాలు)",
        "clinical_context": "Inflammation of the gastrointestinal tract.",
    },
    "pharyngitis": {
        "category": "Respiratory",
        "simple_en": "sore throat / inflammation of the throat",
        "simple_hi": "गले में खराश या सूजन",
        "simple_te": "గొంతు నొప్పి లేదా వాపు",
        "clinical_context": "Inflammation of the pharynx.",
    },
    "pyrexia": {
        "category": "General Clinical",
        "simple_en": "fever (elevated body temperature)",
        "simple_hi": "बुखार (शरीर का तापमान बढ़ना)",
        "simple_te": "జ్వరం (శరీర ఉష్ణోగ్రత పెరగడం)",
        "clinical_context": "Fever / febrile state.",
    },
    "pruritus": {
        "category": "Dermatology",
        "simple_en": "itching sensation on the skin",
        "simple_hi": "त्वचा पर खुजली होना",
        "simple_te": "చర్మంపై దురద",
        "clinical_context": "Unpleasant sensation eliciting the desire to scratch.",
    },
    "insomnia": {
        "category": "Neurological",
        "simple_en": "difficulty falling asleep or staying asleep",
        "simple_hi": "नींद न आने की समस्या (अनिद्रा)",
        "simple_te": "నిద్రలేమి సమస్య",
        "clinical_context": "Sleep disorder characterized by persistent problems sleeping.",
    },
    "vertigo": {
        "category": "Neurological",
        "simple_en": "spinning sensation or dizziness (feeling that the room is spinning)",
        "simple_hi": "सिर घूमना या चक्कर आना (जैसे कमरा घूम रहा हो)",
        "simple_te": "తలతిరగడం లేదా గిర్రున తిరుగుతున్నట్లు అనిపించడం",
        "clinical_context": "Sensation of rotation or whirling.",
    },
    "prophylaxis": {
        "category": "Preventive",
        "simple_en": "preventive treatment to stop an illness before it develops",
        "simple_hi": "बीमारी से बचने के लिए पहले से किया जाने वाला बचाव या इलाज",
        "simple_te": "వ్యాధి రాకుండా ముందుగానే తీసుకునే నివారణ చర్య లేదా మందులు",
        "clinical_context": "Action taken to prevent disease.",
    },
}

class MedicalSimplifier:
    @classmethod
    def simplify_text(
        cls,
        text: str,
        target_lang: str = "English"
    ) -> Dict[str, Any]:
        """
        Converts complicated medical terminology into plain, patient-friendly explanations.
        Safeguards medicines, dosages, and numerical values.
        Supports English, Hindi, and Telugu output.
        """
        if not text or not text.strip():
            return {
                "original_text": text,
                "simplified_text": "",
                "target_language": target_lang,
                "identified_terms": [],
                "preserved_elements": {"medications": [], "dosages": []},
            }

        # Step 1: Extract preserved elements (medications and dosages) so they remain intact
        dosage_regex = re.findall(r'\b(?:\d+(?:\.\d+)?\s*(?:mg|g|mcg|ml|iu|tablets?|capsules?|drops?|puffs?))\b', text, re.IGNORECASE)
        preserved_dosages = list(set(dosage_regex))

        # Detect medicine names
        med_regex = re.findall(r'\b(?:Tab(?:let)?|Cap(?:sule)?|Syp|Inj)\s+([A-Z][a-z0-9]+(?:\s+[A-Z][a-z0-9]+)?)', text)
        preserved_meds = list(set(med_regex))

        # Step 2: Identify complex terms in text
        identified_terms: List[Dict[str, Any]] = []
        simplified_working_text = text

        # Match longest terms first to prevent partial replacements
        sorted_terms = sorted(MEDICAL_DICTIONARY.items(), key=lambda x: -len(x[0]))

        for term, data in sorted_terms:
            pattern = re.compile(rf'\b{re.escape(term)}\b', re.IGNORECASE)
            matches = pattern.findall(text)
            if matches:
                identified_terms.append({
                    "term": term.title(),
                    "category": data["category"],
                    "simple_explanation_en": data["simple_en"],
                    "simple_explanation_hi": data["simple_hi"],
                    "simple_explanation_te": data["simple_te"],
                    "clinical_context": data.get("clinical_context", ""),
                })
                # In the working simplified text, replace medical term with simple explanation
                simplified_working_text = pattern.sub(f"[{data['simple_en']}]", simplified_working_text)

        # Clean up any duplicated brackets
        simplified_working_text = re.sub(r'\[(.*?)\]', r'\1', simplified_working_text)

        # Step 3: Handle target language translation if user requested Hindi or Telugu
        final_simplified = simplified_working_text
        norm_target = target_lang.strip().capitalize()
        
        if norm_target in ["Hindi", "Telugu"]:
            # Translate simplified text into target language
            trans_res = MedicalTranslator.translate_medical_text(
                text=simplified_working_text,
                target_lang=norm_target,
                source_lang="English"
            )
            final_simplified = trans_res.get("translated_text", simplified_working_text)

        return {
            "original_text": text,
            "simplified_text": final_simplified,
            "target_language": norm_target,
            "identified_terms": identified_terms,
            "preserved_elements": {
                "medications": preserved_meds,
                "dosages": preserved_dosages,
            },
            "medical_disclaimer": (
                "This simplified summary is generated to aid understanding. "
                "It does not replace clinical consultation or alter prescribed medical instructions."
            )
        }
