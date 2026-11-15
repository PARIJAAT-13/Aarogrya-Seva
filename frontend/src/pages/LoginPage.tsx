import React, { useState } from 'react';
import { useAuth, SUPPORTED_LANGUAGES } from '../context/AuthContext';
import {
  HeartPulse,
  Lock,
  Mail,
  User,
  AlertCircle,
  Loader2,
  Shield,
  Stethoscope,
  Sparkles,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, demoLogin, registerPatient, registerWorker } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register_patient' | 'register_worker'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Patient Register state
  const [pEmail, setPEmail] = useState('');
  const [pPassword, setPPassword] = useState('');
  const [pFullName, setPFullName] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pDob, setPDob] = useState('1990-01-01');
  const [pGender, setPGender] = useState('Male');
  const [pVillage, setPVillage] = useState('Rampur');
  const [pDistrict, setPDistrict] = useState('Sitapur');
  const [pState, setPState] = useState('Uttar Pradesh');
  const [pLanguage, setPLanguage] = useState('Hindi');

  // Worker Register state
  const [wEmail, setWEmail] = useState('');
  const [wPassword, setWPassword] = useState('');
  const [wFullName, setWFullName] = useState('');
  const [wPhone, setWPhone] = useState('');
  const [wQual, setWQual] = useState('MBBS');
  const [wFacility, setWFacility] = useState('Primary Health Centre (PHC) Rampur');
  const [wDesignation, setWDesignation] = useState('Medical Officer');
  const [wLanguage, setWLanguage] = useState('Hindi');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDemoLogin = async (role: 'admin' | 'healthcare_worker' | 'patient') => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      await demoLogin(role);
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed. Check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      await login(loginEmail.trim().toLowerCase(), loginPassword);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      await registerPatient({
        email: pEmail.trim(),
        password: pPassword,
        full_name: pFullName.trim(),
        phone_number: pPhone.trim(),
        date_of_birth: pDob,
        gender: pGender,
        village: pVillage.trim(),
        district: pDistrict.trim(),
        state: pState.trim(),
        preferred_language: pLanguage,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkerRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      await registerWorker({
        email: wEmail.trim(),
        password: wPassword,
        full_name: wFullName.trim(),
        phone_number: wPhone.trim(),
        qualification: wQual.trim(),
        healthcare_facility: wFacility.trim(),
        designation: wDesignation.trim(),
        preferred_language: wLanguage,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background ambient gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#A879E8]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#E7D4AE]/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#352447] text-white shadow-soft-lg mb-4 border border-[#241731] relative group">
          <HeartPulse className="w-8 h-8 text-[#A879E8]" />
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#E7D4AE] border-2 border-[#352447]"></div>
        </div>
        <h2 className="text-3xl font-black text-[#171923] tracking-tight">
          Aarogya<span className="text-[#A879E8]">Seva</span>
        </h2>
        <div className="mt-1 flex items-center justify-center gap-2 text-xs font-semibold text-[#858392]">
          <span>Rural Health Information System</span>
        </div>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-soft-lg rounded-3xl border border-[#E9DDF8]">
          {/* Quick Demo 1-Click Evaluator strip */}
          <div className="mb-6 p-4 bg-[#FAF9FC] rounded-2xl border border-[#E9DDF8]">
            <div className="text-[11px] font-extrabold text-[#352447] uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#A879E8]" />
                1-Click Quick Demo Login
              </span>
              <span className="text-[10px] text-[#352447] font-bold bg-[#E9DDF8] px-2.5 py-0.5 rounded-full border border-[#D5BEF4]">
                Pre-configured
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('patient')}
                disabled={isLoading}
                className="py-2.5 px-2 bg-[#F8F3EA] hover:bg-[#F2E7D5] border border-[#E7D4AE] rounded-xl text-[11px] font-bold text-[#8A6729] flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer hover:-translate-y-0.5"
              >
                <User className="w-3.5 h-3.5 text-[#B89759]" />
                <span>Patient</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('healthcare_worker')}
                disabled={isLoading}
                className="py-2.5 px-2 bg-[#E9DDF8] hover:bg-[#DDD0EE] border border-[#D5BEF4] rounded-xl text-[11px] font-bold text-[#352447] flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer hover:-translate-y-0.5"
              >
                <Stethoscope className="w-3.5 h-3.5 text-[#A879E8]" />
                <span>Practitioner</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
                className="py-2.5 px-2 bg-[#352447] hover:bg-[#261833] rounded-xl text-[11px] font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer hover:-translate-y-0.5"
              >
                <Shield className="w-3.5 h-3.5 text-[#E7D4AE]" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Form Tabs */}
          <div className="flex border-b border-[#E9DDF8] mb-6">
            <button
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
              }}
              className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${
                activeTab === 'login'
                  ? 'border-[#A879E8] text-[#352447]'
                  : 'border-transparent text-[#858392] hover:text-[#171923]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('register_patient');
                setErrorMsg('');
              }}
              className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${
                activeTab === 'register_patient'
                  ? 'border-[#A879E8] text-[#352447]'
                  : 'border-transparent text-[#858392] hover:text-[#171923]'
              }`}
            >
              Patient Sign Up
            </button>
            <button
              onClick={() => {
                setActiveTab('register_worker');
                setErrorMsg('');
              }}
              className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${
                activeTab === 'register_worker'
                  ? 'border-[#A879E8] text-[#352447]'
                  : 'border-transparent text-[#858392] hover:text-[#171923]'
              }`}
            >
              Worker Sign Up
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#171923] mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#858392] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="doctor@phc.in or patient@rural.in"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#171923] mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#858392] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#A879E8] to-[#915BDB] hover:from-[#9563D6] hover:to-[#834EC5] text-white font-bold rounded-xl shadow-soft hover:shadow-glow-orchid transition-all flex items-center justify-center gap-2 mt-3 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Lock className="w-4 h-4 text-white" />}
                <span>Sign In to Healthcare Console</span>
              </button>
            </form>
          )}

          {/* TAB 2: PATIENT REGISTRATION */}
          {activeTab === 'register_patient' && (
            <form onSubmit={handlePatientRegisterSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#171923] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={pFullName}
                    onChange={(e) => setPFullName(e.target.value)}
                    placeholder="Ramesh Kumar"
                    className="w-full px-3 py-2 bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#171923] mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={pPhone}
                    onChange={(e) => setPPhone(e.target.value)}
                    placeholder="+91 94150 12345"
                    className="w-full px-3 py-2 bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#171923] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={pEmail}
                    onChange={(e) => setPEmail(e.target.value)}
                    placeholder="patient@rural.in"
                    className="w-full px-3 py-2 bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#171923] mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={pPassword}
                    onChange={(e) => setPPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#171923] mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={pDob}
                    onChange={(e) => setPDob(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#171923] mb-1">Gender</label>
                  <select
                    value={pGender}
                    onChange={(e) => setPGender(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#171923] mb-1">Language</label>
                  <select
                    value={pLanguage}
                    onChange={(e) => setPLanguage(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.native}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#171923] mb-1">Village *</label>
                  <input
                    type="text"
                    required
                    value={pVillage}
                    onChange={(e) => setPVillage(e.target.value)}
                    placeholder="Rampur"
                    className="w-full px-3 py-2 bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#171923] mb-1">District *</label>
                  <input
                    type="text"
                    required
                    value={pDistrict}
                    onChange={(e) => setPDistrict(e.target.value)}
                    placeholder="Sitapur"
                    className="w-full px-3 py-2 bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#171923] mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={pState}
                    onChange={(e) => setPState(e.target.value)}
                    placeholder="Uttar Pradesh"
                    className="w-full px-3 py-2 bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#A879E8] to-[#915BDB] hover:from-[#9563D6] hover:to-[#834EC5] text-white font-bold rounded-xl shadow-soft transition-all flex items-center justify-center gap-2 mt-3 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <User className="w-4 h-4 text-white" />}
                <span>Create Patient Profile</span>
              </button>
            </form>
          )}

          {/* TAB 3: WORKER REGISTRATION */}
          {activeTab === 'register_worker' && (
            <form onSubmit={handleWorkerRegisterSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#171923] mb-1">Practitioner Full Name *</label>
                  <input
                    type="text"
                    required
                    value={wFullName}
                    onChange={(e) => setWFullName(e.target.value)}
                    placeholder="Dr. Rajesh Sharma"
                    className="w-full px-3 py-2 bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#171923] mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={wPhone}
                    onChange={(e) => setWPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#171923] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={wEmail}
                    onChange={(e) => setWEmail(e.target.value)}
                    placeholder="doctor@phc.in"
                    className="w-full px-3 py-2 bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#171923] mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={wPassword}
                    onChange={(e) => setWPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#171923] mb-1">Qualification *</label>
                  <input
                    type="text"
                    required
                    value={wQual}
                    onChange={(e) => setWQual(e.target.value)}
                    placeholder="MBBS, BAMS, GNM, ASHA"
                    className="w-full px-3 py-2 bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#171923] mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    value={wDesignation}
                    onChange={(e) => setWDesignation(e.target.value)}
                    placeholder="Medical Officer, Staff Nurse, CHO"
                    className="w-full px-3 py-2 bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#171923] mb-1">Healthcare Facility *</label>
                <input
                  type="text"
                  required
                  value={wFacility}
                  onChange={(e) => setWFacility(e.target.value)}
                  placeholder="Primary Health Centre (PHC) Rampur"
                  className="w-full px-3 py-2 bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#A879E8] to-[#915BDB] hover:from-[#9563D6] hover:to-[#834EC5] text-white font-bold rounded-xl shadow-soft transition-all flex items-center justify-center gap-2 mt-3 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Stethoscope className="w-4 h-4 text-white" />}
                <span>Enroll Healthcare Practitioner</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
