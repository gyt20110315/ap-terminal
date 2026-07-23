import { useTerminalStore } from '../../store/terminalStore';

export function TopicCloud() {
  const topics = useTerminalStore((s) => s.topics[s.activeExamType]);
  const examLabel = useTerminalStore((s) => s.activeExamType.toUpperCase());

  const sizes = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl'];
  const colors = [
    'text-[#ff6a00]', 'text-green-400', 'text-cyan-400', 'text-yellow-400',
    'text-pink-400', 'text-blue-400', 'text-purple-400', 'text-red-400',
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#16162a] border-b border-[#2a2a3a] shrink-0 panel-drag-handle cursor-move">
        <span className="text-[10px] font-bold text-[#aaa] tracking-wide">🔤 热门话题 — {examLabel}</span>
        <span className="text-[9px] text-[#555]">实时</span>
      </div>
      <div className="flex-1 flex flex-wrap items-center justify-center gap-2 p-3 overflow-hidden">
        {!topics || topics.length === 0 ? (
          <span className="text-[#444] text-xs animate-pulse">Loading topics...</span>
        ) : (
          topics.map((topic: string, i: number) => (
            <span
              key={topic + i}
              className={`inline-block px-2 py-1 rounded cursor-pointer bg-[#1a1a2e] hover:bg-[#252540] transition-colors ${sizes[i % sizes.length]} ${colors[i % colors.length]} font-semibold`}
              style={{ opacity: 0.6 + (topics.length - i) / topics.length * 0.4 }}
            >
              {topic}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
