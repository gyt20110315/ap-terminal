import { useTerminalStore } from '../../store/terminalStore';
import type { ExamType } from '../../types';
import { courseLabel } from '../../lib/courseNames';

interface RankItem { name: string; detail: string; score: number; trend: string; note: string }

const RANKINGS: Record<ExamType, { title: string; items: RankItem[] }> = {
  ap: {
    title: 'AP课程热度排名',
    items: [
      { name: 'AP英语语言与写作', detail: 'ENG LANG', score: 98, trend: 'up', note: '59.9万考生' },
      { name: 'AP美国历史', detail: 'US HISTORY', score: 92, trend: 'up', note: '51.1万考生' },
      { name: 'AP微积分AB', detail: 'CALC AB', score: 88, trend: 'up', note: '29万考生' },
      { name: 'AP计算机科学原理', detail: 'CS PRINCIPLES', score: 85, trend: 'up', note: '16.9万考生' },
      { name: 'AP心理学', detail: 'PSYCH', score: 82, trend: 'stable', note: '33.4万考生' },
      { name: 'AP生物学', detail: 'BIO', score: 78, trend: 'down', note: '28.7万考生' },
      { name: 'AP化学', detail: 'CHEM', score: 74, trend: 'stable', note: '14.5万考生' },
      { name: 'AP物理1', detail: 'PHYS 1', score: 70, trend: 'up', note: '17万考生' },
      { name: 'AP统计学', detail: 'STATS', score: 67, trend: 'stable', note: '26.4万考生' },
      { name: 'AP世界历史', detail: 'WORLD HIST', score: 65, trend: 'down', note: '40.6万考生' },
    ],
  },
  ielts: {
    title: '英澳名校雅思要求排名',
    items: [
      { name: 'University of Cambridge', detail: 'UK', score: 98, trend: 'up', note: 'Overall 7.5, each 7.0+' },
      { name: 'University of Oxford', detail: 'UK', score: 95, trend: 'stable', note: 'Overall 7.0, each 6.5+' },
      { name: 'Imperial College London', detail: 'UK', score: 93, trend: 'up', note: 'Overall 7.0, each 6.5+' },
      { name: 'UCL', detail: 'UK', score: 90, trend: 'stable', note: 'Overall 6.5-7.0' },
      { name: 'LSE', detail: 'UK', score: 88, trend: 'up', note: 'Overall 7.0, each 7.0' },
      { name: 'University of Melbourne', detail: 'AUS', score: 85, trend: 'stable', note: 'Overall 6.5-7.0' },
      { name: 'University of Sydney', detail: 'AUS', score: 83, trend: 'up', note: 'Overall 6.5-7.0' },
      { name: 'University of Toronto', detail: 'CAN', score: 80, trend: 'stable', note: 'Overall 6.5, each 6.0' },
      { name: 'ANU', detail: 'AUS', score: 78, trend: 'down', note: 'Overall 6.5, each 6.0' },
      { name: "King's College London", detail: 'UK', score: 75, trend: 'stable', note: 'Overall 6.5-7.0' },
    ],
  },
  toefl: {
    title: '美国名校托福要求排名',
    items: [
      { name: 'MIT', detail: 'US', score: 98, trend: 'stable', note: 'Recommended 100+' },
      { name: 'Stanford University', detail: 'US', score: 95, trend: 'stable', note: 'Recommended 100+' },
      { name: 'Harvard University', detail: 'US', score: 93, trend: 'stable', note: 'Recommended 100+' },
      { name: 'Caltech', detail: 'US', score: 90, trend: 'up', note: 'Required 100+' },
      { name: 'Yale University', detail: 'US', score: 88, trend: 'stable', note: 'Required 100+' },
      { name: 'Princeton University', detail: 'US', score: 86, trend: 'stable', note: 'Recommended 100+' },
      { name: 'Columbia University', detail: 'US', score: 85, trend: 'up', note: 'Required 100+' },
      { name: 'UC Berkeley', detail: 'US', score: 82, trend: 'stable', note: 'Minimum 80' },
      { name: 'UCLA', detail: 'US', score: 80, trend: 'stable', note: 'Minimum 83' },
      { name: 'NYU', detail: 'US', score: 78, trend: 'up', note: 'Recommended 100+' },
    ],
  },
  sat: {
    title: '藤校SAT录取分数段（25%-75%）',
    items: [
      { name: 'MIT', detail: 'US', score: 98, trend: 'up', note: '1520-1580' },
      { name: 'Harvard University', detail: 'US', score: 96, trend: 'stable', note: '1480-1580' },
      { name: 'Stanford University', detail: 'US', score: 95, trend: 'stable', note: '1470-1570' },
      { name: 'Yale University', detail: 'US', score: 93, trend: 'stable', note: '1460-1580' },
      { name: 'Princeton University', detail: 'US', score: 92, trend: 'stable', note: '1460-1570' },
      { name: 'Caltech', detail: 'US', score: 91, trend: 'up', note: '1530-1580' },
      { name: 'Columbia University', detail: 'US', score: 89, trend: 'stable', note: '1470-1570' },
      { name: 'University of Chicago', detail: 'US', score: 87, trend: 'stable', note: '1500-1570' },
      { name: 'Duke University', detail: 'US', score: 85, trend: 'stable', note: '1470-1570' },
      { name: 'UPenn', detail: 'US', score: 84, trend: 'stable', note: '1460-1570' },
    ],
  },
};

export function ExamRanking() {
  const exam = useTerminalStore((s) => s.activeExamType);
  const data = RANKINGS[exam];
  const colors: Record<ExamType, string> = { ap: '#ff6a00', ielts: '#f87171', toefl: '#4ade80', sat: '#60a5fa' };
  const c = colors[exam];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#16162a] border-b border-[#2a2a3a] shrink-0 panel-drag-handle cursor-move">
        <span className="text-[11px] font-bold tracking-wide" style={{ color: c }}>🏆 {data.title.toUpperCase()}</span>
        <span className="text-[9px] text-[#555]">Top 10</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {data.items.map((item, i) => (
          <div key={item.name} className="flex items-center gap-2 px-3 py-1 border-b border-[#1e1e2e] hover:bg-[#16162a] transition-colors cursor-pointer">
            <span className="text-[10px] text-[#555] w-5 text-right">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#ccc] truncate">{item.name}</span>
                <span className="text-[9px] text-[#666] ml-2">{item.detail}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex-1 h-1 bg-[#1a1a2e] rounded overflow-hidden">
                  <div className="h-full rounded transition-all duration-500" style={{ width: `${item.score}%`, background: `linear-gradient(90deg, ${c}, ${c}88)` }} />
                </div>
                <span className="text-[8px] text-[#666] truncate max-w-[100px]">{item.note}</span>
              </div>
            </div>
            <span className={`text-[10px] ${item.trend === 'up' ? 'text-green-400' : item.trend === 'down' ? 'text-red-400' : 'text-[#666]'}`}>
              {item.trend === 'up' ? '▲' : item.trend === 'down' ? '▼' : '─'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
