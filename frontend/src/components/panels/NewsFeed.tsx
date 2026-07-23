import React, { useState, useMemo } from 'react';
import { useTerminalStore } from '../../store/terminalStore';
import type { NewsArticle } from '../../types';
import { Target, ChevronRight, Globe } from 'lucide-react';
import { localRelevanceScore } from '../../lib/relevance';
import { courseLabel } from '../../lib/courseNames';
import { toggleBookmark, isBookmarked } from '../../lib/layoutPresets';
import { Bookmark } from 'lucide-react';

function timeAgo(d: string): string {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return `${s}秒前`;
  if (s < 3600) return `${Math.floor(s / 60)}分钟前`;
  return `${Math.floor(s / 3600)}小时前`;
}

function NewsCard({ article, onClick, showEn, onToggleLang }: {
  article: NewsArticle; onClick: () => void; showEn: boolean; onToggleLang: () => void;
}) {
  const rel = useMemo(() => localRelevanceScore(article), [article.title, article.title_zh]);
  const title = showEn ? article.title : (article.title_zh || article.title);
  const summary = showEn ? article.summary : (article.summary_zh || article.summary);

  return (
    <div onClick={onClick} className="px-3 py-2 border-b border-[#1e1e2e] hover:bg-[#16162a] transition-colors cursor-pointer group">
      <div className="flex items-center gap-1.5 mb-1">
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
          article.sentiment_label === 'positive' ? 'bg-green-900/50 text-green-400' :
          article.sentiment_label === 'negative' ? 'bg-red-900/50 text-red-400' :
          article.sentiment_label === 'mixed' ? 'bg-yellow-900/50 text-yellow-400' :
          'bg-blue-900/50 text-blue-400'
        }`}>{article.source}</span>
        <span className="text-[10px] text-[#555]">{timeAgo(article.published_at)}</span>
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0" style={{
          background: rel.score >= 70 ? 'rgba(74,222,128,0.2)' : rel.score >= 45 ? 'rgba(255,106,0,0.2)' : 'rgba(100,100,100,0.2)',
          color: rel.score >= 70 ? '#4ade80' : rel.score >= 45 ? '#ff6a00' : '#888',
        }} title={rel.reason}>
          <Target size={9} className="inline mr-0.5" />{rel.score}
        </span>
        <button onClick={(e) => { e.stopPropagation(); toggleBookmark(article.url || article.title); }}
          className={`text-[9px] px-1.5 py-0.5 rounded hover:bg-[#1e1e2e] transition-colors ${isBookmarked(article.url || article.title) ? 'text-yellow-400' : 'text-[#444] hover:text-[#aaa]'}`}
          title="收藏">
          <Bookmark size={10} fill={isBookmarked(article.url || article.title) ? 'currentColor' : 'none'} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onToggleLang(); }}
          className="text-[9px] text-[#555] hover:text-[#aaa] px-1.5 py-0.5 rounded hover:bg-[#1e1e2e] transition-colors flex items-center gap-1"
          title={showEn ? '切换为中文' : 'Show English'}>
          <Globe size={10} />{showEn ? '中' : 'EN'}
        </button>
        <span className="text-[9px] text-[#444] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 ml-auto">
          阅读 <ChevronRight size={10} />
        </span>
      </div>
      <p className="text-[11px] text-[#ccc] leading-relaxed line-clamp-2">{title}</p>
      {summary && summary !== title && (
        <p className="text-[10px] text-[#666] mt-0.5 line-clamp-1">{summary}</p>
      )}
      {article.ap_courses && article.ap_courses.length > 0 && (
        <div className="flex gap-1 mt-1 flex-wrap">
          {article.ap_courses.map(c => <span key={c} className="px-1.5 py-0.5 rounded bg-[#1a1a30] text-[9px] text-[#ff6a00]">{courseLabel(c)}</span>)}
        </div>
      )}
    </div>
  );
}

export function NewsFeed() {
  const newsArticles = useTerminalStore((s) => s.newsArticles);
  const activeExamType = useTerminalStore((s) => s.activeExamType);
  const setSelectedArticle = useTerminalStore((s) => s.setSelectedArticle);
  const [showEn, setShowEn] = useState(false);

  const articles = React.useMemo(
    () => newsArticles.filter((a) => a.exam_type === activeExamType),
    [newsArticles, activeExamType]
  );

  const colors: Record<string, string> = { ap: '#ff6a00', ielts: '#f87171', toefl: '#4ade80', sat: '#60a5fa' };
  const labels: Record<string, string> = { ap: 'AP', ielts: '雅思', toefl: '托福', sat: 'SAT' };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#16162a] border-b border-[#2a2a3a] shrink-0 panel-drag-handle cursor-move">
        <span className="text-[11px] font-bold tracking-wide flex items-center gap-2" style={{ color: colors[activeExamType] }}>
          📰 {labels[activeExamType]} 新闻动态
          <span className="text-[9px] font-normal text-[#666]">点击阅读全文</span>
        </span>
        <button onClick={() => setShowEn(!showEn)}
          className={`text-[9px] px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${showEn ? 'bg-blue-400/20 text-blue-400' : 'bg-[#1a1a2e] text-[#666] hover:text-[#aaa]'}`}>
          <Globe size={10} /> {showEn ? '英文' : '中文'}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {articles.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#444] text-xs gap-2">
            等待 {labels[activeExamType]} 新闻推送... <span className="animate-pulse">⏳</span>
          </div>
        ) : (
          articles.map((a, i) => (
            <NewsCard key={`${a.url}-${i}`} article={a} onClick={() => setSelectedArticle(a)} showEn={showEn} onToggleLang={() => setShowEn(!showEn)} />
          ))
        )}
      </div>
    </div>
  );
}
