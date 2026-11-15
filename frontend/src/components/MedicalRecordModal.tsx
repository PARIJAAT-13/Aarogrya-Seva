import React, { useState } from 'react';
import { api } from '../services/api';
import { Patient } from '../types';
import { ClipboardList, X, Save, AlertCircle, Loader2 } from 'lucide-react';

interface MedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patients: Patient[];
  preselectedPatientId?: number;
}

export const MedicalRecordModal: React.FC<MedicalRecordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  patients,
  preselectedPatientId,
}) => {
  const [patientId, setPatientId] = useState<number | ''>(preselectedPatientId || '');
  const [recordType, setRecordType] = useState('General Checkup');
  const [diagnosisSummary, setDiagnosisSummary] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [vitalSigns, setVitalSigns] = useState('BP: 120/80 mmHg, Pulse: 72 bpm, Temp: 98.6 F, SpO2: 98%');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);

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
      await api.createMedicalRecord({
        patient_id: Number(patientId),
        record_type: recordType,
        diagnosis_summary: diagnosisSummary.trim(),
        symptoms: symptoms.trim(),
        vital_signs: vitalSigns.trim() || undefined,
        clinical_notes: clinicalNotes.trim() || undefined,
        treatment_plan: treatmentPlan.trim() || undefined,
        record_date: recordDate,
      });
      setIsLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record clinical entry.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171923]/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-soft-lg border border-[#E9DDF8] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#E9DDF8]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#E9DDF8] text-[#352447]">
              <ClipboardList className="w-5 h-5 text-[#A879E8]" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#171923]">Add Clinical Consultation Record</h3>
              <p className="text-xs text-[#858392]">Record symptoms, vitals and medical observations</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <label className="block text-xs font-bold text-[#171923] mb-1.5">Record Type</label>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              >
                <option value="General Checkup">General Checkup</option>
                <option value="Antenatal Care">Antenatal Care (ANC)</option>
                <option value="Follow-up Consultation">Follow-up Consultation</option>
                <option value="Immunization Visit">Immunization Visit</option>
                <option value="Emergency Care">Emergency Care</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#171923] mb-1.5">
                Diagnosis Summary <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={diagnosisSummary}
                onChange={(e) => setDiagnosisSummary(e.target.value)}
                placeholder="e.g. Mild Anemia & Seasonal Bronchitis"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#171923] mb-1.5">
                Consultation Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171923] mb-1.5">
              Patient Symptoms & Complaints <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe fever, cough, weakness, duration, pain location..."
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171923] mb-1.5">
              Vital Signs (Blood Pressure, Pulse, SpO2, Temperature)
            </label>
            <input
              type="text"
              value={vitalSigns}
              onChange={(e) => setVitalSigns(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] font-mono focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171923] mb-1.5">
              Clinical Observations & Notes
            </label>
            <textarea
              rows={2}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Auscultation, chest sounds, abdominal examination..."
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171923] mb-1.5">
              Treatment Plan / Next Visit
            </label>
            <input
              type="text"
              value={treatmentPlan}
              onChange={(e) => setTreatmentPlan(e.target.value)}
              placeholder="e.g. Prescribed antibiotics, review after 5 days"
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
            />
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
              <span>Save Clinical Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
