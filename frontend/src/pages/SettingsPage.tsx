import React from 'react';
import { useAuth, SUPPORTED_LANGUAGES } from '../context/AuthContext';
import { Settings, Globe, Shield, Check, Database } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, selectedLanguage, setLanguage, demoLogin } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#E9DDF8] shadow-soft">
        <h2 className="text-xl font-black text-[#171923] flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-[#E9DDF8] text-[#352447]">
            <Settings className="w-5 h-5 text-[#A879E8]" />
          </span>
          Platform Settings & Language
        </h2>
        <p className="text-xs text-[#858392] mt-1.5">
          Configure regional language preferences, review connectivity, and access role evaluation shortcuts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language Selection Card */}
        <div className="bg-white rounded-3xl border border-[#E9DDF8] shadow-soft p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3.5 border-b border-[#FAF9FC]">
            <Globe className="w-4 h-4 text-[#A879E8]" />
            <h3 className="text-sm font-extrabold text-[#352447]">Regional Language Support</h3>
          </div>
          <p className="text-xs text-[#858392] leading-relaxed">
            Select your preferred regional language. Preferred language preferences are saved directly to your
            profile and applied across healthcare records, consultations, and educational health guides.
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-2">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#E9DDF8] border-[#A879E8] text-[#352447] font-bold shadow-soft'
                      : 'bg-[#FAF9FC] border-[#E9DDF8] text-[#171923] hover:bg-white'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{lang.native}</div>
                    <div className="text-[10px] text-[#858392]">{lang.name}</div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#A879E8] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Demo Role Switcher for Evaluators */}
        <div className="bg-white rounded-3xl border border-[#E9DDF8] shadow-soft p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3.5 border-b border-[#FAF9FC]">
            <Shield className="w-4 h-4 text-[#352447]" />
            <h3 className="text-sm font-extrabold text-[#352447]">Quick Role Switcher (Evaluation)</h3>
          </div>
          <p className="text-xs text-[#858392] leading-relaxed">
            Switch between the 3 official user roles instantly to test role-based access control and dashboards:
          </p>

          <div className="space-y-2.5 pt-1">
            <button
              onClick={() => demoLogin('patient')}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                user?.role === 'patient'
                  ? 'bg-[#F8F3EA] border-[#E7D4AE] text-[#8A6729] font-bold shadow-2xs'
                  : 'bg-[#FAF9FC] border-[#E9DDF8] text-[#171923] hover:bg-white'
              }`}
            >
              <div>
                <div className="font-bold text-[#171923]">Patient Account</div>
                <div className="text-[11px] text-[#858392]">ramesh.kumar@rural.in (Rampur village)</div>
              </div>
              <span className="text-[10px] bg-[#E7D4AE] text-[#8A6729] px-2.5 py-0.5 rounded-full font-bold">
                Patient Role
              </span>
            </button>

            <button
              onClick={() => demoLogin('healthcare_worker')}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                user?.role === 'healthcare_worker'
                  ? 'bg-[#E9DDF8] border-[#A879E8] text-[#352447] font-bold shadow-2xs'
                  : 'bg-[#FAF9FC] border-[#E9DDF8] text-[#171923] hover:bg-white'
              }`}
            >
              <div>
                <div className="font-bold text-[#171923]">Healthcare Worker Account</div>
                <div className="text-[11px] text-[#858392]">dr.rajesh@phc.in (PHC Medical Officer)</div>
              </div>
              <span className="text-[10px] bg-[#A879E8] text-white px-2.5 py-0.5 rounded-full font-bold">
                Doctor / Staff
              </span>
            </button>

            <button
              onClick={() => demoLogin('admin')}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                user?.role === 'admin'
                  ? 'bg-[#352447] border-[#241731] text-white font-bold shadow-2xs'
                  : 'bg-[#FAF9FC] border-[#E9DDF8] text-[#171923] hover:bg-white'
              }`}
            >
              <div>
                <div className={`font-bold ${user?.role === 'admin' ? 'text-white' : 'text-[#171923]'}`}>
                  Administrator Account
                </div>
                <div className={`text-[11px] ${user?.role === 'admin' ? 'text-white/80' : 'text-[#858392]'}`}>
                  admin@ruralhealth.org (Central Director)
                </div>
              </div>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                user?.role === 'admin' ? 'bg-[#E7D4AE] text-[#352447]' : 'bg-[#352447] text-white'
              }`}>
                Admin Role
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* System Information Card */}
      <div className="bg-white rounded-3xl border border-[#E9DDF8] shadow-soft p-6 space-y-3">
        <h3 className="text-sm font-extrabold text-[#352447] flex items-center gap-2 pb-3.5 border-b border-[#FAF9FC]">
          <Database className="w-4 h-4 text-[#A879E8]" />
          Technical Architecture Status
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-[#FAF9FC] rounded-2xl border border-[#E9DDF8]">
            <span className="text-[#858392] block text-[10px] uppercase font-bold">Database Engine</span>
            <span className="font-bold text-[#171923]">PostgreSQL / SQLAlchemy 2.0</span>
          </div>
          <div className="p-4 bg-[#FAF9FC] rounded-2xl border border-[#E9DDF8]">
            <span className="text-[#858392] block text-[10px] uppercase font-bold">Backend Framework</span>
            <span className="font-bold text-[#171923]">FastAPI REST + JWT Auth</span>
          </div>
          <div className="p-4 bg-[#FAF9FC] rounded-2xl border border-[#E9DDF8]">
            <span className="text-[#858392] block text-[10px] uppercase font-bold">Frontend Client</span>
            <span className="font-bold text-[#171923]">React + TypeScript + Vite</span>
          </div>
        </div>
      </div>
    </div>
  );
};
