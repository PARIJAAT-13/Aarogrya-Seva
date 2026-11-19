import React, { useState, useEffect } from 'react';
import {
  FileCode,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  Search,
  Pill,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../../services/api';
import { SimplificationResult, MedicalTermItem } from '../../types';

export const MedicalSimplificationPage: React.FC = () => {
  const [inputText, setInputText] = useState(
    'Patient has acute hypertension and hyperglycemia. Administer medication orally. Prescribed Amlodipine 5 mg PO once daily and Metformin 500 mg PO BID after meals. Patient reported dyspnea on exertion. Continue current prophylaxis.'
  );
  const [targetLanguage, setTargetLanguage] = useState<'English' | 'Hindi' | 'Telugu'>('English');
  const [simplificationResult, setSimplificationResult] = useState<SimplificationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Terminology dictionary browser state
  const [activeTab, setActiveTab] = useState<'simplifier' | 'dictionary'>('simplifier');
  const [dictionaryTerms, setDictionaryTerms] = useState<MedicalTermItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loadingDict, setLoadingDict] = useState(false);

  useEffect(() => {
    if (activeTab === 'dictionary') {
      fetchDictionary();
    }
  }, [activeTab, searchQuery, categoryFilter]);

  const fetchDictionary = async () => {
    try {
      setLoadingDict(true);
      const params: any = {};
      if (searchQuery) params.query = searchQuery;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      const terms = await api.listTerminology(params);
      setDictionaryTerms(terms);
    } catch (err: any) {
      console.error('Failed to load terminology dictionary:', err);
    } finally {
      setLoadingDict(false);
    }
  };

  const handleSimplify = async () => {
    if (!inputText.trim()) {
      setError('Please provide medical text or instructions to simplify.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      const result = await api.simplifyMedicalText({
        text: inputText,
        target_language: targetLanguage,
      });
      setSimplificationResult(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to simplify medical terminology. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!simplificationResult?.simplified_text) return;
    navigator.clipboard.writeText(simplificationResult.simplified_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-obsidian">Medical Terminology Simplification</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-champagne-100 text-champagne-dark font-semibold border border-champagne-300">
              Plain-Language AI
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-grey mt-0.5">
            Converts technical diagnoses, Latin prescription abbreviations, and clinical jargon into clear explanations.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="inline-flex rounded-lg border border-lavender-200 p-0.5 bg-porcelain">
          <button
            onClick={() => setActiveTab('simplifier')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'simplifier'
                ? 'bg-plum text-white shadow-sm'
                : 'text-muted-grey hover:text-obsidian'
            }`}
          >
            Interactive Simplifier
          </button>
          <button
            onClick={() => setActiveTab('dictionary')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'dictionary'
                ? 'bg-plum text-white shadow-sm'
                : 'text-muted-grey hover:text-obsidian'
            }`}
          >
            Medical Dictionary ({dictionaryTerms.length || '35+'})
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {activeTab === 'simplifier' ? (
        <>
          {/* Controls Bar */}
          <div className="bg-white rounded-xl border border-lavender-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-grey">Language for Explanation:</span>
              <div className="inline-flex rounded-lg border border-lavender-200 p-0.5 bg-porcelain">
                {(['English', 'Hindi', 'Telugu'] as const).map((lang) => (
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

            <button
              onClick={handleSimplify}
              disabled={isProcessing || !inputText.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-orchid hover:bg-orchid-hover text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Simplifying Medical Jargon...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Simplify Medical Text
                </>
              )}
            </button>
          </div>

          {/* Workspace: Original Text & Simplified Text */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Input Box */}
            <div className="bg-white rounded-xl border border-lavender-200 p-4 shadow-sm flex flex-col h-[380px]">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-lavender-100">
                <span className="text-xs font-bold text-obsidian uppercase tracking-wide">
                  Clinical Source Text
                </span>
                <button
                  onClick={() =>
                    setInputText(
                      'Patient diagnosed with hypertension and hyperglycemia. Administer medication orally. Prescribed Amlodipine 5 mg PO once daily and Metformin 500 mg PO BID after meals. Patient reported dyspnea on exertion.'
                    )
                  }
                  className="text-[11px] text-orchid hover:underline"
                >
                  Load Example Text
                </button>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter doctor's prescription, clinical diagnosis, or medical instructions to convert into simple terms..."
                className="flex-1 w-full text-xs text-obsidian leading-relaxed p-2 border border-lavender-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-orchid resize-none font-mono"
              />
            </div>

            {/* Simplified Output Box */}
            <div className="bg-white rounded-xl border border-lavender-200 p-4 shadow-sm flex flex-col h-[380px]">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-lavender-100">
                <span className="text-xs font-bold text-obsidian uppercase tracking-wide">
                  Patient-Friendly Explanation ({targetLanguage})
                </span>
                <button
                  onClick={handleCopy}
                  disabled={!simplificationResult?.simplified_text}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-plum bg-lavender-100 hover:bg-lavender-200 rounded border border-lavender-300 disabled:opacity-40 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 bg-porcelain rounded-lg border border-lavender-100 text-xs text-obsidian leading-relaxed whitespace-pre-wrap font-sans">
                {isProcessing ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-grey space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-orchid" />
                    <p>Converting medical jargon into layperson language...</p>
                  </div>
                ) : simplificationResult?.simplified_text ? (
                  simplificationResult.simplified_text
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-grey text-center p-4">
                    <Sparkles className="w-8 h-8 text-lavender-300 mb-2" />
                    <p>Click "Simplify Medical Text" to generate plain language guidance.</p>
                  </div>
                )}
              </div>

              {simplificationResult && (
                <div className="pt-2 mt-2 border-t border-lavender-100 flex items-center justify-between text-[11px] text-muted-grey">
                  <span>Preserved: {simplificationResult.preserved_elements.dosages.join(', ') || 'Exact dosages'}</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Dosages Intact
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Identified Terms & Explanations Card */}
          {simplificationResult && simplificationResult.identified_terms.length > 0 && (
            <div className="bg-white rounded-xl border border-lavender-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-plum" />
                <h3 className="text-sm font-bold text-obsidian">
                  Identified Clinical Terms & Clear Explanations ({simplificationResult.identified_terms.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {simplificationResult.identified_terms.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-lavender-200 bg-porcelain flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-plum">{item.term}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-lavender-200 text-plum font-medium">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-obsidian font-medium mt-1">
                        👉 {targetLanguage === 'Hindi'
                          ? item.simple_explanation_hi
                          : targetLanguage === 'Telugu'
                          ? item.simple_explanation_te
                          : item.simple_explanation_en}
                      </p>
                    </div>
                    {item.clinical_context && (
                      <p className="text-[11px] text-muted-grey italic mt-2 pt-2 border-t border-lavender-200/50">
                        {item.clinical_context}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medical Disclaimer Banner */}
          <div className="p-4 bg-amber-500/10 border border-amber-300/60 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 leading-relaxed">
              <strong>Medical Disclaimer:</strong> This simplified summary is generated to assist patients and community health workers in understanding complicated terminology. It preserves medication names, exact dosages, and treatment instructions, and does not alter doctor recommendations. Never stop or modify prescription dosages without consulting your physician.
            </div>
          </div>
        </>
      ) : (
        /* Dictionary View */
        <div className="bg-white rounded-xl border border-lavender-200 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-lavender-100">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-muted-grey absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medical terms (e.g. Hypertension, Dyspnea, Sublingual)..."
                className="w-full text-xs pl-9 pr-3 py-2 border border-lavender-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orchid"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-grey">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs px-3 py-1.5 border border-lavender-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orchid"
              >
                <option value="All">All Categories</option>
                <option value="Cardiovascular">Cardiovascular</option>
                <option value="Endocrine / Diabetes">Endocrine / Diabetes</option>
                <option value="Respiratory">Respiratory</option>
                <option value="Pharmacology">Pharmacology</option>
                <option value="Treatment Instructions">Treatment Instructions</option>
                <option value="General Clinical">General Clinical</option>
              </select>
            </div>
          </div>

          {loadingDict ? (
            <div className="py-12 text-center text-xs text-muted-grey">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-orchid" />
              Loading medical dictionary...
            </div>
          ) : dictionaryTerms.length === 0 ? (
            <p className="py-10 text-center text-xs text-muted-grey">No matching clinical terms found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dictionaryTerms.map((term) => (
                <div key={term.id} className="p-4 rounded-xl border border-lavender-200/80 bg-porcelain space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-obsidian">{term.term}</h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-lavender-200 text-plum">
                      {term.category}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-obsidian">
                      <strong className="text-plum">EN:</strong> {term.simple_explanation_en}
                    </p>
                    <p className="text-obsidian">
                      <strong className="text-plum">HI:</strong> {term.simple_explanation_hi}
                    </p>
                    <p className="text-obsidian">
                      <strong className="text-plum">TE:</strong> {term.simple_explanation_te}
                    </p>
                  </div>

                  {term.example_usage && (
                    <p className="text-[11px] text-muted-grey italic pt-1 border-t border-lavender-200/50">
                      Example: "{term.example_usage}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
