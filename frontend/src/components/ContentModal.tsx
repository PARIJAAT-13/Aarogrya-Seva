import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { HealthcareArticle } from '../types';
import { BookOpen, X, Save, AlertCircle, Loader2 } from 'lucide-react';

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  articleToEdit?: HealthcareArticle | null;
}

const CATEGORIES = [
  'General Healthcare',
  'Preventive Healthcare',
  'Maternal Health',
  'Child Healthcare',
  'Elderly Care',
  'Common Diseases',
];

export const ContentModal: React.FC<ContentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  articleToEdit,
}) => {
  const isEdit = Boolean(articleToEdit);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('English');
  const [readTime, setReadTime] = useState(3);
  const [isPublished, setIsPublished] = useState(true);
  const [tags, setTags] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (articleToEdit) {
      setTitle(articleToEdit.title);
      setCategory(articleToEdit.category);
      setSummary(articleToEdit.summary);
      setContent(articleToEdit.content);
      setLanguage(articleToEdit.language);
      setReadTime(articleToEdit.read_time_minutes);
      setIsPublished(articleToEdit.is_published);
      setTags(articleToEdit.tags || '');
    } else {
      setTitle('');
      setCategory(CATEGORIES[0]);
      setSummary('');
      setContent('');
      setLanguage('English');
      setReadTime(3);
      setIsPublished(true);
      setTags('');
    }
  }, [articleToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (isEdit && articleToEdit) {
        await api.updateArticle(articleToEdit.id, {
          title: title.trim(),
          category,
          summary: summary.trim(),
          content: content.trim(),
          language,
          read_time_minutes: Number(readTime),
          is_published: isPublished,
          tags: tags.trim() || undefined,
        });
      } else {
        await api.createArticle({
          title: title.trim(),
          category,
          summary: summary.trim(),
          content: content.trim(),
          language,
          read_time_minutes: Number(readTime),
          is_published: isPublished,
          tags: tags.trim() || undefined,
        });
      }
      setIsLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save health article.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171923]/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-soft-lg border border-[#E9DDF8] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#E9DDF8]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#E9DDF8] text-[#352447]">
              <BookOpen className="w-5 h-5 text-[#A879E8]" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#171923]">
                {isEdit ? 'Edit Healthcare Article' : 'Publish Healthcare Article'}
              </h3>
              <p className="text-xs text-[#858392]">Educational repository for rural health literacy</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#858392] hover:text-[#171923] rounded-lg hover:bg-[#FAF9FC] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 mt-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#171923] mb-1.5">
              Article Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Essential Guidelines for Managing Seasonal Fevers"
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#171923] mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171923] mb-1.5">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Telugu">Telugu</option>
                <option value="Tamil">Tamil</option>
                <option value="Kannada">Kannada</option>
                <option value="Bengali">Bengali</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171923] mb-1.5">Est. Read Time (Minutes)</label>
              <input
                type="number"
                min={1}
                max={60}
                value={readTime}
                onChange={(e) => setReadTime(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171923] mb-1.5">
              Article Summary / Abstract <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="A brief 1-2 sentence overview for cards and listings..."
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171923] mb-1.5">
              Full Content (Supports Markdown & Headers) <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={8}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# Heading 1&#10;&#10;Explain symptoms, guidelines and preventive measures in clear language..."
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] font-mono focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-[#171923] mb-1.5">Keywords / Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="maternal, nutrition, pregnancy, village"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9FC] border border-[#E9DDF8] rounded-xl text-[#171923] focus:outline-hidden focus:ring-2 focus:ring-[#A879E8]/30 focus:border-[#A879E8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171923] mb-1.5">Publishing Status</label>
              <label className="flex items-center gap-2 mt-2 text-xs text-[#171923] font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded text-[#A879E8] focus:ring-[#A879E8]"
                />
                <span>Publish immediately to all healthcare users</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E9DDF8]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 text-xs font-bold text-[#858392] hover:bg-[#FAF9FC] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#A879E8] to-[#915BDB] hover:from-[#9563D6] hover:to-[#834EC5] rounded-xl shadow-soft hover:shadow-glow-orchid transition-all cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Save className="w-4 h-4 text-white" />}
              <span>{isEdit ? 'Update Article' : 'Publish Article'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
