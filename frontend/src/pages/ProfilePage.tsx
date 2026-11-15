import React, { useState } from 'react';
import { useAuth, SUPPORTED_LANGUAGES } from '../context/AuthContext';
import { api } from '../services/api';
import {
  UserCircle,
  Save,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser, selectedLanguage, setLanguage } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [preferredLang, setPreferredLang] = useState(selectedLanguage);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPassSaving, setIsPassSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passError, setPassError] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setIsProfileSaving(true);

    try {
      await api.updateProfile({
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim() || undefined,
        preferred_language: preferredLang,
      });
      await setLanguage(preferredLang);
      await refreshUser();
      setProfileSuccess('Profile details updated successfully.');
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    setIsPassSaving(true);
    try {
      await api.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPassSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassError(err.message || 'Failed to change password.');
    } finally {
      setIsPassSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#E9DDF8] shadow-soft">
        <h2 className="text-xl font-black text-[#171923] flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-[#E9DDF8] text-[#352447]">
            <UserCircle className="w-5 h-5 text-[#A879E8]" />
          </span>
          Profile & Security Credentials
        </h2>
        <p className="text-xs text-[#858392] mt-1.5">
          Manage your personal details, preferred regional language, and security credentials
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Details Card */}
        <div className="bg-white rounded-3xl border border-[#E9DDF8] shadow-soft p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-[#352447] pb-3.5 border-b border-[#FAF9FC] flex items-center gap-2">
            <UserCircle className="w-4 h-4 text-[#A879E8]" />
            Personal Details
          </h3>

          {profileError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{profileError}</span>
            </div>
          )}

          {profileSuccess && (
            <div className="p-3.5 bg-[#E9DDF8] border border-[#D5BEF4] text-[#352447] text-xs font-bold rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#A879E8]" />
              <span>{profileSuccess}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#171923] mb-1.5">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#858392] font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-bold text-[#171923] mb-1.5">User Role</label>
              <input
                type="text"
                disabled
                value={user?.role?.replace('_', ' ').toUpperCase() || ''}
                className="w-full px-3.5 py-2.5 bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#352447] font-bold uppercase tracking-wider cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-bold text-[#171923] mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#171923] mb-1.5">Preferred Regional Language</label>
              <select
                value={preferredLang}
                onChange={(e) => setPreferredLang(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native} ({l.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-[#FAF9FC] flex justify-end">
              <button
                type="submit"
                disabled={isProfileSaving}
                className="flex items-center gap-2 px-4 py-2.5 font-bold text-white bg-gradient-to-r from-[#A879E8] to-[#915BDB] hover:from-[#9563D6] hover:to-[#834EC5] rounded-xl shadow-soft hover:shadow-glow-orchid transition-all cursor-pointer"
              >
                {isProfileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-3xl border border-[#E9DDF8] shadow-soft p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-[#352447] pb-3.5 border-b border-[#FAF9FC] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#A879E8]" />
            Security & Password
          </h3>

          {passError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{passError}</span>
            </div>
          )}

          {passSuccess && (
            <div className="p-3.5 bg-[#E9DDF8] border border-[#D5BEF4] text-[#352447] text-xs font-bold rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#A879E8]" />
              <span>{passSuccess}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#171923] mb-1.5">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#171923] mb-1.5">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#171923] mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              />
            </div>

            <div className="pt-3 border-t border-[#FAF9FC] flex justify-end">
              <button
                type="submit"
                disabled={isPassSaving}
                className="flex items-center gap-2 px-4 py-2.5 font-bold text-white bg-[#352447] hover:bg-[#261833] rounded-xl shadow-soft transition-all cursor-pointer"
              >
                {isPassSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
