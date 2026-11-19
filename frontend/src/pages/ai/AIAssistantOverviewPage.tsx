import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Languages,
  FileCode,
  Cpu,
  Activity,
  BookOpenCheck,
  FileText,
  Globe,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { api } from '../../services/api';
import { AIDashboardStats } from '../../types';

interface AIAssistantOverviewPageProps {
  onNavigateTab: (tab: string) => void;
}

export const AIAssistantOverviewPage: React.FC<AIAssistantOverviewPageProps> = ({ onNavigateTab }) => {
  const [stats, setStats] = useState<AIDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAIDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load AI engine metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const featureCards = [
    {
      id: 'ai_translation',
      title: 'Medical Language Translation',
      subtitle: 'Prescriptions, discharge summaries, and medical reports',
      desc: 'OCR-powered text extraction from PDF and images with high-accuracy translation into Hindi and Telugu while safeguarding drug names and dosage instructions.',
      icon: Languages,
      color: 'bg-orchid-500/10 text-orchid-600 border-orchid-200',
      badge: 'Bilingual NLP',
      action: 'Launch Translator',
    },
    {
      id: 'ai_simplification',
      title: 'Medical Terminology Simplification',
      subtitle: 'Patient-friendly medical explanations',
      desc: 'Converts complex clinical terms (e.g. Hypertension, Dyspnea, PO BID) into easily understandable plain explanations in English, Hindi, and Telugu.',
      icon: FileCode,
      color: 'bg-champagne-600/10 text-champagne-dark border-champagne-200',
      badge: 'Plain Language AI',
      action: 'Launch Simplifier',
    },
    {
      id: 'ai_ner',
      title: 'Medical Information Extraction (NER)',
      subtitle: 'Clinical entity recognition pipeline',
      desc: 'Extracts structured diseases, prescribed medicines, dosages, frequencies, routes, and treatment directives into organized clinical JSON.',
      icon: Cpu,
      color: 'bg-plum/10 text-plum border-lavender-300',
      badge: 'Clinical NER',
      action: 'Launch NER Engine',
    },
    {
      id: 'ai_symptoms',
      title: 'Symptom Explorer',
      subtitle: 'Verified disease awareness & warning signs',
      desc: 'Multilingual symptom guide with causes, self-care guidance, red-flag emergency symptoms, and related healthcare FAQs.',
      icon: Activity,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badge: 'Clinical Guidance',
      action: 'Explore Symptoms',
    },
    {
      id: 'ai_knowledge',
      title: 'Healthcare Knowledge Base',
      subtitle: 'Verified multilingual encyclopedia',
      desc: 'Searchable clinical articles and preventive health protocols verified from MoHFW and WHO guidelines across English, Hindi, and Telugu.',
      icon: BookOpenCheck,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      badge: 'Verified MoHFW',
      action: 'Browse Knowledge',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-plum via-plum-surface to-obsidian rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orchid/30 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orchid/20 text-orchid-light border border-orchid/30 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Milestone 2 • AI-Powered Medical Translation & Simplification Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-porcelain mb-2">
            AI Medical Intelligence Platform
          </h1>
          <p className="text-lavender-soft/80 text-sm sm:text-base leading-relaxed">
            Bridging rural healthcare communication barriers through OCR document extraction,
            neural translation across Indian languages, clinical terminology simplification, and verified symptom intelligence.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-lavender-200/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-grey">Total Documents Processed</p>
            <h3 className="text-2xl font-bold text-obsidian mt-1">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-orchid" /> : (stats?.total_documents_processed ?? 0)}
            </h3>
            <p className="text-xs text-muted-grey mt-0.5">PDF, Scanned & Images</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orchid/10 text-orchid flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-lavender-200/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-grey">Clinical Translations</p>
            <h3 className="text-2xl font-bold text-obsidian mt-1">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-orchid" /> : (stats?.total_translations ?? 0)}
            </h3>
            <p className="text-xs text-muted-grey mt-0.5">Hindi, Telugu & English</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-champagne-600/10 text-champagne-dark flex items-center justify-center">
            <Languages className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-lavender-200/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-grey">Medical Entities Extracted</p>
            <h3 className="text-2xl font-bold text-obsidian mt-1">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-orchid" /> : (stats?.total_entities_extracted ?? 0)}
            </h3>
            <p className="text-xs text-muted-grey mt-0.5">Diseases, Drugs & Dosages</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-plum/10 text-plum flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-lavender-200/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-grey">Supported Languages</p>
            <h3 className="text-2xl font-bold text-obsidian mt-1">3 Available</h3>
            <p className="text-xs text-muted-grey mt-0.5">English • Hindi • Telugu</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 5 Core Feature Modules */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-obsidian">AI Assistant Engines</h2>
            <p className="text-xs text-muted-grey">Select a module to begin clinical processing or knowledge lookup</p>
          </div>
          <button
            onClick={fetchStats}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-grey hover:text-obsidian bg-white border border-lavender-200 rounded-lg hover:bg-porcelain transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Data
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => onNavigateTab(card.id)}
                className="bg-white border border-lavender-200/80 hover:border-orchid/60 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-11 h-11 rounded-lg flex items-center justify-center border ${card.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-lavender-soft text-plum border border-lavender-200">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-obsidian group-hover:text-orchid-600 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs font-medium text-plum/70 mb-2">{card.subtitle}</p>
                  <p className="text-xs text-muted-grey leading-relaxed line-clamp-3">
                    {card.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-lavender-100 flex items-center justify-between text-xs font-semibold text-orchid-600 group-hover:text-orchid-700">
                  <span>{card.action}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Sections: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Translations */}
        <div className="bg-white rounded-xl border border-lavender-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-orchid" />
              <h3 className="text-sm font-bold text-obsidian">Recent Translation Activity</h3>
            </div>
            <button
              onClick={() => onNavigateTab('ai_translation')}
              className="text-xs font-semibold text-orchid hover:underline"
            >
              View All
            </button>
          </div>

          {!stats?.recent_translations || stats.recent_translations.length === 0 ? (
            <p className="text-xs text-muted-grey text-center py-6">No recent translations recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recent_translations.slice(0, 3).map((item) => (
                <div key={item.id} className="p-3 bg-porcelain rounded-lg border border-lavender-200/50">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-obsidian">
                      {item.patient_name || item.document_title || `Translation #${item.id}`}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-orchid-100 text-orchid-700">
                      {item.source_language} → {item.target_language}
                    </span>
                  </div>
                  <p className="text-xs text-muted-grey line-clamp-1 italic mb-1">
                    "{item.original_text}"
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-muted-grey">
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Confidence: {(item.confidence_score * 100).toFixed(0)}%
                    </span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Extractions */}
        <div className="bg-white rounded-xl border border-lavender-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-plum" />
              <h3 className="text-sm font-bold text-obsidian">Recent Clinical NER Extractions</h3>
            </div>
            <button
              onClick={() => onNavigateTab('ai_ner')}
              className="text-xs font-semibold text-orchid hover:underline"
            >
              View All
            </button>
          </div>

          {!stats?.recent_extractions || stats.recent_extractions.length === 0 ? (
            <p className="text-xs text-muted-grey text-center py-6">No clinical entities extracted yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recent_extractions.slice(0, 3).map((item, idx) => (
                <div key={item.id || idx} className="p-3 bg-porcelain rounded-lg border border-lavender-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-obsidian">
                      {item.diseases.length > 0 ? item.diseases.join(', ') : 'Clinical Record'}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-lavender-200 text-plum">
                      {item.total_entities_count} entities
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {item.medications.map((m, mIdx) => (
                      <span key={mIdx} className="text-[11px] px-2 py-0.5 bg-white border border-lavender-200 rounded text-obsidian font-medium">
                        💊 {m.name} ({m.dosage})
                      </span>
                    ))}
                  </div>
                  {item.treatment_instructions.length > 0 && (
                    <p className="text-[11px] text-muted-grey line-clamp-1">
                      📋 {item.treatment_instructions[0]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Safety & Medical Disclaimer */}
      <div className="p-4 bg-amber-500/10 border border-amber-300/60 rounded-xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong className="font-semibold text-amber-950">Medical Disclaimer & Clinical Safety:</strong> AarogyaSeva AI assistance tools (translation, simplification, NER, and symptom explorer) are engineered to support patient education, health communication, and clinical documentation. They do not replace autonomous medical decision-making, clinical diagnosis, or consultation with licensed healthcare practitioners. Prescriptions and dosages must always be verified by certified medical personnel.
        </div>
      </div>
    </div>
  );
};
