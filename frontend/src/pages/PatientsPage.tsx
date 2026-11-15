import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Patient, PatientHistoryItem } from '../types';
import { SUPPORTED_LANGUAGES } from '../context/AuthContext';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Edit2,
  Loader2,
  X,
  History,
  Languages,
  Sparkles,
} from 'lucide-react';

interface PatientsPageProps {
  onOpenCreatePatient: () => void;
  onEditPatient: (patient: Patient) => void;
  onUploadForPatient: (patientId: number) => void;
}

export const PatientsPage: React.FC<PatientsPageProps> = ({
  onOpenCreatePatient,
  onEditPatient,
  onUploadForPatient,
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedGender, setSelectedGender] = useState('');

  // Selected patient for detailed history modal
  const [historyModalPatient, setHistoryModalPatient] = useState<Patient | null>(null);
  const [patientHistory, setPatientHistory] = useState<PatientHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const res = await api.listPatients({
        search: searchVal || undefined,
        language: selectedLanguage || undefined,
        gender: selectedGender || undefined,
      });
      setPatients(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [searchVal, selectedLanguage, selectedGender]);

  const openHistoryModal = async (patient: Patient) => {
    setHistoryModalPatient(patient);
    setIsHistoryLoading(true);
    try {
      const history = await api.getPatientHistory(patient.id);
      setPatientHistory(history || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E9DDF8] shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-[#171923] flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#E9DDF8] text-[#352447]">
                <Users className="w-5 h-5 text-[#A879E8]" />
              </span>
              Rural Patient Registry
            </h2>
            <span className="text-[10px] font-bold text-[#352447] bg-[#E9DDF8] px-2.5 py-0.5 rounded-full border border-[#D5BEF4]">
              {patients.length} Enrolled
            </span>
          </div>
          <p className="text-xs text-[#858392] mt-1.5">
            Manage demographic profiles, village locations, regional language preferences, and clinical records
          </p>
        </div>
        <button
          onClick={onOpenCreatePatient}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#A879E8] to-[#915BDB] hover:from-[#9563D6] hover:to-[#834EC5] rounded-xl shadow-soft hover:shadow-glow-orchid transition-all self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-white" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-[#E9DDF8] shadow-soft">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#858392]" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search by patient name, phone, village, or district..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] placeholder-[#858392]/70 focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8] transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <Filter className="w-3.5 h-3.5 text-[#858392]" />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-2 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30"
          >
            <option value="">All Languages</option>
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.native} ({l.name})
              </option>
            ))}
          </select>

          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="px-3 py-2 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30"
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Patients Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-14 bg-white rounded-3xl border border-[#E9DDF8] shadow-soft">
          <Loader2 className="w-8 h-8 animate-spin text-[#A879E8] mb-2" />
          <span className="text-xs font-bold text-[#352447]">Retrieving census profiles from registry...</span>
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center p-14 bg-white rounded-3xl border border-[#E9DDF8] shadow-soft">
          <div className="w-12 h-12 rounded-2xl bg-[#E9DDF8] text-[#352447] flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-[#A879E8]" />
          </div>
          <h4 className="text-sm font-bold text-[#171923]">No Patients Found</h4>
          <p className="text-xs text-[#858392] mt-1 max-w-sm mx-auto">
            Try adjusting your search query or language filter, or click "Register New Patient" above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {patients.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-3xl border border-[#E9DDF8] p-5 shadow-soft hover:shadow-soft-md hover:border-[#A879E8]/50 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#A879E8] to-[#6E42AA] text-white font-black flex items-center justify-center text-sm shadow-soft">
                      {p.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#171923] leading-tight group-hover:text-[#352447] transition-colors">{p.full_name}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-mono font-bold text-[#352447] bg-[#E9DDF8] px-2 py-0.5 rounded-full border border-[#D5BEF4]">
                          #{p.id}
                        </span>
                        <span className="text-[10px] font-semibold text-[#171923] bg-[#FAF9FC] px-2 py-0.5 rounded-full border border-[#E9DDF8]">
                          {p.gender}
                        </span>
                        {p.blood_group && (
                          <span className="text-[10px] font-bold text-[#8A6729] bg-[#F8F3EA] px-2 py-0.5 rounded-full border border-[#E7D4AE]">
                            {p.blood_group}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onEditPatient(p)}
                    className="p-1.5 text-[#858392] hover:text-[#352447] hover:bg-[#E9DDF8]/50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Patient Details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Details List */}
                <div className="mt-4 space-y-2 text-xs text-[#858392]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#A879E8] shrink-0" />
                    <span className="truncate">
                      Village {p.village}, {p.district}, {p.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#A879E8] shrink-0" />
                    <span>{p.phone_number}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Languages className="w-3.5 h-3.5 text-[#A879E8] shrink-0" />
                    <span>
                      Preferred: <strong className="text-[#352447]">{p.preferred_language}</strong>
                    </span>
                  </div>
                  {p.date_of_birth && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#A879E8] shrink-0" />
                      <span>DOB: {p.date_of_birth}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3.5 border-t border-[#FAF9FC] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#858392]">
                  <FileText className="w-3.5 h-3.5 text-[#A879E8]" />
                  <span>{p.medical_documents_count || 0} Documents</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openHistoryModal(p)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#352447] bg-[#FAF9FC] hover:bg-[#E9DDF8]/60 border border-[#E9DDF8] rounded-xl transition-all cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5 text-[#A879E8]" />
                    <span>History</span>
                  </button>
                  <button
                    onClick={() => onUploadForPatient(p.id)}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#A879E8] to-[#915BDB] hover:from-[#9563D6] hover:to-[#834EC5] rounded-xl shadow-2xs transition-all cursor-pointer"
                  >
                    Upload Doc
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient Medical History Modal */}
      {historyModalPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171923]/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-soft-lg border border-[#E9DDF8] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-[#E9DDF8]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#E9DDF8] text-[#352447]">
                  <History className="w-5 h-5 text-[#A879E8]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#171923]">
                    Medical History: {historyModalPatient.full_name}
                  </h3>
                  <p className="text-[11px] text-[#858392]">
                    Village {historyModalPatient.village} • #{historyModalPatient.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setHistoryModalPatient(null)}
                className="p-1.5 text-[#858392] hover:text-[#171923] rounded-lg hover:bg-[#FAF9FC] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1">
              {isHistoryLoading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-[#A879E8] mb-2" />
                  <span className="text-xs text-[#858392]">Loading history events...</span>
                </div>
              ) : patientHistory.length === 0 ? (
                <div className="text-center py-10 text-xs text-[#858392]">
                  No historical entries recorded for this patient.
                </div>
              ) : (
                patientHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-[#FAF9FC] border border-[#E9DDF8] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#352447]">{item.title}</span>
                      <span className="text-[10px] text-[#858392]">{item.event_date}</span>
                    </div>
                    {item.description && <p className="text-[#858392] leading-relaxed">{item.description}</p>}
                    <div className="text-[10px] text-[#A879E8] font-bold mt-1 uppercase">
                      Event Type: {item.event_type}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#E9DDF8] flex justify-end">
              <button
                onClick={() => setHistoryModalPatient(null)}
                className="px-4 py-2 text-xs font-bold text-[#352447] bg-[#E9DDF8] hover:bg-[#DDD0EE] rounded-xl transition-colors cursor-pointer"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
