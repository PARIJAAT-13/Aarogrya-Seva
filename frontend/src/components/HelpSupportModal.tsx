import React from 'react';
import { X, HelpCircle, CheckCircle2 } from 'lucide-react';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171923]/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-soft-lg border border-[#E9DDF8] max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#E9DDF8]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#E9DDF8] text-[#352447]">
              <HelpCircle className="w-5 h-5 text-[#A879E8]" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#171923]">AarogyaSeva Platform Assistance</h3>
              <p className="text-xs text-[#858392]">User Guide & Operational Reference</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#858392] hover:text-[#171923] rounded-lg hover:bg-[#FAF9FC] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs text-[#171923]">
          <div className="p-4 bg-[#E9DDF8]/70 rounded-2xl border border-[#D5BEF4] text-[#352447] font-semibold leading-relaxed">
            AarogyaSeva is designed to bridge healthcare delivery and multilingual information gaps in rural communities.
            The platform provides a comprehensive <strong>Patient & Healthcare Information Management System</strong>.
          </div>

          <div>
            <h4 className="font-extrabold text-[#352447] mb-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#A879E8]" />
              Role Responsibilities & Features:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#F8F3EA] border border-[#E7D4AE]">
                <div className="font-bold text-[#8A6729] mb-1">A. Patient</div>
                <ul className="space-y-1 text-[11px] list-disc list-inside text-[#171923]">
                  <li>Upload prescriptions & reports</li>
                  <li>View clinical visit history</li>
                  <li>Download medical files</li>
                  <li>Choose preferred regional language</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#E9DDF8] border border-[#D5BEF4]">
                <div className="font-bold text-[#352447] mb-1">B. Healthcare Worker</div>
                <ul className="space-y-1 text-[11px] list-disc list-inside text-[#171923]">
                  <li>Register & manage village patients</li>
                  <li>Add consultation notes & vitals</li>
                  <li>Issue prescriptions & advice</li>
                  <li>Upload diagnostic lab reports</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#352447] text-white">
                <div className="font-bold text-[#E7D4AE] mb-1">C. Administrator</div>
                <ul className="space-y-1 text-[11px] list-disc list-inside text-white/90">
                  <li>Monitor coverage statistics</li>
                  <li>Activate/deactivate accounts</li>
                  <li>Manage educational health content</li>
                  <li>Inspect security audit trail</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-extrabold text-[#352447] mb-1.5">System Specifications & Standards:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] text-[#858392]">
              <div className="p-3.5 rounded-2xl bg-[#FAF9FC] border border-[#E9DDF8]">
                <span className="font-bold text-[#171923] block mb-0.5">Document Formats</span>
                <span>PDF, JPG, JPEG, and PNG up to 10MB with cryptographic storage hashing.</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FAF9FC] border border-[#E9DDF8]">
                <span className="font-bold text-[#171923] block mb-0.5">Role-Based Security</span>
                <span>Patients access only their own records; healthcare workers access assigned clinical records.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-3.5 border-t border-[#E9DDF8] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#A879E8] to-[#915BDB] hover:from-[#9563D6] hover:to-[#834EC5] rounded-xl shadow-soft hover:shadow-glow-orchid cursor-pointer transition-all"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
};
