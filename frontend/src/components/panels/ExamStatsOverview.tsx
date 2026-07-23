import { useTerminalStore } from '../../store/terminalStore';
import type { ExamType } from '../../types';
import { Users, TrendingUp, Award, Globe } from 'lucide-react';

interface StatCard { icon: typeof Users; label: string; value: string; sub: string; color: string }

const STATS: Record<ExamtType, StatCard[]> = {
  ap: [
    { icon: Users, label: 'Annual Test-Takers', value: '2.8M+', sub: 'across 39 subjects', color: '#ff6a00' },
    { icon: Award, label: 'Global Pass Rate (3+)', value: '65%', sub: 'all subjects avg', color: '#4ade80' },
    { icon: Globe, label: 'Countries Offering AP', value: '120+', sub: 'international schools', color: '#22d3ee' },
    { icon: TrendingUp, label: 'YoY Growth', value: '+8.2%', sub: '2024 vs 2023', color: '#a78bfa' },
  ],
  ielts: [
    { icon: Users, label: 'Annual Test-Takers', value: '3.5M+', sub: 'worldwide', color: '#f87171' },
    { icon: Award, label: 'Average Band Score', value: '6.3', sub: 'global mean', color: '#4ade80' },
    { icon: Globe, label: 'Accepting Countries', value: '140+', sub: 'universities & immigration', color: '#22d3ee' },
    { icon: TrendingUp, label: 'China Avg Score', value: '5.9', sub: 'speaking: 5.5, writing: 5.4', color: '#a78bfa' },
  ],
  toefl: [
    { icon: Users, label: 'Annual Test-Takers', value: '2.3M+', sub: 'worldwide', color: '#4ade80' },
    { icon: Award, label: 'Average Score', value: '88', sub: 'out of 120', color: '#22d3ee' },
    { icon: Globe, label: 'Accepting Institutions', value: '11,500+', sub: 'in 160 countries', color: '#a78bfa' },
    { icon: TrendingUp, label: 'China Avg Score', value: '87', sub: 'reading: 23, listening: 22', color: '#f87171' },
  ],
  sat: [
    { icon: Users, label: 'Annual Test-Takers', value: '1.9M+', sub: 'class of 2024', color: '#60a5fa' },
    { icon: Award, label: 'Average Score', value: '1075', sub: 'Math: 528, EBRW: 533', color: '#4ade80' },
    { icon: Globe, label: 'Digital SAT Countries', value: '170+', sub: 'fully digital since 2024', color: '#22d3ee' },
    { icon: TrendingUp, label: 'China Avg Score', value: '1310', sub: 'Math: 720, EBRW: 590', color: '#a78bfa' },
  ],
};

export function ExamStatsOverview() {
  const exam = useTerminalStore((s) => s.activeExamType);
  const cards = STATS[exam];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#16162a] border-b border-[#2a2a3a] shrink-0 panel-drag-handle cursor-move">
        <span className="text-[11px] font-bold text-[#aaa] tracking-wide">📋 {exam.toUpperCase()} 核心数据</span>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-2 p-3 content-start">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-[#1a1a2e] border border-[#2a2a3a] rounded-lg p-3 hover:border-[#3a3a4a] transition-colors">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1.5 rounded-md" style={{ background: `${card.color}20` }}>
                  <Icon size={14} style={{ color: card.color }} />
                </div>
                <span className="text-[8px] text-[#666] uppercase">{card.label}</span>
              </div>
              <div className="text-base font-bold text-white">{card.value}</div>
              <div className="text-[9px] text-[#555] mt-0.5">{card.sub}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
