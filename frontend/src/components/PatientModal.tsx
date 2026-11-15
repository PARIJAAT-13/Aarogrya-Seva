import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SUPPORTED_LANGUAGES } from '../context/AuthContext';
import { Patient } from '../types';
import { X, UserPlus, Save, AlertCircle, Loader2 } from 'lucide-react';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patientToEdit?: Patient | null;
}

export const PatientModal: React.FC<PatientModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  patientToEdit,
}) => {
  const isEdit = Boolean(patientToEdit);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('Uttar Pradesh');
  const [address, setAddress] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('Hindi');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [emergencyContact, setEmergencyContact] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (patientToEdit) {
      setFullName(patientToEdit.full_name || '');
      setEmail(patientToEdit.email || '');
      setPhone(patientToEdit.phone_number || '');
      setDob(patientToEdit.date_of_birth || '');
      setGender(patientToEdit.gender || 'Male');
      setVillage(patientToEdit.village || '');
      setDistrict(patientToEdit.district || '');
      setState(patientToEdit.state || 'Uttar Pradesh');
      setAddress(patientToEdit.address || '');
      setPreferredLanguage(patientToEdit.preferred_language || 'Hindi');
      setBloodGroup(patientToEdit.blood_group || 'B+');
      setEmergencyContact(patientToEdit.emergency_contact || '');
    } else {
      setFullName('');
      setEmail('');
      setPassword('Patient@12345');
      setPhone('');
      setDob('1990-01-01');
      setGender('Male');
      setVillage('');
      setDistrict('Sitapur');
      setState('Uttar Pradesh');
      setAddress('');
      setPreferredLanguage('Hindi');
      setBloodGroup('B+');
      setEmergencyContact('');
    }
  }, [patientToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (isEdit && patientToEdit) {
        await api.updatePatient(patientToEdit.id, {
          full_name: fullName.trim(),
          phone_number: phone.trim(),
          date_of_birth: dob,
          gender,
          address: address.trim(),
          village: village.trim(),
          district: district.trim(),
          state: state.trim(),
          preferred_language: preferredLanguage,
          blood_group: bloodGroup,
          emergency_contact: emergencyContact.trim(),
        });
      } else {
        await api.createPatient({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password: password || 'Patient@12345',
          phone_number: phone.trim(),
          date_of_birth: dob,
          gender,
          address: address.trim(),
          village: village.trim(),
          district: district.trim(),
          state: state.trim(),
          preferred_language: preferredLanguage,
          blood_group: bloodGroup,
          emergency_contact: emergencyContact.trim(),
        });
      }
      setIsLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save patient profile.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171923]/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-soft-lg border border-[#E9DDF8] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#E9DDF8]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#E9DDF8] text-[#352447]">
              <UserPlus className="w-5 h-5 text-[#A879E8]" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#171923]">
                {isEdit ? 'Edit Patient Profile' : 'Register New Patient'}
              </h3>
              <p className="text-xs text-[#858392]">
                {isEdit ? 'Update demographic and clinical details' : 'Create patient record with rural community tags'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#858392] hover:text-[#171923] rounded-lg hover:bg-[#FAF9FC] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 mt-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#171923] mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171923] mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 94150 12345"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              />
            </div>
          </div>

          {!isEdit && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#171923] mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@village.org"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171923] mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8] font-mono"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#171923] mb-1.5">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171923] mb-1.5">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171923] mb-1.5">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#171923] mb-1.5">
                Village / Hamlet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="Rampur"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171923] mb-1.5">
                District <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Sitapur"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171923] mb-1.5">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Uttar Pradesh"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#171923] mb-1.5">Preferred Language</label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.native} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171923] mb-1.5">Emergency Contact</label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="Relation & Phone number"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171923] mb-1.5">Address Details</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House number, landmark, block..."
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E9DDF8]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 text-xs font-bold text-[#858392] hover:bg-[#FAF9FC] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#A879E8] to-[#915BDB] hover:from-[#9563D6] hover:to-[#834EC5] rounded-xl shadow-soft hover:shadow-glow-orchid transition-all cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Save className="w-4 h-4 text-white" />
              )}
              <span>{isEdit ? 'Save Changes' : 'Register Patient'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
