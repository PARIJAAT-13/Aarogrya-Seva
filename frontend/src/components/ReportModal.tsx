import React, { useState } from 'react';
import { api } from '../services/api';
import { Patient, MedicalDocument } from '../types';
import { FileCheck, X, Save, AlertCircle, Loader2 } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patients: Patient[];
  documents?: MedicalDocument[];
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  patients,
  documents = [],
}) => {
  const [patientId, setPatientId] = useState<number | ''>(preselectedPatientIdOrDefault(patients));
  const [labName, setLabName] = useState('District Pathology Lab Sitapur');
  const [reportType, setReportType] = useState('Complete Blood Count (CBC)');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [keyFindings, setKeyFindings] = useState('');
  const [resultsSummary, setResultsSummary] = useState('');
  const [isNormal, setIsNormal] = useState(true);
  const [documentId, setDocumentId] = useState<number | ''>('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  function preselectedPatientIdOrDefault(pList: Patient[]) {
    return pList.length > 0 ? pList[0].id : '';
  }

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      setErrorMsg('Please select a patient.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    try {
      await api.createMedicalReport({
        patient_id: Number(patientId),
        document_id: documentId ? Number(documentId) : null,
        lab_name: labName.trim(),
        report_type: reportType.trim(),
        test_date: testDate,
        key_findings: keyFindings.trim(),
        results_summary: resultsSummary.trim() || undefined,
        is_normal: isNormal,
      });
      setIsLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save medical report.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171923]/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-soft-lg border border-[#E9DDF8] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#E9DDF8]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#E9DDF8] text-[#352447]">
              <FileCheck className="w-5 h-5 text-[#A879E8]" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#171923]">Record Medical Lab Report</h3>
              <p className="text-xs text-[#858392]">Record diagnostic lab results, parameters and clinical status</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#858392] hover:text-[#171923] rounded-lg hover:bg-[#FAF9FC] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 mt-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#171923] mb-1.5">
              Select Patient <span className="text-red-500">*</span>
            </label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              required
            >
              <option value="">-- Choose Patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.village}) - #{p.id}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#171923] mb-1.5">
                Diagnostic Lab Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#171923] mb-1.5">
                Report / Test Type <span className="text-red-500">*</span>
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              >
                <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                <option value="Obstetric Ultrasound (USG)">Obstetric Ultrasound (USG)</option>
                <option value="Blood Glucose (HbA1c / FBS)">Blood Glucose (HbA1c / FBS)</option>
                <option value="Lipid Profile">Lipid Profile</option>
                <option value="Renal Function Test (KFT)">Renal Function Test (KFT)</option>
                <option value="Liver Function Test (LFT)">Liver Function Test (LFT)</option>
                <option value="Chest X-Ray">Chest X-Ray</option>
                <option value="Electrocardiogram (ECG)">Electrocardiogram (ECG)</option>
                <option value="Urine Routine & Microscopic">Urine Routine & Microscopic</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#171923] mb-1.5">
                Test Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#171923] mb-1.5">Result Classification</label>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2 text-xs text-[#171923] font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="isNormal"
                    checked={isNormal}
                    onChange={() => setIsNormal(true)}
                    className="text-[#A879E8] focus:ring-[#A879E8]"
                  />
                  <span>Normal / Expected</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-[#8A6729] font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="isNormal"
                    checked={!isNormal}
                    onChange={() => setIsNormal(false)}
                    className="text-[#B89759] focus:ring-[#B89759]"
                  />
                  <span>Abnormal / Attention Required</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171923] mb-1.5">
              Key Diagnostic Findings <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={keyFindings}
              onChange={(e) => setKeyFindings(e.target.value)}
              placeholder="e.g. Hemoglobin 12.4 g/dL, Platelets 2.2 Lakhs, Fasting Sugar 110 mg/dL..."
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] font-mono focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171923] mb-1.5">
              Summary & Interpretation
            </label>
            <input
              type="text"
              value={resultsSummary}
              onChange={(e) => setResultsSummary(e.target.value)}
              placeholder="Brief summary for patient understanding"
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171923] mb-1.5">
              Link Uploaded Document (Optional)
            </label>
            <select
              value={documentId}
              onChange={(e) => setDocumentId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
            >
              <option value="">-- No Attached File --</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.original_filename})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E9DDF8]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 text-xs font-bold text-[#858392] hover:bg-[#FAF9FC] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#A879E8] to-[#915BDB] hover:from-[#9563D6] hover:to-[#834EC5] rounded-xl shadow-soft hover:shadow-glow-orchid transition-all cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Save className="w-4 h-4 text-white" />}
              <span>Save Medical Report</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
