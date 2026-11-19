const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const getToken = (): string | null => {
  return localStorage.getItem('aarogya_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('aarogya_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('aarogya_token');
  localStorage.removeItem('aarogya_user');
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is not FormData, default Content-Type to application/json
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const isAuthAttempt = endpoint.includes('/auth/login') || endpoint.includes('/auth/register');

  if (response.status === 401 && !isAuthAttempt) {
    removeToken();
    window.dispatchEvent(new Event('auth:unauthorized'));
    throw new Error('Session expired or unauthorized. Please log in again.');
  }

  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorJson.message || JSON.stringify(errorJson);
    } catch {
      errorDetail = await response.text() || response.statusText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  registerPatient: (data: any) => request<any>('/auth/register/patient', { method: 'POST', body: JSON.stringify(data) }),
  registerWorker: (data: any) => request<any>('/auth/register/healthcare-worker', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<any>('/auth/me'),
  updateProfile: (data: any) => request<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data: any) => request<any>('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),

  // Dashboard
  getDashboardStats: () => request<any>('/dashboard/stats'),

  // Patients
  listPatients: (params: { search?: string; language?: string; gender?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.language) q.append('language', params.language);
    if (params.gender) q.append('gender', params.gender);
    return request<any>(`/patients/?${q.toString()}`);
  },
  getPatient: (id: number) => request<any>(`/patients/${id}`),
  createPatient: (data: any) => request<any>('/patients/', { method: 'POST', body: JSON.stringify(data) }),
  updatePatient: (id: number, data: any) => request<any>(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getPatientHistory: (id: number) => request<any>(`/patients/${id}/history`),
  addPatientHistory: (id: number, data: any) => request<any>(`/patients/${id}/history`, { method: 'POST', body: JSON.stringify(data) }),

  // Healthcare Workers
  listWorkers: (params: { search?: string; facility?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.facility) q.append('facility', params.facility);
    return request<any>(`/healthcare-workers/?${q.toString()}`);
  },
  getWorker: (id: number) => request<any>(`/healthcare-workers/${id}`),
  createWorker: (data: any) => request<any>('/healthcare-workers/', { method: 'POST', body: JSON.stringify(data) }),
  updateWorker: (id: number, data: any) => request<any>(`/healthcare-workers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleWorkerStatus: (id: number) => request<any>(`/healthcare-workers/${id}/toggle-status`, { method: 'PATCH' }),

  // Medical Documents
  listDocuments: (params: { patient_id?: number; document_type?: string; search?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.patient_id) q.append('patient_id', params.patient_id.toString());
    if (params.document_type) q.append('document_type', params.document_type);
    if (params.search) q.append('search', params.search);
    return request<any>(`/medical-documents/?${q.toString()}`);
  },
  uploadDocument: (formData: FormData) => request<any>('/medical-documents/upload', { method: 'POST', body: formData }),
  getDocument: (id: number) => request<any>(`/medical-documents/${id}`),
  deleteDocument: (id: number) => request<any>(`/medical-documents/${id}`, { method: 'DELETE' }),
  getDocumentDownloadUrl: (id: number) => `${API_BASE}/medical-documents/${id}/download?token=${getToken()}`,
  getDocumentViewUrl: (id: number) => `${API_BASE}/medical-documents/${id}/view`,

  // Prescriptions
  listPrescriptions: (patientId?: number) => {
    const q = patientId ? `?patient_id=${patientId}` : '';
    return request<any>(`/prescriptions/${q}`);
  },
  createPrescription: (data: any) => request<any>('/prescriptions/', { method: 'POST', body: JSON.stringify(data) }),
  getPrescription: (id: number) => request<any>(`/prescriptions/${id}`),

  // Discharge Summaries
  listDischargeSummaries: (patientId?: number) => {
    const q = patientId ? `?patient_id=${patientId}` : '';
    return request<any>(`/discharge-summaries/${q}`);
  },
  createDischargeSummary: (data: any) => request<any>('/discharge-summaries/', { method: 'POST', body: JSON.stringify(data) }),
  getDischargeSummary: (id: number) => request<any>(`/discharge-summaries/${id}`),

  // Medical Reports
  listMedicalReports: (patientId?: number, reportType?: string) => {
    const q = new URLSearchParams();
    if (patientId) q.append('patient_id', patientId.toString());
    if (reportType) q.append('report_type', reportType);
    return request<any>(`/medical-reports/?${q.toString()}`);
  },
  createMedicalReport: (data: any) => request<any>('/medical-reports/', { method: 'POST', body: JSON.stringify(data) }),
  getMedicalReport: (id: number) => request<any>(`/medical-reports/${id}`),

  // Medical Records
  listMedicalRecords: (patientId?: number, recordType?: string) => {
    const q = new URLSearchParams();
    if (patientId) q.append('patient_id', patientId.toString());
    if (recordType) q.append('record_type', recordType);
    return request<any>(`/medical-records/?${q.toString()}`);
  },
  createMedicalRecord: (data: any) => request<any>('/medical-records/', { method: 'POST', body: JSON.stringify(data) }),
  getMedicalRecord: (id: number) => request<any>(`/medical-records/${id}`),

  // Healthcare Content
  listArticles: (params: { category?: string; language?: string; search?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.category) q.append('category', params.category);
    if (params.language) q.append('language', params.language);
    if (params.search) q.append('search', params.search);
    return request<any>(`/healthcare-content/?${q.toString()}`);
  },
  getArticle: (id: number) => request<any>(`/healthcare-content/${id}`),
  createArticle: (data: any) => request<any>('/healthcare-content/', { method: 'POST', body: JSON.stringify(data) }),
  updateArticle: (id: number, data: any) => request<any>(`/healthcare-content/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteArticle: (id: number) => request<any>(`/healthcare-content/${id}`, { method: 'DELETE' }),
  togglePublishArticle: (id: number) => request<any>(`/healthcare-content/${id}/publish`, { method: 'PATCH' }),

  // Users Management (Admin)
  listUsers: (role?: string) => {
    const q = role ? `?role=${role}` : '';
    return request<any>(`/users/${q}`);
  },
  toggleUserActive: (id: number) => request<any>(`/users/${id}/toggle-active`, { method: 'PATCH' }),
  getActivityLogs: (limit = 50) => request<any>(`/users/activity-logs?limit=${limit}`),

  // =========================================================================
  // MILESTONE 2: AI MEDICAL ASSISTANT ENDPOINTS
  // =========================================================================
  extractDocumentText: (formData: FormData) =>
    request<any>('/ai/extract-text', { method: 'POST', body: formData }),

  translateMedicalText: (data: {
    text: string;
    target_language: string;
    source_language?: string;
    patient_id?: number;
    document_id?: number;
    document_type?: string;
  }) => request<any>('/ai/translate', { method: 'POST', body: JSON.stringify(data) }),

  listTranslations: (params: { patient_id?: number; document_id?: number; limit?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.patient_id) q.append('patient_id', params.patient_id.toString());
    if (params.document_id) q.append('document_id', params.document_id.toString());
    if (params.limit) q.append('limit', params.limit.toString());
    return request<any>(`/ai/translations?${q.toString()}`);
  },

  getTranslation: (id: number) => request<any>(`/ai/translations/${id}`),

  simplifyMedicalText: (data: {
    text: string;
    target_language?: string;
    patient_id?: number;
    document_id?: number;
  }) => request<any>('/ai/simplify', { method: 'POST', body: JSON.stringify(data) }),

  extractEntities: (data: {
    text: string;
    patient_id?: number;
    document_id?: number;
    source_type?: string;
  }) => request<any>('/ai/extract-entities', { method: 'POST', body: JSON.stringify(data) }),

  listExtractedEntities: (params: { patient_id?: number; document_id?: number; limit?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.patient_id) q.append('patient_id', params.patient_id.toString());
    if (params.document_id) q.append('document_id', params.document_id.toString());
    if (params.limit) q.append('limit', params.limit.toString());
    return request<any>(`/ai/extracted-entities?${q.toString()}`);
  },

  listSymptoms: (params: { query?: string; category?: string; language?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.query) q.append('query', params.query);
    if (params.category) q.append('category', params.category);
    if (params.language) q.append('language', params.language);
    return request<any>(`/ai/symptoms?${q.toString()}`);
  },

  getSymptomDetail: (id: number) => request<any>(`/ai/symptoms/${id}`),

  listKnowledgeBase: (params: { query?: string; category?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.query) q.append('query', params.query);
    if (params.category) q.append('category', params.category);
    return request<any>(`/ai/knowledge-base?${q.toString()}`);
  },

  getKnowledgeBaseArticle: (id: number) => request<any>(`/ai/knowledge-base/${id}`),

  createKnowledgeBaseArticle: (data: any) =>
    request<any>('/ai/knowledge-base', { method: 'POST', body: JSON.stringify(data) }),

  updateKnowledgeBaseArticle: (id: number, data: any) =>
    request<any>(`/ai/knowledge-base/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteKnowledgeBaseArticle: (id: number) =>
    request<any>(`/ai/knowledge-base/${id}`, { method: 'DELETE' }),

  listTerminology: (params: { query?: string; category?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.query) q.append('query', params.query);
    if (params.category) q.append('category', params.category);
    return request<any>(`/ai/terminology?${q.toString()}`);
  },

  getAIDashboardStats: () => request<any>('/ai/stats'),
};

