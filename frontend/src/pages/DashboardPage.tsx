import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DashboardStats, Patient } from '../types';
import { MetricCard } from '../components/MetricCard';
import {
  Users,
  Stethoscope,
  ClipboardList,
  FolderOpen,
  Pill,
  Upload,
  UserPlus,
  PlusCircle,
  ArrowUpRight,
  Loader2,
  FileCheck,
  Activity,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface DashboardPageProps {
  onOpenUpload: () => void;
  onOpenPatientModal: () => void;
  onOpenPrescriptionModal: () => void;
  onOpenRecordModal: () => void;
  setActiveTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenUpload,
  onOpenPatientModal,
  onOpenPrescriptionModal,
  onOpenRecordModal,
  setActiveTab,
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const isPatient = user?.role === 'patient';
  const isWorkerOrAdmin = user?.role === 'healthcare_worker' || user?.role === 'admin';

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const statsPromise = api.getDashboardStats();
      const patientsPromise = isWorkerOrAdmin ? api.listPatients() : Promise.resolve({ items: [] });
      const [statsData, patientsData] = await Promise.all([statsPromise, patientsPromise]);
      setStats(statsData);
      setRecentPatients((patientsData.items || []).slice(0, 5));
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load clinical dashboard analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-14 h-14 rounded-2xl bg-[#E9DDF8] flex items-center justify-center mb-3 shadow-soft">
          <Loader2 className="w-7 h-7 animate-spin text-[#A879E8]" />
        </div>
        <p className="text-xs font-bold text-[#352447] tracking-wider uppercase">
          Synthesizing Clinical Intelligence...
        </p>
      </div>
    );
  }

  // Fintech-inspired healthcare palette: Electric Orchid, Deep Plum, Champagne, Soft Lavender
  const palettePieColors = ['#A879E8', '#352447', '#E7D4AE', '#C4A5F5', '#171923'];

  return (
    <div className="space-y-6">
      {/* Asymmetrical Hero / Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-white via-white to-[#F5F0FC] rounded-3xl border border-[#E9DDF8] p-6 sm:p-8 shadow-soft">
        {/* Subtle decorative gradient ambient blobs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#A879E8]/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-10 right-40 w-48 h-48 bg-[#E7D4AE]/20 rounded-full blur-xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-[#E9DDF8] text-[#352447] border border-[#D5BEF4] mb-3 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#A879E8]" />
              <span>Healthcare Information Platform</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#171923] tracking-tight">
              Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#352447] to-[#A879E8]">{user?.full_name || user?.email?.split('@')[0]}</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#858392] mt-2 leading-relaxed">
              {isPatient
                ? 'Your secure medical command centre. Access diagnostic records, prescription details, and verify health history in one click.'
                : 'Rural clinical operations and registry console. Monitor village patient records, verify clinical documentation, and coordinate community care.'}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-gradient-to-r from-[#A879E8] to-[#915BDB] hover:from-[#9563D6] hover:to-[#834EC5] text-white rounded-xl shadow-soft hover:shadow-glow-orchid transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-white" />
              <span>Upload Document</span>
            </button>

            {isWorkerOrAdmin && (
              <>
                <button
                  onClick={onOpenPatientModal}
                  className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold bg-white hover:bg-[#FAF9FC] text-[#352447] border border-[#E9DDF8] hover:border-[#A879E8] rounded-xl transition-all shadow-soft cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-[#A879E8]" />
                  <span>Register Patient</span>
                </button>
                <button
                  onClick={onOpenPrescriptionModal}
                  className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold bg-white hover:bg-[#FAF9FC] text-[#352447] border border-[#E9DDF8] hover:border-[#E7D4AE] rounded-xl transition-all shadow-soft cursor-pointer"
                >
                  <Pill className="w-4 h-4 text-[#B89759]" />
                  <span>New Prescription</span>
                </button>
                <button
                  onClick={onOpenRecordModal}
                  className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold bg-white hover:bg-[#FAF9FC] text-[#352447] border border-[#E9DDF8] rounded-xl transition-all shadow-soft cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-[#352447]" />
                  <span>Consultation Note</span>
                </button>
              </>
            )}

            {isPatient && (
              <>
                <button
                  onClick={() => setActiveTab('prescriptions')}
                  className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold bg-white hover:bg-[#FAF9FC] text-[#352447] border border-[#E9DDF8] rounded-xl transition-all shadow-soft cursor-pointer"
                >
                  <Pill className="w-4 h-4 text-[#B89759]" />
                  <span>View Prescriptions</span>
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold bg-white hover:bg-[#FAF9FC] text-[#352447] border border-[#E9DDF8] rounded-xl transition-all shadow-soft cursor-pointer"
                >
                  <FolderOpen className="w-4 h-4 text-[#A879E8]" />
                  <span>Clinical Records</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-200 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isWorkerOrAdmin ? (
          <>
            <MetricCard
              title="Registered Patients"
              value={stats?.total_patients ?? 0}
              subtitle="Rural registry census"
              icon={Users}
              variant="orchid"
              badge="Active Registry"
              onClick={() => setActiveTab('patients')}
            />
            <MetricCard
              title="Healthcare Workers"
              value={stats?.total_healthcare_workers ?? 0}
              subtitle="Physicians & field nurses"
              icon={Stethoscope}
              variant="plum"
              badge="Care Team"
              onClick={() => setActiveTab('workers')}
            />
            <MetricCard
              title="Prescriptions Issued"
              value={stats?.total_prescriptions ?? 0}
              subtitle="Verified treatment regimens"
              icon={ClipboardList}
              variant="champagne"
              badge="Clinical Records"
              onClick={() => setActiveTab('records')}
            />
            <MetricCard
              title="Medical Documents"
              value={stats?.total_medical_documents ?? 0}
              subtitle="Encrypted lab & chart files"
              icon={FolderOpen}
              variant="lavender"
              badge="Cloud Stored"
              onClick={() => setActiveTab('documents')}
            />
          </>
        ) : (
          <>
            <MetricCard
              title="Health Profile Status"
              value="Verified"
              subtitle={user?.facility_or_village || 'Primary Health Center'}
              icon={Users}
              variant="orchid"
              badge="Enrolled"
              onClick={() => setActiveTab('profile')}
            />
            <MetricCard
              title="Active Prescriptions"
              value={stats?.total_prescriptions ?? 0}
              subtitle="Medication schedule logs"
              icon={Pill}
              variant="champagne"
              badge="Authorized"
              onClick={() => setActiveTab('prescriptions')}
            />
            <MetricCard
              title="Medical Documents"
              value={stats?.total_medical_documents ?? 0}
              subtitle="Diagnostic scans & PDFs"
              icon={FolderOpen}
              variant="lavender"
              badge="Encrypted"
              onClick={() => setActiveTab('documents')}
            />
            <MetricCard
              title="Clinical Encounters"
              value={stats?.total_prescriptions ?? 0}
              subtitle="Documented doctor visits"
              icon={ClipboardList}
              variant="plum"
              badge="History"
              onClick={() => setActiveTab('records')}
            />
          </>
        )}
      </div>

      {/* Advanced Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#E9DDF8] shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-[#171923]">Healthcare Enrolment & Clinical Volume</h3>
                <span className="text-[10px] font-bold text-[#352447] bg-[#E9DDF8] px-2.5 py-0.5 rounded-full border border-[#D5BEF4]">
                  Live Telemetry
                </span>
              </div>
              <p className="text-xs text-[#858392] mt-0.5">Monthly trajectory of community patients and healthcare practitioner registrations</p>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-[#A879E8]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A879E8]"></span>
                Patients
              </span>
              <span className="flex items-center gap-1.5 font-bold text-[#352447]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#352447]"></span>
                Workers
              </span>
            </div>
          </div>

          <div className="h-68 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats?.registration_trend || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="orchidGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A879E8" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#A879E8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="plumGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#352447" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#352447" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#858392' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#858392' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171923',
                    borderRadius: '14px',
                    boxShadow: '0 8px 24px rgba(23, 25, 35, 0.25)',
                    border: '1px solid #352447',
                    fontSize: '12px',
                    color: '#FAF9FC',
                  }}
                  itemStyle={{ color: '#FAF9FC' }}
                />
                <Area
                  type="monotone"
                  dataKey="patients"
                  name="Patients"
                  stroke="#A879E8"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#orchidGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="workers"
                  name="Healthcare Workers"
                  stroke="#352447"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#plumGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clinical Document Distribution Chart */}
        <div className="bg-white p-6 rounded-3xl border border-[#E9DDF8] shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-extrabold text-[#171923]">Document Taxonomy</h3>
              <span className="text-[10px] font-bold text-[#8A6729] bg-[#F8F3EA] px-2 py-0.5 rounded-full border border-[#E7D4AE]">
                Classified
              </span>
            </div>
            <p className="text-xs text-[#858392]">Stored medical files by clinical classification</p>
          </div>

          <div className="h-60 w-full flex-1 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.document_distribution || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={5}
                >
                  {(stats?.document_distribution || []).map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={palettePieColors[index % palettePieColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171923',
                    borderRadius: '12px',
                    border: '1px solid #352447',
                    fontSize: '12px',
                    color: '#FAF9FC',
                  }}
                  itemStyle={{ color: '#FAF9FC' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section: Dual Column for Recent Documents & Recent Registrations / Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Recent Medical Documents */}
        <div className="bg-white p-6 rounded-3xl border border-[#E9DDF8] shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-[#171923]">Recent Clinical Documents</h3>
                <p className="text-xs text-[#858392]">Verified prescriptions, diagnostic records & discharge summaries</p>
              </div>
              <button
                onClick={() => setActiveTab('documents')}
                className="text-xs font-bold text-[#A879E8] hover:text-[#834EC5] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#FAF9FC]">
              {stats?.recent_documents && stats.recent_documents.length > 0 ? (
                stats.recent_documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="py-3 flex items-center justify-between hover:bg-[#FAF9FC] rounded-2xl px-2.5 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="p-2.5 rounded-xl bg-[#E9DDF8] text-[#352447] shrink-0 shadow-2xs">
                        <FileCheck className="w-4 h-4 text-[#352447]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#171923] truncate">{doc.title}</div>
                        <div className="text-[11px] text-[#858392] truncate mt-0.5">
                          Patient: <span className="font-semibold text-[#352447]">{doc.patient_name}</span> •{' '}
                          {doc.original_filename}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E9DDF8] text-[#352447] capitalize border border-[#D5BEF4]">
                        {doc.document_type.replace('_', ' ')}
                      </span>
                      <div className="text-[10px] text-[#858392] mt-1 font-medium">
                        {new Date(doc.upload_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-xs text-[#858392]">
                  No clinical documents stored. Click "Upload Document" to add files.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Patients or System Activity */}
        <div className="bg-white p-6 rounded-3xl border border-[#E9DDF8] shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-[#171923]">
                  {isWorkerOrAdmin ? 'Recent Patient Registrations' : 'Security & Event Audit Log'}
                </h3>
                <p className="text-xs text-[#858392]">
                  {isWorkerOrAdmin ? 'Newly enrolled village patients in healthcare registry' : 'Real-time authenticated clinical events'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#352447] bg-[#E9DDF8] px-2.5 py-0.5 rounded-full border border-[#D5BEF4]">
                <Activity className="w-3.5 h-3.5 text-[#A879E8]" />
                <span>Live Stream</span>
              </div>
            </div>

            {isWorkerOrAdmin && recentPatients.length > 0 ? (
              <div className="divide-y divide-[#FAF9FC]">
                {recentPatients.map((pat) => (
                  <div
                    key={pat.id}
                    className="py-3 flex items-center justify-between hover:bg-[#FAF9FC] rounded-2xl px-2.5 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A879E8] to-[#6E42AA] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-soft">
                        {pat.full_name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#171923] truncate">{pat.full_name}</div>
                        <div className="text-[11px] text-[#858392] truncate mt-0.5">
                          Village {pat.village}, {pat.district} • {pat.preferred_language}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F8F3EA] text-[#8A6729] border border-[#E7D4AE]">
                        {pat.gender}
                      </span>
                      <div className="text-[10px] text-[#858392] mt-1 font-mono">
                        #{pat.id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-[#FAF9FC]">
                {stats?.recent_activities && stats.recent_activities.length > 0 ? (
                  stats.recent_activities.slice(0, 5).map((act) => (
                    <div
                      key={act.id}
                      className="py-2.5 flex items-start justify-between text-xs hover:bg-[#FAF9FC] rounded-2xl px-2.5 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-[#171923] leading-snug">
                          <span className="font-bold text-[#352447]">{act.user_name || 'System'}</span>:{' '}
                          {act.details}
                        </div>
                        <div className="text-[10px] text-[#858392] mt-0.5 capitalize">
                          {act.action.replace(/_/g, ' ').toLowerCase()} • {act.user_role?.replace('_', ' ')}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-[#858392] shrink-0 ml-3">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-xs text-[#858392]">No recent system events logged.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
