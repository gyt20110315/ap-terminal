import { useTerminalStore } from '../../store/terminalStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export function SentimentTimeline() {
  const sentiment = useTerminalStore((s) => s.sentiment[s.activeExamType]);
  const examLabel = useTerminalStore((s) => s.activeExamType.toUpperCase());

  const getData = () => {
    if (!sentiment) {
      return Array.from({ length: 20 }, (_, i) => ({ time: `${i * 5}m`, positive: 0, negative: 0, neutral: 0 }));
    }
    return Array.from({ length: 20 }, (_, i) => ({
      time: `${i * 5}m`,
      positive: Math.round(sentiment.positive_ratio * 100 + Math.random() * 10),
      negative: Math.round(sentiment.negative_ratio * 100 + Math.random() * 5),
      neutral: Math.round(sentiment.neutral_ratio * 100 + Math.random() * 10),
    }));
  };

  const data = getData();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#16162a] border-b border-[#2a2a3a] shrink-0 panel-drag-handle cursor-move">
        <span className="text-[11px] font-bold text-[#aaa] tracking-wide">📊 情感趋势 — {examLabel}</span>
        {sentiment && (
          <span className={`text-[9px] font-bold ${sentiment.score > 0.2 ? 'text-green-400' : sentiment.score < -0.2 ? 'text-red-400' : 'text-[#666]'}`}>
            Score: {sentiment.score > 0 ? '+' : ''}{sentiment.score.toFixed(2)}
          </span>
        )}
      </div>
      <div className="flex-1 p-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
            <XAxis dataKey="time" tick={{ fontSize: 8, fill: '#555' }} axisLine={{ stroke: '#2a2a3a' }} tickLine={false} />
            <YAxis tick={{ fontSize: 8, fill: '#555' }} axisLine={{ stroke: '#2a2a3a' }} tickLine={false} domain={[0, 100]} />
            <Tooltip contentStyle={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 4, fontSize: 10 }} />
            <ReferenceLine y={0} stroke="#2a2a3a" />
            <Area type="monotone" dataKey="positive" stackId="1" stroke="#4ade80" fill="#4ade80" fillOpacity={0.15} isAnimationActive={false} />
            <Area type="monotone" dataKey="neutral" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} isAnimationActive={false} />
            <Area type="monotone" dataKey="negative" stackId="1" stroke="#f87171" fill="#f87171" fillOpacity={0.15} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-3 px-3 py-1 border-t border-[#1e1e2e] text-[9px]">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" /> 正面</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#6366f1]" /> 中性</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> 负面</span>
      </div>
    </div>
  );
}
