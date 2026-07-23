import { useState } from 'react';
import { useTerminalStore } from '../../store/terminalStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line,
} from 'recharts';
import {
  ArrowLeft, TrendingUp, Users, Award, BookOpen, Target,
  AlertTriangle, Star, FileText, Clock, BookMarked, ExternalLink,
} from 'lucide-react';
import { courseLabel } from '../../lib/courseNames';
import { getCourseDetail } from '../../lib/courseDetails';
import type { CourseDetail } from '../../lib/courseDetails';

// ── Course data (stats only) ──────────────────────────────
interface APCourseData { name: string; short: string; category: string; enrollment: number; avgScore: number; passingRate: number; score5: number; score4: number; score3: number; score2: number; score1: number; enrollmentTrend: number[]; difficulty: string; popularity: string }

const ALL_COURSES: APCourseData[] = [
  { name: 'AP Art History', short: 'ART HIST', category: 'Arts', enrollment: 26000, avgScore: 3.01, passingRate: 62.7, score5: 13.9, score4: 21.5, score3: 27.2, score2: 24.8, score1: 12.5, enrollmentTrend: [24,25,25,26,26.5,27.2], difficulty: 'Hard', popularity: 'Low' },
  { name: 'AP Music Theory', short: 'MUSIC THEO', category: 'Arts', enrollment: 18000, avgScore: 2.99, passingRate: 60.2, score5: 19.0, score4: 17.5, score3: 23.6, score2: 25.3, score1: 14.5, enrollmentTrend: [16.5,17,17.5,18,18.5,19], difficulty: 'Hard', popularity: 'Very Low' },
  { name: 'AP Studio Art: 2-D Design', short: 'STUDIO 2D', category: 'Arts', enrollment: 34000, avgScore: 3.31, passingRate: 82.8, score5: 11.2, score4: 28.8, score3: 42.8, score2: 14.0, score1: 3.2, enrollmentTrend: [30,32,33,34,35,36], difficulty: 'Easy', popularity: 'Low' },
  { name: 'AP Studio Art: 3-D Design', short: 'STUDIO 3D', category: 'Arts', enrollment: 8000, avgScore: 3.05, passingRate: 72.0, score5: 6.2, score4: 24.3, score3: 41.4, score2: 23.4, score1: 4.7, enrollmentTrend: [7,7.5,8,8,8.3,8.5], difficulty: 'Moderate', popularity: 'Very Low' },
  { name: 'AP Studio Art: Drawing', short: 'STUDIO DRAW', category: 'Arts', enrollment: 22000, avgScore: 3.43, passingRate: 83.8, score5: 15.1, score4: 31.1, score3: 37.6, score2: 13.5, score1: 2.7, enrollmentTrend: [20,21,21.5,22,22.5,23], difficulty: 'Easy', popularity: 'Low' },
  { name: 'AP English Language & Composition', short: 'ENG LANG', category: 'English', enrollment: 588470, avgScore: 2.79, passingRate: 54.6, score5: 9.8, score4: 21.4, score3: 23.5, score2: 28.8, score1: 16.6, enrollmentTrend: [520,550,568,588,600,615], difficulty: 'Very Hard', popularity: 'Very High' },
  { name: 'AP English Literature & Composition', short: 'ENG LIT', category: 'English', enrollment: 394486, avgScore: 3.16, passingRate: 72.4, score5: 13.7, score4: 26.9, score3: 31.8, score2: 16.5, score1: 11.1, enrollmentTrend: [360,375,385,394,405,415], difficulty: 'Moderate', popularity: 'Very High' },
  { name: 'AP United States History', short: 'US HISTORY', category: 'History', enrollment: 490438, avgScore: 2.82, passingRate: 72.2, score5: 12.8, score4: 33.3, score3: 26.0, score2: 19.4, score1: 8.4, enrollmentTrend: [450,470,480,490,500,512], difficulty: 'Hard', popularity: 'Very High' },
  { name: 'AP World History: Modern', short: 'WORLD HIST', category: 'History', enrollment: 380378, avgScore: 3.07, passingRate: 63.7, score5: 11.9, score4: 32.3, score3: 19.6, score2: 27.4, score1: 8.8, enrollmentTrend: [350,365,375,380,390,398], difficulty: 'Moderate', popularity: 'Very High' },
  { name: 'AP European History', short: 'EURO HIST', category: 'History', enrollment: 85000, avgScore: 3.19, passingRate: 71.6, score5: 13.1, score4: 33.3, score3: 25.2, score2: 20.7, score1: 7.7, enrollmentTrend: [78,80,82,85,87,89], difficulty: 'Moderate', popularity: 'Moderate' },
  { name: 'AP US Government & Politics', short: 'US GOV', category: 'History', enrollment: 316000, avgScore: 2.98, passingRate: 73.0, score5: 24.3, score4: 25.0, score3: 23.7, score2: 18.1, score1: 8.9, enrollmentTrend: [280,295,306,316,330,342], difficulty: 'Moderate-Easy', popularity: 'High' },
  { name: 'AP Comparative Government', short: 'COMP GOV', category: 'History', enrollment: 24000, avgScore: 3.17, passingRate: 73.0, score5: 16.0, score4: 24.8, score3: 32.1, score2: 15.1, score1: 11.9, enrollmentTrend: [22,23,23.5,24,24.5,25], difficulty: 'Moderate-Easy', popularity: 'Low' },
  { name: 'AP Human Geography', short: 'HUMAN GEO', category: 'History', enrollment: 260000, avgScore: 2.61, passingRate: 56.1, score5: 17.9, score4: 20.5, score3: 17.8, score2: 14.3, score1: 29.5, enrollmentTrend: [235,245,252,260,270,278], difficulty: 'Very Hard', popularity: 'High' },
  { name: 'AP African American Studies', short: 'AFAM STUDIES', category: 'History', enrollment: 15000, avgScore: 3.22, passingRate: 72.6, score5: 14.2, score4: 30.2, score3: 28.2, score2: 18.6, score1: 8.8, enrollmentTrend: [3,8,12,15,22,30], difficulty: 'Moderate', popularity: 'Low' },
  { name: 'AP Psychology', short: 'PSYCH', category: 'Social Sciences', enrollment: 322000, avgScore: 2.89, passingRate: 61.7, score5: 19.2, score4: 23.1, score3: 19.5, score2: 11.8, score1: 26.5, enrollmentTrend: [280,295,308,322,335,348], difficulty: 'Hard', popularity: 'Very High' },
  { name: 'AP Macroeconomics', short: 'MACRO ECON', category: 'Social Sciences', enrollment: 145000, avgScore: 3.10, passingRate: 65.1, score5: 20.7, score4: 20.7, score3: 23.8, score2: 20.8, score1: 14.1, enrollmentTrend: [125,132,138,145,152,160], difficulty: 'Moderate', popularity: 'High' },
  { name: 'AP Microeconomics', short: 'MICRO ECON', category: 'Social Sciences', enrollment: 100000, avgScore: 3.30, passingRate: 67.6, score5: 22.9, score4: 23.9, score3: 20.8, score2: 19.2, score1: 13.2, enrollmentTrend: [88,92,96,100,105,110], difficulty: 'Moderate', popularity: 'Moderate' },
  { name: 'AP Calculus AB', short: 'CALC AB', category: 'Mathematics', enrollment: 270000, avgScore: 2.93, passingRate: 64.4, score5: 21.4, score4: 27.8, score3: 15.3, score2: 22.7, score1: 12.9, enrollmentTrend: [245,255,262,270,280,290], difficulty: 'Hard', popularity: 'Very High' },
  { name: 'AP Calculus BC', short: 'CALC BC', category: 'Mathematics', enrollment: 135000, avgScore: 3.80, passingRate: 80.9, score5: 47.7, score4: 21.1, score3: 12.1, score2: 13.9, score1: 5.2, enrollmentTrend: [118,125,130,135,142,150], difficulty: 'Moderate', popularity: 'High' },
  { name: 'AP Statistics', short: 'STATS', category: 'Mathematics', enrollment: 250000, avgScore: 2.89, passingRate: 61.8, score5: 17.5, score4: 21.8, score3: 22.5, score2: 15.9, score1: 22.3, enrollmentTrend: [220,232,242,250,262,275], difficulty: 'Hard', popularity: 'High' },
  { name: 'AP Precalculus', short: 'PRECALC', category: 'Mathematics', enrollment: 80000, avgScore: 3.41, passingRate: 75.6, score5: 25.9, score4: 23.9, score3: 25.9, score2: 14.6, score1: 9.8, enrollmentTrend: [0,0,0,80,95,110], difficulty: 'Moderate-Easy', popularity: 'Moderate' },
  { name: 'AP Biology', short: 'BIO', category: 'Sciences', enrollment: 270000, avgScore: 3.04, passingRate: 68.3, score5: 16.8, score4: 23.1, score3: 28.4, score2: 21.7, score1: 10.0, enrollmentTrend: [235,248,258,270,280,290], difficulty: 'Moderate', popularity: 'Very High' },
  { name: 'AP Chemistry', short: 'CHEM', category: 'Sciences', enrollment: 140000, avgScore: 3.34, passingRate: 75.6, score5: 17.9, score4: 27.4, score3: 30.3, score2: 16.9, score1: 7.5, enrollmentTrend: [128,132,136,140,145,150], difficulty: 'Moderate', popularity: 'High' },
  { name: 'AP Physics 1: Algebra-Based', short: 'PHYS 1', category: 'Sciences', enrollment: 165000, avgScore: 2.54, passingRate: 47.3, score5: 10.2, score4: 17.9, score3: 19.2, score2: 26.1, score1: 26.6, enrollmentTrend: [150,155,160,165,168,172], difficulty: 'Very Hard', popularity: 'High' },
  { name: 'AP Physics 2: Algebra-Based', short: 'PHYS 2', category: 'Sciences', enrollment: 28000, avgScore: 3.21, passingRate: 70.5, score5: 19.1, score4: 18.0, score3: 33.4, score2: 22.9, score1: 6.6, enrollmentTrend: [24,25.5,27,28,29,30], difficulty: 'Moderate', popularity: 'Low' },
  { name: 'AP Physics C: Mechanics', short: 'PHYS C:M', category: 'Sciences', enrollment: 55000, avgScore: 3.48, passingRate: 76.3, score5: 28.5, score4: 26.8, score3: 20.9, score2: 13.2, score1: 10.5, enrollmentTrend: [48,50,52,55,57,60], difficulty: 'Moderate-Easy', popularity: 'Moderate' },
  { name: 'AP Physics C: E&M', short: 'PHYS C:E&M', category: 'Sciences', enrollment: 25000, avgScore: 3.53, passingRate: 71.6, score5: 35.2, score4: 21.6, score3: 14.8, score2: 17.4, score1: 11.0, enrollmentTrend: [22,23,24,25,26,27], difficulty: 'Moderate-Easy', popularity: 'Low' },
  { name: 'AP Environmental Science', short: 'ENVIRO SCI', category: 'Sciences', enrollment: 190000, avgScore: 2.69, passingRate: 54.1, score5: 9.2, score4: 27.5, score3: 17.4, score2: 25.8, score1: 20.1, enrollmentTrend: [160,172,182,190,195,200], difficulty: 'Very Hard', popularity: 'High' },
  { name: 'AP Computer Science A', short: 'CS A', category: 'Computer Science', enrollment: 95000, avgScore: 3.15, passingRate: 67.2, score5: 25.6, score4: 21.4, score3: 20.1, score2: 10.8, score1: 22.0, enrollmentTrend: [75,82,88,95,105,115], difficulty: 'Moderate', popularity: 'High' },
  { name: 'AP Computer Science Principles', short: 'CS PRINCIPLES', category: 'Computer Science', enrollment: 170000, avgScore: 2.93, passingRate: 64.0, score5: 10.9, score4: 20.0, score3: 33.1, score2: 20.3, score1: 15.7, enrollmentTrend: [140,155,162,170,180,190], difficulty: 'Hard', popularity: 'High' },
  { name: 'AP Chinese Language', short: 'CHINESE LANG', category: 'World Languages', enrollment: 16000, avgScore: 4.05, passingRate: 88.5, score5: 53.3, score4: 19.4, score3: 15.9, score2: 4.9, score1: 6.5, enrollmentTrend: [14,14.5,15,16,17,18], difficulty: 'Easy', popularity: 'Low' },
  { name: 'AP Japanese Language', short: 'JAPANESE LANG', category: 'World Languages', enrollment: 3000, avgScore: 3.71, passingRate: 76.1, score5: 49.1, score4: 10.2, score3: 16.9, score2: 7.2, score1: 16.7, enrollmentTrend: [2.5,2.7,2.9,3.0,3.2,3.4], difficulty: 'Moderate-Easy', popularity: 'Very Low' },
  { name: 'AP Spanish Language', short: 'SPAN LANG', category: 'World Languages', enrollment: 170000, avgScore: 3.53, passingRate: 82.9, score5: 21.2, score4: 31.4, score3: 30.4, score2: 14.0, score1: 3.0, enrollmentTrend: [155,160,165,170,175,180], difficulty: 'Moderate-Easy', popularity: 'High' },
  { name: 'AP Spanish Literature', short: 'SPAN LIT', category: 'World Languages', enrollment: 25000, avgScore: 3.01, passingRate: 67.0, score5: 10.2, score4: 23.7, score3: 33.1, score2: 21.6, score1: 11.4, enrollmentTrend: [22,23,24,25,26,27], difficulty: 'Moderate', popularity: 'Low' },
  { name: 'AP French Language', short: 'FRENCH LANG', category: 'World Languages', enrollment: 21000, avgScore: 3.20, passingRate: 72.3, score5: 14.5, score4: 24.9, score3: 32.9, score2: 21.7, score1: 6.0, enrollmentTrend: [19,20,20.5,21,21.5,22], difficulty: 'Moderate', popularity: 'Low' },
  { name: 'AP German Language', short: 'GERMAN LANG', category: 'World Languages', enrollment: 5000, avgScore: 3.30, passingRate: 69.8, score5: 26.1, score4: 20.3, score3: 23.4, score2: 20.1, score1: 10.1, enrollmentTrend: [4.5,4.7,4.9,5.0,5.2,5.4], difficulty: 'Moderate', popularity: 'Very Low' },
  { name: 'AP Italian Language', short: 'ITALIAN LANG', category: 'World Languages', enrollment: 3000, avgScore: 3.28, passingRate: 72.4, score5: 22.6, score4: 22.8, score3: 27.0, score2: 17.5, score1: 10.2, enrollmentTrend: [2.7,2.8,2.9,3.0,3.1,3.2], difficulty: 'Moderate-Easy', popularity: 'Very Low' },
  { name: 'AP Latin', short: 'LATIN', category: 'World Languages', enrollment: 5000, avgScore: 2.74, passingRate: 56.5, score5: 11.9, score4: 16.6, score3: 28.0, score2: 23.0, score1: 20.5, enrollmentTrend: [5.5,5.3,5.1,5.0,4.8,4.7], difficulty: 'Very Hard', popularity: 'Very Low' },
  { name: 'AP Seminar', short: 'SEMINAR', category: 'Capstone', enrollment: 90000, avgScore: 3.19, passingRate: 85.7, score5: 9.4, score4: 19.8, score3: 56.5, score2: 10.3, score1: 4.0, enrollmentTrend: [70,78,84,90,95,100], difficulty: 'Moderate-Easy', popularity: 'Moderate' },
  { name: 'AP Research', short: 'RESEARCH', category: 'Capstone', enrollment: 55000, avgScore: 3.35, passingRate: 86.1, score5: 12.6, score4: 26.0, score3: 47.5, score2: 11.5, score1: 2.4, enrollmentTrend: [42,46,50,55,58,62], difficulty: 'Easy', popularity: 'Moderate' },
];

