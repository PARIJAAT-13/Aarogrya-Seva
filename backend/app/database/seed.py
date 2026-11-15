import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.patient import PatientProfile
from app.models.worker import HealthcareWorkerProfile
from app.models.document import MedicalDocument, Prescription, DischargeSummary, MedicalReport
from app.models.medical_record import MedicalRecord, PatientHistory
from app.models.content import HealthcareContent
from app.models.activity import ActivityLog

logger = logging.getLogger("uvicorn.error")

def seed_database(db: Session):
    """Seed initial demonstration data if database is empty."""
    admin_exists = db.query(User).filter(User.email == "admin@ruralhealth.org").first()
    if admin_exists:
        return

    logger.info("Initializing AarogyaSeva database with verified seed data...")

    # 1. Admin Account
    admin = User(
        email="admin@ruralhealth.org",
        hashed_password=hash_password("Admin@12345"),
        role=UserRole.ADMIN.value,
        is_active=True,
    )
    db.add(admin)
    db.flush()

    # 2. Healthcare Workers
    worker1_user = User(
        email="dr.rajesh@phc.in",
        hashed_password=hash_password("Doctor@12345"),
        role=UserRole.HEALTHCARE_WORKER.value,
        is_active=True,
    )
    db.add(worker1_user)
    db.flush()

    worker1_profile = HealthcareWorkerProfile(
        user_id=worker1_user.id,
        full_name="Dr. Rajesh Sharma",
        phone_number="+91 98765 43210",
        qualification="MBBS, MD (Community Medicine)",
        healthcare_facility="Primary Health Centre (PHC) Rampur",
        designation="Medical Officer In-Charge",
        license_number="UP-MC-48291",
        address="PHC Staff Quarters, Main Road, Rampur",
        preferred_language="Hindi",
    )
    db.add(worker1_profile)

    worker2_user = User(
        email="sunita.devi@asha.in",
        hashed_password=hash_password("Asha@12345"),
        role=UserRole.HEALTHCARE_WORKER.value,
        is_active=True,
    )
    db.add(worker2_user)
    db.flush()

    worker2_profile = HealthcareWorkerProfile(
        user_id=worker2_user.id,
        full_name="Sunita Devi",
        phone_number="+91 98112 34567",
        qualification="ASHA Accredited Health Activist",
        healthcare_facility="Sub-Health Centre Chandpur",
        designation="Community Health Worker",
        license_number="ASHA-SIT-092",
        address="Village Chandpur, Block Sidhauli",
        preferred_language="Hindi",
    )
    db.add(worker2_profile)

    worker3_user = User(
        email="priya.patel@chc.in",
        hashed_password=hash_password("Nurse@12345"),
        role=UserRole.HEALTHCARE_WORKER.value,
        is_active=True,
    )
    db.add(worker3_user)
    db.flush()

    worker3_profile = HealthcareWorkerProfile(
        user_id=worker3_user.id,
        full_name="Priya Patel",
        phone_number="+91 97234 56789",
        qualification="B.Sc Nursing, GNM",
        healthcare_facility="Community Health Centre (CHC) Balrampur",
        designation="Senior Staff Nurse",
        license_number="NUR-UP-11204",
        address="CHC Campus, Hospital Road, Balrampur",
        preferred_language="English",
    )
    db.add(worker3_profile)
    db.flush()

    # 3. Rural Patients
    patient1_user = User(
        email="ramesh.kumar@rural.in",
        hashed_password=hash_password("Patient@12345"),
        role=UserRole.PATIENT.value,
        is_active=True,
    )
    db.add(patient1_user)
    db.flush()

    patient1 = PatientProfile(
        user_id=patient1_user.id,
        full_name="Ramesh Kumar",
        phone_number="+91 94150 12345",
        date_of_birth="1979-04-12",
        gender="Male",
        address="House 42, North Hamlet, Rampur Village",
        village="Rampur",
        district="Sitapur",
        state="Uttar Pradesh",
        preferred_language="Hindi",
        blood_group="B+",
        emergency_contact="Suresh Kumar (Brother) - +91 94150 99887",
    )
    db.add(patient1)

    patient2_user = User(
        email="lakshmi.devi@rural.in",
        hashed_password=hash_password("Patient@12345"),
        role=UserRole.PATIENT.value,
        is_active=True,
    )
    db.add(patient2_user)
    db.flush()

    patient2 = PatientProfile(
        user_id=patient2_user.id,
        full_name="Lakshmi Devi",
        phone_number="+91 94520 87654",
        date_of_birth="1996-08-20",
        gender="Female",
        address="Near Primary School, Chandpur Village",
        village="Chandpur",
        district="Sitapur",
        state="Uttar Pradesh",
        preferred_language="Hindi",
        blood_group="O+",
        emergency_contact="Mahesh Yadav (Husband) - +91 94520 11223",
    )
    db.add(patient2)

    patient3_user = User(
        email="venkat.rao@rural.in",
        hashed_password=hash_password("Patient@12345"),
        role=UserRole.PATIENT.value,
        is_active=True,
    )
    db.add(patient3_user)
    db.flush()

    patient3 = PatientProfile(
        user_id=patient3_user.id,
        full_name="Venkata Rao",
        phone_number="+91 98480 33445",
        date_of_birth="1968-11-05",
        gender="Male",
        address="Main Bazaar, Kothapeta",
        village="Kothapeta",
        district="Guntur",
        state="Andhra Pradesh",
        preferred_language="Telugu",
        blood_group="A+",
        emergency_contact="Anjali Rao (Daughter) - +91 98480 77889",
    )
    db.add(patient3)
    db.flush()

    # 4. Prescriptions
    rx1 = Prescription(
        patient_id=patient1.id,
        doctor_name="Dr. Rajesh Sharma",
        facility_name="PHC Rampur",
        prescription_date="2026-10-15",
        diagnosis="Stage 1 Essential Hypertension & Mild Dyslipidemia",
        medications_text="1. Tab. Amlodipine 5mg - 1 tablet once daily morning after food\n2. Tab. Telmisartan 40mg - 1 tablet once daily morning\n3. Tab. Atorvastatin 10mg - 1 tablet at bedtime",
        dosage_instructions="Take regularly with warm water. Avoid high salt pickles, papad and fried foods.",
        notes="Blood pressure checkup recommended after 3 weeks at PHC or Sub-centre.",
    )
    db.add(rx1)

    rx2 = Prescription(
        patient_id=patient2.id,
        doctor_name="Dr. Rajesh Sharma",
        facility_name="PHC Rampur",
        prescription_date="2026-10-22",
        diagnosis="Second Trimester Antenatal Routine Supplementation (24 Weeks)",
        medications_text="1. Tab. Iron & Folic Acid (IFA Red) - 1 tablet daily after lunch with lemon water\n2. Tab. Calcium 500mg + Vit D3 - 1 tablet twice daily after morning & dinner meals",
        dosage_instructions="Do not take iron and calcium together. Maintain 2 hours gap between them.",
        notes="Next antenatal checkup with ASHA worker Sunita Devi on 2026-11-20.",
    )
    db.add(rx2)

    rx3 = Prescription(
        patient_id=patient3.id,
        doctor_name="Dr. K. Srinivas",
        facility_name="CHC Guntur Rural",
        prescription_date="2026-11-02",
        diagnosis="Type 2 Diabetes Mellitus with Mild Neuropathy",
        medications_text="1. Tab. Metformin 500mg - 1 tablet twice daily with meals\n2. Tab. Glimepiride 1mg - 1 tablet before breakfast\n3. Cap. Methylcobalamin 1500mcg - 1 capsule once daily",
        dosage_instructions="Monitor fasting and post-prandial blood sugar levels every 2 weeks.",
        notes="Daily 30 minutes brisk walking advised. Keep feet dry and inspected.",
    )
    db.add(rx3)

    # 5. Discharge Summaries
    ds1 = DischargeSummary(
        patient_id=patient1.id,
        hospital_name="District Hospital Sitapur",
        doctor_name="Dr. V. K. Gupta (Civil Surgeon)",
        admission_date="2026-09-04",
        discharge_date="2026-09-07",
        admission_reason="Acute gastroenteritis with moderate dehydration and muscle cramps",
        final_diagnosis="Acute Infectious Gastroenteritis (Recovered)",
        treatment_summary="Intravenous Ringer Lactate 3 litres, IV Ondansetron, Oral Rehydration Salt (ORS) solution, oral Ciprofloxacin 500mg BD for 5 days, probiotic spores.",
        discharge_advice="Drink boiled and cooled water only. Continue ORS if loose stools persist. Soft khichdi and curd diet for 3 days.",
    )
    db.add(ds1)

    # 6. Medical Reports
    mr1 = MedicalReport(
        patient_id=patient1.id,
        lab_name="District Central Pathology Lab Sitapur",
        report_type="Complete Blood Count (CBC) & Lipid Panel",
        test_date="2026-10-14",
        key_findings="Hemoglobin: 13.8 g/dL (Normal: 13.0-17.0)\nWBC: 6,800 /uL (Normal: 4,000-11,000)\nPlatelets: 240,000 /uL\nTotal Cholesterol: 198 mg/dL (Desirable < 200)\nTriglycerides: 162 mg/dL (Borderline High)",
        results_summary="Hemogram within normal limits. Mild borderline triglyceride elevation; dietary counseling advised.",
        is_normal=True,
    )
    db.add(mr1)

    mr2 = MedicalReport(
        patient_id=patient2.id,
        lab_name="Community Health Centre Ultrasound Unit",
        report_type="Obstetric Level II Ultrasound (24 Weeks)",
        test_date="2026-10-20",
        key_findings="Single live intrauterine fetus in cephalic presentation.\nFetal Heart Rate: 142 bpm (Regular)\nPlacenta: Anterior, Upper segment, Grade I maturity\nAmniotic Fluid Index (AFI): 13.5 cm (Normal)\nEstimated Fetal Weight: 680 grams\nNo gross congenital anomalies identified.",
        results_summary="Normal second trimester fetal development corresponding to 24 weeks gestation.",
        is_normal=True,
    )
    db.add(mr2)

    mr3 = MedicalReport(
        patient_id=patient3.id,
        lab_name="Aarogya Diagnostic Centre Guntur",
        report_type="Glycated Hemoglobin (HbA1c) & Renal Profile",
        test_date="2026-11-01",
        key_findings="Fasting Plasma Glucose: 138 mg/dL (Normal: 70-99)\nPost-Prandial Blood Sugar: 182 mg/dL (Normal: < 140)\nHbA1c: 7.4% (Target: < 7.0%)\nSerum Creatinine: 0.9 mg/dL (Normal: 0.7-1.2)\nBlood Urea: 26 mg/dL",
        results_summary="Sub-optimal glycemic control indicating Type 2 Diabetes; kidney function parameters are normal.",
        is_normal=False,
    )
    db.add(mr3)

    # 7. Clinical Records
    cr1 = MedicalRecord(
        patient_id=patient1.id,
        recorded_by_id=worker1_user.id,
        record_type="General Checkup",
        diagnosis_summary="Hypertension Follow-up Checkup",
        symptoms="Occasional mild morning headache, fatigue after manual farm work. Denies chest pain or breathlessness.",
        vital_signs="BP: 136/86 mmHg, Pulse: 76 bpm, Temp: 98.4 F, SpO2: 98%, Weight: 68 kg",
        clinical_notes="Blood pressure improved compared to previous reading (154/96). Patient taking Amlodipine regularly.",
        treatment_plan="Continue current anti-hypertensive medication. Follow up after 1 month or if headaches increase.",
        record_date="2026-10-15",
    )
    db.add(cr1)

    cr2 = MedicalRecord(
        patient_id=patient2.id,
        recorded_by_id=worker2_user.id,
        record_type="Antenatal Care",
        diagnosis_summary="ANC Visit 2 - Sub-centre Village Visit",
        symptoms="Mild morning nausea resolved. Fetal movements well appreciated by mother. No ankle swelling.",
        vital_signs="BP: 112/74 mmHg, Pulse: 80 bpm, Temp: 98.6 F, Fundal Height: 24 weeks, Weight: 52 kg",
        clinical_notes="Provided 100 IFA tablets and Calcium strip. Advised high protein dietary sources including pulses and seasonal greens.",
        treatment_plan="Continue daily IFA and Calcium. Schedule Tetanus Toxoid (TT-2) booster next week.",
        record_date="2026-10-22",
    )
    db.add(cr2)

    # 8. Patient History Events
    h1 = PatientHistory(
        patient_id=patient1.id,
        recorded_by_id=worker1_user.id,
        event_type="Clinical Consultation",
        title="Hypertension Evaluation & Prescription",
        description="Prescribed Amlodipine 5mg and Telmisartan 40mg. Advised low salt diet.",
        event_date="2026-10-15",
    )
    db.add(h1)

    h2 = PatientHistory(
        patient_id=patient1.id,
        recorded_by_id=admin.id,
        event_type="Hospital Discharge",
        title="Discharge from District Hospital Sitapur",
        description="Completed inpatient treatment for acute gastroenteritis. Fully stabilized.",
        event_date="2026-09-07",
    )
    db.add(h2)

    h3 = PatientHistory(
        patient_id=patient2.id,
        recorded_by_id=worker2_user.id,
        event_type="Antenatal Care",
        title="Second Trimester ANC Checkup",
        description="Health parameters stable, ultrasound confirmed normal fetal development.",
        event_date="2026-10-22",
    )
    db.add(h3)

    # 9. Healthcare Educational Content (Section 13 categories)
    articles = [
        HealthcareContent(
            author_id=admin.id,
            title="Essential Nutrition & Health Care During Pregnancy",
            category="Maternal Health",
            summary="A comprehensive nutritional guide for expectant mothers in rural communities, emphasizing locally available foods, iron supplements, and warning signs.",
            content="""# Essential Nutrition & Care During Pregnancy

A healthy pregnancy begins with proper nourishment and regular health checkups. Expectant mothers in rural communities can achieve optimal health using affordable, locally available foods.

### 1. Key Dietary Recommendations
- **Green Leafy Vegetables**: Spinach (Palak), Fenugreek (Methi), and Drumstick leaves (Moringa) are exceptionally rich in iron and folates.
- **Pulses and Legumes**: Daily intake of lentils (daal), chickpeas (chana), and sprouted beans provides essential proteins for fetal organ development.
- **Dairy and Calcium**: Milk, buttermilk (chaas), and curd support fetal bone development.
- **Seasonal Fruits**: Guava, amla, papaya (ripe only), and oranges supply vital Vitamin C to maximize iron absorption.

### 2. Medication Discipline
- **Iron & Folic Acid (IFA)**: Take one red IFA tablet daily starting from the second trimester. Avoid taking iron with tea or milk.
- **Calcium Supplements**: Take calcium tablets separately with meals, ensuring a 2-hour interval from iron tablets.

### 3. Critical Warning Signs
Seek immediate attention at your nearest PHC or Sub-Centre if you experience:
- Severe headache with blurred vision
- Sudden swelling of hands, feet, or face
- Unexplained bleeding or fluid discharge
- Absence of fetal movements for more than 4 hours
""",
            language="English",
            read_time_minutes=4,
            is_published=True,
            tags="maternal, pregnancy, nutrition, IFA, rural health",
        ),
        HealthcareContent(
            author_id=admin.id,
            title="Safe Drinking Water & Prevention of Waterborne Diseases",
            category="Preventive Healthcare",
            summary="Practical guidelines for rural households to purify drinking water, prevent cholera, diarrhea, and jaundice, and maintain sanitary water storage.",
            content="""# Safe Drinking Water & Waterborne Disease Prevention

Contaminated water is the leading cause of preventable illnesses such as acute diarrhea, typhoid, and hepatitis in rural communities.

### 1. Simple Methods to Purify Water at Home
1. **Boiling**: Rolling boil for at least 3-5 minutes kills 99.9% of bacteria, viruses, and parasites. Allow water to cool naturally inside a covered vessel.
2. **Chlorine Tablets**: Add one chlorine/halazone tablet per 20 litres of clear water; wait 30 minutes before drinking.
3. **Three-Pot Settling Method**: Filter turbid water through a clean cotton cloth before purification.

### 2. Safe Water Storage
- Always store drinking water in elevated, covered containers equipped with a tap or dedicated long-handled ladle.
- Never dip hands directly into the storage pot.
- Clean water vessels with salt and clean water every 2 days.

### 3. Immediate Care for Diarrhea
- Prepare **Oral Rehydration Salts (ORS)**: Dissolve 1 sachet in 1 litre of clean drinking water. Drink small sips frequently.
- For children, administer Zinc syrup/tablets for 14 days as advised by your local ASHA or ANM.
""",
            language="English",
            read_time_minutes=3,
            is_published=True,
            tags="water, sanitation, diarrhea, prevention, hygiene",
        ),
        HealthcareContent(
            author_id=admin.id,
            title="Complete Immunization Guide for Infants and Young Children",
            category="Child Healthcare",
            summary="A clear overview of the national immunization schedule from birth to 5 years, explaining vaccines against polio, measles, tuberculosis, and hepatitis.",
            content="""# Complete Immunization Guide for Infants & Children

Vaccines protect infants against life-threatening childhood illnesses. Every child is entitled to free immunizations at government Sub-Centres and Anganwadi centres.

### 1. Key Vaccination Milestones
- **At Birth**: BCG (Tuberculosis), OPV-0 (Oral Polio), Hepatitis B birth dose.
- **6, 10, and 14 Weeks**: Pentavalent vaccine (Diphtheria, Pertussis, Tetanus, Hepatitis B, Hib), Rotavirus vaccine, Inactivated Polio (IPV), Pneumococcal (PCV).
- **9-12 Months**: Measles-Rubella (MR-1), Vitamin A 1st dose, Japanese Encephalitis (endemic regions).
- **16-24 Months**: MR-2, DPT booster, OPV booster.
- **5-6 Years**: DPT 2nd booster.

### 2. After-Vaccination Care
- Mild fever and soreness at the injection site are completely normal signs that the child's immune system is responding.
- Apply a cold, damp cloth to the injection site; do not massage or apply oils.
- Keep the immunization card (MCP card) safely for school admissions and records.
""",
            language="English",
            read_time_minutes=4,
            is_published=True,
            tags="child health, immunization, vaccines, anganwadi, pediatrics",
        ),
        HealthcareContent(
            author_id=admin.id,
            title="Managing High Blood Pressure & Joint Health in Older Adults",
            category="Elderly Care",
            summary="Guidance for elderly individuals and rural caregivers on managing hypertension, arthritis, fall prevention, and routine health maintenance.",
            content="""# Managing Blood Pressure & Joint Health in the Elderly

As our village elders age, managing silent conditions such as hypertension and osteoarthritis ensures active and fulfilling lives.

### 1. Hypertension (High Blood Pressure)
- Hypertension is often called the 'silent killer' because it seldom produces noticeable symptoms until severe.
- **Salt Reduction**: Limit salt intake to less than 1 teaspoon per day. Avoid salted fish, pickles, and packaged snacks.
- **Medication Compliance**: Never discontinue blood pressure tablets even if feeling completely fine without consulting a doctor.

### 2. Caring for Aging Joints
- Gentle daily movements: Morning walks and light joint stretches keep synovial fluid circulating.
- Warm compresses on aching knees ease stiffness during colder months.
- Avoid sitting cross-legged on the floor for extended periods if severe knee arthritis is present.

### 3. Fall Prevention in the Household
- Ensure pathways between the bed and bathroom are well-lit at night.
- Eliminate wet, slippery surfaces in courtyards and washrooms.
""",
            language="English",
            read_time_minutes=4,
            is_published=True,
            tags="elderly, geriatric, hypertension, arthritis, joint care",
        ),
        HealthcareContent(
            author_id=admin.id,
            title="Recognizing & Preventing Seasonal Fevers: Malaria & Dengue",
            category="Common Diseases",
            summary="How to differentiate between viral fever, malaria, and dengue, and simple environmental sanitation steps to eradicate mosquito breeding in villages.",
            content="""# Seasonal Fevers: Malaria & Dengue Awareness

During the post-monsoon months, stagnant water bodies in rural areas foster mosquito vectors responsible for Malaria and Dengue outbreaks.

### 1. Identifying the Warning Signs
- **Malaria**: Chills, high fever in recurring cycles (every 24-48 hours), intense sweating, and shivering.
- **Dengue**: Sudden high fever, severe headache, retro-orbital eye pain, intense joint/body aches ('breakbone fever'), and petechial skin rashes.

### 2. Critical Don'ts
- **DO NOT take Aspirin or Ibuprofen** for fever or body ache, as these thin the blood and can cause dangerous internal hemorrhaging in dengue.
- Use **Paracetamol only** for fever management.

### 3. Preventing Mosquito Breeding
- Inspect your homestead every Sunday (Dry Day): empty water from discarded tires, coconut shells, and overhead coolers.
- Sleep under insecticide-treated bed nets (ITNs).
- Cooperate with local healthcare workers during indoor residual spraying (IRS).
""",
            language="English",
            read_time_minutes=3,
            is_published=True,
            tags="malaria, dengue, fever, vector control, prevention",
        ),
        HealthcareContent(
            author_id=admin.id,
            title="Essential First Aid for Agricultural Cuts, Burns & Heatstroke",
            category="General Healthcare",
            summary="Life-saving first-aid techniques for rural agricultural workers dealing with sharp tool injuries, chemical fertilizer exposure, and extreme summer heat.",
            content="""# First Aid for Agricultural Cuts, Burns & Heat Exhaustion

Agricultural workers face unique environmental and occupational hazards during harvest and sowing seasons.

### 1. Sickle & Machine Cuts
1. Apply firm, direct pressure on the bleeding wound using a clean folded cloth or gauze for 5-10 minutes.
2. Elevate the injured limb above heart level if possible.
3. Wash with clean running water once bleeding slows.
4. **Never apply cow dung, mud, or ash** to wounds; this causes deadly Tetanus infection.
5. Receive a Tetanus Toxoid (TT) injection at the PHC within 24 hours.

### 2. Heatstroke Emergency
- Symptoms: Dry hot skin, confusion, cessation of sweating, dizziness in intense sunlight.
- Action: Immediately move the person into dense shade. Sponge body with room-temperature water. Loosen clothing and offer sips of ORS or salted lime water.
""",
            language="English",
            read_time_minutes=3,
            is_published=True,
            tags="first aid, farm safety, heatstroke, tetanus, emergency",
        ),
    ]

    for article in articles:
        db.add(article)

    # 10. Initial Activity Logs
    db.add(ActivityLog(user_id=admin.id, action="SYSTEM_INIT", resource_type="system", details="AarogyaSeva Platform Initialized with base records"))
    db.add(ActivityLog(user_id=admin.id, action="SEED_DATA", resource_type="database", details="Sample patients, workers, clinical records, and health articles generated"))

    db.commit()
    logger.info("AarogyaSeva database seeded successfully with comprehensive demonstration data!")

