import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  ClipboardList,
  Pill,
  FileText,
  FileCheck,
  FolderOpen,
  BookOpen,
  UserCircle,
  Settings,
  ShieldCheck,
  HelpCircle,
  LogOut,
  HeartPulse,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenHelp: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenHelp,
  isCollapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();
  const role = user?.role || 'patient';
  const isWorkerOrAdmin = role === 'healthcare_worker' || role === 'admin';
  const isAdmin = role === 'admin';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(isWorkerOrAdmin ? [{ id: 'patients', label: 'Patients Registry', icon: Users }] : []),
    ...(isWorkerOrAdmin ? [{ id: 'workers', label: 'Clinical Staff', icon: Stethoscope }] : []),
    { id: 'records', label: 'Medical Records', icon: ClipboardList },
    { id: 'documents', label: 'Clinical Documents', icon: FolderOpen },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { id: 'discharge', label: 'Discharge Summaries', icon: FileText },
    { id: 'reports', label: 'Lab & Diagnostic Reports', icon: FileCheck },
    { id: 'content', label: 'Health Knowledge', icon: BookOpen },
    ...(isAdmin ? [{ id: 'users', label: 'User Directory & Logs', icon: ShieldCheck }] : []),
    { id: 'profile', label: 'My Profile', icon: UserCircle },
    { id: 'settings', label: 'Preferences & Locale', icon: Settings },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  const roleLabelMap: Record<string, string> = {
    admin: 'System Admin',
    healthcare_worker: 'Health Practitioner',
    patient: 'Verified Patient',
  };

  const sidebarContent = (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-[#352447] text-white flex flex-col justify-between shrink-0 h-screen sticky top-0 transition-all duration-300 z-40 select-none shadow-soft-lg border-r border-[#241731]`}
    >
      {/* Brand Header */}
      <div className="flex flex-col min-h-0 flex-1">
        <div
          className={`flex items-center ${
            isCollapsed ? 'justify-center px-2' : 'justify-between px-5'
          } h-18 border-b border-white/10 shrink-0 bg-[#2C1C3C]/60 backdrop-blur-md`}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A879E8] to-[#6E42AA] text-white flex items-center justify-center font-bold shadow-soft relative group">
                <HeartPulse className="w-5 h-5 text-white" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#E7D4AE] border-2 border-[#352447]"></div>
              </div>
              <div>
                <div className="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
                  Aarogya<span className="text-[#A879E8]">Seva</span>
                </div>
                <div className="text-[10px] font-semibold text-[#E7D4AE] tracking-widest uppercase mt-0.5 flex items-center gap-1">
                  <span>Healthcare System</span>
                </div>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A879E8] to-[#6E42AA] text-white flex items-center justify-center font-bold shadow-soft">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={`hidden md:flex items-center justify-center p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ${
                isCollapsed ? 'mt-2' : ''
              }`}
              title={isCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
              aria-label={isCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}

          {/* Mobile Close Button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Primary Navigation Items */}
        <div className="p-3.5 space-y-1.5 overflow-y-auto flex-1">
          {!isCollapsed && (
            <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-[#E9DDF8]/60 uppercase tracking-widest flex items-center justify-between">
              <span>Navigation</span>
              <Sparkles className="w-3 h-3 text-[#E7D4AE]" />
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center cursor-pointer transition-all duration-200 ${
                  isCollapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3.5 py-2.5'
                } text-xs font-semibold rounded-xl ${
                  isActive
                    ? 'bg-gradient-to-r from-[#A879E8] to-[#915BDB] text-white shadow-soft-md shadow-[#A879E8]/20 font-bold'
                    : 'text-white/75 hover:text-white hover:bg-white/8 hover:translate-x-0.5'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-[#E9DDF8]/70'
                  }`}
                />
                {!isCollapsed && (
                  <span className="truncate tracking-tight">{item.label}</span>
                )}
                {!isCollapsed && isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#E7D4AE]"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: User Profile & Actions */}
      <div className="p-3.5 border-t border-white/10 space-y-2 shrink-0 bg-[#291A39]/90">
        {/* Compact User Profile */}
        {!isCollapsed ? (
          <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between gap-2.5 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A879E8] to-[#E7D4AE] text-[#171923] flex items-center justify-center font-bold text-xs shrink-0 shadow-soft">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate leading-tight">
                  {user?.full_name || user?.email?.split('@')[0]}
                </div>
                <div className="text-[10px] text-[#E7D4AE] font-semibold tracking-wider uppercase mt-0.5 truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A879E8]"></span>
                  <span>{roleLabelMap[role] || role}</span>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-white/50 hover:text-red-300 hover:bg-white/10 rounded-lg transition-colors shrink-0 cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A879E8] to-[#E7D4AE] text-[#171923] flex items-center justify-center font-bold text-xs shrink-0 shadow-soft"
              title={user?.full_name || 'Profile'}
            >
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <button
              onClick={logout}
              className="p-2 text-white/60 hover:text-red-300 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Help & Support Button */}
        <button
          onClick={() => {
            onOpenHelp();
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full flex items-center cursor-pointer ${
            isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2'
          } text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors`}
          title={isCollapsed ? 'Platform Support' : undefined}
        >
          <HelpCircle className="w-4 h-4 text-[#A879E8] shrink-0" />
          {!isCollapsed && <span>Help & Platform Docs</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block">{sidebarContent}</div>

      {/* Mobile Drawer with Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-[#171923]/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-50 flex">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
