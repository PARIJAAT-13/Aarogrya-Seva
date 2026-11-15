import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { HealthcareArticle } from '../types';
import {
  BookOpen,
  Search,
  PlusCircle,
  Clock,
  Eye,
  Edit2,
  Trash2,
  X,
  Loader2,
  Heart,
  Baby,
  Shield,
  Activity,
  Users,
} from 'lucide-react';

interface HealthcareContentPageProps {
  onOpenNewArticle: () => void;
  onEditArticle: (article: HealthcareArticle) => void;
}

const CATEGORIES = [
  'All',
  'General Healthcare',
  'Preventive Healthcare',
  'Maternal Health',
  'Child Healthcare',
  'Elderly Care',
  'Common Diseases',
];

export const HealthcareContentPage: React.FC<HealthcareContentPageProps> = ({
  onOpenNewArticle,
  onEditArticle,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [articles, setArticles] = useState<HealthcareArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchVal, setSearchVal] = useState('');

  // Reader Modal State
  const [readingArticle, setReadingArticle] = useState<HealthcareArticle | null>(null);

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const data = await api.listArticles({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchVal || undefined,
      });
      setArticles(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, searchVal]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this educational article?')) return;
    try {
      await api.deleteArticle(id);
      await fetchArticles();
    } catch (err: any) {
      alert(err.message || 'Failed to delete article.');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Maternal Health':
        return <Heart className="w-4 h-4 text-[#A879E8]" />;
      case 'Child Healthcare':
        return <Baby className="w-4 h-4 text-[#A879E8]" />;
      case 'Preventive Healthcare':
        return <Shield className="w-4 h-4 text-[#A879E8]" />;
      case 'Elderly Care':
        return <Users className="w-4 h-4 text-[#352447]" />;
      case 'Common Diseases':
        return <Activity className="w-4 h-4 text-[#8A6729]" />;
      default:
        return <BookOpen className="w-4 h-4 text-[#A879E8]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#E9DDF8] shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-[#171923] flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#E9DDF8] text-[#352447]">
                <BookOpen className="w-5 h-5 text-[#A879E8]" />
              </span>
              Clinical Knowledge & Health Literacy
            </h2>
            <span className="text-[10px] font-bold text-[#352447] bg-[#E9DDF8] px-2.5 py-0.5 rounded-full border border-[#D5BEF4]">
              {articles.length} Articles
            </span>
          </div>
          <p className="text-xs text-[#858392] mt-1.5">
            Verified clinical guidance, preventative hygiene and maternal-child health advisories for rural communities
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={onOpenNewArticle}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#A879E8] to-[#915BDB] hover:from-[#9563D6] hover:to-[#834EC5] rounded-xl shadow-soft hover:shadow-glow-orchid transition-all self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>Publish Article</span>
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-xs rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#352447] text-white shadow-soft'
                : 'bg-white text-[#858392] hover:bg-[#FAF9FC] border border-[#E9DDF8]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-[#E9DDF8] shadow-soft">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#858392]" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search health articles by title, keywords, or topics..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] placeholder-[#858392]/70 focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8] transition-all"
          />
        </div>
      </div>

      {/* Articles Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-14 bg-white rounded-3xl border border-[#E9DDF8] shadow-soft">
          <Loader2 className="w-8 h-8 animate-spin text-[#A879E8] mb-2" />
          <span className="text-xs font-bold text-[#352447]">Loading verified health guidance...</span>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center p-14 bg-white rounded-3xl border border-[#E9DDF8] shadow-soft">
          <div className="w-12 h-12 rounded-2xl bg-[#E9DDF8] text-[#352447] flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6 text-[#A879E8]" />
          </div>
          <h4 className="text-sm font-bold text-[#171923]">No Articles Found</h4>
          <p className="text-xs text-[#858392] mt-1">Try switching categories or clearing search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((art) => (
            <div
              key={art.id}
              className="bg-white rounded-3xl border border-[#E9DDF8] p-6 shadow-soft hover:shadow-soft-md hover:border-[#A879E8]/50 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Category & Read Time */}
                <div className="flex items-center justify-between pb-3.5 border-b border-[#FAF9FC]">
                  <div className="flex items-center gap-1.5">
                    {getCategoryIcon(art.category)}
                    <span className="text-[11px] font-bold text-[#352447]">{art.category}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#858392]">
                    <Clock className="w-3 h-3 text-[#858392]" />
                    <span>{art.read_time_minutes} min read</span>
                  </div>
                </div>

                {/* Title & Summary */}
                <h3
                  onClick={() => setReadingArticle(art)}
                  className="text-sm font-extrabold text-[#171923] mt-3 hover:text-[#A879E8] cursor-pointer transition-colors leading-snug line-clamp-2"
                >
                  {art.title}
                </h3>
                <p className="text-xs text-[#858392] mt-2 line-clamp-3 leading-relaxed">{art.summary}</p>

                {/* Tags */}
                {art.tags && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {art.tags.split(',').map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-[#E9DDF8] text-[#352447] font-semibold px-2 py-0.5 rounded-md border border-[#D5BEF4]"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Controls */}
              <div className="mt-5 pt-3.5 border-t border-[#FAF9FC] flex items-center justify-between">
                <span className="text-[11px] text-[#858392]">By {art.author_name || 'Health Directorate'}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setReadingArticle(art)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#352447] bg-[#E9DDF8] hover:bg-[#DDD0EE] rounded-xl transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#A879E8]" />
                    <span>Read</span>
                  </button>

                  {isAdmin && (
                    <>
                      <button
                        onClick={() => onEditArticle(art)}
                        className="p-1.5 text-[#858392] hover:text-[#352447] rounded-lg hover:bg-[#FAF9FC] transition-colors cursor-pointer"
                        title="Edit Article"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(art.id)}
                        className="p-1.5 text-[#858392] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reader Modal */}
      {readingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171923]/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-soft-lg border border-[#E9DDF8] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E9DDF8] bg-[#FAF9FC]">
              <div className="flex items-center gap-2">
                {getCategoryIcon(readingArticle.category)}
                <span className="text-xs font-bold text-[#352447] uppercase tracking-wider">
                  {readingArticle.category}
                </span>
                <span className="text-[#858392]">•</span>
                <span className="text-xs text-[#858392]">{readingArticle.read_time_minutes} min read</span>
              </div>
              <button
                onClick={() => setReadingArticle(null)}
                className="p-1.5 text-[#858392] hover:text-[#171923] rounded-lg hover:bg-[#E9DDF8]/50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <h1 className="text-xl font-black text-[#171923] leading-tight">{readingArticle.title}</h1>
              <div className="p-4 bg-[#E9DDF8]/60 rounded-2xl border border-[#D5BEF4] text-xs text-[#352447] font-semibold leading-relaxed">
                {readingArticle.summary}
              </div>

              <div className="max-w-none text-[#171923] leading-relaxed whitespace-pre-line font-sans text-xs sm:text-sm">
                {readingArticle.content}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#E9DDF8] bg-[#FAF9FC] flex items-center justify-between text-xs text-[#858392]">
              <span>Published by <strong className="text-[#352447]">{readingArticle.author_name}</strong></span>
              <button
                onClick={() => setReadingArticle(null)}
                className="px-4 py-2 bg-gradient-to-r from-[#A879E8] to-[#915BDB] hover:from-[#9563D6] hover:to-[#834EC5] text-white font-bold rounded-xl shadow-soft transition-all cursor-pointer"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
