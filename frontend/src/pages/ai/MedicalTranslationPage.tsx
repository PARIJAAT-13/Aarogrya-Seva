import React, { useState, useEffect } from 'react';
import {
  Languages,
  Upload,
  FileText,
  Copy,
  Download,
  Check,
  RefreshCw,
  AlertCircle,
  FileCheck,
  ArrowRightLeft,
  ChevronDown,
  User,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../services/api';
import { Patient, MedicalDocument, TranslationRecord } from '../../types';

interface MedicalTranslationPageProps {
  initialDocument?: MedicalDocument | null;
  initialText?: string;
  patients: Patient[];
  documents: MedicalDocument[];
}

export const MedicalTranslationPage: React.FC<MedicalTranslationPageProps> = ({
  initialDocument = null,
  initialText = '',
  patients = [],
  documents = [],
}) => {
  const [sourceText, setSourceText] = useState(initialText || '');
  const [targetLanguage, setTargetLanguage] = useState<'Hindi' | 'Telugu' | 'English'>('Hindi');
  const [detectedLanguage, setDetectedLanguage] = useState<string>('English');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);
  const [translationEngine, setTranslationEngine] = useState<string>('');

  const [selectedPatientId, setSelectedPatientId] = useState<number | ''>('');
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | ''>(
    initialDocument ? initialDocument.id : ''
  );

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  // Translation history list
  const [history, setHistory] = useState<TranslationRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // If initialDocument changes or was passed, load it
  useEffect(() => {
    if (initialDocument) {
      setSelectedDocumentId(initialDocument.id);
      setSelectedPatientId(initialDocument.patient_id);
      handleExtractFromExistingDoc(initialDocument.id);
    }
  }, [initialDocument]);

  useEffect(() => {
    fetchHistory();
  }, [selectedPatientId]);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const params: any = { limit: 20 };
      if (selectedPatientId) params.patient_id = Number(selectedPatientId);
      const data = await api.listTranslations(params);
      setHistory(data);
    } catch (err: any) {
      console.error('Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    setError(null);
    setWarning(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsExtracting(true);
      const result = await api.extractDocumentText(formData);
      setSourceText(result.extracted_text || '');
      setDetectedLanguage(result.detected_language || 'English');
      if (result.warning) setWarning(result.warning);
    } catch (err: any) {
      setError(err?.message || 'Failed to extract text from document. Please verify image clarity.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleExtractFromExistingDoc = async (docId: number) => {
    setError(null);
    setWarning(null);
    const formData = new FormData();
    formData.append('document_id', docId.toString());

    try {
      setIsExtracting(true);
      const result = await api.extractDocumentText(formData);
      setSourceText(result.extracted_text || '');
      setDetectedLanguage(result.detected_language || 'English');
      if (result.warning) setWarning(result.warning);
    } catch (err: any) {
      setError(err?.message || 'Failed to extract text from the selected document');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      setError('Please provide medical text or upload a document to translate.');
      return;
    }

    try {
      setIsTranslating(true);
      setError(null);
      const res = await api.translateMedicalText({
        text: sourceText,
        target_language: targetLanguage,
        source_language: 'auto',
        patient_id: selectedPatientId ? Number(selectedPatientId) : undefined,
        document_id: selectedDocumentId ? Number(selectedDocumentId) : undefined,
        document_type: 'medical_document',
      });

      setTranslatedText(res.translated_text);
      setDetectedLanguage(res.source_language);
      setConfidenceScore(res.confidence_score);
      setTranslationEngine(res.engine || 'AarogyaSeva Neural Engine');
      fetchHistory(); // Refresh history
    } catch (err: any) {
      setError(err?.message || 'Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!translatedText) return;
    const element = document.createElement('a');
    const fileContent = `========================================================\nAAROGYASEVA CLINICAL TRANSLATION REPORT\nDate: ${new Date().toLocaleString()}\nTarget Language: ${targetLanguage}\nDetected Source: ${detectedLanguage}\nConfidence: ${confidenceScore ? (confidenceScore * 100).toFixed(0) + '%' : 'High'}\n========================================================\n\n[ORIGINAL CLINICAL TEXT]\n${sourceText}\n\n--------------------------------------------------------\n[TRANSLATED CLINICAL TEXT - ${targetLanguage.toUpperCase()}]\n${translatedText}\n\n========================================================\nMedical Disclaimer: This translation is generated for educational and communication clarity. Prescribed medications, dosages, and emergency instructions must be verified by a licensed medical practitioner.\n========================================================\n`;

    const file = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `AarogyaSeva_Translation_${targetLanguage}_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-obsidian">Medical Language Translation</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orchid-100 text-orchid-700 font-semibold border border-orchid-200">
              Hindi • Telugu • English
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-grey mt-0.5">
            Extract text from prescriptions, discharge summaries, and medical reports with instant clinical translation.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {warning && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{warning}</span>
        </div>
      )}

      {/* Input Options Card */}
      <div className="bg-white rounded-xl border border-lavender-200 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Patient Selection */}
          <div>
            <label className="block text-xs font-semibold text-obsidian mb-1">
              Link to Patient (Optional)
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value ? Number(e.target.value) : '')}
              className="w-full text-xs px-3 py-2 border border-lavender-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orchid"
            >
              <option value="">-- No specific patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.village}, {p.district})
                </option>
              ))}
            </select>
          </div>

          {/* Select from existing document */}
          <div>
            <label className="block text-xs font-semibold text-obsidian mb-1">
              Select Stored Clinical Document
            </label>
            <select
              value={selectedDocumentId}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : '';
                setSelectedDocumentId(val);
                if (val) handleExtractFromExistingDoc(val);
              }}
              className="w-full text-xs px-3 py-2 border border-lavender-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orchid"
            >
              <option value="">-- Choose from uploaded documents --</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.document_type})
                </option>
              ))}
            </select>
          </div>

          {/* Upload New File */}
          <div>
            <label className="block text-xs font-semibold text-obsidian mb-1">
              Upload PDF or Scanned Document (OCR)
            </label>
            <label className="flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-orchid/60 bg-orchid-50/50 hover:bg-orchid-50 rounded-lg text-xs font-medium text-orchid-700 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>{uploadFile ? uploadFile.name : 'Upload PDF, JPG, PNG'}</span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Translation Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-lavender-100">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-grey font-medium">Target Language:</span>
            <div className="inline-flex rounded-lg border border-lavender-200 p-0.5 bg-porcelain">
              {(['Hindi', 'Telugu', 'English'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setTargetLanguage(lang)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    targetLanguage === lang
                      ? 'bg-plum text-white shadow-sm'
                      : 'text-muted-grey hover:text-obsidian'
                  }`}
                >
                  {lang === 'Hindi' ? 'हिन्दी (Hindi)' : lang === 'Telugu' ? 'తెలుగు (Telugu)' : 'English'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-grey">
              Detected Source: <strong className="text-obsidian">{detectedLanguage}</strong>
            </span>
            <button
              onClick={handleTranslate}
              disabled={isTranslating || isExtracting || !sourceText.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-orchid hover:bg-orchid-hover text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {isTranslating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Translating...
                </>
              ) : isExtracting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Extracting OCR...
                </>
              ) : (
                <>
                  <Languages className="w-3.5 h-3.5" />
                  Translate Document
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Source Text Box */}
        <div className="bg-white rounded-xl border border-lavender-200 p-4 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-lavender-100">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-plum" />
              <span className="text-xs font-bold text-obsidian uppercase tracking-wide">
                Original Medical Text ({detectedLanguage})
              </span>
            </div>
            <button
              onClick={() => {
                setSourceText(
                  'Patient Name: Ramesh Kumar\nDiagnosis: Hypertension and Type 2 Diabetes Mellitus.\nRx:\n1. Tab Amlodipine 5 mg PO Once daily in the morning.\n2. Tab Metformin 500 mg PO Twice daily after meals.\n3. Tab Paracetamol 650 mg SOS for headache or fever.\nAdvice: Restrict dietary sodium. Walk 30 minutes daily. Avoid skipping breakfast. Follow up after 2 weeks.'
                );
                setDetectedLanguage('English');
              }}
              className="text-[11px] text-orchid hover:underline"
            >
              Load Sample Rx
            </button>
          </div>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Type or paste medical prescription, clinical notes, discharge advice, or lab report text here..."
            className="flex-1 w-full text-xs text-obsidian leading-relaxed p-2 border border-lavender-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-orchid resize-none font-mono"
          />
        </div>

        {/* Translated Text Box */}
        <div className="bg-white rounded-xl border border-lavender-200 p-4 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-lavender-100">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-orchid" />
              <span className="text-xs font-bold text-obsidian uppercase tracking-wide">
                Translated Medical Text ({targetLanguage})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                disabled={!translatedText}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-plum bg-lavender-100 hover:bg-lavender-200 rounded border border-lavender-300 disabled:opacity-40 transition-colors"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                disabled={!translatedText}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-white bg-plum hover:bg-plum-light rounded disabled:opacity-40 transition-colors"
                title="Download report"
              >
                <Download className="w-3 h-3" />
                Download
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 bg-porcelain rounded-lg border border-lavender-100 text-xs text-obsidian leading-relaxed whitespace-pre-wrap font-sans">
            {isTranslating ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-grey space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-orchid" />
                <p>Translating clinical text into {targetLanguage}...</p>
              </div>
            ) : translatedText ? (
              translatedText
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-grey text-center p-4">
                <Languages className="w-8 h-8 text-lavender-300 mb-2" />
                <p>Click "Translate Document" to see side-by-side translated output.</p>
              </div>
            )}
          </div>

          {confidenceScore !== null && (
            <div className="pt-2 mt-2 border-t border-lavender-100 flex items-center justify-between text-[11px] text-muted-grey">
              <span>Engine: {translationEngine}</span>
              <span className="text-emerald-700 font-semibold">
                Confidence: {(confidenceScore * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Translation History Table */}
      <div className="bg-white rounded-xl border border-lavender-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-plum" />
            <h3 className="text-sm font-bold text-obsidian">Patient Translation History</h3>
          </div>
          <span className="text-xs text-muted-grey">{history.length} records</span>
        </div>

        {loadingHistory ? (
          <div className="py-6 text-center text-xs text-muted-grey">
            <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-orchid" />
            Loading history...
          </div>
        ) : history.length === 0 ? (
          <p className="text-xs text-muted-grey text-center py-6">No previous translations recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-lavender-100 text-muted-grey font-semibold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Languages</th>
                  <th className="py-2.5 px-3">Original Preview</th>
                  <th className="py-2.5 px-3">Translated Preview</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lavender-100">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-porcelain/60 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap text-muted-grey">
                      {new Date(record.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-medium text-obsidian">
                      {record.patient_name || 'General Patient'}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-lavender-100 text-plum border border-lavender-200">
                        {record.source_language} → {record.target_language}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-muted-grey max-w-xs truncate">
                      {record.original_text}
                    </td>
                    <td className="py-2.5 px-3 text-obsidian font-medium max-w-xs truncate">
                      {record.translated_text}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSourceText(record.original_text);
                          setTranslatedText(record.translated_text);
                          setTargetLanguage(record.target_language as any);
                          setDetectedLanguage(record.source_language);
                          setConfidenceScore(record.confidence_score);
                        }}
                        className="text-orchid hover:text-orchid-hover font-semibold text-xs"
                      >
                        Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
