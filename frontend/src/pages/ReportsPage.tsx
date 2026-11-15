import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { MedicalReport } from '../types';
import {
  FileCheck,
  Search,
  PlusCircle,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileText,
} from 'lucide-react';

interface ReportsPageProps {
  onOpenNewReport: () => void;
  onViewDocumentById?: (docId: number) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  onOpenNewReport,
  onViewDocumentById,
}) => {
  const { user } = useAuth();
  const isWorkerOrAdmin = user?.role === 'healthcare_worker' || user?.role === 'admin';

  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const data = await api.listMedicalReports();
      setReports(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filtered = reports.filter((r) => {
    if (!searchVal) return true;
    const q = searchVal.toLowerCase();
    return (
      r.report_type.toLowerCase().includes(q) ||
      r.lab_name.toLowerCase().includes(q) ||
      (r.patient_name && r.patient_name.toLowerCase().includes(q)) ||
      r.key_findings.toLowerCase().includes(q)
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
                <FileCheck className="w-5 h-5 text-[#A879E8]" />
              </span>
              Diagnostic & Lab Reports
            </h2>
            <span className="text-[10px] font-bold text-[#352447] bg-[#E9DDF8] px-2.5 py-0.5 rounded-full border border-[#D5BEF4]">
              {reports.length} Tests
            </span>
          </div>
          <p className="text-xs text-[#858392] mt-1.5">
            Pathology blood tests, imaging sonography, cardiograms and laboratory investigations
          </p>
        </div>
        {isWorkerOrAdmin && (
          <button
            onClick={onOpenNewReport}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#A879E8] to-[#915BDB] hover:from-[#9563D6] hover:to-[#834EC5] rounded-xl shadow-soft hover:shadow-glow-orchid transition-all self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>Record Lab Report</span>
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
            placeholder="Search reports by test type, lab name, or patient..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] placeholder-[#858392]/70 focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8] transition-all"
          />
        </div>
      </div>

      {/* Reports Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-14 bg-white rounded-3xl border border-[#E9DDF8] shadow-soft">
          <Loader2 className="w-8 h-8 animate-spin text-[#A879E8] mb-2" />
          <span className="text-xs font-bold text-[#352447]">Loading lab diagnostic reports...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center p-14 bg-white rounded-3xl border border-[#E9DDF8] shadow-soft">
          <div className="w-12 h-12 rounded-2xl bg-[#E9DDF8] text-[#352447] flex items-center justify-center mx-auto mb-3">
            <FileCheck className="w-6 h-6 text-[#A879E8]" />
          </div>
          <h4 className="text-sm font-bold text-[#171923]">No Medical Reports Found</h4>
          <p className="text-xs text-[#858392] mt-1">Diagnostic lab results will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl border border-[#E9DDF8] p-6 shadow-soft hover:shadow-soft-md hover:border-[#A879E8]/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E9DDF8] text-[#352447] border border-[#D5BEF4]">
                      {r.report_type}
                    </span>
                    <h3 className="text-sm font-extrabold text-[#171923] mt-2 group-hover:text-[#352447] transition-colors">
                      Patient: {r.patient_name || `#${r.patient_id}`}
                    </h3>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border ${
                      r.is_normal
                        ? 'bg-[#E9DDF8] text-[#352447] border-[#D5BEF4]'
                        : 'bg-[#F8F3EA] text-[#8A6729] border-[#E7D4AE]'
                    }`}
                  >
                    {r.is_normal ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-[#A879E8]" /> Normal
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3 h-3 text-[#8A6729]" /> Attention Req.
                      </>
                    )}
                  </span>
                </div>

                <div className="mt-3.5 p-3.5 rounded-2xl bg-[#FAF9FC] border border-[#E9DDF8] font-mono text-xs text-[#171923] whitespace-pre-line leading-relaxed">
                  {r.key_findings}
                </div>

                {r.results_summary && (
                  <div className="mt-3 text-xs text-[#858392]">
                    <strong className="text-[#352447]">Interpretation:</strong> {r.results_summary}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3.5 border-t border-[#FAF9FC] flex items-center justify-between text-xs text-[#858392]">
                <div className="flex items-center gap-1.5 truncate">
                  <Building2 className="w-3.5 h-3.5 text-[#A879E8] shrink-0" />
                  <span>{r.lab_name} • {r.test_date}</span>
                </div>

                {r.document_id && onViewDocumentById && (
                  <button
                    onClick={() => onViewDocumentById(r.document_id!)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#352447] bg-[#E9DDF8] hover:bg-[#DDD0EE] rounded-xl transition-colors shrink-0 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#A879E8]" />
                    <span>View Lab Doc</span>
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
