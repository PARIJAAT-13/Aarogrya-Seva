import React, { useState } from 'react';
import { useAuth, SUPPORTED_LANGUAGES } from '../context/AuthContext';
import {
  Search,
  Globe,
  User as UserIcon,
  Shield,
  LogOut,
  Check,
  Stethoscope,
  X,
  Menu,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  onSearch?: (query: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSearch,
  activeTab,
  setActiveTab,
  onToggleMobileMenu,
}) => {
  const { user, selectedLanguage, setLanguage, logout } = useAuth();
  const [searchVal, setSearchVal] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchVal);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#352447] text-white border border-[#241731] shadow-soft">
            <Shield className="w-3.5 h-3.5 text-[#E7D4AE]" />
            <span>Administrator</span>
          </span>
        );
      case 'healthcare_worker':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E9DDF8] text-[#352447] border border-[#D5BEF4] shadow-soft">
            <Stethoscope className="w-3.5 h-3.5 text-[#A879E8]" />
            <span>Health Practitioner</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F8F3EA] text-[#7B5C28] border border-[#E7D4AE] shadow-soft">
            <UserIcon className="w-3.5 h-3.5 text-[#B89759]" />
            <span>Patient Portal</span>
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-18 px-4 md:px-8 bg-white/90 backdrop-blur-md border-b border-[#E9DDF8] shadow-soft">
      {/* Search Bar & Mobile Trigger */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-[#352447] hover:bg-[#E9DDF8]/50 rounded-xl transition-colors cursor-pointer"
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#858392]" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
              if (onSearch) onSearch(e.target.value);
            }}
            placeholder="Search patients, medical records, clinical documents..."
            className="w-full pl-10 pr-9 py-2 text-xs md:text-sm bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] placeholder-[#858392]/70 focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8] transition-all"
          />
          {searchVal && (
            <button
              type="button"
              onClick={() => {
                setSearchVal('');
                if (onSearch) onSearch('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#858392] hover:text-[#171923] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 md:gap-3.5">
        {/* Role Badge */}
        {user && <div className="hidden sm:block">{getRoleBadge(user.role)}</div>}

        {/* Regional Language Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#352447] bg-[#FAF9FC] hover:bg-[#E9DDF8]/60 border border-[#E9DDF8] rounded-xl transition-all shadow-soft cursor-pointer"
            title="Select Regional Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#A879E8]" />
            <span>
              {SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage)?.native || selectedLanguage}
            </span>
            <ChevronDown className="w-3 h-3 text-[#858392]" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-[#E9DDF8] rounded-2xl shadow-soft-lg py-2 z-50">
              <div className="px-3.5 py-1.5 text-[10px] font-bold text-[#858392] uppercase tracking-wider">
                Language / भाषा
              </div>
              <div className="mt-1 max-h-56 overflow-y-auto divide-y divide-[#FAF9FC]">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors cursor-pointer ${
                      selectedLanguage === lang.code
                        ? 'bg-[#E9DDF8] text-[#352447] font-bold'
                        : 'text-[#171923] hover:bg-[#FAF9FC]'
                    }`}
                  >
                    <div>
                      <span className="font-semibold">{lang.native}</span>
                      <span className="text-[#858392] text-[10px] ml-1.5">({lang.name})</span>
                    </div>
                    {selectedLanguage === lang.code && <Check className="w-3.5 h-3.5 text-[#352447]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 pl-1.5 pr-2.5 bg-[#FAF9FC] hover:bg-[#E9DDF8]/50 border border-[#E9DDF8] rounded-xl transition-all shadow-soft cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#A879E8] to-[#E7D4AE] text-[#171923] flex items-center justify-center font-black text-xs shadow-soft">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-[#171923] leading-tight truncate max-w-[130px]">
                {user?.full_name || user?.email?.split('@')[0]}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-[#858392]" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-[#E9DDF8] rounded-2xl shadow-soft-lg py-2 z-50">
              <div className="px-4 py-2.5 border-b border-[#E9DDF8] bg-[#FAF9FC]/60">
                <div className="text-xs font-bold text-[#352447]">{user?.full_name || 'Healthcare Practitioner'}</div>
                <div className="text-[11px] text-[#858392] truncate">{user?.email}</div>
                <div className="text-[10px] font-bold text-[#A879E8] mt-1 capitalize tracking-wide">
                  {user?.role?.replace('_', ' ')}
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#171923] hover:bg-[#FAF9FC] text-left transition-colors cursor-pointer"
              >
                <UserIcon className="w-4 h-4 text-[#A879E8]" />
                <span>Profile Details</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#171923] hover:bg-[#FAF9FC] text-left transition-colors cursor-pointer"
              >
                <Globe className="w-4 h-4 text-[#A879E8]" />
                <span>Regional Settings</span>
              </button>
              <div className="my-1 border-t border-[#E9DDF8]" />
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 text-left transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
