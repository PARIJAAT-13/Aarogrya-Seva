import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { Patient } from '../types';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patients?: Patient[];
  preselectedPatientId?: number;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  patients = [],
  preselectedPatientId,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('prescription');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [patientId, setPatientId] = useState<number | ''>(
    preselectedPatientId || (user?.role === 'patient' && user.profile_id ? user.profile_id : '')
  );

  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleFileSelect = (selected: File) => {
    setErrorMsg('');
    const ext = selected.name.split('.').pop()?.toLowerCase();
    const validExts = ['pdf', 'jpg', 'jpeg', 'png'];

    if (!ext || !validExts.includes(ext)) {
      setErrorMsg('Invalid file format. Only PDF, JPG, JPEG, and PNG files are allowed.');
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setErrorMsg('File exceeds 10MB maximum limit.');
      return;
    }

    setFile(selected);
    if (!title) {
      const cleanName = selected.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!file) {
      setErrorMsg('Please select a file to upload.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Document title is required.');
      return;
    }

    const targetPatient = user?.role === 'patient' ? user.profile_id : patientId;
    if (!targetPatient) {
      setErrorMsg('Please select a patient for this document.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    formData.append('title', title.trim());
    if (description.trim()) {
      formData.append('description', description.trim());
    }
    formData.append('patient_id', String(targetPatient));

    try {
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 25 : prev));
      }, 150);

      await api.uploadDocument(formData);
      clearInterval(progressTimer);
      setUploadProgress(100);
      setSuccessMsg('Document successfully uploaded and saved to medical record.');

      setTimeout(() => {
        setIsUploading(false);
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload document.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171923]/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-soft-lg border border-[#E9DDF8]">
        <div className="flex items-center justify-between pb-4 border-b border-[#E9DDF8]">
          <div>
            <h3 className="text-base font-black text-[#171923]">Upload Clinical Document</h3>
            <p className="text-xs text-[#858392]">PDF, JPG, JPEG or PNG up to 10MB</p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 text-[#858392] hover:text-[#171923] rounded-lg hover:bg-[#FAF9FC] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 mt-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 mt-4 p-3.5 rounded-2xl bg-[#E9DDF8] border border-[#D5BEF4] text-xs font-bold text-[#352447]">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#A879E8]" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Patient Selector */}
          {user?.role !== 'patient' && (
            <div>
              <label className="block text-xs font-bold text-[#171923] mb-1.5">
                Select Patient <span className="text-red-500">*</span>
              </label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
                required
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({p.village}, {p.district}) - #{p.id}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Document Category */}
          <div>
            <label className="block text-xs font-bold text-[#171923] mb-1.5">
              Document Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'prescription', label: 'Prescription' },
                { id: 'discharge_summary', label: 'Discharge Summary' },
                { id: 'medical_report', label: 'Medical Lab Report' },
                { id: 'other', label: 'Other Document' },
              ].map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setDocumentType(cat.id)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    documentType === cat.id
                      ? 'bg-[#E9DDF8] border-[#A879E8] text-[#352447] shadow-soft'
                      : 'bg-[#FAF9FC] border-[#E9DDF8] text-[#171923] hover:bg-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Document Title */}
          <div>
            <label className="block text-xs font-bold text-[#171923] mb-1.5">
              Document Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hypertension Prescription - Oct 2026"
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              required
            />
          </div>

          {/* Dropzone */}
          <div>
            <label className="block text-xs font-bold text-[#171923] mb-1.5">
              Select Document File <span className="text-red-500">*</span>
            </label>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-[#A879E8] bg-[#E9DDF8]'
                  : file
                  ? 'border-[#A879E8] bg-[#E9DDF8]/40'
                  : 'border-[#E9DDF8] hover:border-[#A879E8] bg-[#FAF9FC]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
              {file ? (
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#E9DDF8] text-[#352447]">
                    <FileText className="w-5 h-5 text-[#A879E8]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#171923] truncate max-w-xs">{file.name}</div>
                    <div className="text-[11px] text-[#858392]">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                  </div>
                </div>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 text-[#A879E8] mb-2" />
                  <p className="text-xs font-semibold text-[#171923]">
                    Drag and drop file here, or <span className="text-[#A879E8] underline">browse</span>
                  </p>
                  <p className="text-[11px] text-[#858392] mt-1">PDF, JPG, JPEG or PNG (Max 10MB)</p>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#171923] mb-1.5">
              Clinical Notes / Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add relevant doctor notes, lab details or instructions..."
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8] resize-none"
            />
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-[#858392]">
                <span>Uploading document securely...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-[#E9DDF8] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#A879E8] to-[#915BDB] h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-[#E9DDF8]">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2.5 text-xs font-bold text-[#858392] hover:bg-[#FAF9FC] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !file}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#A879E8] to-[#915BDB] hover:from-[#9563D6] hover:to-[#834EC5] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-soft hover:shadow-glow-orchid transition-all cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 text-white" />
                  <span>Submit Document</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
