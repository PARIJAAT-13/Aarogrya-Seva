import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { MedicalDocument } from '../types';
import {
  FileText,
  Search,
  Filter,
  Upload,
  Eye,
  Download,
  Trash2,
  Loader2,
  FolderOpen,
} from 'lucide-react';

interface DocumentsPageProps {
  onOpenUpload: () => void;
  onViewDocument: (doc: MedicalDocument) => void;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ onOpenUpload, onViewDocument }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await api.listDocuments({
        document_type: typeFilter || undefined,
        search: searchVal || undefined,
      });
      setDocuments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [typeFilter, searchVal]);

  const handleDelete = async (docId: number) => {
    if (!window.confirm('Are you sure you want to delete this document from medical records?')) {
      return;
    }
    setActionLoading(docId);
    try {
      await api.deleteDocument(docId);
      await fetchDocuments();
    } catch (err: any) {
      alert(err.message || 'Failed to delete document.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getTypeBadge = (type: string) => {
    const map: Record<string, { label: string; bg: string; text: string; border: string }> = {
      prescription: { label: 'Prescription', bg: 'bg-[#F8F3EA]', text: 'text-[#8A6729]', border: 'border-[#E7D4AE]' },
      discharge_summary: { label: 'Discharge Summary', bg: 'bg-[#E9DDF8]', text: 'text-[#352447]', border: 'border-[#D5BEF4]' },
      medical_report: { label: 'Lab Diagnostic Report', bg: 'bg-[#FAF7FD]', text: 'text-[#352447]', border: 'border-[#A879E8]/30' },
      other: { label: 'Clinical Doc', bg: 'bg-[#FAF9FC]', text: 'text-[#858392]', border: 'border-[#E9DDF8]' },
    };
    const t = map[type] || { label: type, bg: 'bg-[#FAF9FC]', text: 'text-[#858392]', border: 'border-[#E9DDF8]' };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${t.bg} ${t.text} ${t.border}`}>
        {t.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#E9DDF8] shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-[#171923] flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#E9DDF8] text-[#352447]">
                <FolderOpen className="w-5 h-5 text-[#A879E8]" />
              </span>
              Clinical Document Repository
            </h2>
            <span className="text-[10px] font-bold text-[#352447] bg-[#E9DDF8] px-2.5 py-0.5 rounded-full border border-[#D5BEF4]">
              {documents.length} Files
            </span>
          </div>
          <p className="text-xs text-[#858392] mt-1.5">
            Digitized prescriptions, discharge summaries, laboratory diagnostic reports and healthcare records
          </p>
        </div>
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#A879E8] to-[#915BDB] hover:from-[#9563D6] hover:to-[#834EC5] rounded-xl shadow-soft hover:shadow-glow-orchid transition-all self-start sm:self-auto cursor-pointer"
        >
          <Upload className="w-4 h-4 text-white" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-[#E9DDF8] shadow-soft">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#858392]" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search documents by title or filename..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] placeholder-[#858392]/70 focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8] transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <Filter className="w-3.5 h-3.5 text-[#858392]" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30"
          >
            <option value="">All Document Types</option>
            <option value="prescription">Prescriptions</option>
            <option value="discharge_summary">Discharge Summaries</option>
            <option value="medical_report">Medical Lab Reports</option>
            <option value="other">Other Documents</option>
          </select>
        </div>
      </div>

      {/* Document Listing */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-14 bg-white rounded-3xl border border-[#E9DDF8] shadow-soft">
          <Loader2 className="w-8 h-8 animate-spin text-[#A879E8] mb-2" />
          <span className="text-xs font-bold text-[#352447]">Retrieving medical documents...</span>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center p-14 bg-white rounded-3xl border border-[#E9DDF8] shadow-soft">
          <div className="w-12 h-12 rounded-2xl bg-[#E9DDF8] text-[#352447] flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6 text-[#A879E8]" />
          </div>
          <h4 className="text-sm font-bold text-[#171923]">No Medical Documents Found</h4>
          <p className="text-xs text-[#858392] mt-1 max-w-sm mx-auto">
            Click "Upload Document" to upload a prescription, discharge summary or lab report.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#E9DDF8] shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#171923]">
              <thead className="bg-[#FAF9FC] border-b border-[#E9DDF8] text-[11px] font-bold text-[#352447] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Document Title</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Upload Date</th>
                  <th className="px-6 py-4">Uploaded By</th>
                  <th className="px-6 py-4">Format / Size</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF9FC]">
                {documents.map((doc) => {
                  const downloadUrl = api.getDocumentDownloadUrl(doc.id);
                  const canDelete =
                    user?.role === 'admin' || doc.uploaded_by_id === user?.id;

                  return (
                    <tr key={doc.id} className="hover:bg-[#FAF9FC]/90 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#171923]">{doc.title}</div>
                        <div className="text-[11px] text-[#858392] font-mono mt-0.5 truncate max-w-xs">
                          {doc.original_filename}
                        </div>
                      </td>
                      <td className="px-6 py-4">{getTypeBadge(doc.document_type)}</td>
                      <td className="px-6 py-4 font-semibold text-[#352447]">
                        {doc.patient_name || `#${doc.patient_id}`}
                      </td>
                      <td className="px-6 py-4 text-[#858392]">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-[#858392]">{doc.uploaded_by_name || 'System'}</td>
                      <td className="px-6 py-4 text-[#858392]">
                        <span className="uppercase font-mono text-[10px] bg-[#E9DDF8] text-[#352447] px-2 py-0.5 rounded-md font-bold">
                          {doc.original_filename.split('.').pop() || 'FILE'}
                        </span>{' '}
                        <span className="text-[11px] text-[#858392] ml-1">
                          ({formatFileSize(doc.file_size)})
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => onViewDocument(doc)}
                          className="p-2 text-[#352447] hover:text-[#A879E8] rounded-xl hover:bg-[#E9DDF8]/50 transition-colors cursor-pointer"
                          title="View Document Inline"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={downloadUrl}
                          download={doc.original_filename}
                          className="inline-block p-2 text-[#352447] hover:text-[#A879E8] rounded-xl hover:bg-[#E9DDF8]/50 transition-colors cursor-pointer"
                          title="Download File"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(doc.id)}
                            disabled={actionLoading === doc.id}
                            className="p-2 text-[#858392] hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Document"
                          >
                            {actionLoading === doc.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
