import { useState, useMemo } from 'react';
import { useTerminalStore } from '../../store/terminalStore';
import { ArrowLeft, Search, X, SlidersHorizontal, Target, ChevronRight } from 'lucide-react';
import type { NewsArticle, ExamType } from '../../types';
import { courseLabel } from '../../lib/courseNames';

const COURSE_FILTERS = ['CALC AB', 'CALC BC', 'STATS', 'BIO', 'CHEM', 'PHYS 1', 'CS A', 'CS PRINCIPLES', 'ENG LANG', 'PSYCH'];
const SENTIMENT_FILTERS = ['positive', 'negative', 'neutral', 'mixed'];
const EXAM_TABS: { id: ExamType | 'all'; label: string; color: string }[] = [
  { id: 'all', label: 'All', color: 'text-white' },
  { id: 'ap', label: 'AP', color: 'text-[#ff6a00]' },
  { id: 'ielts', label: 'IELTS', color: 'text-red-400' },
  { id: 'toefl', label: 'TOEFL', color: 'text-green-400' },
  { id: 'sat', label: 'SAT', color: 'text-blue-400' },
];

export function NewsArchiveView() {
  const { newsArticles, setSelectedArticle, setCurrentView, relevanceScores } = useTerminalStore();
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState<string | null>(null);
  const [sentimentFilter, setSentimentFilter] = useState<string | null>(null);
  const [examFilter, setExamFilter] = useState<ExamType | 'all'>('all');
  const [sortByRelevance, setSortByRelevance] = useState(false);

  const filtered = useMemo(() => {
    let result = newsArticles;
    if (examFilter !== 'all') result = result.filter((a) => a.exam_type === examFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((a) => a.title.toLowerCase().includes(q) || a.summary?.toLowerCase().includes(q) || a.keywords?.some((k) => k.toLowerCase().includes(q)) || a.ap_courses?.some((c) => c.toLowerCase().includes(q)));
    }
    if (courseFilter) result = result.filter((a) => a.ap_courses?.includes(courseFilter));
    if (sentimentFilter) result = result.filter((a) => a.sentiment_label === sentimentFilter);
    if (sortByRelevance) {
      result = [...result].sort((a, b) => {
        const ra = relevanceScores[(a.url || a.title)]?.relevance_score || 0;
        const rb = relevanceScores[(b.url || b.title)]?.relevance_score || 0;
        return rb - ra;
      });
    }
    return result;
  }, [newsArticles, search, courseFilter, sentimentFilter, examFilter, sortByRelevance, relevanceScores]);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] overflow-hidden">
      <div className="flex items-center gap-4 px-4 py-3 bg-[#12121a] border-b border-[#2a2a3a] shrink-0">
        <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-1 text-[#666] hover:text-white text-xs">
          <ArrowLeft size={14} /> Dashboard
        </button>
        <h2 className="text-sm font-bold text-cyan-400 tracking-wide">NEWS ARCHIVE</h2>
        <span className="text-[10px] text-[#555]">{filtered.length} / {newsArticles.length} articles</span>
        <div className="flex-1" />
        <button onClick={() => setSortByRelevance(!sortByRelevance)} className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded transition-colors ${sortByRelevance ? 'bg-[#ff6a00]/20 text-[#ff6a00]' : 'text-[#666] hover:text-[#aaa]'}`}>
          <Target size={12} /> {sortByRelevance ? '关联度排序中' : '关联度排序'}
        </button>
      </div>

      {/* Search & Filters */}
      <div className="px-4 py-2 bg-[#0d0d15] border-b border-[#2a2a3a] shrink-0 space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-[#1a1a2e] border border-[#2a2a3a] rounded px-3 py-1.5">
            <Search size={14} className="text-[#555] shrink-0" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search all news by keyword, course, source..." className="flex-1 bg-transparent text-xs text-[#ccc] outline-none ml-2 placeholder:text-[#444]" />
            {search && <button onClick={() => setSearch('')} className="text-[#555] hover:text-white"><X size={14} /></button>}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <SlidersHorizontal size={12} className="text-[#555] shrink-0" />
          {EXAM_TABS.map((tab) => (
            <button key={tab.id} onClick={() => setExamFilter(tab.id)} className={`px-2 py-0.5 rounded text-[9px] font-bold transition-colors ${examFilter === tab.id ? `bg-[#1e1e32] ${tab.color}` : 'bg-[#1a1a2e] text-[#666] hover:text-[#aaa]'}`}>{tab.label}</button>
          ))}
          <span className="text-[#333]">|</span>
          {COURSE_FILTERS.slice(0, 6).map((c) => (
            <button key={c} onClick={() => setCourseFilter(courseFilter === c ? null : c)} className={`px-1.5 py-0.5 rounded text-[8px] transition-colors ${courseFilter === c ? 'bg-[#ff6a00]/30 text-[#ff6a00]' : 'bg-[#1a1a2e] text-[#666] hover:text-[#aaa]'}`}>{courseLabel(c)}</button>
          ))}
          <span className="text-[#333]">|</span>
          {SENTIMENT_FILTERS.map((s) => (
            <button key={s} onClick={() => setSentimentFilter(sentimentFilter === s ? null : s)} className={`px-1.5 py-0.5 rounded text-[8px] transition-colors ${sentimentFilter === s ? (s === 'positive' ? 'bg-green-900/50 text-green-400' : s === 'negative' ? 'bg-red-900/50 text-red-400' : 'bg-blue-900/50 text-blue-400') : 'bg-[#1a1a2e] text-[#666] hover:text-[#aaa]'}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#444] gap-2"><Search size={32} /><span className="text-xs">No articles found. Try different filters or wait for news.</span></div>
        ) : (
          filtered.map((article, i) => {
            const rel = relevanceScores[(article.url || article.title)];
            return (
              <div key={`${article.url}-${i}`} onClick={() => setSelectedArticle(article)}
                className="px-4 py-2.5 border-b border-[#1e1e2e] hover:bg-[#12121a] transition-colors cursor-pointer group">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="px-1 py-0.5 rounded text-[8px] font-bold uppercase bg-blue-900/50 text-blue-400">{article.exam_type?.toUpperCase() || 'AP'}</span>
                  <span className={`px-1 py-0.5 rounded text-[8px] font-bold uppercase ${article.sentiment_label === 'positive' ? 'bg-green-900/50 text-green-400' : article.sentiment_label === 'negative' ? 'bg-red-900/50 text-red-400' : 'bg-blue-900/50 text-blue-400'}`}>{article.source}</span>
                  <span className="text-[9px] text-[#555]">{new Date(article.published_at).toLocaleString()}</span>
                  {rel && (
                    <span className={`text-[9px] font-bold ml-auto ${rel.relevance_score >= 70 ? 'text-green-400' : rel.relevance_score >= 40 ? 'text-[#ff6a00]' : 'text-[#666]'}`}>
                      <Target size={9} className="inline mr-0.5" />{rel.relevance_score} {rel.relevance_level}
                    </span>
                  )}
                  <span className="text-[9px] text-[#444] opacity-0 group-hover:opacity-100"><ChevronRight size={12} /></span>
                </div>
                <p className="text-xs text-[#ccc] leading-relaxed">{article.title}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
