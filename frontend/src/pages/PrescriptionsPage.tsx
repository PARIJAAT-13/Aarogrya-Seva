import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Prescription } from '../types';
import {
  Pill,
  Search,
  PlusCircle,
  Calendar,
  Building2,
  FileText,
  Loader2,
} from 'lucide-react';

interface PrescriptionsPageProps {
  onOpenNewPrescription: () => void;
  onViewDocumentById?: (docId: number) => void;
}

export const PrescriptionsPage: React.FC<PrescriptionsPageProps> = ({
  onOpenNewPrescription,
  onViewDocumentById,
}) => {
  const { user } = useAuth();
  const isWorkerOrAdmin = user?.role === 'healthcare_worker' || user?.role === 'admin';

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');

  const fetchPrescriptions = async () => {
    setIsLoading(true);
    try {
      const data = await api.listPrescriptions();
      setPrescriptions(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const filtered = prescriptions.filter((p) => {
    if (!searchVal) return true;
    const s = searchVal.toLowerCase();
    return (
      p.diagnosis.toLowerCase().includes(s) ||
      p.doctor_name.toLowerCase().includes(s) ||
      p.facility_name.toLowerCase().includes(s) ||
      (p.patient_name && p.patient_name.toLowerCase().includes(s)) ||
      p.medications_text.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#E9DDF8] shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-[#171923] flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#F8F3EA] text-[#8A6729]">
                <Pill className="w-5 h-5 text-[#B89759]" />
              </span>
              Prescriptions & Medication Management
            </h2>
            <span className="text-[10px] font-bold text-[#8A6729] bg-[#F8F3EA] px-2.5 py-0.5 rounded-full border border-[#E7D4AE]">
              {prescriptions.length} Regimens
            </span>
          </div>
          <p className="text-xs text-[#858392] mt-1.5">
            Active medication schedules, clinical dosages, dietary recommendations and doctor advice
          </p>
        </div>
        {isWorkerOrAdmin && (
          <button
            onClick={onOpenNewPrescription}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#A879E8] to-[#915BDB] hover:from-[#9563D6] hover:to-[#834EC5] rounded-xl shadow-soft hover:shadow-glow-orchid transition-all self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>New Prescription</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-[#E9DDF8] shadow-soft">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#858392]" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search prescriptions by diagnosis, doctor, medicine or patient..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] placeholder-[#858392]/70 focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8] transition-all"
          />
        </div>
      </div>

      {/* Prescriptions List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-14 bg-white rounded-3xl border border-[#E9DDF8] shadow-soft">
          <Loader2 className="w-8 h-8 animate-spin text-[#A879E8] mb-2" />
          <span className="text-xs font-bold text-[#352447]">Retrieving active prescriptions...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center p-14 bg-white rounded-3xl border border-[#E9DDF8] shadow-soft">
          <div className="w-12 h-12 rounded-2xl bg-[#F8F3EA] text-[#8A6729] flex items-center justify-center mx-auto mb-3">
            <Pill className="w-6 h-6 text-[#B89759]" />
          </div>
          <h4 className="text-sm font-bold text-[#171923]">No Prescriptions Found</h4>
          <p className="text-xs text-[#858392] mt-1">Prescriptions issued by doctors will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-3xl border border-[#E9DDF8] p-6 shadow-soft hover:shadow-soft-md hover:border-[#A879E8]/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F8F3EA] text-[#8A6729] border border-[#E7D4AE]">
                      Diagnosis: {p.diagnosis}
                    </span>
                    <h3 className="text-sm font-extrabold text-[#171923] mt-2 group-hover:text-[#352447] transition-colors">
                      Patient: {p.patient_name || `#${p.patient_id}`}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#858392]">
                    <Calendar className="w-3.5 h-3.5 text-[#A879E8]" />
                    <span>{p.prescription_date}</span>
                  </div>
                </div>

                <div className="mt-3.5 p-3.5 rounded-2xl bg-[#FAF9FC] border border-[#E9DDF8] font-mono text-xs text-[#171923] whitespace-pre-line leading-relaxed">
                  {p.medications_text}
                </div>

                {p.dosage_instructions && (
                  <div className="mt-3 text-xs text-[#858392]">
                    <strong className="text-[#352447]">Instructions:</strong> {p.dosage_instructions}
                  </div>
                )}

                {p.notes && (
                  <div className="mt-1 text-[11px] text-[#858392] italic">
                    Notes: {p.notes}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3.5 border-t border-[#FAF9FC] flex items-center justify-between text-xs text-[#858392]">
                <div className="flex items-center gap-1.5 truncate max-w-xs">
                  <Building2 className="w-3.5 h-3.5 text-[#A879E8] shrink-0" />
                  <span className="truncate">{p.doctor_name} • {p.facility_name}</span>
                </div>

                {p.document_id && onViewDocumentById && (
                  <button
                    onClick={() => onViewDocumentById(p.document_id!)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#352447] bg-[#E9DDF8] hover:bg-[#DDD0EE] rounded-xl transition-colors shrink-0 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#A879E8]" />
                    <span>View File</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
