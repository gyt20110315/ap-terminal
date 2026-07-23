import { useTerminalStore } from '../../store/terminalStore';

const EXAM_COLORS: Record<string, string> = {
  ap: 'bg-[#ff6a00]/20 text-[#ff6a00] border-[#ff6a00]/30',
  ielts: 'bg-red-400/20 text-red-400 border-red-400/30',
  toefl: 'bg-green-400/20 text-green-400 border-green-400/30',
  sat: 'bg-blue-400/20 text-blue-400 border-blue-400/30',
};
const EXAM_NAMES: Record<string, string> = { ap: 'AP', ielts: '雅思', toefl: '托福', sat: 'SAT' };

export function NewsTicker() {
  const newsTicker = useTerminalStore((s) => s.newsTicker);

  if (newsTicker.length === 0) {
    return (
      <div className="shrink-0 bg-[#0d0d18] border-b border-[#2a2a3a] px-4 py-1 text-[10px] text-[#555]">
        等待数据... AP / 雅思 / 托福 / SAT 实时新闻将在此滚动显示
      </div>
    );
  }

  // Double items for seamless loop
  const items = [...newsTicker, ...newsTicker];
  // Animation duration: ~8s per full scroll cycle, scaled by item count
  const duration = Math.max(15, newsTicker.length * 2.5);

  return (
    <div className="shrink-0 bg-[#0d0d18] border-b border-[#2a2a3a] overflow-hidden h-6 relative">
      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div
        className="flex items-center gap-10 px-4 py-1 text-[10px] whitespace-nowrap"
        style={{
          animation: `ticker-scroll ${duration}s linear infinite`,
          width: 'max-content',
        }}
      >
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-2 shrink-0">
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${EXAM_COLORS[item.exam_type || 'ap'] || EXAM_COLORS.ap}`}>
              {EXAM_NAMES[item.exam_type || 'ap'] || 'AP'}
            </span>
            <span className="text-[#aaa]">{item.title}</span>
            <span className="text-[#444]">●</span>
          </span>
        ))}
      </div>
    </div>
  );
}
