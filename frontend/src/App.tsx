import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { WorkersPage } from './pages/WorkersPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { PrescriptionsPage } from './pages/PrescriptionsPage';
import { DischargePage } from './pages/DischargePage';
import { ReportsPage } from './pages/ReportsPage';
import { MedicalHistoryPage } from './pages/MedicalHistoryPage';
import { HealthcareContentPage } from './pages/HealthcareContentPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { UsersManagementPage } from './pages/UsersManagementPage';
import { LoginPage } from './pages/LoginPage';

// Modals
import { DocumentUploadModal } from './components/DocumentUploadModal';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { PatientModal } from './components/PatientModal';
import { PrescriptionModal } from './components/PrescriptionModal';
import { MedicalRecordModal } from './components/MedicalRecordModal';
import { DischargeModal } from './components/DischargeModal';
import { ReportModal } from './components/ReportModal';
import { ContentModal } from './components/ContentModal';
import { HelpSupportModal } from './components/HelpSupportModal';

import { api } from './services/api';
import { Patient, MedicalDocument, HealthcareArticle } from './types';
import { Loader2 } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cached patients and documents for modals
  const [patients, setPatients] = useState<Patient[]>([]);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);

  // Modal States
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadPreselectedPatientId, setUploadPreselectedPatientId] = useState<number | undefined>();

  const [viewingDocument, setViewingDocument] = useState<MedicalDocument | null>(null);

  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<HealthcareArticle | null>(null);

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const loadSupportingData = async () => {
    if (!user) return;
    try {
      if (user.role !== 'patient') {
        const pRes = await api.listPatients();
        setPatients(pRes.items || []);
      }
      const dRes = await api.listDocuments();
      setDocuments(dRes || []);
    } catch (e) {
      // Background load
    }
  };

  useEffect(() => {
    loadSupportingData();
  }, [user, activeTab]);

  // Ensure active tab is allowed for current user role on login/switch
  useEffect(() => {
    if (!user) return;
    const role = user.role;
    const allowedForPatient = ['dashboard', 'records', 'documents', 'prescriptions', 'discharge', 'reports', 'content', 'profile', 'settings'];
    const allowedForWorker = [...allowedForPatient, 'patients', 'workers'];
    
    if (role === 'patient' && !allowedForPatient.includes(activeTab)) {
      setActiveTab('dashboard');
    } else if (role === 'healthcare_worker' && !allowedForWorker.includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [user?.role, user?.id]);

  const handleViewDocById = async (docId: number) => {
    try {
      const doc = await api.getDocument(docId);
      setViewingDocument(doc);
    } catch (e) {
      alert('Could not open document.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9FC]">
        <div className="w-12 h-12 rounded-2xl bg-[#E9DDF8] flex items-center justify-center mb-3 shadow-soft">
          <Loader2 className="w-6 h-6 animate-spin text-[#A879E8]" />
        </div>
        <h3 className="text-sm font-bold text-[#171923] tracking-tight">AarogyaSeva Healthcare System</h3>
        <p className="text-xs text-[#858392] mt-1">Initializing secure clinical workspace...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen bg-[#FAF9FC] overflow-hidden font-sans">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenHelp={() => setIsHelpOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        mobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSearch={(q) => setSearchQuery(q)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Dynamic Content Pane */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardPage
                onOpenUpload={() => {
                  setUploadPreselectedPatientId(undefined);
                  setIsUploadOpen(true);
                }}
                onOpenPatientModal={() => {
                  setEditingPatient(null);
                  setIsPatientModalOpen(true);
                }}
                onOpenPrescriptionModal={() => setIsPrescriptionModalOpen(true)}
                onOpenRecordModal={() => setIsRecordModalOpen(true)}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'patients' && (
              <PatientsPage
                onOpenCreatePatient={() => {
                  setEditingPatient(null);
                  setIsPatientModalOpen(true);
                }}
                onEditPatient={(patient) => {
                  setEditingPatient(patient);
                  setIsPatientModalOpen(true);
                }}
                onUploadForPatient={(pId) => {
                  setUploadPreselectedPatientId(pId);
                  setIsUploadOpen(true);
                }}
              />
            )}

            {activeTab === 'workers' && <WorkersPage />}

            {activeTab === 'records' && (
              <MedicalHistoryPage
                onOpenNewRecord={() => setIsRecordModalOpen(true)}
                patients={patients}
              />
            )}

            {activeTab === 'documents' && (
              <DocumentsPage
                onOpenUpload={() => {
                  setUploadPreselectedPatientId(undefined);
                  setIsUploadOpen(true);
                }}
                onViewDocument={(doc) => setViewingDocument(doc)}
              />
            )}

            {activeTab === 'prescriptions' && (
              <PrescriptionsPage
                onOpenNewPrescription={() => setIsPrescriptionModalOpen(true)}
                onViewDocumentById={handleViewDocById}
              />
            )}

            {activeTab === 'discharge' && (
              <DischargePage
                onOpenNewDischarge={() => setIsDischargeModalOpen(true)}
                onViewDocumentById={handleViewDocById}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsPage
                onOpenNewReport={() => setIsReportModalOpen(true)}
                onViewDocumentById={handleViewDocById}
              />
            )}

            {activeTab === 'content' && (
              <HealthcareContentPage
                onOpenNewArticle={() => {
                  setEditingArticle(null);
                  setIsContentModalOpen(true);
                }}
                onEditArticle={(art) => {
                  setEditingArticle(art);
                  setIsContentModalOpen(true);
                }}
              />
            )}

            {activeTab === 'users' && <UsersManagementPage />}
            {activeTab === 'profile' && <ProfilePage />}
            {activeTab === 'settings' && <SettingsPage />}
          </div>
        </main>
      </div>

      {/* Reusable Modals */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          loadSupportingData();
        }}
        patients={patients}
        preselectedPatientId={uploadPreselectedPatientId}
      />

      <DocumentViewerModal
        document={viewingDocument}
        onClose={() => setViewingDocument(null)}
      />

      <PatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSuccess={() => {
          loadSupportingData();
        }}
        patientToEdit={editingPatient}
      />

      <PrescriptionModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        onSuccess={() => {
          loadSupportingData();
        }}
        patients={patients}
        documents={documents}
      />

      <MedicalRecordModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSuccess={() => {
          loadSupportingData();
        }}
        patients={patients}
      />

      <DischargeModal
        isOpen={isDischargeModalOpen}
        onClose={() => setIsDischargeModalOpen(false)}
        onSuccess={() => {
          loadSupportingData();
        }}
        patients={patients}
        documents={documents}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={() => {
          loadSupportingData();
        }}
        patients={patients}
        documents={documents}
      />

      <ContentModal
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        onSuccess={() => {
          loadSupportingData();
        }}
        articleToEdit={editingArticle}
      />

      <HelpSupportModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
