import React from 'react';
import { MedicalDocument } from '../types';
import { api } from '../services/api';
import { X, Download, FileText, Calendar, User, HardDrive, Languages, Cpu } from 'lucide-react';

interface DocumentViewerModalProps {
  document: MedicalDocument | null;
  onClose: () => void;
  onTranslateDoc?: (doc: MedicalDocument) => void;
  onExtractDoc?: (doc: MedicalDocument) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document,
  onClose,
  onTranslateDoc,
  onExtractDoc,
}) => {
  if (!document) return null;

  const isImage = document.mime_type.startsWith('image/');
  const isPdf = document.mime_type === 'application/pdf';
  const viewUrl = api.getDocumentViewUrl(document.id);
  const downloadUrl = api.getDocumentDownloadUrl(document.id);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171923]/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-4xl w-full h-[85vh] flex flex-col shadow-soft-lg border border-[#E9DDF8] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E9DDF8] bg-[#FAF9FC]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#E9DDF8] text-[#352447]">
              <FileText className="w-5 h-5 text-[#A879E8]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171923] leading-tight">{document.title}</h3>
              <p className="text-xs text-[#858392] font-mono mt-0.5">{document.original_filename}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onTranslateDoc && (
              <button
                onClick={() => {
                  onTranslateDoc(document);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#352447] bg-[#E9DDF8] hover:bg-[#D5BEF4] rounded-xl transition-all cursor-pointer"
                title="Translate clinical document"
              >
                <Languages className="w-3.5 h-3.5 text-[#A879E8]" />
                <span className="hidden sm:inline">Translate</span>
              </button>
            )}

            {onExtractDoc && (
              <button
                onClick={() => {
                  onExtractDoc(document);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#352447] bg-[#E9DDF8] hover:bg-[#D5BEF4] rounded-xl transition-all cursor-pointer"
                title="Extract medical entities"
              >
                <Cpu className="w-3.5 h-3.5 text-[#A879E8]" />
                <span className="hidden sm:inline">Extract NER</span>
              </button>
            )}

            <a
              href={downloadUrl}
              download={document.original_filename}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#A879E8] to-[#915BDB] hover:from-[#9563D6] hover:to-[#834EC5] rounded-xl shadow-soft hover:shadow-glow-orchid transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-[#858392] hover:text-[#171923] rounded-lg hover:bg-[#E9DDF8]/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metadata Banner */}
        <div className="flex items-center gap-6 px-6 py-3 bg-[#FAF9FC]/80 border-b border-[#E9DDF8] text-xs text-[#858392]">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#A879E8]" />
            <span>Patient: <strong className="text-[#352447]">{document.patient_name || `#${document.patient_id}`}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#A879E8]" />
            <span>Uploaded: <strong className="text-[#352447]">{new Date(document.created_at).toLocaleDateString()}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-[#A879E8]" />
            <span>Size: <strong className="text-[#352447]">{formatFileSize(document.file_size)}</strong></span>
          </div>
          <div className="ml-auto">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E9DDF8] text-[#352447] border border-[#D5BEF4]">
              {document.document_type.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Content Preview Canvas */}
        <div className="flex-1 bg-[#FAF9FC] overflow-auto p-4 flex items-center justify-center">
          {isImage ? (
            <img
              src={viewUrl}
              alt={document.title}
              className="max-h-full max-w-full object-contain rounded-2xl shadow-soft bg-white border border-[#E9DDF8]"
            />
          ) : isPdf ? (
            <iframe
              src={viewUrl}
              title={document.title}
              className="w-full h-full rounded-2xl border border-[#E9DDF8] bg-white shadow-soft"
            />
          ) : (
            <div className="text-center p-8 bg-white rounded-3xl shadow-soft border border-[#E9DDF8] max-w-md">
              <FileText className="w-12 h-12 text-[#858392] mx-auto mb-3" />
              <h4 className="text-sm font-bold text-[#171923]">Preview not supported for this file type</h4>
              <p className="text-xs text-[#858392] mt-1">Please download the file to view on your device.</p>
              <a
                href={downloadUrl}
                download={document.original_filename}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#A879E8] to-[#915BDB] hover:from-[#9563D6] hover:to-[#834EC5] rounded-xl shadow-soft cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
