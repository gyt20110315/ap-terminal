import { useTerminalStore } from '../../store/terminalStore';

const RANKED_COURSES = [
  { name: 'AP English Language', short: 'ENG LANG', heat: 98, trend: 'up' },
  { name: 'AP US History', short: 'US HIST', heat: 92, trend: 'up' },
  { name: 'AP Calculus AB', short: 'CALC AB', heat: 88, trend: 'up' },
  { name: 'AP Computer Science Principles', short: 'CS PRIN', heat: 85, trend: 'up' },
  { name: 'AP Psychology', short: 'PSYCH', heat: 82, trend: 'stable' },
  { name: 'AP Biology', short: 'BIO', heat: 78, trend: 'down' },
  { name: 'AP Chemistry', short: 'CHEM', heat: 74, trend: 'stable' },
  { name: 'AP Physics 1', short: 'PHYS 1', heat: 70, trend: 'up' },
  { name: 'AP Statistics', short: 'STATS', heat: 67, trend: 'stable' },
  { name: 'AP World History', short: 'WORLD', heat: 65, trend: 'down' },
];

export function CourseRanking() {
  const newsArticles = useTerminalStore((s) => s.newsArticles);

  const courseMentions: Record<string, number> = {};
  newsArticles.forEach((a) => {
    a.ap_courses?.forEach((c) => { courseMentions[c] = (courseMentions[c] || 0) + 1; });
  });

  const displayData = RANKED_COURSES.map((course) => ({
    ...course,
    liveMentions: courseMentions[course.short] || 0,
    heat: Math.min(100, course.heat + (courseMentions[course.short] || 0) * 3),
  })).sort((a, b) => b.heat - a.heat);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#16162a] border-b border-[#2a2a3a] shrink-0 panel-drag-handle cursor-move">
        <span className="text-[10px] font-bold text-[#aaa] tracking-wide">🏆 COURSE HEAT RANKING</span>
        <span className="text-[9px] text-[#ff6a00]">Top 10</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {displayData.map((course, i) => (
          <div key={course.short} className="flex items-center gap-2 px-3 py-1.5 border-b border-[#1e1e2e] hover:bg-[#16162a] transition-colors cursor-pointer">
            <span className="text-[10px] text-[#555] w-5 text-right">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#ccc] truncate">{course.name}</span>
                <span className="text-[9px] text-[#666] ml-2">{course.short}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex-1 h-1 bg-[#1a1a2e] rounded overflow-hidden">
                  <div className="h-full rounded transition-all duration-500" style={{
                    width: `${course.heat}%`,
                    background: course.heat > 85 ? 'linear-gradient(90deg, #ff6a00, #ff4500)' : course.heat > 70 ? 'linear-gradient(90deg, #4ade80, #22d3ee)' : 'linear-gradient(90deg, #6366f1, #a78bfa)',
                  }} />
                </div>
                <span className="text-[9px] text-[#666] w-8 text-right">{course.heat}%</span>
              </div>
            </div>
            <span className={`text-[10px] ${course.trend === 'up' ? 'text-green-400' : course.trend === 'down' ? 'text-red-400' : 'text-[#666]'}`}>
              {course.trend === 'up' ? '▲' : course.trend === 'down' ? '▼' : '─'}
            </span>
            {course.liveMentions > 0 && (
              <span className="text-[9px] bg-[#ff6a00]/20 text-[#ff6a00] px-1 py-0.5 rounded">+{course.liveMentions}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
