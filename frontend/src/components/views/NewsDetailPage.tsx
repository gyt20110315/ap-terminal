import { useState, useEffect, useCallback } from 'react';
import { useTerminalStore } from '../../store/terminalStore';
import type { NewsArticle, AISummary, RelevanceScore } from '../../types';
import {
  ArrowLeft, ExternalLink, Languages, Sparkles, Loader2,
  Target, FileText, AlertTriangle, BookOpen, Lightbulb, MessageSquare,
} from 'lucide-react';

export function NewsDetailPage() {
  const { selectedArticle, setSelectedArticle, setCurrentView, aiSummaries, setAISummary, relevanceScores, setRelevanceScore } = useTerminalStore();
  const article = selectedArticle;

  const [activeSection, setActiveSection] = useState<'original' | 'translated' | 'aisummary' | 'relevance'>('original');
  const [showEn, setShowEn] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isScoring, setIsScoring] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [article]);

  if (!article) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a0f] text-[#666]">
        <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-2 text-[#ff6a00] hover:underline">
          <ArrowLeft size={14} /> 返回 to Dashboard
        </button>
      </div>
    );
  }

  const articleKey = article.url || article.title;
  const cachedSummary = aiSummaries[articleKey];
  const cachedRelevance = relevanceScores[articleKey];

  const handleTranslate = async () => {
    if (translatedText) { setActiveSection('translated'); return; }
    setIsTranslating(true);
    try {
      const text = [article.title, article.summary, article.content].filter(Boolean).join('\n\n');
      const resp = await fetch('http://localhost:8000/api/translate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 3000), target: 'zh-CN' }),
      });
      const data = await resp.json();
      setTranslatedText(data.translated);
      setActiveSection('translated');
    } catch (e) { /* ignore */ } finally { setIsTranslating(false); }
  };

  const handleSummarize = async () => {
    if (cachedSummary) { setActiveSection('aisummary'); return; }
    setIsSummarizing(true);
    try {
      const resp = await fetch('http://localhost:8000/api/summarize', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: article.title, content: article.content, summary: article.summary, source: article.source, language: 'zh' }),
      });
      const data = await resp.json();
      if (data.detailed_summary || data.key_points) {
        setAISummary(articleKey, { headline_summary: data.headline_summary || '', detailed_summary: data.detailed_summary || '', key_points: Array.isArray(data.key_points) ? data.key_points : [], background_context: data.background_context || '', stakeholder_impact: data.stakeholder_impact || '', action_items: typeof data.action_items === 'string' ? data.action_items : Array.isArray(data.action_items) ? data.action_items.join('; ') : '', sentiment: data.sentiment || 'neutral', credibility_note: data.credibility_note || '', fallback: data.fallback || false });
      }
      setActiveSection('aisummary');
    } catch (e) { /* ignore */ } finally { setIsSummarizing(false); }
  };

  const handleRelevance = async () => {
    if (cachedRelevance) { setActiveSection('relevance'); return; }
    setIsScoring(true);
    try {
      const resp = await fetch('http://localhost:8000/api/relevance', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: article.title, content: article.content, summary: article.summary, source: article.source }),
      });
      const data = await resp.json();
      if (data.relevance_score !== undefined) {
        setRelevanceScore(articleKey, { relevance_score: data.relevance_score || 0, relevance_level: data.relevance_level || '中等', target_grade: data.target_grade || '', why_relevant: data.why_relevant || '', affected_courses: Array.isArray(data.affected_courses) ? data.affected_courses : [], urgency: data.urgency || '', action_suggestion: data.action_suggestion || '', key_takeaway_for_students: data.key_takeaway_for_students || '', fallback: data.fallback || false });
      }
      setActiveSection('relevance');
    } catch (e) { /* ignore */ } finally { setIsScoring(false); }
  };

  const sentimentColor = (s?: string | null) => {
    switch (s) { case 'positive': return 'text-green-400'; case 'negative': return 'text-red-400'; case 'mixed': return 'text-yellow-400'; default: return 'text-gray-400'; }
  };

  const relevanceColor = (level?: string) => {
    switch (level) { case '极高': return '#4ade80'; case '高': return '#ff6a00'; case '中等': return '#facc15'; default: return '#666'; }
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center gap-3 px-5 py-3 bg-[#12121a]/95 backdrop-blur border-b border-[#2a2a3a]">
        <button onClick={() => { setSelectedArticle(null); setCurrentView('dashboard'); }} className="flex items-center gap-1.5 text-[#888] hover:text-white transition-colors text-xs">
          <ArrowLeft size={14} /> 返回
        </button>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${sentimentColor(article.sentiment_label)}`}>
          {article.exam_type?.toUpperCase() || 'AP'} · {article.source}
        </span>
        {article.region && <span className="text-[10px] text-[#666]">{article.region}</span>}
        <div className="flex-1" />
        {article.url && (
          <a href={article.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#ff6a00]/20 hover:bg-[#ff6a00]/30 text-[#ff6a00] text-xs font-medium transition-colors">
            <ExternalLink size={14} /> 跳转原文
          </a>
        )}
      </div>

      {/* Article Title — Chinese default, toggle to English */}
      <div className="px-6 py-4 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-lg font-bold text-white leading-snug">
            {showEn ? article.title : (article.title_zh || article.title)}
          </h1>
          <button
            onClick={() => setShowEn(!showEn)}
            className="text-[10px] px-2 py-0.5 rounded bg-[#1a1a2e] text-[#666] hover:text-[#aaa] hover:bg-[#252540] transition-colors shrink-0"
            title={showEn ? '显示中文' : 'Show English'}
          >
            {showEn ? '中' : 'EN'}
          </button>
        </div>
        <div className="flex items-center gap-3 mt-2 text-[10px] text-[#555]">
          <span>{article.source}</span><span>·</span>
          <span>{new Date(article.published_at).toLocaleString()}</span>
          {article.sentiment_label && <><span>·</span><span className={sentimentColor(article.sentiment_label)}>{article.sentiment_label.toUpperCase()}</span></>}
        </div>
      </div>

      {/* Action Tabs */}
      <div className="px-6 max-w-4xl mx-auto w-full">
        <div className="flex gap-0 border-b border-[#2a2a3a]">
          {([
            { id: 'original' as const, label: showEn ? '原文' : '中文', icon: FileText },
            { id: 'translated' as const, label: '翻译对照', icon: Languages },
            { id: 'aisummary' as const, label: 'AI 摘要', icon: Sparkles },
            { id: 'relevance' as const, label: '关联评分', icon: Target },
          ]).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSection(tab.id);
                  if (tab.id === 'translated') handleTranslate();
                  if (tab.id === 'aisummary') handleSummarize();
                  if (tab.id === 'relevance') handleRelevance();
                }}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                  activeSection === tab.id ? 'border-[#ff6a00] text-white' : 'border-transparent text-[#666] hover:text-[#aaa]'
                }`}
              >
                <Icon size={13} className={activeSection === tab.id ? 'text-[#ff6a00]' : ''} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="px-6 py-4 max-w-4xl mx-auto w-full pb-16 space-y-4">
        {/* Original */}
        {activeSection === 'original' && (
          <div className="space-y-4">
            {article.summary && article.summary !== article.title && (
              <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-4">
                <h3 className="text-[10px] font-bold text-[#666] uppercase tracking-wide mb-2">Summary</h3>
                <p className="text-sm text-[#ccc] leading-relaxed">{article.summary}</p>
              </div>
            )}
            {article.content && (
              <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-4">
                <h3 className="text-[10px] font-bold text-[#666] uppercase tracking-wide mb-2">Full Content</h3>
                <p className="text-sm text-[#bbb] leading-relaxed whitespace-pre-wrap">{article.content}</p>
              </div>
            )}
            {(article.keywords?.length || article.ap_courses?.length) && (
              <div className="flex flex-wrap gap-2">
                {article.ap_courses?.map(c => <span key={c} className="px-2 py-1 rounded bg-[#ff6a00]/15 text-[11px] text-[#ff6a00] font-medium">{c}</span>)}
                {article.keywords?.map(kw => <span key={kw} className="px-2 py-1 rounded bg-[#1a1a30] text-[11px] text-[#888]">{kw}</span>)}
              </div>
            )}
            {article.url && (
              <a href={article.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ff6a00] hover:bg-[#ff6a00]/80 text-white text-sm font-medium transition-colors">
                <ExternalLink size={16} /> 跳转到原文阅读完整内容
              </a>
            )}
          </div>
        )}

        {/* Translated */}
        {activeSection === 'translated' && (
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3 text-[10px] text-[#666]">
              <Languages size={14} /> <span>中文翻译</span>
            </div>
            {isTranslating ? (
              <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-[#666]" /></div>
            ) : translatedText ? (
              <div className="text-sm text-[#ddd] leading-relaxed whitespace-pre-wrap">{translatedText}</div>
            ) : null}
          </div>
        )}

        {/* AI Detailed Summary */}
        {activeSection === 'aisummary' && (
          <div className="space-y-4">
            {isSummarizing ? (
              <div className="flex items-center justify-center py-16 bg-[#12121a] rounded-lg border border-[#2a2a3a]">
                <Loader2 size={28} className="animate-spin text-[#ff6a00]" />
                <span className="ml-3 text-sm text-[#888]">AI 正在分析中...</span>
              </div>
            ) : cachedSummary ? (
              <>
                {/* Headline */}
                <div className="bg-[#12121a] border border-[#ff6a00]/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2"><Sparkles size={14} className="text-[#ff6a00]" /><span className="text-[10px] font-bold text-[#ff6a00] uppercase">核心摘要</span></div>
                  <p className="text-sm text-white font-medium leading-relaxed">{cachedSummary.headline_summary}</p>
                </div>
                {/* Detailed Summary */}
                <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2"><FileText size={14} className="text-[#666]" /><span className="text-[10px] font-bold text-[#666] uppercase">详细摘要</span></div>
                  <p className="text-sm text-[#ddd] leading-relaxed">{cachedSummary.detailed_summary}</p>
                </div>
                {/* Key Points */}
                <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2"><Lightbulb size={14} className="text-yellow-400" /><span className="text-[10px] font-bold text-yellow-400 uppercase">关键要点</span></div>
                  <ul className="space-y-1.5">{(Array.isArray(cachedSummary.key_points) ? cachedSummary.key_points : []).map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#ccc]"><span className="text-[#ff6a00] mt-1">●</span>{p}</li>
                  ))}</ul>
                </div>
                {/* Background */}
                <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2"><BookOpen size={14} className="text-cyan-400" /><span className="text-[10px] font-bold text-cyan-400 uppercase">背景分析</span></div>
                  <p className="text-sm text-[#bbb] leading-relaxed">{cachedSummary.background_context}</p>
                </div>
                {/* Stakeholder Impact */}
                <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2"><MessageSquare size={14} className="text-purple-400" /><span className="text-[10px] font-bold text-purple-400 uppercase">各方影响</span></div>
                  <p className="text-sm text-[#bbb] leading-relaxed">{cachedSummary.stakeholder_impact}</p>
                </div>
                {/* Action Items */}
                <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2"><Target size={14} className="text-green-400" /><span className="text-[10px] font-bold text-green-400 uppercase">行动建议</span></div>
                  <p className="text-sm text-[#ddd] leading-relaxed">{cachedSummary.action_items}</p>
                </div>
                {/* Meta */}
                <div className="flex gap-4 text-[10px] text-[#555]">
                  <span>情感: <span className={sentimentColor(cachedSummary.sentiment)}>{cachedSummary.sentiment.toUpperCase()}</span></span>
                  <span>{cachedSummary.credibility_note}</span>
                  {cachedSummary.fallback && <span className="text-yellow-400">(规则模式)</span>}
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Relevance Score */}
        {activeSection === 'relevance' && (
          <div className="space-y-4">
            {isScoring ? (
              <div className="flex items-center justify-center py-16 bg-[#12121a] rounded-lg border border-[#2a2a3a]">
                <Loader2 size={28} className="animate-spin text-[#ff6a00]" />
                <span className="ml-3 text-sm text-[#888]">AI 正在分析关联度...</span>
              </div>
            ) : cachedRelevance ? (
              <>
                {/* Score Gauge */}
                <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-6 text-center">
                  <div className="text-[10px] text-[#666] uppercase tracking-wide mb-2">与中国高一AP考生关联度</div>
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
                      <circle cx="64" cy="64" r="56" fill="none" stroke="#1e1e2e" strokeWidth="10" />
                      <circle cx="64" cy="64" r="56" fill="none" stroke={relevanceColor(cachedRelevance.relevance_level)}
                        strokeWidth="10" strokeDasharray={`${(cachedRelevance.relevance_score / 100) * 352} 352`}
                        strokeLinecap="round" className="transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-white">{cachedRelevance.relevance_score}</span>
                      <span className="text-[9px] text-[#666]">/ 100</span>
                    </div>
                  </div>
                  <div className={`text-sm font-bold mt-2`} style={{ color: relevanceColor(cachedRelevance.relevance_level) }}>
                    {cachedRelevance.relevance_level}
                  </div>
                </div>
                {/* Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-3">
                    <div className="text-[9px] text-[#666] uppercase mb-1">适用年级</div>
                    <div className="text-sm text-white font-medium">{cachedRelevance.target_grade}</div>
                  </div>
                  <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-3">
                    <div className="text-[9px] text-[#666] uppercase mb-1">紧急程度</div>
                    <div className="text-sm text-white font-medium">{cachedRelevance.urgency}</div>
                  </div>
                  <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-3 col-span-2">
                    <div className="text-[9px] text-[#666] uppercase mb-1">关联分析</div>
                    <div className="text-sm text-[#ccc] leading-relaxed">{cachedRelevance.why_relevant}</div>
                  </div>
                  <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-3 col-span-2">
                    <div className="text-[9px] text-[#666] uppercase mb-1">学生核心关注</div>
                    <div className="text-sm text-[#ddd] font-medium">{cachedRelevance.key_takeaway_for_students}</div>
                  </div>
                  <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-3 col-span-2">
                    <div className="text-[9px] text-[#666] uppercase mb-1">行动建议</div>
                    <div className="text-sm text-[#ff6a00] font-medium">{cachedRelevance.action_suggestion}</div>
                  </div>
                </div>
                {cachedRelevance.affected_courses?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {cachedRelevance.affected_courses.map(c => <span key={c} className="px-2 py-1 rounded bg-[#1a1a30] text-[11px] text-[#888]">{c}</span>)}
                  </div>
                )}
                {cachedRelevance.fallback && <div className="text-[10px] text-yellow-400/50 text-center">(规则估算模式)</div>}
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
