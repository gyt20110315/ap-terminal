import { useMemo } from 'react';
import { Clock } from 'lucide-react';

// Upcoming exam dates (approximate — College Board official dates)
const EXAM_DATES: { label: string; date: string; color: string }[] = [
  // AP exams: early May 2027
  { label: 'AP Exams 2027', date: '2027-05-03', color: '#ff6a00' },
  // IELTS is offered year-round, but mark next quarter
  { label: 'IELTS (全年可考)', date: '2026-09-01', color: '#f87171' },
  { label: 'TOEFL (全年可考)', date: '2026-09-01', color: '#4ade80' },
  // SAT: typical dates
  { label: 'SAT Aug 2026', date: '2026-08-23', color: '#60a5fa' },
  { label: 'SAT Oct 2026', date: '2026-10-04', color: '#60a5fa' },
];

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function ExamCountdown() {
  const items = useMemo(() => {
    return EXAM_DATES.map((e) => {
      const days = daysUntil(e.date);
      const urgent = days <= 30;
      return { ...e, days, urgent };
    }).filter((e) => e.days > -365).sort((a, b) => a.days - b.days);
  }, []);

  const next = items[0];

  if (!next) return null;

  return (
    <div className="bg-[#0d0d18] border-b border-[#2a2a3a] px-3 py-1 flex items-center gap-3 shrink-0">
      <Clock size={13} className={next.urgent ? 'text-red-400' : 'text-[#555]'} />
      <div className="flex items-center gap-4 flex-1 overflow-x-auto text-[10px]">
        {items.slice(0, 4).map((e) => (
          <div key={e.label} className="flex items-center gap-1.5 shrink-0">
            <span className="text-[#888]">{e.label}</span>
            <span className={`font-bold font-mono ${e.days <= 30 ? 'text-red-400' : e.days <= 90 ? 'text-[#ff6a00]' : 'text-[#666]'}`}>
              {e.days <= 0 ? '今天' : `${e.days}天`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
