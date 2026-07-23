import { useTerminalStore } from '../../store/terminalStore';
import type { ExamType } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ScoreData { label: string; value: number; fill: string }

const SCORE_DATA: Record<ExamType, { title: string; data: ScoreData[]; colors: string[]; legend: string[] }> = {
  ap: {
    title: 'AP成绩分布（2024年平均）',
    data: [
      { label: 'Score 5', value: 17.5, fill: '#4ade80' },
      { label: 'Score 4', value: 22.9, fill: '#22d3ee' },
      { label: 'Score 3', value: 24.2, fill: '#facc15' },
      { label: 'Score 2', value: 19.3, fill: '#f87171' },
      { label: 'Score 1', value: 16.1, fill: '#ef4444' },
    ],
    colors: ['#4ade80','#22d3ee','#facc15','#f87171','#ef4444'],
    legend: ['5','4','3','2','1'],
  },
  ielts: {
    title: '雅思分数段分布（全球）',
    data: [
      { label: 'Band 9', value: 0.5, fill: '#4ade80' },
      { label: 'Band 8-8.5', value: 4.2, fill: '#22d3ee' },
      { label: 'Band 7-7.5', value: 15.3, fill: '#a78bfa' },
      { label: 'Band 6-6.5', value: 34.8, fill: '#facc15' },
      { label: 'Band 5-5.5', value: 28.5, fill: '#f87171' },
      { label: 'Band <5', value: 16.7, fill: '#ef4444' },
    ],
    colors: ['#4ade80','#22d3ee','#a78bfa','#facc15','#f87171','#ef4444'],
    legend: ['9','8-8.5','7-7.5','6-6.5','5-5.5','<5'],
  },
  toefl: {
    title: '托福iBT分数段分布（全球）',
    data: [
      { label: '110-120', value: 3.2, fill: '#4ade80' },
      { label: '100-109', value: 14.8, fill: '#22d3ee' },
      { label: '90-99', value: 25.3, fill: '#a78bfa' },
      { label: '80-89', value: 30.1, fill: '#facc15' },
      { label: '60-79', value: 21.5, fill: '#f87171' },
      { label: '<60', value: 5.1, fill: '#ef4444' },
    ],
    colors: ['#4ade80','#22d3ee','#a78bfa','#facc15','#f87171','#ef4444'],
    legend: ['110-120','100-109','90-99','80-89','60-79','<60'],
  },
  sat: {
    title: 'SAT总分分布（2024年机考）',
    data: [
      { label: '1500-1600', value: 1.2, fill: '#4ade80' },
      { label: '1400-1490', value: 6.8, fill: '#22d3ee' },
      { label: '1300-1390', value: 14.5, fill: '#a78bfa' },
      { label: '1200-1290', value: 20.3, fill: '#facc15' },
      { label: '1100-1190', value: 21.8, fill: '#f87171' },
      { label: '<1100', value: 35.4, fill: '#ef4444' },
    ],
    colors: ['#4ade80','#22d3ee','#a78bfa','#facc15','#f87171','#ef4444'],
    legend: ['1500+','1400-1490','1300-1390','1200-1290','1100-1190','<1100'],
  },
};

export function ExamScoreChart() {
  const exam = useTerminalStore((s) => s.activeExamType);
  const sd = SCORE_DATA[exam];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#16162a] border-b border-[#2a2a3a] shrink-0 panel-drag-handle cursor-move">
        <span className="text-[11px] font-bold text-[#aaa] tracking-wide">📊 {sd.title}</span>
      </div>
      <div className="flex-1 p-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sd.data} margin={{ top: 2, right: 4, left: -20, bottom: 0 }} barSize={exam==='ap'?32:28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
            <XAxis dataKey="label" tick={{ fontSize: 7, fill: '#555' }} axisLine={{ stroke: '#2a2a3a' }} tickLine={false} angle={-20} textAnchor="end" height={30} />
            <YAxis tick={{ fontSize: 8, fill: '#555' }} axisLine={{ stroke: '#2a2a3a' }} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip contentStyle={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 4, fontSize: 10 }} formatter={(v: number) => [`${v}%`, '']} />
            <Bar dataKey="value" radius={[3,3,0,0]} isAnimationActive={false}>
              {sd.data.map((entry, idx) => <Cell key={idx} fill={entry.fill} fillOpacity={0.85} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-2 px-3 py-1 border-t border-[#1e1e2e] text-[8px] flex-wrap">
        {sd.legend.map((label, i) => (
          <span key={label} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: sd.colors[i] }} />{label}</span>
        ))}
      </div>
    </div>
  );
}
