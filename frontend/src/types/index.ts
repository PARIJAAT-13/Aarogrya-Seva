export type UserRole = 'patient' | 'healthcare_worker' | 'admin';

export interface UserSummary {
  id: number;
  email: string;
  role: UserRole;
  is_active: boolean;
  full_name?: string;
  preferred_language?: string;
  facility_or_village?: string;
  profile_id?: number;
}

export interface Patient {
  id: number;
  user_id: number;
  email?: string;
  full_name: string;
  phone_number: string;
  date_of_birth?: string;
  gender: string;
  address?: string;
  village: string;
  district: string;
  state: string;
  preferred_language: string;
  blood_group?: string;
  emergency_contact?: string;
  medical_documents_count?: number;
  prescriptions_count?: number;
  created_at: string;
  updated_at: string;
}

export interface HealthcareWorker {
  id: number;
  user_id: number;
  email?: string;
  full_name: string;
  phone_number: string;
  qualification: string;
  healthcare_facility: string;
  designation: string;
  license_number?: string;
  address?: string;
  preferred_language: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicalDocument {
  id: number;
  patient_id: number;
  patient_name?: string;
  uploaded_by_id?: number;
  uploaded_by_name?: string;
  document_type: 'prescription' | 'discharge_summary' | 'medical_report' | 'other';
  title: string;
  description?: string;
  file_name: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Prescription {
  id: number;
  patient_id: number;
  patient_name?: string;
  document_id?: number;
  document_title?: string;
  original_filename?: string;
  doctor_name: string;
  facility_name: string;
  prescription_date: string;
  diagnosis: string;
  medications_text: string;
  dosage_instructions?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DischargeSummary {
  id: number;
  patient_id: number;
  patient_name?: string;
  document_id?: number;
  document_title?: string;
  original_filename?: string;
  hospital_name: string;
  doctor_name: string;
  admission_date: string;
  discharge_date: string;
  admission_reason?: string;
  final_diagnosis: string;
  treatment_summary: string;
  discharge_advice: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalReport {
  id: number;
  patient_id: number;
  patient_name?: string;
  document_id?: number;
  document_title?: string;
  original_filename?: string;
  lab_name: string;
  report_type: string;
  test_date: string;
  key_findings: string;
  results_summary?: string;
  is_normal: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecord {
  id: number;
  patient_id: number;
  patient_name?: string;
  recorded_by_id?: number;
  recorded_by_name?: string;
  record_type: string;
  diagnosis_summary: string;
  symptoms: string;
  vital_signs?: string;
  clinical_notes?: string;
  treatment_plan?: string;
  record_date: string;
  created_at: string;
  updated_at: string;
}

export interface PatientHistoryItem {
  id: number;
  patient_id: number;
  event_type: string;
  title: string;
  description: string;
  event_date: string;
  recorded_by_id?: number;
  recorded_by_name?: string;
  metadata_json?: string;
  created_at: string;
}

export interface HealthcareArticle {
  id: number;
  author_id?: number;
  author_name?: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  language: string;
  read_time_minutes: number;
  is_published: boolean;
  tags?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_patients: number;
  total_healthcare_workers: number;
  total_medical_documents: number;
  total_prescriptions: number;
  total_discharge_summaries: number;
  total_medical_reports: number;
  total_articles: number;
  registration_trend: Array<{ month: string; patients: number; workers: number }>;
  document_distribution: Array<{ name: string; value: number; color?: string }>;
  recent_activities: Array<{
    id: number;
    action: string;
    resource_type?: string;
    details?: string;
    user_name?: string;
    user_role?: string;
    timestamp: string;
  }>;
  recent_documents: Array<{
    id: number;
    title: string;
    document_type: string;
    patient_name: string;
    original_filename: string;
    upload_date: string;
    file_size: number;
  }>;
}

export interface AdminUser {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  full_name?: string;
  facility_or_village?: string;
  created_at: string;
  updated_at: string;
}

// =========================================================================
// MILESTONE 2: AI MEDICAL ASSISTANT TYPES
// =========================================================================

export interface TextExtractionResult {
  document_id?: number;
  filename?: string;
  extracted_text: string;
  detected_language: string;
  confidence: number;
  page_count: number;
  method: string;
  warning?: string | null;
}

export interface TranslationRecord {
  id: number;
  patient_id?: number | null;
  patient_name?: string | null;
  document_id?: number | null;
  document_title?: string | null;
  document_type?: string | null;
  source_language: string;
  target_language: string;
  original_text: string;
  translated_text: string;
  confidence_score: number;
  status: string;
  engine?: string;
  created_at: string;
}

export interface SimplifiedTermItem {
  term: string;
  category: string;
  simple_explanation_en: string;
  simple_explanation_hi: string;
  simple_explanation_te: string;
  clinical_context?: string | null;
}

export interface SimplificationResult {
  original_text: string;
  simplified_text: string;
  target_language: string;
  identified_terms: SimplifiedTermItem[];
  preserved_elements: {
    medications: string[];
    dosages: string[];
  };
  medical_disclaimer: string;
}

export interface MedicationEntity {
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  duration?: string | null;
}

export interface MedicalEntityResult {
  id?: number;
  patient_id?: number | null;
  document_id?: number | null;
  diseases: string[];
  medications: MedicationEntity[];
  treatment_instructions: string[];
  symptoms?: string[];
  medical_terms?: string[];
  total_entities_count: number;
  confidence_score: number;
  created_at?: string;
}

export interface SymptomSummaryItem {
  id: number;
  symptom_name: string;
  symptom_name_hi?: string | null;
  symptom_name_te?: string | null;
  category: string;
  urgency_level: 'Low' | 'Moderate' | 'High / Urgent';
  description: string;
}

export interface SymptomDetail {
  id: number;
  symptom_name: string;
  symptom_name_hi?: string | null;
  symptom_name_te?: string | null;
  category: string;
  urgency_level: 'Low' | 'Moderate' | 'High / Urgent';
  description_en: string;
  description_hi?: string | null;
  description_te?: string | null;
  possible_causes_en: string;
  possible_causes_hi?: string | null;
  possible_causes_te?: string | null;
  self_care_advice_en?: string | null;
  self_care_advice_hi?: string | null;
  self_care_advice_te?: string | null;
  when_to_see_doctor_en: string;
  when_to_see_doctor_hi?: string | null;
  when_to_see_doctor_te?: string | null;
  related_faqs: Array<{ q: string; a: string }>;
  reference_source: string;
  medical_disclaimer: string;
}

export interface KnowledgeBaseArticle {
  id: number;
  title_en: string;
  title_hi?: string | null;
  title_te?: string | null;
  category: string;
  tags?: string | null;
  summary_en?: string | null;
  summary_hi?: string | null;
  summary_te?: string | null;
  content_en: string;
  content_hi?: string | null;
  content_te?: string | null;
  reference_source: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicalTermItem {
  id: number;
  term: string;
  category: string;
  simple_explanation_en: string;
  simple_explanation_hi: string;
  simple_explanation_te: string;
  clinical_context?: string | null;
  example_usage?: string | null;
}

export interface AIDashboardStats {
  total_documents_processed: number;
  total_translations: number;
  total_entities_extracted: number;
  supported_languages: string[];
  recent_translations: TranslationRecord[];
  recent_extractions: MedicalEntityResult[];
  knowledge_base_article_count: number;
  symptom_topics_count: number;
}


