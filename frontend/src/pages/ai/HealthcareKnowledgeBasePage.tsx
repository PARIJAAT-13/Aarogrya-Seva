import React, { useState, useEffect } from 'react';
import {
  BookOpenCheck,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  X,
  RefreshCw,
  Globe,
  Tag,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { KnowledgeBaseArticle } from '../../types';

export const HealthcareKnowledgeBasePage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [language, setLanguage] = useState<'English' | 'Hindi' | 'Telugu'>('English');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Article reading modal
  const [readingArticle, setReadingArticle] = useState<KnowledgeBaseArticle | null>(null);

  // Admin Create/Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<KnowledgeBaseArticle | null>(null);
  const [formData, setFormData] = useState({
    title_en: '',
    title_hi: '',
    title_te: '',
    category: 'Chronic Conditions',
    tags: '',
    summary_en: '',
    summary_hi: '',
    summary_te: '',
    content_en: '',
    content_hi: '',
    content_te: '',
    reference_source: 'Ministry of Health and Family Welfare (MoHFW) / WHO Guidelines',
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'All',
    'Chronic Conditions',
    'Maternal & Child Health',
    'Preventive Care',
    'Infectious Diseases',
    'Nutrition & Sanitation',
    'First Aid',
  ];

  useEffect(() => {
    fetchArticles();
  }, [searchQuery, selectedCategory]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (searchQuery.trim()) params.query = searchQuery.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;
      const data = await api.listKnowledgeBase(params);
      setArticles(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load knowledge base articles');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingArticle(null);
    setFormData({
      title_en: '',
      title_hi: '',
      title_te: '',
      category: 'Chronic Conditions',
      tags: '',
      summary_en: '',
      summary_hi: '',
      summary_te: '',
      content_en: '',
      content_hi: '',
      content_te: '',
      reference_source: 'Ministry of Health and Family Welfare (MoHFW) / WHO Guidelines',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (article: KnowledgeBaseArticle) => {
    setEditingArticle(article);
    setFormData({
      title_en: article.title_en,
      title_hi: article.title_hi || '',
      title_te: article.title_te || '',
      category: article.category,
      tags: article.tags || '',
      summary_en: article.summary_en || '',
      summary_hi: article.summary_hi || '',
      summary_te: article.summary_te || '',
      content_en: article.content_en,
      content_hi: article.content_hi || '',
      content_te: article.content_te || '',
      reference_source: article.reference_source,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this knowledge base article?')) return;
    try {
      await api.deleteKnowledgeBaseArticle(id);
      fetchArticles();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete article');
    }
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title_en.trim() || !formData.content_en.trim()) {
      alert('English title and content are required.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingArticle) {
        await api.updateKnowledgeBaseArticle(editingArticle.id, formData);
      } else {
        await api.createKnowledgeBaseArticle(formData);
      }
      setIsModalOpen(false);
      fetchArticles();
    } catch (err: any) {
      alert(err?.message || 'Failed to save knowledge base article');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-obsidian">Multilingual Healthcare Knowledge Base</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-200">
              MoHFW & WHO Verified
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-grey mt-0.5">
            Verified medical encyclopedia, disease awareness, chronic condition protocols, and preventive guides in 3 languages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
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

          {isAdmin && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-4 py-2 bg-orchid hover:bg-orchid-hover text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Article
            </button>
          )}
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
            placeholder="Search articles by topic, keyword, or disease (e.g. hypertension, diabetes, antenatal, malaria)..."
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

      {/* Articles Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-muted-grey">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-orchid" />
          Loading knowledge base articles...
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white rounded-xl border border-lavender-200 p-8 text-center text-muted-grey space-y-2">
          <BookOpenCheck className="w-8 h-8 mx-auto text-lavender-300" />
          <p className="text-sm font-semibold text-obsidian">No articles found</p>
          <p className="text-xs">Try adjusting your search terms or selecting another category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((article) => {
            const title =
              language === 'Hindi' && article.title_hi
                ? article.title_hi
                : language === 'Telugu' && article.title_te
                ? article.title_te
                : article.title_en;

            const summary =
              language === 'Hindi' && article.summary_hi
                ? article.summary_hi
                : language === 'Telugu' && article.summary_te
                ? article.summary_te
                : article.summary_en || article.content_en.slice(0, 160) + '...';

            return (
              <div
                key={article.id}
                className="bg-white rounded-xl border border-lavender-200/80 hover:border-orchid/60 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-porcelain text-plum border border-lavender-200">
                      {article.category}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  </div>

                  <h3
                    onClick={() => setReadingArticle(article)}
                    className="text-sm font-bold text-obsidian hover:text-orchid-600 transition-colors cursor-pointer line-clamp-2 mb-2"
                  >
                    {title}
                  </h3>

                  <p className="text-xs text-muted-grey leading-relaxed line-clamp-3 mb-3">
                    {summary}
                  </p>

                  {article.tags && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {article.tags.split(',').map((tag, i) => (
                        <span key={i} className="text-[10px] text-plum/70 bg-lavender-50 px-2 py-0.5 rounded">
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-lavender-100 flex items-center justify-between">
                  <span className="text-[10px] text-muted-grey truncate max-w-[150px]">
                    {article.reference_source}
                  </span>

                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(article)}
                          className="p-1 text-muted-grey hover:text-plum transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="p-1 text-muted-grey hover:text-rose-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setReadingArticle(article)}
                      className="text-xs font-semibold text-orchid hover:underline"
                    >
                      Read Guide →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Article Reader Modal */}
      {readingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-lavender-200 p-6 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-lavender-100">
              <div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-lavender-100 text-plum border border-lavender-200 mb-2 inline-block">
                  {readingArticle.category}
                </span>
                <h2 className="text-xl font-bold text-obsidian">
                  {language === 'Hindi' && readingArticle.title_hi
                    ? readingArticle.title_hi
                    : language === 'Telugu' && readingArticle.title_te
                    ? readingArticle.title_te
                    : readingArticle.title_en}
                </h2>
              </div>
              <button
                onClick={() => setReadingArticle(null)}
                className="p-1.5 rounded-lg text-muted-grey hover:text-obsidian hover:bg-porcelain transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="prose prose-sm max-w-none text-xs text-obsidian leading-relaxed whitespace-pre-wrap font-sans">
              {language === 'Hindi' && readingArticle.content_hi
                ? readingArticle.content_hi
                : language === 'Telugu' && readingArticle.content_te
                ? readingArticle.content_te
                : readingArticle.content_en}
            </div>

            <div className="pt-3 border-t border-lavender-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-grey">
              <span>Source Citation: <strong>{readingArticle.reference_source}</strong></span>
              <button
                onClick={() => setReadingArticle(null)}
                className="w-full sm:w-auto px-5 py-2 bg-plum hover:bg-plum-light text-white font-semibold rounded-lg transition-colors"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-lavender-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-lavender-100">
              <h2 className="text-base font-bold text-obsidian">
                {editingArticle ? 'Edit Knowledge Base Article' : 'Create Knowledge Base Article'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-muted-grey hover:text-obsidian hover:bg-porcelain transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-obsidian mb-1">Title (English) *</label>
                <input
                  type="text"
                  required
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  className="w-full px-3 py-2 border border-lavender-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orchid"
                  placeholder="e.g. Hypertension Diet and Medication Protocol"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-obsidian mb-1">Title (Hindi)</label>
                  <input
                    type="text"
                    value={formData.title_hi}
                    onChange={(e) => setFormData({ ...formData, title_hi: e.target.value })}
                    className="w-full px-3 py-2 border border-lavender-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orchid"
                    placeholder="शीर्षक (हिन्दी)"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-obsidian mb-1">Title (Telugu)</label>
                  <input
                    type="text"
                    value={formData.title_te}
                    onChange={(e) => setFormData({ ...formData, title_te: e.target.value })}
                    className="w-full px-3 py-2 border border-lavender-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orchid"
                    placeholder="శీర్షిక (తెలుగు)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-obsidian mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-lavender-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orchid"
                  >
                    <option value="Chronic Conditions">Chronic Conditions</option>
                    <option value="Maternal & Child Health">Maternal & Child Health</option>
                    <option value="Preventive Care">Preventive Care</option>
                    <option value="Infectious Diseases">Infectious Diseases</option>
                    <option value="Nutrition & Sanitation">Nutrition & Sanitation</option>
                    <option value="First Aid">First Aid</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-obsidian mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3 py-2 border border-lavender-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orchid"
                    placeholder="e.g. bp, diet, exercise"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-obsidian mb-1">Article Content (English) *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.content_en}
                  onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                  className="w-full px-3 py-2 border border-lavender-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orchid font-mono"
                  placeholder="Comprehensive clinical guidance, instructions, and preventive protocols..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-obsidian mb-1">Content (Hindi)</label>
                  <textarea
                    rows={3}
                    value={formData.content_hi}
                    onChange={(e) => setFormData({ ...formData, content_hi: e.target.value })}
                    className="w-full px-3 py-2 border border-lavender-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orchid font-mono"
                    placeholder="लेख की सामग्री (हिन्दी)..."
                  />
                </div>
                <div>
                  <label className="block font-semibold text-obsidian mb-1">Content (Telugu)</label>
                  <textarea
                    rows={3}
                    value={formData.content_te}
                    onChange={(e) => setFormData({ ...formData, content_te: e.target.value })}
                    className="w-full px-3 py-2 border border-lavender-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orchid font-mono"
                    placeholder="వ్యాస సమాచారం (తెలుగు)..."
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-obsidian mb-1">Verified Reference Source *</label>
                <input
                  type="text"
                  required
                  value={formData.reference_source}
                  onChange={(e) => setFormData({ ...formData, reference_source: e.target.value })}
                  className="w-full px-3 py-2 border border-lavender-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orchid"
                  placeholder="e.g. Ministry of Health & Family Welfare / WHO Guidelines"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-lavender-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-lavender-200 text-muted-grey hover:text-obsidian rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-orchid hover:bg-orchid-hover text-white font-semibold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingArticle ? 'Update Article' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
