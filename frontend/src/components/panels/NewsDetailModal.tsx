import { useState, useCallback } from 'react';
import { X, Languages, Sparkles, Loader2, ExternalLink } from 'lucide-react';
import type { NewsArticle } from '../../types';

interface Props {
  article: NewsArticle;
  onClose: () => void;
}

type TabId = 'original' | 'translated' | 'summary';

export function NewsDetailModal({ article, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('original');
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<{
    summary: string;
    key_points: string[];
    ap_relevance: string;
    sentiment: string;
    fallback?: boolean;
  } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const handleTranslate = useCallback(async () => {
    if (translatedText) {
      setActiveTab('translated');
      return;
    }
    setIsTranslating(true);
    setTranslateError(null);
    try {
      const text = `${article.title}${article.summary ? '\n\n' + article.summary : ''}${article.content ? '\n\n' + article.content : ''}`;
      const resp = await fetch('http://localhost:8000/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 3000), target: 'zh-CN' }),
      });
      if (!resp.ok) throw new Error(`Translation failed: ${resp.status}`);
      const data = await resp.json();
      setTranslatedText(data.translated);
      setActiveTab('translated');
    } catch (e) {
      setTranslateError(e instanceof Error ? e.message : 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  }, [article, translatedText]);

  const handleSummarize = useCallback(async () => {
    if (aiSummary) {
      setActiveTab('summary');
      return;
    }
    setIsSummarizing(true);
    setSummaryError(null);
    try {
      const resp = await fetch('http://localhost:8000/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          content: article.content,
          summary: article.summary,
          source: article.source,
          language: 'zh',
        }),
      });
      if (!resp.ok) throw new Error(`Summary failed: ${resp.status}`);
      const data = await resp.json();
      setAiSummary(data);
      setActiveTab('summary');
    } catch (e) {
      setSummaryError(e instanceof Error ? e.message : 'AI summary failed');
    } finally {
      setIsSummarizing(false);
    }
  }, [article, aiSummary]);

  const sentimentColor = (label?: string | null) => {
    switch (label) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      case 'mixed': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'original', label: 'Original', icon: null },
    { id: 'translated', label: '中文翻译', icon: <Languages size={14} /> },
    { id: 'summary', label: 'AI 摘要', icon: <Sparkles size={14} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#12121a] border border-[#2a2a3a] rounded-lg w-[720px] max-h-[85vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2a3a] shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
              article.sentiment_label === 'positive' ? 'bg-green-900/50 text-green-400' :
              article.sentiment_label === 'negative' ? 'bg-red-900/50 text-red-400' :
              'bg-blue-900/50 text-blue-400'
            }`}>
              {article.source}
            </span>
            {article.region && (
              <span className="text-[10px] text-[#ff6a00]">{article.region}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {article.url && (
              <a href={article.url} target="_blank" rel="noopener noreferrer"
                className="text-[#666] hover:text-white transition-colors p-1"
                title="Open original"
              >
                <ExternalLink size={14} />
              </a>
            )}
            <button onClick={onClose} className="text-[#666] hover:text-white transition-colors p-1">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 px-5 pt-3 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'translated') handleTranslate();
                if (tab.id === 'summary') handleSummarize();
              }}
              disabled={tab.id !== 'original' && tab.id === activeTab}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-t transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#1e1e32] text-white border-t border-x border-[#2a2a3a]'
                  : 'text-[#666] hover:text-[#aaa] hover:bg-[#16162a]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
          <div className="flex-1 border-b border-[#2a2a3a]" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Original Tab */}
          {activeTab === 'original' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white leading-snug">{article.title}</h2>
              <div className="flex items-center gap-3 text-[10px] text-[#555]">
                <span>{article.source}</span>
                <span>·</span>
                <span>{new Date(article.published_at).toLocaleString()}</span>
                {article.sentiment_label && (
                  <>
                    <span>·</span>
                    <span className={sentimentColor(article.sentiment_label)}>
                      {article.sentiment_label.toUpperCase()}
                    </span>
                  </>
                )}
              </div>
              {article.summary && article.summary !== article.title && (
                <p className="text-sm text-[#bbb] leading-relaxed">{article.summary}</p>
              )}
              {article.content && (
                <p className="text-sm text-[#999] leading-relaxed whitespace-pre-wrap">{article.content}</p>
              )}
              {article.keywords && article.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {article.keywords.map((kw) => (
                    <span key={kw} className="px-2 py-0.5 rounded bg-[#1a1a30] text-[10px] text-[#888]">{kw}</span>
                  ))}
                </div>
              )}
              {article.ap_courses && article.ap_courses.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {article.ap_courses.map((c) => (
                    <span key={c} className="px-2 py-0.5 rounded bg-[#ff6a00]/15 text-[10px] text-[#ff6a00] font-medium">{c}</span>
                  ))}
                </div>
              )}

              {/* Quick actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleTranslate}
                  disabled={isTranslating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1e1e32] hover:bg-[#252540] text-xs text-[#aaa] transition-colors disabled:opacity-50"
                >
                  {isTranslating ? <Loader2 size={14} className="animate-spin" /> : <Languages size={14} />}
                  翻译成中文
                </button>
                <button
                  onClick={handleSummarize}
                  disabled={isSummarizing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1e1e32] hover:bg-[#252540] text-xs text-[#ff6a00] transition-colors disabled:opacity-50"
                >
                  {isSummarizing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  AI 摘要
                </button>
              </div>
            </div>
          )}

          {/* Translated Tab */}
          {activeTab === 'translated' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] text-[#555]">
                <Languages size={12} />
                <span>Google 翻译 · 中文</span>
              </div>
              {translateError ? (
                <div className="text-red-400 text-sm bg-red-900/20 rounded p-3">{translateError}</div>
              ) : translatedText ? (
                <div className="text-sm text-[#ddd] leading-relaxed whitespace-pre-wrap">{translatedText}</div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-[#666]" />
                </div>
              )}
              <details className="mt-4">
                <summary className="text-[10px] text-[#666] cursor-pointer hover:text-[#888]">查看原文</summary>
                <p className="mt-2 text-xs text-[#888] leading-relaxed">{article.title}{article.summary ? '\n\n' + article.summary : ''}</p>
              </details>
            </div>
          )}

          {/* AI Summary Tab */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px]">
                <Sparkles size={12} className="text-[#ff6a00]" />
                <span className="text-[#ff6a00]">DeepSeek AI 分析</span>
                {aiSummary?.fallback && (
                  <span className="text-[#666]">(规则模式)</span>
                )}
              </div>
              {summaryError ? (
                <div className="text-red-400 text-sm bg-red-900/20 rounded p-3">{summaryError}</div>
              ) : aiSummary ? (
                <>
                  {/* Summary */}
                  <div>
                    <h4 className="text-[10px] font-bold text-[#666] uppercase tracking-wide mb-1.5">摘要 Summary</h4>
                    <p className="text-sm text-[#ddd] leading-relaxed">{aiSummary.summary}</p>
                  </div>

                  {/* Key Points */}
                  <div>
                    <h4 className="text-[10px] font-bold text-[#666] uppercase tracking-wide mb-1.5">关键要点 Key Points</h4>
                    <ul className="space-y-1">
                      {aiSummary.key_points.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#ccc]">
                          <span className="text-[#ff6a00] mt-0.5 shrink-0">●</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* AP Relevance */}
                  <div>
                    <h4 className="text-[10px] font-bold text-[#666] uppercase tracking-wide mb-1.5">AP 相关性 AP Relevance</h4>
                    <p className="text-sm text-[#bbb] leading-relaxed">{aiSummary.ap_relevance}</p>
                  </div>

                  {/* Sentiment */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-[#666]">情感分析:</span>
                    <span className={`text-xs font-medium ${
                      aiSummary.sentiment === 'positive' ? 'text-green-400' :
                      aiSummary.sentiment === 'negative' ? 'text-red-400' :
                      aiSummary.sentiment === 'mixed' ? 'text-yellow-400' :
                      'text-gray-400'
                    }`}>
                      {aiSummary.sentiment.toUpperCase()}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-[#666]" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2 border-t border-[#2a2a3a] shrink-0 flex items-center justify-between text-[10px] text-[#555]">
          <span>AP Terminal · Bloomberg-Style News Reader</span>
          <span>{article.url ? new URL(article.url).hostname : ''}</span>
        </div>
      </div>
    </div>
  );
}
