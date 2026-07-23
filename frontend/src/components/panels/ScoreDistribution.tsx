import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// 2024 AP Exam Score Distributions (College Board data)
const SCORE_DATA = [
  { course: 'Calc BC', score5: 45, score4: 16, score3: 18, score2: 15, score1: 6 },
  { course: 'Chinese', score5: 52, score4: 16, score3: 15, score2: 9, score1: 8 },
  { course: 'Physics C:M', score5: 33, score4: 27, score3: 20, score2: 14, score1: 6 },
  { course: 'CS A', score5: 27, score4: 22, score3: 18, score2: 12, score1: 21 },
  { course: 'Calc AB', score5: 20, score4: 16, score3: 19, score2: 23, score1: 22 },
  { course: 'US Gov', score5: 22, score4: 27, score3: 24, score2: 13, score1: 14 },
  { course: 'Biology', score5: 17, score4: 28, score3: 23, score2: 17, score1: 15 },
  { course: 'Physics 1', score5: 9, score4: 18, score3: 20, score2: 26, score1: 27 },
];

const SCORE_COLORS = ['#4ade80', '#22d3ee', '#facc15', '#f87171', '#ef4444'];

export function ScoreDistribution() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#16162a] border-b border-[#2a2a3a] shrink-0 panel-drag-handle cursor-move">
        <span className="text-[10px] font-bold text-[#aaa] tracking-wide">📊 SCORE DISTRIBUTION (2024)</span>
      </div>
      <div className="flex-1 p-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={SCORE_DATA}
            layout="vertical"
            margin={{ top: 2, right: 4, left: 40, bottom: 0 }}
            barSize={10}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 7, fill: '#555' }}
              axisLine={{ stroke: '#2a2a3a' }}
              tickLine={false}
              tickFormatter={(v: number) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="course"
              tick={{ fontSize: 8, fill: '#888' }}
              axisLine={{ stroke: '#2a2a3a' }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: '#12121a',
                border: '1px solid #2a2a3a',
                borderRadius: 4,
                fontSize: 10,
              }}
              formatter={(value: number) => [`${value}%`, '']}
            />
            {['score5', 'score4', 'score3', 'score2', 'score1'].map((key, idx) => (
              <Bar key={key} dataKey={key} stackId="a" fill={SCORE_COLORS[idx]} isAnimationActive={false}>
                {SCORE_DATA.map((_, i) => (
                  <Cell key={i} fill={SCORE_COLORS[idx]} fillOpacity={0.85} />
                ))}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex gap-2 px-3 py-1 border-t border-[#1e1e2e] text-[8px]">
        {['5', '4', '3', '2', '1'].map((score, i) => (
          <span key={score} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: SCORE_COLORS[i] }} /> Score {score}
          </span>
        ))}
      </div>
    </div>
  );
}
