import React, { useState } from 'react';
import { api } from '../services/api';
import { Patient, MedicalDocument } from '../types';
import { FileText, X, Save, AlertCircle, Loader2 } from 'lucide-react';

interface DischargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patients: Patient[];
  documents?: MedicalDocument[];
}

export const DischargeModal: React.FC<DischargeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  patients,
  documents = [],
}) => {
  const [patientId, setPatientId] = useState<number | ''>('');
  const [hospitalName, setHospitalName] = useState('District Hospital Sitapur');
  const [doctorName, setDoctorName] = useState('Dr. V. K. Gupta');
  const [admissionDate, setAdmissionDate] = useState('2026-11-01');
  const [dischargeDate, setDischargeDate] = useState('2026-11-05');
  const [admissionReason, setAdmissionReason] = useState('');
  const [finalDiagnosis, setFinalDiagnosis] = useState('');
  const [treatmentSummary, setTreatmentSummary] = useState('');
  const [dischargeAdvice, setDischargeAdvice] = useState('');
  const [documentId, setDocumentId] = useState<number | ''>('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
      await api.createDischargeSummary({
        patient_id: Number(patientId),
        document_id: documentId ? Number(documentId) : null,
        hospital_name: hospitalName.trim(),
        doctor_name: doctorName.trim(),
        admission_date: admissionDate,
        discharge_date: dischargeDate,
        admission_reason: admissionReason.trim() || undefined,
        final_diagnosis: finalDiagnosis.trim(),
        treatment_summary: treatmentSummary.trim(),
        discharge_advice: dischargeAdvice.trim(),
      });
      setIsLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create discharge summary.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171923]/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-soft-lg border border-[#E9DDF8] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#E9DDF8]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#E9DDF8] text-[#352447]">
              <FileText className="w-5 h-5 text-[#A879E8]" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#171923]">Hospital Discharge Summary</h3>
              <p className="text-xs text-[#858392]">Record inpatient stay, course in hospital, and discharge advice</p>
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
              <label className="block text-xs font-bold text-[#171923] mb-1.5">Hospital Name</label>
              <input
                type="text"
                required
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#171923] mb-1.5">Treating Physician</label>
              <input
                type="text"
                required
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#171923] mb-1.5">Admission Date</label>
              <input
                type="date"
                required
                value={admissionDate}
                onChange={(e) => setAdmissionDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#171923] mb-1.5">Discharge Date</label>
              <input
                type="date"
                required
                value={dischargeDate}
                onChange={(e) => setDischargeDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171923] mb-1.5">
              Final Diagnosis <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={finalDiagnosis}
              onChange={(e) => setFinalDiagnosis(e.target.value)}
              placeholder="e.g. Acute Gastroenteritis with Moderate Dehydration"
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171923] mb-1.5">
              Treatment Given During Hospitalization <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={treatmentSummary}
              onChange={(e) => setTreatmentSummary(e.target.value)}
              placeholder="IV Fluids, injectable antibiotics, monitoring..."
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171923] mb-1.5">
              Discharge Advice & Follow-up <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={dischargeAdvice}
              onChange={(e) => setDischargeAdvice(e.target.value)}
              placeholder="Drink boiled water, take prescribed medications for 5 days..."
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
              <span>Save Discharge Summary</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
