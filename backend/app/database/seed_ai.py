import json
import logging
from sqlalchemy.orm import Session
from app.models.ai_engine import (
    MedicalTerminology,
    SymptomInformation,
    HealthcareKnowledgeBase,
    TranslationHistory,
    ExtractedMedicalEntity,
)
from app.models.user import User
from app.models.patient import PatientProfile
from app.models.document import MedicalDocument

logger = logging.getLogger("uvicorn.error")

def seed_ai_engine_data(db: Session):
    """Seeds verified clinical terminology, symptoms, knowledge base articles, and demonstration records."""
    
    # 1. Seed Medical Terminology
    if db.query(MedicalTerminology).count() == 0:
        logger.info("Seeding verified Medical Terminology dictionary...")
        terminology_data = [
            MedicalTerminology(
                term="Hypertension",
                category="Cardiovascular",
                simple_explanation_en="High blood pressure - the force of blood against your blood vessels is consistently too high.",
                simple_explanation_hi="उच्च रक्तचाप (हाई ब्लड प्रेशर) - नसों में खून का बहाव सामान्य से ज्यादा दबाव डालता है।",
                simple_explanation_te="అధిక రక్తపోటు (హై బీపీ) - రక్తనాళాలపై రక్తం యొక్క ఒత్తిడి సాధారణం కంటే ఎక్కువగా ఉండటం.",
                clinical_context="Systolic BP >= 140 mmHg or Diastolic BP >= 90 mmHg.",
                example_usage="Patient diagnosed with essential hypertension requiring antihypertensive therapy."
            ),
            MedicalTerminology(
                term="Hyperglycemia",
                category="Endocrine / Diabetes",
                simple_explanation_en="Higher than normal blood sugar levels.",
                simple_explanation_hi="रक्त में शुगर (ग्लूकोज) का स्तर सामान्य से अधिक हो जाना।",
                simple_explanation_te="రక్తంలో చక్కెర (షుగర్) స్థాయి సాధారణం కంటే ఎక్కువగా ఉండటం.",
                clinical_context="Fasting blood glucose > 126 mg/dL or postprandial > 200 mg/dL.",
                example_usage="Persistent hyperglycemia indicates the need for oral hypoglycemic agent adjustment."
            ),
            MedicalTerminology(
                term="Hypoglycemia",
                category="Endocrine / Diabetes",
                simple_explanation_en="Dangerously low blood sugar level causing dizziness, sweating, and shaking.",
                simple_explanation_hi="रक्त में शुगर का स्तर बहुत कम हो जाना जिससे घबराहट और चक्कर आ सकते हैं।",
                simple_explanation_te="రక్తంలో చక్కెర శాతం బాగా తగ్గిపోవడం, దీనివల్ల వణుకు మరియు కళ్లు తిరగడం వస్తాయి.",
                clinical_context="Blood glucose < 70 mg/dL requiring immediate oral carbohydrates.",
                example_usage="Patient experienced nocturnal hypoglycemia due to delayed dinner."
            ),
            MedicalTerminology(
                term="Administer medication orally",
                category="Treatment Instructions",
                simple_explanation_en="Take the medicine by mouth by swallowing it with water.",
                simple_explanation_hi="दवा को मुंह के जरिए पानी के साथ निगलकर लें।",
                simple_explanation_te="మందును నోటి ద్వారా నీటితో మింగండి.",
                clinical_context="Per os (PO) administration.",
                example_usage="Administer medication orally once daily after breakfast."
            ),
            MedicalTerminology(
                term="Dyspnea",
                category="Respiratory",
                simple_explanation_en="Shortness of breath or difficulty breathing.",
                simple_explanation_hi="सांस फूलना या सांस लेने में परेशानी होना।",
                simple_explanation_te="శ్వాస తీసుకోవడంలో ఇబ్బంది లేదా ఆయాసం.",
                clinical_context="Symptom of respiratory compromise or cardiovascular failure.",
                example_usage="Patient reported sudden onset dyspnea on minimal exertion."
            ),
            MedicalTerminology(
                term="Tachycardia",
                category="Cardiovascular",
                simple_explanation_en="Abnormally fast heartbeat (faster than 100 beats per minute).",
                simple_explanation_hi="दिल की धड़कन का असामान्य रूप से बहुत तेज होना।",
                simple_explanation_te="గుండె అసాధారణంగా చాలా వేగంగా కొట్టుకోవడం.",
                clinical_context="Heart rate > 100 bpm in resting adult.",
                example_usage="Sinus tachycardia noted on ECG during febrile episode."
            ),
            MedicalTerminology(
                term="Bradycardia",
                category="Cardiovascular",
                simple_explanation_en="Abnormally slow heartbeat (slower than 60 beats per minute).",
                simple_explanation_hi="दिल की धड़कन का असामान्य रूप से बहुत धीमा होना।",
                simple_explanation_te="గుండె చాలా నెమ్మదిగా కొట్టుకోవడం.",
                clinical_context="Resting heart rate < 60 bpm.",
                example_usage="Patient displayed drug-induced bradycardia following beta-blocker overdose."
            ),
            MedicalTerminology(
                term="Edema",
                category="General Clinical",
                simple_explanation_en="Swelling caused by excess fluid accumulating in tissues, commonly feet or ankles.",
                simple_explanation_hi="शरीर के अंगों (जैसे पैर या टखने) में पानी जमा होने से सूजन आना।",
                simple_explanation_te="శరీర భాగాలలో (ముఖ్యంగా పాదాలు, చీలమండలలో) నీరు చేరి వాపు రావడం.",
                clinical_context="Peripheral or pulmonary interstitial fluid buildup.",
                example_usage="Bilateral pitting pedal edema observed in congestive heart failure."
            ),
            MedicalTerminology(
                term="Analgesic",
                category="Pharmacology",
                simple_explanation_en="Medicine used to relieve pain (painkiller).",
                simple_explanation_hi="दर्द निवारक दवा (दर्द कम करने वाली दवा)।",
                simple_explanation_te="నొప్పిని తగ్గించే మందు (పెయిన్ కిల్లర్).",
                clinical_context="Agents relieving pain without inducing anesthesia.",
                example_usage="Prescribed mild oral analgesic for musculoskeletal discomfort."
            ),
            MedicalTerminology(
                term="Antipyretic",
                category="Pharmacology",
                simple_explanation_en="Medicine used to bring down fever.",
                simple_explanation_hi="बुखार को कम करने वाली दवा।",
                simple_explanation_te="జ్వరాన్ని తగ్గించే ఔషధం.",
                clinical_context="Agents acting on hypothalamus to normalize elevated core temperature.",
                example_usage="Administer antipyretic if temperature exceeds 101 F."
            ),
            MedicalTerminology(
                term="Contraindication",
                category="Clinical Safety",
                simple_explanation_en="A specific reason or medical condition where a drug or treatment must NOT be given.",
                simple_explanation_hi="वह स्थिति या कारण जिसमें किसी दवा या इलाज का प्रयोग वर्जित या खतरनाक होता है।",
                simple_explanation_te="ఏదైనా మందు లేదా చికిత్సను వాడటం ప్రాణహాని కలిగించే పరిస్థితి.",
                clinical_context="Clinical flag forbidding therapeutic intervention.",
                example_usage="Active peptic ulcer is a strict contraindication for NSAID administration."
            ),
            MedicalTerminology(
                term="Sublingual",
                category="Treatment Instructions",
                simple_explanation_en="Placed under the tongue to dissolve and absorb into the blood.",
                simple_explanation_hi="जीभ के नीचे रखकर घुलने दी जाने वाली दवा।",
                simple_explanation_te="నాలుక కింద ఉంచి కరిగించుకోవాల్సిన మందు.",
                clinical_context="Mucosal absorption bypassing hepatic first-pass metabolism.",
                example_usage="Take Sorbitrate 5mg sublingually in case of acute chest discomfort."
            ),
            MedicalTerminology(
                term="Gastroenteritis",
                category="Digestive",
                simple_explanation_en="Inflammation of stomach and intestines, causing vomiting, loose motions, and cramps.",
                simple_explanation_hi="पेट और आंतों का संक्रमण, जिसके कारण उल्टी और दस्त होते हैं।",
                simple_explanation_te="కడుపు మరియు పేగుల ఇన్ఫెక్షన్, దీనివల్ల విరేచనాలు మరియు వాంతులు అవుతాయి.",
                clinical_context="Acute gastrointestinal mucosal infection, usually viral or bacterial.",
                example_usage="Patient treated for acute infectious gastroenteritis with oral rehydration."
            ),
            MedicalTerminology(
                term="Prophylaxis",
                category="Preventive Care",
                simple_explanation_en="Preventive action or medicine given to protect against disease before it occurs.",
                simple_explanation_hi="बीमारी से बचाव के लिए पहले से दिया जाने वाला टीका या दवा।",
                simple_explanation_te="వ్యాధి రాకుండా ముందుగానే రక్షణ కోసం తీసుకునే నివారణ చర్య లేదా మందులు.",
                clinical_context="Pre-exposure or post-exposure preventive therapeutic regimen.",
                example_usage="Administered tetanus toxoid as post-exposure wound prophylaxis."
            ),
        ]
        for item in terminology_data:
            db.add(item)
        db.commit()

    # 2. Seed Symptom Information
    if db.query(SymptomInformation).count() < 8:
        logger.info("Seeding verified Symptom Information...")
        symptoms_data = [
            SymptomInformation(
                symptom_name="Fever (Pyrexia)",
                symptom_name_hi="बुखार (पायरेक्सिया)",
                symptom_name_te="జ్వరం (పైరెక్సియా)",
                category="General",
                urgency_level="Moderate",
                description_en="A temporary increase in average body temperature above 98.6°F (37°C), typically a sign of your immune system fighting off an infection.",
                description_hi="शरीर का तापमान सामान्य (98.6°F) से ऊपर बढ़ जाना, जो आमतौर पर शरीर में किसी संक्रमण (इन्फेक्शन) से लड़ने का संकेत होता है।",
                description_te="శరీర ఉష్ణోగ్రత సాధారణం (98.6°F) కంటే పెరగడం, ఇది సాధారణంగా శరీరం ఇన్ఫెక్షన్‌తో పోరాడుతోందనడానికి సంకేతం.",
                possible_causes_en="Common viral infections (Flu, Common Cold), Bacterial infections (Typhoid, UTI), Vector-borne illnesses (Malaria, Dengue), Heat exhaustion.",
                possible_causes_hi="वायरल संक्रमण (फ्लू, सर्दी), बैक्टीरिया संक्रमण (टाइफाइड, यूटीआई), मच्छर जनित रोग (मलेरिया, डेंगू), लू लगना।",
                possible_causes_te="వైరల్ ఇన్ఫెక్షన్లు (ఫ్లూ, జలుబు), బ్యాక్టీరియా ఇన్ఫెక్షన్లు (టైఫాయిడ్, యూటీఐ), దోమల ద్వారా వచ్చే వ్యాధులు (మలేరియా, డెంగ్యూ).",
                self_care_advice_en="Drink plentiful fluids (ORS, coconut water, boiled water). Rest adequately. Take Paracetamol for fever control. Apply cool wet sponging to forehead if fever exceeds 102°F.",
                self_care_advice_hi="खूब पानी और तरल पदार्थ (ओआरएस, नारियल पानी) पिएं। पर्याप्त आराम करें। केवल पैरासिटामोल लें। तेज बुखार में गीली पट्टी से माथे को पोंछें।",
                self_care_advice_te="ఎక్కువ ద్రవాలు (ఓఆర్ఎస్, కొబ్బరి నీరు) తాగండి. విశ్రాంతి తీసుకోండి. జ్వరం తగ్గడానికి పారాసిటమాల్ వాడండి.",
                when_to_see_doctor_en="Seek immediate emergency care if fever exceeds 103°F, persists for more than 3 days, or is accompanied by stiff neck, confusion, breathing difficulty, or rash.",
                when_to_see_doctor_hi="यदि बुखार 103°F से अधिक हो, 3 दिनों से अधिक रहे, या गर्दन में अकड़न, सांस लेने में तकलीफ या बेहोशी हो तो तुरंत अस्पताल जाएं।",
                when_to_see_doctor_te="జ్వరం 103°F దాటినా, 3 రోజుల కంటే ఎక్కువ కాలం ఉన్నా, లేదా శ్వాస తీసుకోవడంలో ఇబ్బంది, మెడ పట్టేయడం వంటివి ఉంటే వెంటనే వైద్యుడిని సంప్రదించండి.",
                related_faqs_json=json.dumps([
                    {"q": "Can I take Aspirin or Brufen for high fever?", "a": "No. In areas where Dengue is prevalent, Aspirin and Brufen thin the blood and can cause bleeding. Use Paracetamol only."},
                    {"q": "What should I eat during fever?", "a": "Eat light, easily digestible meals like khichdi, dalia, warm vegetable soup, and drink boiled water."},
                    {"q": "When does fever become an emergency?", "a": "If accompanied by confusion, severe headache, continuous vomiting, or breathing trouble."}
                ]),
                reference_source="National Health Portal of India / WHO Fever Clinical Guidelines"
            ),
            SymptomInformation(
                symptom_name="Chest Pain & Discomfort",
                symptom_name_hi="छाती में दर्द और बेचैनी",
                symptom_name_te="ఛాతీ నొప్పి మరియు అసౌకర్యం",
                category="Cardiovascular",
                urgency_level="High / Urgent",
                description_en="Pain, tightness, pressure, or squeezing sensation felt in the chest area, which can originate from heart, lungs, or digestive tract.",
                description_hi="छाती के बीच या बाईं ओर दबाव, भारीपन, या जकड़न जैसा दर्द होना।",
                description_te="ఛాతీ మధ్యలో లేదా ఎడమ వైపున ఒత్తిడి, బిగుతు లేదా మంటగా అనిపించడం.",
                possible_causes_en="Angina or Acute Myocardial Infarction (Heart Attack), Acid Reflux (GERD), Muscle Strain, Pneumonia or Pleurisy, Severe Anxiety.",
                possible_causes_hi="दिल का दौरा (हार्ट अटैक), एसिडिटी और गैस (GERD), छाती की मांसपेशियों में खिंचाव, फेफड़ों का संक्रमण।",
                possible_causes_te="గుండెపోటు (హార్ట్ ఎటాక్), గ్యాస్ట్రిక్ లేదా ఎసిడిటీ (GERD), కండరాల నొప్పి, ఊపిరితిత్తుల ఇన్ఫెక్షన్.",
                self_care_advice_en="Sit down and rest immediately. Loosen tight clothing. If already diagnosed with heart disease, take prescribed Sorbitrate. Do not attempt home remedies for unexplained chest pain.",
                self_care_advice_hi="तुरंत शांत होकर बैठ जाएं। कपड़े ढीले करें। यदि पहले से दिल की बीमारी है तो डॉक्टर द्वारा दी गई सोर्बिट्रेट दवा लें। घरेलू नुस्खों में समय बर्बाद न करें।",
                self_care_advice_te="వెంటనే కూర్చుని విశ్రాంతి తీసుకోండి. ఒత్తిడి తగ్గించండి. వైద్యులు సూచించిన మందులు తీసుకోండి.",
                when_to_see_doctor_en="CRITICAL: Call 108 / seek immediate hospital care if pain radiates to jaw, left arm, or back, or is accompanied by cold sweat, dizziness, or nausea.",
                when_to_see_doctor_hi="अत्यंत महत्वपूर्ण: यदि दर्द बाएं हाथ, जबड़े या पीठ में फैले, साथ में पसीना आए या चक्कर आए, तो तुरंत 108 पर कॉल करें या नजदीकी अस्पताल जाएं।",
                when_to_see_doctor_te="అత్యవసరం: నొప్పి ఎడమ చేతికి, దవడకు వ్యాపించినా, చెమటలు పట్టినా వెంటనే 108 కు కాల్ చేసి ఆసుపత్రికి వెళ్ళండి.",
                related_faqs_json=json.dumps([
                    {"q": "How to tell heart pain from acidity?", "a": "Heart pain often feels like heavy pressure or squeezing, worsens with exertion, and radiates to arm/jaw. Acidity usually causes burning sensation relieved by antacids."},
                    {"q": "What is the golden hour?", "a": "The first 60 minutes after heart attack symptoms start is crucial for restoring blood flow to save heart muscle."}
                ]),
                reference_source="AIIMS Cardiology Guidelines / Indian Heart Association"
            ),
            SymptomInformation(
                symptom_name="Shortness of Breath (Dyspnea)",
                symptom_name_hi="सांस फूलना (डिस्पेनिया)",
                symptom_name_te="శ్వాస ఆడకపోవడం (ఆయాసం)",
                category="Respiratory",
                urgency_level="High / Urgent",
                description_en="Difficulty inhaling enough air, chest tightness, or feeling suffocated.",
                description_hi="सांस लेने में भारी कठिनाई महसूस होना, फेफड़ों में पर्याप्त हवा न पहुंचना।",
                description_te="ఊపిరి పీల్చుకోవడంలో తీవ్రమైన ఇబ్బంది కలగడం, ఆయాసం రావడం.",
                possible_causes_en="Bronchial Asthma, COPD, Pneumonia, Severe Anemia, Heart Failure, Allergic reaction (Anaphylaxis).",
                possible_causes_hi="अस्थमा (दमा), फेफड़ों की बीमारी (COPD), निमोनिया, खून की अत्यधिक कमी (गंभीर एनीमिया), दिल की कमजोरी।",
                possible_causes_te="ఉబ్బసం (ఆస్తమా), ఊపిరితిత్తుల సమస్యలు (COPD), న్యుమోనియా, తీవ్ర రక్తహీనత, గుండె వైఫల్యం.",
                self_care_advice_en="Sit upright leaning slightly forward. Practice slow pursed-lip breathing. Use prescribed rescue bronchodilator inhaler (Salbutamol) if diagnosed asthmatic.",
                self_care_advice_hi="सीधे बैठें और थोड़ा आगे झुकें। धीरे-धीरे सांस लें। यदि दमे के मरीज हैं तो अपना इनहेलर तुरंत लें।",
                self_care_advice_te="నిటారుగా కూర్చోండి. శ్వాస నెమ్మదిగా తీసుకోండి. ఆస్తమా ఉంటే డాక్టర్ సూచించిన ఇన్హేలర్ వాడండి.",
                when_to_see_doctor_en="Seek emergency attention if lips or fingernails turn bluish (Cyanosis), inability to speak full sentences, or swelling in feet.",
                when_to_see_doctor_hi="यदि होंठ या नाखून नीले पड़ने लगें, पूरा वाक्य न बोला जा सके, तो तुरंत इमरजेंसी में जाएं।",
                when_to_see_doctor_te="పెదవులు లేదా గోళ్లు నీలం రంగులోకి మారినా, మాట్లాడలేకపోయినా వెంటనే ఆసుపత్రికి వెళ్ళండి.",
                related_faqs_json=json.dumps([
                    {"q": "Does smoke from biomass chulhas cause breathing problems?", "a": "Yes, indoor smoke damages airway linings and leads to chronic bronchitis and asthma in rural women and children."}
                ]),
                reference_source="WHO Global Alliance Against Chronic Respiratory Diseases"
            ),
            SymptomInformation(
                symptom_name="Headache & Dizziness",
                symptom_name_hi="सिरदर्द और चक्कर आना",
                symptom_name_te="తలనొప్పి మరియు కళ్లు తిరగడం",
                category="Neurological",
                urgency_level="Moderate",
                description_en="Pain or throbbing in the head or neck accompanied by lightheadedness, unsteadiness, or spinning sensation.",
                description_hi="सिर या गर्दन में दर्द और भारीपन के साथ चक्कर या संतुलन बिगड़ने का अहसास।",
                description_te="తల లేదా మెడ భాగంలో నొప్పి మరియు కళ్లు తిరగడం, నిలబడలేకపోవడం.",
                possible_causes_en="High Blood Pressure Spike, Dehydration, Heat Exhaustion, Migraine, Lack of sleep, Eyestrain, Cervical Spondylosis.",
                possible_causes_hi="अचानक बीपी बढ़ना, पानी की कमी (डिहाइड्रेशन), माइग्रेन, धूप और गर्मी, आंखों की कमजोरी।",
                possible_causes_te="అధిక రక్తపోటు పెరగడం, డీహైడ్రేషన్, ఎండదెబ్బ, మైగ్రేన్, నిద్రలేమి, కంటి సమస్యలు.",
                self_care_advice_en="Rest in a quiet, darkened room. Drink 2 glasses of water. Check blood pressure at the local PHC/Health Sub-centre. Avoid sudden posture changes.",
                self_care_advice_hi="शांत और ठंडे कमरे में आराम करें। पानी पिएं। नजदीकी स्वास्थ्य केंद्र जाकर अपना बीपी जरूर चेक करवाएं।",
                self_care_advice_te="ప్రశాంతమైన గదిలో విశ్రాంతి తీసుకోండి. నీరు ఎక్కువగా తాగండి. ప్రాథమిక ఆరోగ్య కేంద్రంలో బీపీ చెక్ చేసుకోండి.",
                when_to_see_doctor_en="Consult a doctor immediately if headache is sudden and explosive ('worst headache of life'), causes blurred vision, speech slurring, or weakness on one side of face/body.",
                when_to_see_doctor_hi="यदि अचानक असहनीय सिरदर्द हो, नजर धुंधली हो जाए, या बोलने में लड़खड़ाहट हो तो तुरंत न्यूरोलॉजिस्ट या बड़े अस्पताल जाएं।",
                when_to_see_doctor_te="హఠాత్తుగా తీవ్రమైన తలనొప్పి వచ్చినా, చూపు మసకబారినా లేదా ఒక వైపు చేయి/కాలు బలహీనపడినా వెంటనే ఆసుపత్రికి వెళ్ళండి.",
                related_faqs_json=json.dumps([
                    {"q": "Can high BP cause headaches?", "a": "Yes, especially severe hypertension or sudden BP spikes can cause throbbing occipital headaches in the morning."}
                ]),
                reference_source="National Institute of Mental Health and Neurosciences (NIMHANS)"
            ),
            SymptomInformation(
                symptom_name="Acute Diarrhea & Dehydration",
                symptom_name_hi="गंभीर दस्त और निर्जलीकरण (डिहाइड्रेशन)",
                symptom_name_te="తీవ్రమైన విరేచనాలు మరియు నిర్జలీకరణం (డీహైడ్రేషన్)",
                category="Digestive",
                urgency_level="Moderate",
                description_en="Frequent watery stools (3 or more times a day) leading to dangerous loss of body water and essential electrolytes.",
                description_hi="दिन में तीन या अधिक बार पानी जैसे पतले दस्त होना, जिससे शरीर में पानी और आवश्यक लवणों की भारी कमी हो जाती है।",
                description_te="రోజుకు మూడు లేదా అంతకంటే ఎక్కువ సార్లు నీళ్ల విరేచనాలు కావడం, దీనివల్ల శరీరంలో నీరు మరియు లవణాలు తగ్గిపోతాయి.",
                possible_causes_en="Contaminated drinking water, viral gastroenteritis (Rotavirus), bacterial dysentery, food poisoning, cholera.",
                possible_causes_hi="दूषित पेयजल, आंतों का संक्रमण (रोटावायरस), दूषित भोजन, हैजा या पेचिश।",
                possible_causes_te="కలుషితమైన తాగునీరు, ఫుడ్ పాయిజనింగ్, బ్యాక్టీరియా లేదా వైరల్ ఇన్ఫెక్షన్లు.",
                self_care_advice_en="Start Oral Rehydration Salts (ORS) solution immediately after every loose stool. Drink boiled water, thin rice kanji with salt, and coconut water. Continue normal feeding.",
                self_care_advice_hi="हर दस्त के बाद तुरंत ओआरएस (ORS) का घोल पिएं। उबला पानी, नमक मिला चावल का मांड और नारियल पानी लें। खाना बंद न करें।",
                self_care_advice_te="ప్రతి విరేచనం తర్వాత వెంటనే ఓఆర్ఎస్ (ORS) ద్రావణం తాగండి. ఉడకబెట్టిన నీరు, గంజి తాగండి.",
                when_to_see_doctor_en="Seek urgent medical care if blood is present in stools, patient is unable to drink fluids, eyes become sunken, or urine output stops for > 8 hours.",
                when_to_see_doctor_hi="यदि दस्त में खून आए, मरीज पानी न पी पाए, आंखें धंस जाएं या 8 घंटे से पेशाब न हुआ हो, तो तुरंत अस्पताल ले जाएं।",
                when_to_see_doctor_te="విరేచనాలలో రక్తం పడినా, కళ్ళు గుంటలు పడినా లేదా 8 గంటలైనా మూత్రం రాకపోయినా వెంటనే ఆసుపత్రికి వెళ్ళండి.",
                related_faqs_json=json.dumps([
                    {"q": "How to prepare ORS packet at home?", "a": "Dissolve 1 full packet of WHO-formula ORS in 1 liter of clean drinking water. Drink within 24 hours."},
                    {"q": "Should antibiotics be taken for every diarrhea episode?", "a": "No. Most diarrheas are viral and self-limiting. Indiscriminate antibiotic use causes dangerous resistance."}
                ]),
                reference_source="WHO / UNICEF Diarrheal Disease Management Protocol"
            ),
            SymptomInformation(
                symptom_name="High Blood Sugar Warning Signs (Hyperglycemia)",
                symptom_name_hi="हाई ब्लड शुगर के लक्षण (हाइपरग्लाइसीमिया)",
                symptom_name_te="అధిక రక్తంలో చక్కెర హెచ్చరిక సంకేతాలు",
                category="Endocrine / Diabetes",
                urgency_level="Moderate",
                description_en="Excessive thirst (Polydipsia), frequent urination especially at night (Polyuria), and unexplained weight loss or extreme fatigue.",
                description_hi="बहुत ज्यादा प्यास लगना, बार-बार पेशाब आना (विशेषकर रात में), और बिना वजह कमजोरी व वजन घटना।",
                description_te="ఎక్కువగా దాహం వేయడం, రాత్రి వేళల్లో తరచుగా మూత్ర విసర్జన కావడం మరియు విపరీతమైన అలసట.",
                possible_causes_en="Undiagnosed Type 2 Diabetes, missed insulin/oral diabetes pills, severe systemic infection, steroid medications, high sugar diet.",
                possible_causes_hi="अनियंत्रित डायबिटीज, दवा न लेना या छोड़ देना, गंभीर संक्रमण, खान-पान में लापरवाही।",
                possible_causes_te="నియంత్రణ లేని మధుమేహం, మందులు వేసుకోకపోవడం, తీవ్రమైన ఇన్ఫెక్షన్లు.",
                self_care_advice_en="Check blood sugar using glucometer. Drink plain water to stay hydrated. Avoid all sugary beverages, sweets, and high-carb food. Take prescribed diabetes medicines.",
                self_care_advice_hi="ग्लूकोमीटर से तुरंत शुगर जांचें। खूब सादा पानी पिएं। मीठा और कोल्ड ड्रिंक बिल्कुल बंद कर दें। समय पर दवा लें।",
                self_care_advice_te="గ్లూకోమీటర్‌తో షుగర్ చెక్ చేసుకోండి. మంచినీరు ఎక్కువగా తాగండి. తీపి పదార్థాలు పూర్తిగా మానేయండి.",
                when_to_see_doctor_en="Seek urgent medical attention if blood sugar > 300 mg/dL, or accompanied by fruity breath odor, persistent vomiting, deep rapid breathing, or confusion (signs of Diabetic Ketoacidosis).",
                when_to_see_doctor_hi="यदि शुगर 300 से अधिक हो, सांस से फल जैसी गंध आए, लगातार उल्टी हो या मरीज बेहोश होने लगे, तो तुरंत इमरजेंसी में जाएं।",
                when_to_see_doctor_te="రక్తంలో చక్కెర 300 mg/dL దాటినా, వాంతులు అవుతున్నా వెంటనే అత్యవసర వైద్య విభాగానికి తీసుకెళ్లండి.",
                related_faqs_json=json.dumps([
                    {"q": "What is normal fasting blood sugar?", "a": "Normal fasting blood sugar in adults is between 70 to 100 mg/dL."}
                ]),
                reference_source="ICMR Guidelines for Management of Type 2 Diabetes"
            ),
            SymptomInformation(
                symptom_name="Joint Pain & Morning Stiffness (Arthritis)",
                symptom_name_hi="जोड़ों में दर्द और सुबह की अकड़न (गठिया / आर्थराइटिस)",
                symptom_name_te="కీళ్ల నొప్పులు మరియు ఉదయం పట్టేయడం (కీళ్ళవాతం)",
                category="Musculoskeletal",
                urgency_level="Low",
                description_en="Ache, tenderness, swelling, and stiffness in knee, hip, shoulder, or finger joints, making daily walking and agricultural work painful.",
                description_hi="घुटनों, कूल्हों या उंगलियों के जोड़ों में दर्द, सूजन और सुबह उठने पर अकड़न होना।",
                description_te="మోకాళ్ళు, తుంటి లేదా వేళ్ల కీళ్ళలో నొప్పి, వాపు మరియు నడవడానికి ఇబ్బందిగా ఉండటం.",
                possible_causes_en="Age-related Osteoarthritis, Rheumatoid Arthritis, High Uric Acid (Gout), Post-viral arthritis (Chikungunya), Joint injury.",
                possible_causes_hi="उम्र के साथ जोड़ों का घिसना (ऑस्टियोआर्थराइटिस), यूरिक एसिड बढ़ना (गाउट), चिकनगुनिया के बाद का दर्द।",
                possible_causes_te="వయస్సు సంబంధిత కీళ్ల అరుగుదల (ఆస్టియో ఆర్థరైటిస్), యూరిక్ యాసిడ్ పెరగడం (గౌట్).",
                self_care_advice_en="Apply warm compresses to stiff joints. Maintain healthy body weight to reduce knee pressure. Perform gentle low-impact exercises. Avoid sitting on the floor if knee pain is severe.",
                self_care_advice_hi="जोड़ों की गर्म पानी या थैली से सिकाई करें। वजन नियंत्रित रखें। जमीन पर उकड़ू बैठने से बचें और कुर्सी का इस्तेमाल करें।",
                self_care_advice_te="నొప్పి ఉన్న కీళ్ళపై వేడి కాపడం పెట్టండి. శరీర బరువును అదుపులో ఉంచుకోండి. నేలపై కూర్చోవడం తగ్గించండి.",
                when_to_see_doctor_en="Visit PHC if a joint becomes intensely red, hot to touch, swollen, and accompanied by fever (possible septic joint infection).",
                when_to_see_doctor_hi="यदि जोड़ में अत्यधिक लाली, गर्माहट और तेज बुखार हो तो तुरंत डॉक्टर को दिखाएं।",
                when_to_see_doctor_te="కీలు తీవ్రంగా ఎర్రబడి, వేడిగా ఉండి జ్వరం వస్తే వెంటనే వైద్యుడిని సంప్రదించండి.",
                related_faqs_json=json.dumps([
                    {"q": "Can calcium and vitamin D help knee pain?", "a": "Yes, adequate calcium and sunlight exposure for Vitamin D strengthen bones and reduce fracture risk in older adults."}
                ]),
                reference_source="National Health Portal / Indian Rheumatology Association"
            ),
            SymptomInformation(
                symptom_name="Severe Persistent Cough & Phlegm",
                symptom_name_hi="लगातार खांसी और बलगम (खांसी की समस्या)",
                symptom_name_te="తీవ్రమైన దగ్గు మరియు కఫం",
                category="Respiratory",
                urgency_level="Moderate",
                description_en="Cough lasting more than 2 weeks, with or without yellowish-green sputum, chest soreness, or low-grade evening fever.",
                description_hi="2 सप्ताह से अधिक समय से लगातार खांसी रहना, बलगम निकलना या शाम के समय हल्का बुखार आना।",
                description_te="2 వారాల కంటే ఎక్కువ కాలం దగ్గు ఉండటం, కఫం రావడం లేదా సాయంత్రం వేళల్లో జ్వరం రావడం.",
                possible_causes_en="Pulmonary Tuberculosis (TB), Chronic Bronchitis, Pneumonia, Post-nasal drip, Asthma, Smoke irritation.",
                possible_causes_hi="टीबी (तपेदिक), फेफड़ों का संक्रमण (निमोनिया), क्रोनिक ब्रोंकाइटिस, धुएं से एलर्जी।",
                possible_causes_te="క్షయ వ్యాధి (టీబీ), న్యుమోనియా, బ్రాంకైటిస్, పొగ వల్ల వచ్చే సమస్యలు.",
                self_care_advice_en="Drink warm water with ginger and tulsi. Steam inhalation twice daily. Cover mouth with clean cloth when coughing. Wear a mask around infants.",
                self_care_advice_hi="अदरक-तुलसी वाला गुनगुना पानी पिएं। भाप लें। खांसते समय मुंह पर रुमाल रखें।",
                self_care_advice_te="గోరువెచ్చని నీరు తాగండి. ఆవిరి పట్టండి. దగ్గినప్పుడు నోటికి రుమాలు అడ్డం పెట్టుకోండి.",
                when_to_see_doctor_en="CRITICAL: Any cough lasting more than 2 weeks MUST be tested for Tuberculosis (Sputum test & Chest X-ray is FREE under National TB Elimination Programme at every government PHC).",
                when_to_see_doctor_hi="महत्वपूर्ण: 2 सप्ताह से अधिक की खांसी में टीबी की जांच (बलगम जांच और एक्स-रे) नजदीकी सरकारी अस्पताल में बिल्कुल मुफ्त होती है, तुरंत जांच कराएं।",
                when_to_see_doctor_te="ముఖ్య గమనిక: 2 వారాలు దాటిన దగ్గుకు ప్రతి ప్రభుత్వ ఆసుపత్రిలో ఉచిత క్షయ (టీబీ) పరీక్ష చేయించుకోవాలి.",
                related_faqs_json=json.dumps([
                    {"q": "Is TB curable?", "a": "Yes! TB is 100% curable if the prescribed DOTS antibiotic course is completed without stopping."}
                ]),
                reference_source="National Tuberculosis Elimination Programme (NTEP) / WHO"
            ),
            SymptomInformation(
                symptom_name="Extreme Fatigue & Pale Skin (Anemia)",
                symptom_name_hi="अत्यधिक थकान, कमजोरी और पीलापन (एनीमिया)",
                symptom_name_te="తీవ్రమైన అలసట, బలహీనత మరియు పాలిపోయిన చర్మం (రక్తహీనత)",
                category="General",
                urgency_level="Low",
                description_en="Lack of physical energy, breathlessness while climbing stairs, paleness in inner eyelids and tongue, and frequent dizziness.",
                description_hi="हर समय थकान रहना, थोड़ा सा चलने पर सांस फूलना, आंखों के नीचे और जीभ में पीलापन दिखना।",
                description_te="శరీరంలో శక్తి లేకపోవడం, మెట్లు ఎక్కినప్పుడు ఆయాసం రావడం, నాలుక మరియు కనురెప్పలు పాలిపోవడం.",
                possible_causes_en="Iron Deficiency Anemia (nutritional), Hookworm intestinal infection, heavy menstrual bleeding, Vitamin B12 deficiency.",
                possible_causes_hi="भोजन में आयरन (लोहे) की कमी, पेट में कीड़े (हुकवर्म), अत्यधिक मासिक स्राव, विटामिन बी12 की कमी।",
                possible_causes_te="ఆహారంలో ఐరన్ లోపం, కడుపులో నులిపురుగులు, విపరీతమైన రక్తస్రావం.",
                self_care_advice_en="Eat iron-rich foods: green leafy vegetables (spinach, methi), jaggery (gur), roasted chana, drumstick leaves, and lentils. Take deworming tablet (Albendazole) twice a year.",
                self_care_advice_hi="आयरन युक्त भोजन खाएं: पालक, मेथी, गुड़, भुना चना, सहजन की पत्तियां और दालें। साल में दो बार पेट के कीड़ों की दवा (एल्बेंडाजोल) जरूर लें।",
                self_care_advice_te="ఐరన్ ఎక్కువగా ఉండే ఆకుకూరలు (పాలకూర), బెల్లం, వేయించిన శనగలు తినండి. నులిపురుగుల నివారణకు ఆల్బెండజోల్ మాత్రలు వేసుకోండి.",
                when_to_see_doctor_en="Consult doctor if fatigue causes fainting, chest pain, or rapid irregular heartbeats (Hemoglobin < 7 g/dL requires urgent medical therapy).",
                when_to_see_doctor_hi="यदि कमजोरी के कारण चक्कर आकर बेहोशी हो या दिल की धड़कन बढ़ जाए तो तुरंत हीमोग्लोबिन की जांच कराएं।",
                when_to_see_doctor_te="అలసట వల్ల స్పృహ తప్పి పడిపోయినా లేదా గుండె దడగా అనిపించినా వెంటనే వైద్యుడిని సంప్రదించండి.",
                related_faqs_json=json.dumps([
                    {"q": "Can tea after meals block iron absorption?", "a": "Yes! Drinking strong tea or coffee immediately with or after meals blocks iron absorption. Wait at least 1 hour."}
                ]),
                reference_source="Anemia Mukt Bharat Strategy / MoHFW"
            )
        ]
        for s in symptoms_data:
            existing = db.query(SymptomInformation).filter(SymptomInformation.symptom_name == s.symptom_name).first()
            if not existing:
                db.add(s)
        db.commit()

    # 3. Seed Healthcare Knowledge Base
    if db.query(HealthcareKnowledgeBase).count() == 0:
        logger.info("Seeding verified Healthcare Knowledge Base...")
        admin_user = db.query(User).filter(User.role == "admin").first()
        author_id = admin_user.id if admin_user else None

        kb_articles = [
            HealthcareKnowledgeBase(
                title_en="Managing Hypertension & Blood Pressure in Rural Communities",
                title_hi="ग्रामीण क्षेत्रों में उच्च रक्तचाप (हाई बीपी) का प्रबंधन और रोकथाम",
                title_te="గ్రామీణ ప్రాంతాలలో అధిక రక్తపోటు (హై బీపీ) నిర్వహణ మరియు నివారణ",
                category="Chronic Conditions",
                tags="hypertension, blood pressure, salt reduction, lifestyle, cardiovascular",
                summary_en="Practical guide to detecting, monitoring, and controlling hypertension through diet, regular exercise, and uninterrupted medication.",
                summary_hi="आहार में नमक की कमी, नियमित जांच और बिना नागा दवा लेकर हाई बीपी को नियंत्रित रखने की व्यावहारिक मार्गदर्शिका।",
                summary_te="ఆహారంలో ఉప్పు తగ్గించడం, క్రమం తప్పకుండా బీపీ చెక్ చేసుకోవడం మరియు మందులు వాడటం ద్వారా అధిక రక్తపోటును అదుపులో ఉంచుకునే మార్గదర్శిని.",
                content_en="""# Managing High Blood Pressure (Hypertension)

Hypertension is known as the 'Silent Killer' because it rarely causes noticeable warning symptoms until serious organ damage has occurred.

### Key Control Steps:
1. **Reduce Salt Intake**: Limit total daily salt to less than 1 level teaspoon (5 grams). Avoid salted pickles, papads, and processed snacks.
2. **Never Stop Medication Abruptly**: Take your prescribed antihypertensive tablet (e.g., Amlodipine, Telmisartan) daily without fail, even when you feel completely fine.
3. **Daily Physical Activity**: Walk briskly for at least 30 minutes every morning or evening.
4. **Regular PHC Checkups**: Visit your local ASHA worker or Sub-centre every month to record your BP readings.
""",
                content_hi="""# उच्च रक्तचाप (हाई ब्लड प्रेशर) का नियंत्रण

हाई बीपी को 'साइलेंट किलर' कहा जाता है क्योंकि इसके कोई शुरुआती लक्षण नहीं दिखते, लेकिन यह दिल और गुर्दों को नुकसान पहुंचा सकता है।

### जरूरी सावधानियां:
1. **नमक कम खाएं**: पूरे दिन में एक चम्मच से ज्यादा नमक न लें। अचार, पापड़ और नमकीन से परहेज करें।
2. **दवा कभी बंद न करें**: डॉक्टर द्वारा बताई गई दवा (जैसे एम्लोडिपिन) रोज समय पर लें, भले ही आप खुद को स्वस्थ महसूस कर रहे हों।
3. **रोजाना 30 मिनट टहलें**: सुबह या शाम तेज कदमों से चलना दिल को मजबूत बनाता है।
4. **हर महीने बीपी नपवाएं**: अपने गांव की आशा दीदी या प्राथमिक स्वास्थ्य केंद्र जाकर नियमित जांच कराएं।
""",
                content_te="""# అధిక రక్తపోటు (హై బీపీ) నివారణ మరియు సంరక్షణ

రక్తపోటు ఎక్కువగా ఉన్నప్పుడు ఎలాంటి స్పష్టమైన లక్షణాలు కనిపించకపోవచ్చు, అందుకే దీనిని 'సైలెంట్ కిల్లర్' అంటారు.

### ముఖ్యమైన సూచనలు:
1. **ఉప్పు వినియోగం తగ్గించండి**: రోజుకు ఒక చెంచా కంటే ఎక్కువ ఉప్పు వాడకండి. ఊరగాయలు మరియు ఉప్పు ఎక్కువగా ఉండే పదార్థాలకు దూరంగా ఉండండి.
2. **మందులు ఆపవద్దు**: వైద్యులు సూచించిన మందులను ప్రతిరోజూ క్రమం తప్పకుండా వేసుకోండి.
3. **రోజూ వ్యాయామం చేయండి**: ప్రతిరోజూ కనీసం 30 నిమిషాలు వేగంగా నడవండి.
4. **ప్రాథమిక ఆరోగ్య కేంద్రంలో తనిఖీ చేయించుకోండి**: నెలకు ఒకసారి ఆశా కార్యకర్త లేదా ఆరోగ్య కేంద్రంలో బీపీ పరీక్షించుకోండి.
""",
                reference_source="Indian Council of Medical Research (ICMR) / MoHFW India Hypertension Control Initiative (IHCI)",
                created_by_id=author_id,
            ),
            HealthcareKnowledgeBase(
                title_en="Type 2 Diabetes Mellitus: Food Choices, Medication & Foot Care",
                title_hi="टाइप 2 डायबिटीज (मधुमेह): उचित खान-पान, दवा और पैरों की देखभाल",
                title_te="టైప్ 2 మధుమేహం: సరైన ఆహారపు అలవాట్లు, మందులు మరియు పాదాల సంరక్షణ",
                category="Chronic Conditions",
                tags="diabetes, sugar, foot care, diet, insulin, metformin",
                summary_en="Comprehensive advice on controlling blood sugar levels, preventing diabetic foot complications, and recognizing hypoglycemia.",
                summary_hi="शुगर के स्तर को सामान्य रखने, पैरों में घाव से बचने और अचानक शुगर कम होने पर तुरंत उपाय करने की संपूर्ण जानकारी।",
                summary_te="రక్తంలో చక్కెర స్థాయిని అదుపులో ఉంచడం, షుగర్ వ్యాధిగ్రస్తులు పాదాల జాగ్రత్తలు తీసుకోవడం మరియు మందుల వాడకం.",
                content_en="""# Diabetes Mellitus Management

Diabetes requires lifelong disciplined self-care to protect the eyes, heart, kidneys, and nerves.

### 1. Balanced Nutrition
- Replace polished white rice with whole wheat, jowar, bajra, or ragi.
- Eat generous portions of green leafy vegetables and seasonal lentils (dal).
- Avoid sugary sweets, refined flour (maida), and bottled cold drinks.

### 2. Daily Foot Inspection
- Wash feet daily with lukewarm water and dry thoroughly, especially between toes.
- Never walk barefoot, even inside the house or in agricultural fields.
- Check daily for small cuts, blisters, or redness and visit the doctor immediately if a wound appears.
""",
                content_hi="""# डायबिटीज (शुगर) का संपूर्ण प्रबंधन

डायबिटीज को सही खान-पान और दवा से पूरी तरह नियंत्रित रखा जा सकता है।

### 1. खान-पान में बदलाव:
- सफेद चावल की जगह ज्वार, बाजरा, रागी या चोकरयुक्त गेहूं की रोटी खाएं।
- हरी सब्जियां, करेला, मेथी और दालें अधिक मात्रा में लें।
- चीनी, गुड़, मिठाई और मीठे पेय पदार्थों से पूरी तरह परहेज करें।

### 2. पैरों की विशेष देखभाल:
- कभी भी नंगे पैर न चलें, खेतों या घर के अंदर भी चप्पल जरूर पहनें।
- रोज रात को पैरों को धोकर देखें कि कहीं कोई कट या छाला तो नहीं है।
- घाव होने पर तुरंत डॉक्टर को दिखाएं, क्योंकि डायबिटीज में घाव जल्दी नहीं भरते।
""",
                content_te="""# మధుమేహం (డయాబెటిస్) సంరక్షణ

సరైన ఆహారం మరియు క్రమబద్ధమైన మందుల ద్వారా మధుమేహాన్ని అదుపులో ఉంచుకోవచ్చు.

### 1. ఆహార జాగ్రత్తలు:
- తెల్ల బియ్యం బదులు జొన్నలు, రాగులు, సజ్జలు వాడండి.
- పచ్చని కూరగాయలు, ఆకుకూరలు ఎక్కువగా ఆహారంలో చేర్చుకోండి.
- తీపి పదార్థాలు, శీతల పానీయాలకు దూరంగా ఉండండి.

### 2. పాదాల సంరక్షణ:
- ఎట్టి పరిస్థితుల్లోనూ చెప్పులు లేకుండా నడవకండి.
- ప్రతిరోజూ పాదాలను పరిశీలించి, ఏవైనా గాయాలు ఉంటే వెంటనే వైద్యుడిని సంప్రదించండి.
""",
                reference_source="National Programme for Prevention and Control of Non-Communicable Diseases (NP-NCD)",
                created_by_id=author_id,
            ),
            HealthcareKnowledgeBase(
                title_en="Antenatal Care (ANC) & Institutional Delivery for Rural Mothers",
                title_hi="ग्रामीण माताओं के लिए प्रसव पूर्व देखभाल (ANC) और अस्पताल में सुरक्षित प्रसव",
                title_te="గ్రామీణ గర్భిణీ స్త్రీలకు ప్రసవపూర్వ సంరక్షణ (ANC) మరియు సురక్షిత ప్రసవం",
                category="Maternal & Child Health",
                tags="pregnancy, antenatal care, safe delivery, iron folic acid, immunization",
                summary_en="Vital roadmap for pregnant women ensuring at least 4 ANC checkups, IFA supplementation, and institutional delivery under Janani Suraksha Yojana.",
                summary_hi="गर्भावस्था के दौरान कम से कम 4 जांच, आयरन की गोलियां और जननी सुरक्षा योजना के तहत सरकारी अस्पताल में सुरक्षित प्रसव की जानकारी।",
                summary_te="గర్భిణీ స్త్రీలు తీసుకోవలసిన 4 ముఖ్యమైన వైద్య పరీక్షలు, ఐరన్ మాత్రలు మరియు ఆసుపత్రిలో సురక్షిత ప్రసవం గురించిన వివరాలు.",
                content_en="""# Maternal & Newborn Health Protocol

Every pregnancy must be registered early with the local ASHA or ANM within the first trimester.

### Critical Milestones:
1. **Four Essential ANC Visits**: At 12 weeks, 14-26 weeks, 28-34 weeks, and 36 weeks.
2. **Iron & Folic Acid (IFA)**: Take 1 IFA tablet daily for at least 180 days after the first trimester to combat maternal anemia.
3. **Tetanus Immunization**: Complete 2 doses of Tetanus Toxoid (TT) injections.
4. **Institutional Delivery**: Always plan delivery at a Community Health Centre (CHC) or District Hospital to ensure maternal and newborn safety under Janani Suraksha Yojana (JSY).
""",
                content_hi="""# सुरक्षित मातृत्व और शिशु स्वास्थ्य

गर्भावस्था का पता चलते ही पहले तीन महीनों के भीतर आशा दीदी के पास पंजीकरण अवश्य कराएं।

### मुख्य बातें:
1. **कम से कम 4 एएनसी जांच**: 12वें हफ्ते, 20वें हफ्ते, 32वें हफ्ते और 36वें हफ्ते में जांच जरूर कराएं।
2. **आयरन-फोलिक एसिड की गोलियां**: खून की कमी से बचने के लिए कम से कम 180 दिनों तक रोजाना एक लाल गोली लें।
3. **टिटनेस का टीका**: समय पर टिटनेस के दो टीके अवश्य लगवाएं।
4. **अस्पताल में प्रसव**: प्रसव हमेशा सरकारी अस्पताल (PHC/CHC) में ही कराएं, जहां जननी सुरक्षा योजना के तहत मुफ्त एंबुलेंस और आर्थिक सहायता मिलती है।
""",
                content_te="""# సురక్షిత ప్రసవం మరియు మాతా శిశు సంరక్షణ

గర్భం దాల్చిన వెంటనే మొదటి మూడు నెలల్లోనే స్థానిక ఆశా లేదా ఏఎన్ఎం వద్ద పేరు నమోదు చేయించుకోవాలి.

### ముఖ్యమైన అంశాలు:
1. **4 సార్లు వైద్య పరీక్షలు (ANC)**: గర్భధారణ సమయంలో క్రమం తప్పకుండా 4 సార్లు ఆరోగ్య పరీక్షలు చేయించుకోవాలి.
2. **ఐరన్ మాత్రలు**: రక్తహీనత నివారణకు ప్రతిరోజూ ఐరన్ ఫోలిక్ యాసిడ్ మాత్రలు వాడాలి.
3. **టీటీ ఇంజక్షన్లు**: తల్లి, బిడ్డ రక్షణ కోసం 2 డోసుల టిటానస్ ఇంజక్షన్లు తీసుకోవాలి.
4. **ఆసుపత్రిలోనే ప్రసవం**: జననీ సురక్ష యోజన క్రింద సురక్షిత ప్రసవం కోసం ప్రభుత్వ ఆసుపత్రినే ఎంచుకోండి.
""",
                reference_source="National Health Mission (NHM) / Ministry of Health and Family Welfare",
                created_by_id=author_id,
            ),
        ]
        for a in kb_articles:
            db.add(a)
        db.commit()

    # 4. Seed Demonstration Translation & NER records for demo patients
    if db.query(TranslationHistory).count() == 0:
        logger.info("Seeding demonstration Translation & NER history...")
        patient = db.query(PatientProfile).first()
        doc = db.query(MedicalDocument).first()
        doctor = db.query(User).filter(User.role == "healthcare_worker").first()

        sample_original = (
            "Patient Name: Ramesh Kumar\n"
            "Diagnosis: Essential Hypertension and Mild Dyspnea.\n"
            "Prescription:\n"
            "1. Tab Amlodipine 5 mg PO Once daily in the morning.\n"
            "2. Tab Paracetamol 650 mg SOS for headache.\n"
            "Advice: Reduce dietary sodium intake. Walk 30 minutes daily. Follow up after 2 weeks."
        )

        sample_translated_hi = (
            "मरीज़ का नाम: रमेश कुमार\n"
            "रोग का निदान: उच्च रक्तचाप (हाई ब्लड प्रेशर) और सांस फूलने की समस्या।\n"
            "दवा का पर्चा:\n"
            "1. गोली एम्लोडिपिन 5 मिलीग्राम (Tab Amlodipine 5 mg) सुबह पानी के साथ दिन में एक बार लें।\n"
            "2. गोली पैरासिटामोल 650 मिलीग्राम (Tab Paracetamol 650 mg) सिरदर्द होने पर जरूरत पड़ने पर लें।\n"
            "सलाह: भोजन में नमक की मात्रा कम करें। रोजाना 30 मिनट टहलें। 2 सप्ताह बाद पुनः जांच के लिए आएं।"
        )

        sample_translated_te = (
            "రోగి పేరు: రమేష్ కుమార్\n"
            "రోగ నిర్ధారణ: అధిక రక్తపోటు (హైపర్ టెన్షన్) మరియు తేలికపాటి ఆయాసం.\n"
            "మందుల వివరాలు:\n"
            "1. మాత్ర ఆమ్లోడిపైన్ 5 మి.గ్రా (Tab Amlodipine 5 mg) ఉదయం నీటితో రోజుకు ఒకసారి తీసుకోండి.\n"
            "2. మాత్ర పారాసిటమాల్ 650 మి.గ్రా తలనొప్పి వచ్చినప్పుడు అవసరమైతే మాత్రమే తీసుకోండి.\n"
            "సలహా: ఆహారంలో ఉప్పు తగ్గించండి. రోజూ 30 నిమిషాలు నడవండి. 2 వారాల తర్వాత తిరిగి సంప్రదించండి."
        )

        db.add(TranslationHistory(
            patient_id=patient.id if patient else None,
            document_id=doc.id if doc else None,
            user_id=doctor.id if doctor else None,
            document_title="Prescription - Dr. Rajesh Sharma",
            document_type="prescription",
            source_language="English",
            target_language="Hindi",
            original_text=sample_original,
            translated_text=sample_translated_hi,
            confidence_score=0.96,
            translation_engine="AarogyaSeva Neural Translator",
            status="Completed",
        ))

        db.add(TranslationHistory(
            patient_id=patient.id if patient else None,
            document_id=doc.id if doc else None,
            user_id=doctor.id if doctor else None,
            document_title="Prescription - Dr. Rajesh Sharma",
            document_type="prescription",
            source_language="English",
            target_language="Telugu",
            original_text=sample_original,
            translated_text=sample_translated_te,
            confidence_score=0.95,
            translation_engine="AarogyaSeva Neural Translator",
            status="Completed",
        ))

        db.add(ExtractedMedicalEntity(
            patient_id=patient.id if patient else None,
            document_id=doc.id if doc else None,
            user_id=doctor.id if doctor else None,
            source_type="prescription",
            source_text=sample_original,
            diseases_json=json.dumps(["Hypertension", "Dyspnea"]),
            medications_json=json.dumps([
                {
                    "name": "Amlodipine",
                    "dosage": "5 mg",
                    "frequency": "Once daily",
                    "route": "Oral"
                },
                {
                    "name": "Paracetamol",
                    "dosage": "650 mg",
                    "frequency": "As needed (SOS)",
                    "route": "Oral"
                }
            ]),
            treatment_instructions_json=json.dumps([
                "Take Amlodipine 5 mg PO Once daily in the morning",
                "Reduce dietary sodium intake",
                "Walk 30 minutes daily",
                "Follow up after 2 weeks"
            ]),
            symptoms_json=json.dumps(["Dyspnea", "Headache"]),
            medical_terms_json=json.dumps(["Hypertension", "Dyspnea", "PO", "SOS"]),
            total_entities_count=4,
            confidence_score=0.95,
        ))

        db.commit()
        logger.info("Demonstration Translation & Entity records created successfully!")
