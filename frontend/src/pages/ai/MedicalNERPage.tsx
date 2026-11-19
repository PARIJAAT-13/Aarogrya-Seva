import React, { useState, useEffect } from 'react';
import {
  Cpu,
  FileText,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Pill,
  Activity,
  ClipboardList,
  Code,
  Sparkles,
  Layers,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { Patient, MedicalDocument, MedicalEntityResult } from '../../types';

interface MedicalNERPageProps {
  patients: Patient[];
  documents: MedicalDocument[];
}

export const MedicalNERPage: React.FC<MedicalNERPageProps> = ({
  patients = [],
  documents = [],
}) => {
  const [inputText, setInputText] = useState(
    'Patient diagnosed with hypertension and prescribed Amlodipine 5 mg once daily. Also taking Metformin 500 mg twice daily after meals for Type 2 Diabetes. Advice: Avoid high salt intake. Walk 30 minutes daily. Follow up in 2 weeks.'
  );
  const [selectedPatientId, setSelectedPatientId] = useState<number | ''>('');
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | ''>('');
  const [extractionResult, setExtractionResult] = useState<MedicalEntityResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedJSON, setCopiedJSON] = useState(false);

  // History state
  const [history, setHistory] = useState<MedicalEntityResult[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [selectedPatientId]);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const params: any = { limit: 15 };
      if (selectedPatientId) params.patient_id = Number(selectedPatientId);
      const data = await api.listExtractedEntities(params);
      setHistory(data);
    } catch (err: any) {
      console.error('Failed to load entity extraction history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleExtract = async () => {
    if (!inputText.trim()) {
      setError('Please provide clinical notes or prescription text to extract entities.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      const res = await api.extractEntities({
        text: inputText,
        patient_id: selectedPatientId ? Number(selectedPatientId) : undefined,
        document_id: selectedDocumentId ? Number(selectedDocumentId) : undefined,
        source_type: 'prescription',
      });
      setExtractionResult(res);
      fetchHistory();
    } catch (err: any) {
      setError(err?.message || 'Entity extraction failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyJSON = () => {
    if (!extractionResult) return;
    const cleanOutput = {
      diseases: extractionResult.diseases,
      medications: extractionResult.medications.map((m) => ({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
      })),
      treatment_instructions: extractionResult.treatment_instructions,
    };
    navigator.clipboard.writeText(JSON.stringify(cleanOutput, null, 2));
    setCopiedJSON(true);
    setTimeout(() => setCopiedJSON(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-obsidian">Medical Named Entity Recognition (NER)</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-plum/10 text-plum font-semibold border border-lavender-300">
              Clinical Information Extraction
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-grey mt-0.5">
            Parses clinical notes and prescriptions into structured diseases, medications (dosage, frequency, route), and treatment directives.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Configuration Card */}
      <div className="bg-white rounded-xl border border-lavender-200 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-obsidian mb-1">
              Link to Patient Record (Optional)
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

          <div>
            <label className="block text-xs font-semibold text-obsidian mb-1">
              Source Clinical Document (Optional)
            </label>
            <select
              value={selectedDocumentId}
              onChange={(e) => setSelectedDocumentId(e.target.value ? Number(e.target.value) : '')}
              className="w-full text-xs px-3 py-2 border border-lavender-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orchid"
            >
              <option value="">-- No specific document --</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.document_type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Text Input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-obsidian">Clinical Text or Prescription</label>
            <button
              onClick={() =>
                setInputText(
                  'Patient diagnosed with hypertension and prescribed Amlodipine 5 mg once daily.'
                )
              }
              className="text-[11px] text-orchid hover:underline"
            >
              Load Infosys Prompt Example
            </button>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            className="w-full text-xs p-3 border border-lavender-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orchid font-mono text-obsidian"
            placeholder="Type or paste doctor's notes (e.g. 'Patient diagnosed with hypertension and prescribed Amlodipine 5 mg once daily')..."
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleExtract}
            disabled={isProcessing || !inputText.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-orchid hover:bg-orchid-hover text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Extracting Clinical Entities...
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5" />
                Extract Medical Entities
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Dashboard */}
      {extractionResult && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orchid" />
              <h2 className="text-base font-bold text-obsidian">Extracted Medical Entities</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                {extractionResult.total_entities_count} items identified
              </span>
            </div>
            <button
              onClick={handleCopyJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-plum bg-lavender-100 hover:bg-lavender-200 rounded-lg border border-lavender-300 transition-colors"
            >
              {copiedJSON ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedJSON ? 'Copied JSON' : 'Copy Structured JSON'}
            </button>
          </div>

          {/* Categorized Visual Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Diseases Card */}
            <div className="bg-white rounded-xl border border-lavender-200 p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-lavender-100">
                <Activity className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-obsidian">
                  Diseases & Conditions ({extractionResult.diseases.length})
                </h3>
              </div>
              {extractionResult.diseases.length === 0 ? (
                <p className="text-xs text-muted-grey italic">No specific diseases identified.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {extractionResult.diseases.map((d, i) => (
                    <span
                      key={i}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Prescribed Medications Card */}
            <div className="bg-white rounded-xl border border-lavender-200 p-4 shadow-sm space-y-3 md:col-span-2">
              <div className="flex items-center gap-2 pb-2 border-b border-lavender-100">
                <Pill className="w-4 h-4 text-orchid" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-obsidian">
                  Prescribed Medications ({extractionResult.medications.length})
                </h3>
              </div>
              {extractionResult.medications.length === 0 ? (
                <p className="text-xs text-muted-grey italic">No medications detected in text.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-lavender-100 text-muted-grey font-semibold">
                        <th className="py-1.5 px-2">Medicine Name</th>
                        <th className="py-1.5 px-2">Dosage</th>
                        <th className="py-1.5 px-2">Frequency</th>
                        <th className="py-1.5 px-2">Route</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-lavender-100 font-medium">
                      {extractionResult.medications.map((m, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-2 text-plum font-bold">{m.name}</td>
                          <td className="py-2 px-2 text-obsidian">{m.dosage}</td>
                          <td className="py-2 px-2 text-emerald-700">{m.frequency}</td>
                          <td className="py-2 px-2 text-muted-grey">{m.route}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Treatment Instructions */}
          <div className="bg-white rounded-xl border border-lavender-200 p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-lavender-100">
              <ClipboardList className="w-4 h-4 text-plum" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-obsidian">
                Treatment & Lifestyle Instructions ({extractionResult.treatment_instructions.length})
              </h3>
            </div>
            {extractionResult.treatment_instructions.length === 0 ? (
              <p className="text-xs text-muted-grey italic">No specific treatment directives identified.</p>
            ) : (
              <ul className="space-y-1.5 text-xs text-obsidian font-medium">
                {extractionResult.treatment_instructions.map((instr, idx) => (
                  <li key={idx} className="flex items-start gap-2 p-2 bg-porcelain rounded-lg border border-lavender-100">
                    <span className="text-orchid font-bold">•</span>
                    <span>{instr}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Raw Structured JSON Viewer */}
          <div className="bg-obsidian rounded-xl p-4 shadow-sm text-porcelain">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-xs font-bold text-orchid-light">
                <Code className="w-4 h-4" />
                <span>Structured Output JSON (API Schema)</span>
              </div>
              <span className="text-[11px] text-muted-grey font-mono">confidence: {extractionResult.confidence_score}</span>
            </div>
            <pre className="text-xs font-mono text-emerald-400 overflow-x-auto p-2 bg-obsidian-dark rounded-lg">
              {JSON.stringify(
                {
                  diseases: extractionResult.diseases,
                  medications: extractionResult.medications.map((m) => ({
                    name: m.name,
                    dosage: m.dosage,
                    frequency: m.frequency,
                  })),
                  treatment_instructions: extractionResult.treatment_instructions,
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      )}

      {/* Previous Extraction History */}
      <div className="bg-white rounded-xl border border-lavender-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-plum" />
            <h3 className="text-sm font-bold text-obsidian">Previous Entity Extractions</h3>
          </div>
          <span className="text-xs text-muted-grey">{history.length} records</span>
        </div>

        {loadingHistory ? (
          <div className="py-6 text-center text-xs text-muted-grey">
            <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-orchid" />
            Loading history...
          </div>
        ) : history.length === 0 ? (
          <p className="text-xs text-muted-grey text-center py-6">No previous entity extractions found.</p>
        ) : (
          <div className="space-y-3">
            {history.map((record, i) => (
              <div key={record.id || i} className="p-3.5 bg-porcelain rounded-xl border border-lavender-200/60">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-plum">
                      {record.diseases.length > 0 ? record.diseases.join(', ') : 'Clinical Record'}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-lavender-200 text-plum">
                      {record.total_entities_count} entities
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-grey">
                    {record.created_at ? new Date(record.created_at).toLocaleDateString() : ''}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  {record.medications.map((m, mIdx) => (
                    <span
                      key={mIdx}
                      className="text-[11px] px-2 py-0.5 bg-white border border-lavender-200 rounded text-obsidian font-medium"
                    >
                      💊 {m.name} ({m.dosage} - {m.frequency})
                    </span>
                  ))}
                </div>

                {record.treatment_instructions.length > 0 && (
                  <p className="text-[11px] text-muted-grey line-clamp-1 italic">
                    Instructions: {record.treatment_instructions.join('; ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
