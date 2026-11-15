import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { HealthcareWorker } from '../types';
import {
  Stethoscope,
  Search,
  Filter,
  Building2,
  Phone,
  Award,
  CheckCircle2,
  XCircle,
  Loader2,
  Shield,
} from 'lucide-react';

export const WorkersPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [workers, setWorkers] = useState<HealthcareWorker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('');

  const [toggleLoading, setToggleLoading] = useState<number | null>(null);

  const fetchWorkers = async () => {
    setIsLoading(true);
    try {
      const res = await api.listWorkers({
        search: searchVal || undefined,
        facility: facilityFilter || undefined,
      });
      setWorkers(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [searchVal, facilityFilter]);

  const handleToggleStatus = async (workerId: number) => {
    if (!isAdmin) return;
    setToggleLoading(workerId);
    try {
      await api.toggleWorkerStatus(workerId);
      await fetchWorkers();
    } catch (err) {
      console.error(err);
    } finally {
      setToggleLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#E9DDF8] shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-[#171923] flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#E9DDF8] text-[#352447]">
                <Stethoscope className="w-5 h-5 text-[#A879E8]" />
              </span>
              Clinical Staff & Health Workers
            </h2>
            <span className="text-[10px] font-bold text-[#352447] bg-[#E9DDF8] px-2.5 py-0.5 rounded-full border border-[#D5BEF4]">
              {workers.length} Practitioners
            </span>
          </div>
          <p className="text-xs text-[#858392] mt-1.5">
            Primary Health Centre (PHC) Medical Officers, Community Health Officers, Nurses & ASHA Cadre
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-[#E9DDF8] shadow-soft">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#858392]" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search by worker name, qualification, facility or designation..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] placeholder-[#858392]/70 focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8] transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <Filter className="w-3.5 h-3.5 text-[#858392]" />
          <select
            value={facilityFilter}
            onChange={(e) => setFacilityFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30"
          >
            <option value="">All Health Facilities</option>
            <option value="Primary Health Centre (PHC) Rampur">PHC Rampur</option>
            <option value="Sub-Health Centre Chandpur">Sub-Centre Chandpur</option>
            <option value="Community Health Centre (CHC) Balrampur">CHC Balrampur</option>
          </select>
        </div>
      </div>

      {/* Workers Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-14 bg-white rounded-3xl border border-[#E9DDF8] shadow-soft">
          <Loader2 className="w-8 h-8 animate-spin text-[#A879E8] mb-2" />
          <span className="text-xs font-bold text-[#352447]">Loading healthcare staff roster...</span>
        </div>
      ) : workers.length === 0 ? (
        <div className="text-center p-14 bg-white rounded-3xl border border-[#E9DDF8] shadow-soft">
          <div className="w-12 h-12 rounded-2xl bg-[#E9DDF8] text-[#352447] flex items-center justify-center mx-auto mb-3">
            <Stethoscope className="w-6 h-6 text-[#A879E8]" />
          </div>
          <h4 className="text-sm font-bold text-[#171923]">No Healthcare Workers Found</h4>
          <p className="text-xs text-[#858392] mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or facility filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {workers.map((w) => (
            <div
              key={w.id}
              className="bg-white rounded-3xl border border-[#E9DDF8] p-5 shadow-soft hover:shadow-soft-md hover:border-[#A879E8]/50 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#352447] to-[#51366D] text-white font-black flex items-center justify-center text-sm shadow-soft">
                      {w.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#171923] leading-tight group-hover:text-[#352447] transition-colors">{w.full_name}</h3>
                      <div className="text-[11px] font-bold text-[#A879E8] mt-0.5">{w.designation}</div>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                      w.is_active
                        ? 'bg-[#E9DDF8] text-[#352447] border border-[#D5BEF4]'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {w.is_active ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-[#A879E8]" /> Active
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" /> Inactive
                      </>
                    )}
                  </span>
                </div>

                {/* Details */}
                <div className="mt-4 space-y-2 text-xs text-[#858392]">
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-[#A879E8] shrink-0" />
                    <span>
                      Qualification: <strong className="text-[#352447]">{w.qualification}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-[#A879E8] shrink-0" />
                    <span className="truncate">{w.healthcare_facility}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#A879E8] shrink-0" />
                    <span>{w.phone_number}</span>
                  </div>
                  {w.license_number && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-[#8A6729]">License:</span>
                      <span className="font-mono text-[11px] text-[#171923]">{w.license_number}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions (Admin toggle) */}
              <div className="mt-5 pt-3.5 border-t border-[#FAF9FC] flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#858392]">{w.preferred_language || 'Hindi / English'}</span>
                {isAdmin && (
                  <button
                    onClick={() => handleToggleStatus(w.id)}
                    disabled={toggleLoading === w.id}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer ${
                      w.is_active
                        ? 'bg-[#F8F3EA] text-[#8A6729] hover:bg-[#F2E7D5] border border-[#E7D4AE]'
                        : 'bg-[#E9DDF8] text-[#352447] hover:bg-[#DDD0EE] border border-[#D5BEF4]'
                    }`}
                  >
                    {toggleLoading === w.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : w.is_active ? (
                      'Deactivate'
                    ) : (
                      'Activate'
                    )}
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
