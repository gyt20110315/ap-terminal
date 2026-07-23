import { useState, useEffect, useCallback } from 'react';
import { useTerminalStore } from '../../store/terminalStore';
import { ArrowLeft, Coins, Zap, Clock, BarChart3, RefreshCw } from 'lucide-react';

interface TokenData {
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_calls: number;
  estimated_cost_usd: number;
  calls_by_type: Record<string, number>;
  runtime_seconds: number;
  recent_calls: Array<{
    type: string;
    prompt_tokens: number;
    completion_tokens: number;
    total: number;
    timestamp: number;
  }>;
}

export function TokenPage() {
  const [data, setData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const setCurrentView = useTerminalStore((s) => s.setCurrentView);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('http://localhost:8000/api/tokens');
      setData(await r.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const typeLabels: Record<string, string> = {
    summary_detailed: 'AI 详细摘要',
    relevance_scoring: 'AI 关联评分',
    translation: 'AI 翻译',
    unknown: '其他',
  };

  const formatTokens = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}小时${m}分钟` : `${m}分钟`;
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-3 bg-[#12121a] border-b border-[#2a2a3a] shrink-0">
        <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-1.5 text-[#888] hover:text-white text-xs">
          <ArrowLeft size={14} /> 返回总览
        </button>
        <h2 className="text-sm font-bold text-purple-400 tracking-wide">TOKEN 消耗监控</h2>
        <button onClick={fetchData} className="ml-auto flex items-center gap-1.5 text-[10px] text-[#666] hover:text-white px-2 py-1 rounded hover:bg-[#1a1a2e] transition-colors">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> 刷新
        </button>
      </div>

      <div className="max-w-3xl mx-auto w-full p-5 space-y-5">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Coins, label: '总消耗 Token', value: data ? formatTokens(data.total_tokens) : '-', sub: 'prompt + completion', color: '#a78bfa' },
            { icon: Zap, label: 'API 调用次数', value: data ? `${data.total_calls}` : '-', sub: '次请求', color: '#facc15' },
            { icon: BarChart3, label: '预估费用', value: data ? `$${data.estimated_cost_usd.toFixed(4)}` : '-', sub: '美元 (USD)', color: '#4ade80' },
            { icon: Clock, label: '运行时长', value: data ? formatTime(data.runtime_seconds) : '-', sub: '自服务启动', color: '#22d3ee' },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} style={{ color: card.color }} />
                  <span className="text-[9px] text-[#666] uppercase">{card.label}</span>
                </div>
                <div className="text-xl font-bold text-white">{card.value}</div>
                <div className="text-[9px] text-[#555] mt-0.5">{card.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Token Breakdown */}
        {data && (
          <div className="grid grid-cols-2 gap-3">
            {/* By type */}
            <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-4">
              <h3 className="text-[10px] font-bold text-[#888] uppercase tracking-wide mb-3">按调用类型分布</h3>
              <div className="space-y-2">
                {Object.entries(data.calls_by_type).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-[11px] text-[#ccc]">{typeLabels[type] || type}</span>
                    <span className="text-[11px] text-white font-mono">{count} 次</span>
                  </div>
                ))}
                {Object.keys(data.calls_by_type).length === 0 && (
                  <span className="text-[11px] text-[#555]">暂无 AI 调用记录</span>
                )}
              </div>
            </div>

            {/* Token split */}
            <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-4">
              <h3 className="text-[10px] font-bold text-[#888] uppercase tracking-wide mb-3">Token 用量分布</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#ccc]">输入 (Prompt)</span>
                  <span className="text-[11px] text-white font-mono">{formatTokens(data.prompt_tokens)}</span>
                </div>
                <div className="h-2 bg-[#1a1a2e] rounded overflow-hidden flex">
                  <div className="h-full bg-purple-400 rounded-l" style={{ width: `${data.total_tokens > 0 ? (data.prompt_tokens / data.total_tokens) * 100 : 0}%` }} />
                  <div className="h-full bg-[#ff6a00] rounded-r" style={{ width: `${data.total_tokens > 0 ? (data.completion_tokens / data.total_tokens) * 100 : 0}%` }} />
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-purple-400">输入 {data.total_tokens > 0 ? ((data.prompt_tokens / data.total_tokens) * 100).toFixed(0) : 0}%</span>
                  <span className="text-[#ff6a00]">输出 {data.total_tokens > 0 ? ((data.completion_tokens / data.total_tokens) * 100).toFixed(0) : 0}%</span>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#ccc]">输出 (Completion)</span>
                  <span className="text-[11px] text-white font-mono">{formatTokens(data.completion_tokens)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Calls */}
        {data && data.recent_calls.length > 0 && (
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-4">
            <h3 className="text-[10px] font-bold text-[#888] uppercase tracking-wide mb-2">最近调用记录</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="text-[#555] border-b border-[#2a2a3a]">
                    <th className="text-left py-1.5 px-2">类型</th>
                    <th className="text-right py-1.5 px-2">Prompt</th>
                    <th className="text-right py-1.5 px-2">Completion</th>
                    <th className="text-right py-1.5 px-2">合计</th>
                    <th className="text-right py-1.5 px-2">时间</th>
                  </tr>
                </thead>
                <tbody>
                  {[...data.recent_calls].reverse().map((call, i) => (
                    <tr key={i} className="border-b border-[#1e1e2e] text-[#aaa]">
                      <td className="py-1.5 px-2">{typeLabels[call.type] || call.type}</td>
                      <td className="text-right py-1.5 px-2 font-mono">{call.prompt_tokens}</td>
                      <td className="text-right py-1.5 px-2 font-mono">{call.completion_tokens}</td>
                      <td className="text-right py-1.5 px-2 font-mono text-white">{call.total}</td>
                      <td className="text-right py-1.5 px-2 text-[#555]">{new Date(call.timestamp * 1000).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pricing info */}
        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-4">
          <h3 className="text-[10px] font-bold text-[#888] uppercase tracking-wide mb-2">DeepSeek 计费参考</h3>
          <div className="text-[10px] text-[#555] space-y-0.5">
            <p>· 输入：$0.14 / 百万 token</p>
            <p>· 输出：$0.28 / 百万 token</p>
            <p className="text-[#666]">注：以上为 DeepSeek API 标准定价，实际费用以官方账单为准。翻译使用预置人工翻译，不消耗 token。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