const SCORE_COLORS = ['#4ade80', '#22d3ee', '#facc15', '#f87171', '#ef4444'];
const YEARS = ['2021', '2022', '2023', '2024', '2025', '2026*'];

function diffColor(d: string) {
  switch (d) { case 'Very Hard': return 'text-red-400'; case 'Hard': return 'text-orange-400'; case 'Moderate': return 'text-yellow-400'; case 'Moderate-Easy': return 'text-green-300'; case 'Easy': return 'text-green-400'; default: return 'text-gray-400'; }
}

// ── Component ──
export function CourseDetailView() {
  const [selectedShort, setSelectedShort] = useState<string>('CALC AB');
  const course = ALL_COURSES.find((c) => c.short === selectedShort) || ALL_COURSES[0];
  const detail = getCourseDetail(selectedShort);
  const categories = [...new Set(ALL_COURSES.map((c) => c.category))];

  const scoreData = [
    { score: '5', pct: course.score5, fill: SCORE_COLORS[0] },
    { score: '4', pct: course.score4, fill: SCORE_COLORS[1] },
    { score: '3', pct: course.score3, fill: SCORE_COLORS[2] },
    { score: '2', pct: course.score2, fill: SCORE_COLORS[3] },
    { score: '1', pct: course.score1, fill: SCORE_COLORS[4] },
  ];
  const trendData = YEARS.map((year, i) => ({ year, enrollment: course.enrollmentTrend[i] || 0 }));

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] overflow-y-auto">
      {/* ══ Header ══ */}
      <div className="sticky top-0 z-10 flex items-center gap-4 px-4 py-3 bg-[#12121a]/95 backdrop-blur border-b border-[#2a2a3a]">
        <button onClick={() => useTerminalStore.getState().setCurrentView('dashboard')} className="flex items-center gap-1 text-[#666] hover:text-white text-xs"><ArrowLeft size={14} /> 总览</button>
        <h2 className="text-sm font-bold text-yellow-400 tracking-wide">课程详情</h2>
        <select value={selectedShort} onChange={(e) => setSelectedShort(e.target.value)} className="ml-auto bg-[#1a1a2e] border border-[#2a2a3a] text-xs text-[#ccc] px-3 py-1.5 rounded outline-none max-w-[360px]">
          {categories.map((cat) => (
            <optgroup key={cat} label={`━━ ${cat} ━━`}>
              {ALL_COURSES.filter((c) => c.category === cat).map((c) => (
                <option key={c.short} value={c.short}>{courseLabel(c.short)}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* ══ Body ══ */}
      <div className="max-w-5xl mx-auto w-full p-5 space-y-5">
        {/* Title */}
        <div>
          <h1 className="text-xl font-bold text-white">{courseLabel(course.short)}</h1>
          <div className="flex items-center gap-3 mt-1 text-[11px]">
            <span className="text-[#666]">{course.category}</span>
            <span className={`font-medium ${diffColor(course.difficulty)}`}>难度：{course.difficulty}</span>
            <span className="text-[#555]">热度：{course.popularity}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Users, label: '2024考生', value: `${(course.enrollment/1000).toFixed(1)}k`, color: '#ff6a00' },
            { icon: Award, label: '平均分', value: course.avgScore.toFixed(2), sub: '/ 5.00', color: '#4ade80' },
            { icon: TrendingUp, label: '通过率 (3+)', value: `${course.passingRate}%`, color: '#22d3ee' },
            { icon: Star, label: '5分率', value: `${course.score5}%`, color: '#facc15' },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: `${card.color}15` }}><Icon size={20} style={{ color: card.color }} /></div>
                <div>
                  <div className="text-[9px] text-[#666] uppercase">{card.label}</div>
                  <div className="text-lg font-bold text-white">{card.value}{card.sub && <span className="text-[11px] text-[#666] font-normal">{card.sub}</span>}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chinese Introduction */}
        {detail && (
          <>
            {/* Overview */}
            <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3"><BookOpen size={16} className="text-[#ff6a00]" /><h3 className="text-sm font-bold text-white">课程概述</h3></div>
              <p className="text-sm text-[#bbb] leading-relaxed">{detail.intro_zh}</p>
            </div>

            {/* Exam Structure + Topics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3"><Clock size={16} className="text-cyan-400" /><h3 className="text-sm font-bold text-white">考试结构</h3></div>
                <p className="text-sm text-[#bbb] leading-relaxed">{detail.exam_structure}</p>
                {detail.prerequisites && (
                  <div className="mt-3 pt-3 border-t border-[#1e1e2e]">
                    <span className="text-[10px] text-[#666] uppercase">前置要求</span>
                    <p className="text-xs text-[#999] mt-1">{detail.prerequisites}</p>
                  </div>
                )}
              </div>
              <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3"><Target size={16} className="text-yellow-400" /><h3 className="text-sm font-bold text-white">核心知识点</h3></div>
                <ul className="space-y-1">
                  {detail.topics.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#bbb]"><span className="text-[#ff6a00] mt-0.5">●</span>{t}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Difficulty Note */}
            <div className="bg-[#1a1a20] border border-[#ff6a00]/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2"><AlertTriangle size={16} className="text-[#ff6a00]" /><h3 className="text-sm font-bold text-white">学习难度分析</h3></div>
              <p className="text-sm text-[#ccc] leading-relaxed">{detail.difficulty_note}</p>
            </div>

            {/* Textbooks */}
            {detail.textbooks.length > 0 && (
              <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4"><BookMarked size={16} className="text-purple-400" /><h3 className="text-sm font-bold text-white">推荐教材与参考书</h3></div>
                <div className="space-y-3">
                  {detail.textbooks.map((tb, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-[#1a1a2e] rounded-lg">
                      <span className="text-[#ff6a00] text-xs font-bold mt-0.5">{i + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-white">{tb.title}</div>
                        {tb.author && <div className="text-[10px] text-[#666] mt-0.5">{tb.author}{tb.publisher ? ` · ${tb.publisher}` : ''}</div>}
                        {tb.note && <div className="text-[10px] text-[#888] mt-1">{tb.note}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Study Resources */}
            {detail.study_resources.length > 0 && (
              <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3"><ExternalLink size={16} className="text-green-400" /><h3 className="text-sm font-bold text-white">推荐学习资源</h3></div>
                <div className="flex flex-wrap gap-2">
                  {detail.study_resources.map((r, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-[#1a1a2e] text-xs text-[#aaa]">{r}</span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Charts */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-4">
            <h3 className="text-[11px] font-bold text-[#888] uppercase tracking-wide mb-3">📊 成绩分布 (2024)</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                  <XAxis dataKey="score" tick={{ fontSize: 11, fill: '#888' }} axisLine={{ stroke: '#2a2a3a' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#555' }} axisLine={{ stroke: '#2a2a3a' }} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 60]} />
                  <Tooltip contentStyle={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 8, fontSize: 11 }} formatter={(v: number) => [`${v.toFixed(1)}%`, '']} />
                  <Bar dataKey="pct" radius={[4, 4, 0, 0]} maxBarSize={60} isAnimationActive={false}>
                    {scoreData.map((e, idx) => <Cell key={idx} fill={e.fill} fillOpacity={0.85} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-4">
            <h3 className="text-[11px] font-bold text-[#888] uppercase tracking-wide mb-3">📈 考生趋势 (2021-2026)</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#666' }} axisLine={{ stroke: '#2a2a3a' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#555' }} axisLine={{ stroke: '#2a2a3a' }} tickLine={false} tickFormatter={(v) => `${v.toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 8, fontSize: 11 }} formatter={(v: number) => [`${v.toFixed(1)}k`, '考生数']} />
                  <Line type="monotone" dataKey="enrollment" stroke="#ff6a00" strokeWidth={2.5} dot={{ r: 4, fill: '#ff6a00' }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Category Comparison Table */}
        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-4">
          <h3 className="text-[11px] font-bold text-[#888] uppercase tracking-wide mb-2">📋 {course.category} 类别课程一览</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="text-[#666] border-b border-[#2a2a3a]">
                  <th className="text-left py-1.5 px-2">课程</th>
                  <th className="text-right py-1.5 px-2">考生</th>
                  <th className="text-right py-1.5 px-2">均分</th>
                  <th className="text-right py-1.5 px-2">通过</th>
                  <th className="text-right py-1.5 px-2">5分率</th>
                  <th className="text-left py-1.5 px-2">难度</th>
                </tr>
              </thead>
              <tbody>
                {ALL_COURSES.filter((c) => c.category === course.category).map((c) => (
                  <tr key={c.short} onClick={() => setSelectedShort(c.short)}
                    className={`border-b border-[#1e1e2e] cursor-pointer transition-colors ${c.short === selectedShort ? 'bg-[#ff6a00]/10 text-white' : 'hover:bg-[#16162a] text-[#aaa]'}`}>
                    <td className="py-1.5 px-2 font-medium">{courseLabel(c.short)}</td>
                    <td className="text-right py-1.5 px-2">{(c.enrollment/1000).toFixed(0)}k</td>
                    <td className="text-right py-1.5 px-2 font-mono">{c.avgScore.toFixed(2)}</td>
                    <td className={`text-right py-1.5 px-2 ${c.passingRate>70?'text-green-400':c.passingRate<55?'text-red-400':''}`}>{c.passingRate}%</td>
                    <td className={`text-right py-1.5 px-2 ${c.score5>30?'text-green-400':c.score5<15?'text-red-400':''}`}>{c.score5}%</td>
                    <td className={`py-1.5 px-2 ${diffColor(c.difficulty)}`}>{c.difficulty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
