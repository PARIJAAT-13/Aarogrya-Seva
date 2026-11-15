import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DischargeSummary } from '../types';
import {
  FileText,
  Search,
  PlusCircle,
  Calendar,
  Building2,
  FileCheck,
  Loader2,
} from 'lucide-react';

interface DischargePageProps {
  onOpenNewDischarge: () => void;
  onViewDocumentById?: (docId: number) => void;
}

export const DischargePage: React.FC<DischargePageProps> = ({
  onOpenNewDischarge,
  onViewDocumentById,
}) => {
  const { user } = useAuth();
  const isWorkerOrAdmin = user?.role === 'healthcare_worker' || user?.role === 'admin';

  const [summaries, setSummaries] = useState<DischargeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');

  const fetchSummaries = async () => {
    setIsLoading(true);
    try {
      const data = await api.listDischargeSummaries();
      setSummaries(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  const filtered = summaries.filter((s) => {
    if (!searchVal) return true;
    const q = searchVal.toLowerCase();
    return (
      s.final_diagnosis.toLowerCase().includes(q) ||
      s.hospital_name.toLowerCase().includes(q) ||
      s.doctor_name.toLowerCase().includes(q) ||
      (s.patient_name && s.patient_name.toLowerCase().includes(q))
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
                <FileText className="w-5 h-5 text-[#A879E8]" />
              </span>
              Inpatient Discharge Summaries
            </h2>
            <span className="text-[10px] font-bold text-[#352447] bg-[#E9DDF8] px-2.5 py-0.5 rounded-full border border-[#D5BEF4]">
              {summaries.length} Summaries
            </span>
          </div>
          <p className="text-xs text-[#858392] mt-1.5">
            Inpatient hospital admission records, therapeutic procedures performed, and post-discharge recovery advice
          </p>
        </div>
        {isWorkerOrAdmin && (
          <button
            onClick={onOpenNewDischarge}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#A879E8] to-[#915BDB] hover:from-[#9563D6] hover:to-[#834EC5] rounded-xl shadow-soft hover:shadow-glow-orchid transition-all self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>New Discharge Summary</span>
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
            placeholder="Search discharge summaries by diagnosis, hospital, or patient..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] placeholder-[#858392]/70 focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8] transition-all"
          />
        </div>
      </div>

      {/* Summaries List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-14 bg-white rounded-3xl border border-[#E9DDF8] shadow-soft">
          <Loader2 className="w-8 h-8 animate-spin text-[#A879E8] mb-2" />
          <span className="text-xs font-bold text-[#352447]">Loading discharge summaries...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center p-14 bg-white rounded-3xl border border-[#E9DDF8] shadow-soft">
          <div className="w-12 h-12 rounded-2xl bg-[#E9DDF8] text-[#352447] flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6 text-[#A879E8]" />
          </div>
          <h4 className="text-sm font-bold text-[#171923]">No Discharge Summaries Found</h4>
          <p className="text-xs text-[#858392] mt-1">Inpatient discharge records will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-3xl border border-[#E9DDF8] p-6 shadow-soft hover:shadow-soft-md hover:border-[#A879E8]/50 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#FAF9FC] gap-2">
                <div>
                  <span className="text-xs font-bold text-[#352447] bg-[#E9DDF8] border border-[#D5BEF4] px-3 py-1 rounded-full">
                    {s.final_diagnosis}
                  </span>
                  <h3 className="text-sm font-extrabold text-[#171923] mt-2 group-hover:text-[#352447] transition-colors">
                    Patient: {s.patient_name || `#${s.patient_id}`}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#858392]">
                  <Calendar className="w-3.5 h-3.5 text-[#A879E8]" />
                  <span>
                    Admitted: <strong className="text-[#352447]">{s.admission_date}</strong> • Discharged: <strong className="text-[#352447]">{s.discharge_date}</strong>
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-[#FAF9FC] p-4 rounded-2xl border border-[#E9DDF8]">
                  <div className="font-bold text-[#352447] mb-1">Treatment Given:</div>
                  <p className="text-[#858392] whitespace-pre-line leading-relaxed">{s.treatment_summary}</p>
                </div>
                <div className="bg-[#F8F3EA] p-4 rounded-2xl border border-[#E7D4AE]">
                  <div className="font-bold text-[#8A6729] mb-1">Discharge Advice & Follow-up:</div>
                  <p className="text-[#171923] whitespace-pre-line leading-relaxed">{s.discharge_advice}</p>
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-[#FAF9FC] flex items-center justify-between text-xs text-[#858392]">
                <div className="flex items-center gap-1.5 truncate">
                  <Building2 className="w-3.5 h-3.5 text-[#A879E8] shrink-0" />
                  <span>{s.hospital_name} • Attending: {s.doctor_name}</span>
                </div>

                {s.document_id && onViewDocumentById && (
                  <button
                    onClick={() => onViewDocumentById(s.document_id!)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#352447] bg-[#E9DDF8] hover:bg-[#DDD0EE] rounded-xl transition-colors cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-[#A879E8]" />
                    <span>View Hospital File</span>
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
