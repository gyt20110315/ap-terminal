import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// Simulated trend data
const TREND_DATA = [
  { year: '2021', 'AP Calc AB': 249000, 'AP CS A': 78000, 'AP Bio': 230000, 'AP Psych': 288000 },
  { year: '2022', 'AP Calc AB': 262000, 'AP CS A': 82000, 'AP Bio': 242000, 'AP Psych': 295000 },
  { year: '2023', 'AP Calc AB': 275000, 'AP CS A': 88000, 'AP Bio': 255000, 'AP Psych': 305000 },
  { year: '2024', 'AP Calc AB': 282000, 'AP CS A': 94000, 'AP Bio': 268000, 'AP Psych': 318000 },
  { year: '2025', 'AP Calc AB': 290000, 'AP CS A': 102000, 'AP Bio': 280000, 'AP Psych': 328000 },
  { year: '2026*', 'AP Calc AB': 302000, 'AP CS A': 110000, 'AP Bio': 288000, 'AP Psych': 335000 },
];

const COLORS: Record<string, string> = {
  'AP Calc AB': '#ff6a00',
  'AP CS A': '#4ade80',
  'AP Bio': '#22d3ee',
  'AP Psych': '#a78bfa',
};

export function TrendChart() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#16162a] border-b border-[#2a2a3a] shrink-0 panel-drag-handle cursor-move">
        <span className="text-[10px] font-bold text-[#aaa] tracking-wide">📈 ENROLLMENT TRENDS</span>
        <span className="text-[9px] text-[#555]">*projected</span>
      </div>
      <div className="flex-1 p-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={TREND_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 8, fill: '#555' }}
              axisLine={{ stroke: '#2a2a3a' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 8, fill: '#555' }}
              axisLine={{ stroke: '#2a2a3a' }}
              tickLine={false}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: '#12121a',
                border: '1px solid #2a2a3a',
                borderRadius: 4,
                fontSize: 10,
              }}
              formatter={(value: number) => [`${(value / 1000).toFixed(0)}k students`, '']}
            />
            <Legend
              wrapperStyle={{ fontSize: 9, color: '#888' }}
              iconType="circle"
              iconSize={6}
            />
            {Object.keys(COLORS).map((course) => (
              <Line
                key={course}
                type="monotone"
                dataKey={course}
                stroke={COLORS[course]}
                strokeWidth={1.5}
                dot={{ r: 2, fill: COLORS[course] }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
