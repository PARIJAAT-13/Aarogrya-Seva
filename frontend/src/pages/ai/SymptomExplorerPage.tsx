import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  AlertTriangle,
  HeartPulse,
  ShieldAlert,
  HelpCircle,
  ChevronRight,
  X,
  RefreshCw,
  PhoneCall,
  Sparkles,
  BookOpen,
  Info,
} from 'lucide-react';
import { api } from '../../services/api';
import { SymptomSummaryItem, SymptomDetail } from '../../types';

export const SymptomExplorerPage: React.FC = () => {
  const [symptoms, setSymptoms] = useState<SymptomSummaryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [language, setLanguage] = useState<'English' | 'Hindi' | 'Telugu'>('English');
  const [loading, setLoading] = useState(false);

  // Selected symptom detail modal
  const [selectedSymptomId, setSelectedSymptomId] = useState<number | null>(null);
  const [symptomDetail, setSymptomDetail] = useState<SymptomDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const categories = [
    'All',
    'General',
    'Cardiovascular',
    'Respiratory',
    'Digestive',
    'Neurological',
    'Endocrine / Diabetes',
    'Musculoskeletal',
  ];

  useEffect(() => {
    fetchSymptoms();
  }, [searchQuery, selectedCategory, language]);

  const fetchSymptoms = async () => {
    try {
      setLoading(true);
      const params: any = { language };
      if (searchQuery.trim()) params.query = searchQuery.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const data = await api.listSymptoms(params);
      setSymptoms(data);
    } catch (err: any) {
      console.error('Failed to load symptoms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (id: number) => {
    setSelectedSymptomId(id);
    try {
      setLoadingDetail(true);
      const data = await api.getSymptomDetail(id);
      setSymptomDetail(data);
    } catch (err: any) {
      console.error('Failed to load symptom detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedSymptomId(null);
    setSymptomDetail(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-obsidian">Symptom Explorer & Clinical Guidance</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
              Verified Health Awareness
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-grey mt-0.5">
            Verified reference information on common symptoms, self-care measures, associated conditions, and emergency warning signs.
          </p>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-grey">Language:</span>
          <div className="inline-flex rounded-lg border border-lavender-200 p-0.5 bg-porcelain">
            {(['English', 'Hindi', 'Telugu'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  language === lang
                    ? 'bg-plum text-white shadow-sm'
                    : 'text-muted-grey hover:text-obsidian'
                }`}
              >
                {lang === 'Hindi' ? 'हिन्दी' : lang === 'Telugu' ? 'తెలుగు' : 'English'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Prominent Educational & Non-Diagnostic Disclaimer */}
      <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <strong className="font-semibold text-blue-950">Educational Health Awareness Only:</strong> This module provides general symptom education and verified clinical guidelines. It does NOT diagnose medical conditions or replace formal consultation with a qualified doctor. If you experience severe symptoms, contact emergency medical services (108) or visit the nearest Primary Health Centre immediately.
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-xl border border-lavender-200 p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-muted-grey absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symptoms by name or keywords (e.g. fever, headache, chest pain, దగ్గు, बुखार)..."
            className="w-full text-xs pl-9 pr-4 py-2 border border-lavender-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orchid text-obsidian"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-plum text-white shadow-sm'
                  : 'bg-porcelain text-muted-grey hover:text-obsidian border border-lavender-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Symptoms Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-muted-grey">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-orchid" />
          Loading symptom reference data...
        </div>
      ) : symptoms.length === 0 ? (
        <div className="bg-white rounded-xl border border-lavender-200 p-8 text-center text-muted-grey space-y-2">
          <Activity className="w-8 h-8 mx-auto text-lavender-300" />
          <p className="text-sm font-semibold text-obsidian">No symptoms found</p>
          <p className="text-xs">Try searching for another symptom or clearing the category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {symptoms.map((s) => {
            const displayName =
              language === 'Hindi' && s.symptom_name_hi
                ? s.symptom_name_hi
                : language === 'Telugu' && s.symptom_name_te
                ? s.symptom_name_te
                : s.symptom_name;

            const isUrgent = s.urgency_level.includes('Urgent');

            return (
              <div
                key={s.id}
                onClick={() => handleOpenDetail(s.id)}
                className="bg-white rounded-xl border border-lavender-200/80 hover:border-orchid/60 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-porcelain text-plum border border-lavender-200">
                      {s.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isUrgent
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {s.urgency_level}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-obsidian group-hover:text-orchid-600 transition-colors mb-1">
                    {displayName}
                  </h3>
                  <p className="text-xs text-muted-grey leading-relaxed line-clamp-2">
                    {s.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-lavender-100 flex items-center justify-between text-xs font-semibold text-orchid group-hover:text-orchid-hover">
                  <span>Explore Guidance</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Symptom Detail Modal */}
      {selectedSymptomId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-lavender-200 p-6 space-y-5">
            {loadingDetail || !symptomDetail ? (
              <div className="py-16 text-center text-xs text-muted-grey">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orchid" />
                Retrieving detailed clinical guidance...
              </div>
            ) : (
              <>
                {/* Modal Header */}
                <div className="flex items-start justify-between pb-3 border-b border-lavender-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-porcelain text-plum border border-lavender-200">
                        {symptomDetail.category}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          symptomDetail.urgency_level.includes('Urgent')
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {symptomDetail.urgency_level}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-obsidian">
                      {language === 'Hindi' && symptomDetail.symptom_name_hi
                        ? symptomDetail.symptom_name_hi
                        : language === 'Telugu' && symptomDetail.symptom_name_te
                        ? symptomDetail.symptom_name_te
                        : symptomDetail.symptom_name}
                    </h2>
                  </div>
                  <button
                    onClick={handleCloseDetail}
                    className="p-1.5 rounded-lg text-muted-grey hover:text-obsidian hover:bg-porcelain transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-grey mb-1">Overview</h4>
                  <p className="text-xs text-obsidian leading-relaxed">
                    {language === 'Hindi' && symptomDetail.description_hi
                      ? symptomDetail.description_hi
                      : language === 'Telugu' && symptomDetail.description_te
                      ? symptomDetail.description_te
                      : symptomDetail.description_en}
                  </p>
                </div>

                {/* Possible Causes */}
                <div className="p-3.5 bg-porcelain rounded-xl border border-lavender-200/60">
                  <h4 className="text-xs font-bold text-plum mb-1.5 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-orchid" />
                    Possible Associated Health Conditions (Verified References)
                  </h4>
                  <p className="text-xs text-obsidian leading-relaxed">
                    {language === 'Hindi' && symptomDetail.possible_causes_hi
                      ? symptomDetail.possible_causes_hi
                      : language === 'Telugu' && symptomDetail.possible_causes_te
                      ? symptomDetail.possible_causes_te
                      : symptomDetail.possible_causes_en}
                  </p>
                </div>

                {/* Self Care Advice */}
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <h4 className="text-xs font-bold text-emerald-900 mb-1.5 flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-emerald-700" />
                    Self-Care & Preventative Guidance
                  </h4>
                  <p className="text-xs text-emerald-950 leading-relaxed">
                    {language === 'Hindi' && symptomDetail.self_care_advice_hi
                      ? symptomDetail.self_care_advice_hi
                      : language === 'Telugu' && symptomDetail.self_care_advice_te
                      ? symptomDetail.self_care_advice_te
                      : symptomDetail.self_care_advice_en}
                  </p>
                </div>

                {/* Red Flag Warning Box */}
                <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wide">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>When to Seek Immediate Medical Attention (Red Flags)</span>
                  </div>
                  <p className="text-xs text-rose-950 leading-relaxed font-medium">
                    {language === 'Hindi' && symptomDetail.when_to_see_doctor_hi
                      ? symptomDetail.when_to_see_doctor_hi
                      : language === 'Telugu' && symptomDetail.when_to_see_doctor_te
                      ? symptomDetail.when_to_see_doctor_te
                      : symptomDetail.when_to_see_doctor_en}
                  </p>
                </div>

                {/* Related FAQs */}
                {symptomDetail.related_faqs && symptomDetail.related_faqs.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-grey">
                      Frequently Asked Questions
                    </h4>
                    <div className="space-y-2">
                      {symptomDetail.related_faqs.map((faq, i) => (
                        <div key={i} className="p-3 bg-porcelain rounded-lg border border-lavender-100 text-xs">
                          <p className="font-bold text-plum mb-0.5">Q: {faq.q}</p>
                          <p className="text-obsidian leading-relaxed">{faq.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reference Source and Close */}
                <div className="pt-3 border-t border-lavender-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-grey">
                  <span>Source: {symptomDetail.reference_source}</span>
                  <button
                    onClick={handleCloseDetail}
                    className="w-full sm:w-auto px-5 py-2 bg-plum hover:bg-plum-light text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Close Guidance
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
