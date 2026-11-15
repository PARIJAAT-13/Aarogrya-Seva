import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { MedicalRecord, Patient } from '../types';
import {
  ClipboardList,
  Calendar,
  User,
  PlusCircle,
  Search,
  Filter,
  Loader2,
} from 'lucide-react';

interface MedicalHistoryPageProps {
  onOpenNewRecord: () => void;
  patients: Patient[];
}

export const MedicalHistoryPage: React.FC<MedicalHistoryPageProps> = ({
  onOpenNewRecord,
  patients,
}) => {
  const { user } = useAuth();
  const isWorkerOrAdmin = user?.role === 'healthcare_worker' || user?.role === 'admin';

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState<number | ''>('');
  const [searchVal, setSearchVal] = useState('');

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const data = await api.listMedicalRecords(
        selectedPatientId ? Number(selectedPatientId) : undefined
      );
      setRecords(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedPatientId]);

  const filtered = records.filter((r) => {
    if (!searchVal) return true;
    const q = searchVal.toLowerCase();
    return (
      r.diagnosis_summary.toLowerCase().includes(q) ||
      r.symptoms.toLowerCase().includes(q) ||
      (r.patient_name && r.patient_name.toLowerCase().includes(q)) ||
      (r.clinical_notes && r.clinical_notes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#E9DDF8] shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-[#171923] flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#E9DDF8] text-[#352447]">
                <ClipboardList className="w-5 h-5 text-[#A879E8]" />
              </span>
              Clinical Consultations & Medical History
            </h2>
            <span className="text-[10px] font-bold text-[#352447] bg-[#E9DDF8] px-2.5 py-0.5 rounded-full border border-[#D5BEF4]">
              {records.length} Consultations
            </span>
          </div>
          <p className="text-xs text-[#858392] mt-1.5">
            Chronological log of clinical visits, vital signs, symptom evaluations and treatment plans
          </p>
        </div>
        {isWorkerOrAdmin && (
          <button
            onClick={onOpenNewRecord}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#A879E8] to-[#915BDB] hover:from-[#9563D6] hover:to-[#834EC5] rounded-xl shadow-soft hover:shadow-glow-orchid transition-all self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>Add Consultation Note</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-[#E9DDF8] shadow-soft">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#858392]" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search clinical notes by diagnosis, symptoms, or patient..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] placeholder-[#858392]/70 focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8] transition-all"
          />
        </div>

        {isWorkerOrAdmin && (
          <div className="flex items-center gap-2.5">
            <Filter className="w-3.5 h-3.5 text-[#858392]" />
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value ? Number(e.target.value) : '')}
              className="px-3 py-2 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30"
            >
              <option value="">All Patients</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.village})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Clinical Timeline Listing */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-14 bg-white rounded-3xl border border-[#E9DDF8] shadow-soft">
          <Loader2 className="w-8 h-8 animate-spin text-[#A879E8] mb-2" />
          <span className="text-xs font-bold text-[#352447]">Loading chronological records...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center p-14 bg-white rounded-3xl border border-[#E9DDF8] shadow-soft">
          <div className="w-12 h-12 rounded-2xl bg-[#E9DDF8] text-[#352447] flex items-center justify-center mx-auto mb-3">
            <ClipboardList className="w-6 h-6 text-[#A879E8]" />
          </div>
          <h4 className="text-sm font-bold text-[#171923]">No Clinical Records Found</h4>
          <p className="text-xs text-[#858392] mt-1">Consultation notes recorded by healthcare workers will appear here.</p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E9DDF8]">
          {filtered.map((r) => (
            <div key={r.id} className="relative">
              {/* Dot */}
              <div className="absolute -left-6 top-3 w-4 h-4 rounded-full bg-[#A879E8] ring-4 ring-[#E9DDF8] shadow-soft flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>

              {/* Card */}
              <div className="bg-white rounded-3xl border border-[#E9DDF8] p-6 shadow-soft hover:shadow-soft-md hover:border-[#A879E8]/50 transition-all group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#FAF9FC] gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E9DDF8] text-[#352447] border border-[#D5BEF4]">
                      {r.record_type}
                    </span>
                    <h3 className="text-sm font-extrabold text-[#171923] group-hover:text-[#352447] transition-colors">{r.diagnosis_summary}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#858392]">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#A879E8]" />
                      <span>Patient: <strong className="text-[#352447]">{r.patient_name || `#${r.patient_id}`}</strong></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#A879E8]" />
                      <span>{r.record_date}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div>
                    <span className="font-bold text-[#352447]">Symptoms Reported:</span>
                    <p className="text-[#858392] mt-1 leading-relaxed">{r.symptoms}</p>
                  </div>

                  {r.vital_signs && (
                    <div className="bg-[#FAF9FC] p-3.5 rounded-2xl border border-[#E9DDF8] font-mono text-[11px] text-[#171923]">
                      <strong className="text-[#352447]">Vitals:</strong> {r.vital_signs}
                    </div>
                  )}

                  {r.clinical_notes && (
                    <div>
                      <span className="font-bold text-[#352447]">Clinical Observations:</span>
                      <p className="text-[#858392] mt-1 leading-relaxed">{r.clinical_notes}</p>
                    </div>
                  )}

                  {r.treatment_plan && (
                    <div className="bg-[#E9DDF8]/70 p-3.5 rounded-2xl border border-[#D5BEF4] text-[#352447]">
                      <strong className="text-[#352447]">Treatment Plan:</strong> {r.treatment_plan}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#FAF9FC] flex items-center justify-between text-[11px] text-[#858392]">
                  <span>Recorded by: <strong className="text-[#352447]">{r.recorded_by_name || 'Healthcare Staff'}</strong></span>
                  <span className="font-mono text-[#858392]">Log #{r.id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
