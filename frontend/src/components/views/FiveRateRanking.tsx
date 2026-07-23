import { useState } from 'react';
import { useTerminalStore } from '../../store/terminalStore';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { courseLabel } from '../../lib/courseNames';

// 2024 AP 5-point rates (all 39 courses, sorted by 5-rate descending)
const RANKINGS = [
  { short:'CHINESE LANG', rate:53.3, prev:54.2, diff:-0.9, cat:'语言', pass:88.5 },
  { short:'JAPANESE LANG', rate:49.1, prev:50.8, diff:-1.7, cat:'语言', pass:76.1 },
  { short:'CALC BC', rate:47.7, prev:45.5, diff:+2.2, cat:'数学', pass:80.9 },
  { short:'PHYS C:E&M', rate:35.2, prev:33.6, diff:+1.6, cat:'科学', pass:71.6 },
  { short:'PHYS C:M', rate:28.5, prev:27.5, diff:+1.0, cat:'科学', pass:76.3 },
  { short:'GERMAN LANG', rate:26.1, prev:24.8, diff:+1.3, cat:'语言', pass:69.8 },
  { short:'PRECALC', rate:25.9, prev:0, diff:+25.9, cat:'数学', pass:75.6 },
  { short:'CS A', rate:25.6, prev:27.0, diff:-1.4, cat:'计算机', pass:67.2 },
  { short:'US GOV', rate:24.3, prev:12.8, diff:+11.5, cat:'历史', pass:73.0 },
  { short:'MICRO ECON', rate:22.9, prev:21.3, diff:+1.6, cat:'社科', pass:67.6 },
  { short:'ITALIAN LANG', rate:22.6, prev:24.0, diff:-1.4, cat:'语言', pass:72.4 },
  { short:'CALC AB', rate:21.4, prev:20.5, diff:+0.9, cat:'数学', pass:64.4 },
  { short:'SPAN LANG', rate:21.2, prev:23.5, diff:-2.3, cat:'语言', pass:82.9 },
  { short:'MACRO ECON', rate:20.7, prev:22.0, diff:-1.3, cat:'社科', pass:65.1 },
  { short:'PSYCH', rate:19.2, prev:18.0, diff:+1.2, cat:'社科', pass:61.7 },
  { short:'PHYS 2', rate:19.1, prev:18.5, diff:+0.6, cat:'科学', pass:70.5 },
  { short:'MUSIC THEO', rate:19.0, prev:20.0, diff:-1.0, cat:'艺术', pass:60.2 },
  { short:'CHEM', rate:17.9, prev:16.0, diff:+1.9, cat:'科学', pass:75.6 },
  { short:'HUMAN GEO', rate:17.9, prev:16.8, diff:+1.1, cat:'历史', pass:56.1 },
  { short:'STATS', rate:17.5, prev:18.0, diff:-0.5, cat:'数学', pass:61.8 },
  { short:'BIO', rate:16.8, prev:14.3, diff:+2.5, cat:'科学', pass:68.3 },
  { short:'COMP GOV', rate:16.0, prev:15.5, diff:+0.5, cat:'历史', pass:73.0 },
  { short:'STUDIO DRAW', rate:15.1, prev:16.0, diff:-0.9, cat:'艺术', pass:83.8 },
  { short:'FRENCH LANG', rate:14.5, prev:15.0, diff:-0.5, cat:'语言', pass:72.3 },
  { short:'AFAM STUDIES', rate:14.2, prev:0, diff:+14.2, cat:'历史', pass:72.6 },
  { short:'ART HIST', rate:13.9, prev:14.5, diff:-0.6, cat:'艺术', pass:62.7 },
  { short:'ENG LIT', rate:13.7, prev:14.9, diff:-1.2, cat:'英语', pass:72.4 },
  { short:'EURO HIST', rate:13.1, prev:12.0, diff:+1.1, cat:'历史', pass:71.6 },
  { short:'US HISTORY', rate:12.8, prev:10.6, diff:+2.2, cat:'历史', pass:72.2 },
  { short:'RESEARCH', rate:12.6, prev:13.3, diff:-0.7, cat:'Capstone', pass:86.1 },
  { short:'WORLD HIST', rate:11.9, prev:15.0, diff:-3.1, cat:'历史', pass:63.7 },
  { short:'STUDIO 2D', rate:11.2, prev:12.0, diff:-0.8, cat:'艺术', pass:82.8 },
  { short:'LATIN', rate:11.9, prev:12.5, diff:-0.6, cat:'语言', pass:56.5 },
  { short:'CS PRINCIPLES', rate:10.9, prev:11.5, diff:-0.6, cat:'计算机', pass:64.0 },
  { short:'PHYS 1', rate:10.2, prev:9.5, diff:+0.7, cat:'科学', pass:47.3 },
  { short:'SPAN LIT', rate:10.2, prev:9.8, diff:+0.4, cat:'语言', pass:67.0 },
  { short:'ENG LANG', rate:9.8, prev:10.3, diff:-0.5, cat:'英语', pass:54.6 },
  { short:'SEMINAR', rate:9.4, prev:11.0, diff:-1.6, cat:'Capstone', pass:85.7 },
  { short:'ENVIRO SCI', rate:9.2, prev:8.0, diff:+1.2, cat:'科学', pass:54.1 },
  { short:'STUDIO 3D', rate:6.2, prev:6.8, diff:-0.6, cat:'艺术', pass:72.0 },
];

export function FiveRateRanking() {
  const [sortBy, setSortBy] = useState<'rate'|'diff'|'pass'>('rate');
  const setCurrentView = useTerminalStore((s) => s.setCurrentView);

  const sorted = [...RANKINGS].sort((a, b) => {
    if (sortBy === 'rate') return b.rate - a.rate;
    if (sortBy === 'diff') return b.diff - a.diff;
    return b.pass - a.pass;
  });

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] overflow-y-auto">
      <div className="sticky top-0 z-10 flex items-center gap-4 px-4 py-3 bg-[#12121a]/95 backdrop-blur border-b border-[#2a2a3a]">
        <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-1 text-[#666] hover:text-white text-xs"><ArrowLeft size={14} /> 总览</button>
        <h2 className="text-sm font-bold text-green-400 tracking-wide">AP 5分率排行榜</h2>
        <div className="flex-1" />
        <div className="flex gap-1 text-[10px]">
          {[{ k:'rate' as const, l:'5分率' },{ k:'diff' as const, l:'变化' },{ k:'pass' as const, l:'通过率' }].map((b) => (
            <button key={b.k} onClick={() => setSortBy(b.k)} className={`px-3 py-1 rounded ${sortBy===b.k ? 'bg-green-400/20 text-green-400' : 'text-[#666] hover:text-[#aaa]'}`}>{b.l}</button>
          ))}
        </div>
      </div>
      <div className="max-w-3xl mx-auto w-full p-5">
        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg overflow-hidden">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-[#666] border-b border-[#2a2a3a] bg-[#16162a]">
                <th className="text-left py-2 px-4 w-10">#</th>
                <th className="text-left py-2 px-4">课程</th>
                <th className="text-center py-2 px-3 w-20">类别</th>
                <th className="text-right py-2 px-4 w-20">5分率</th>
                <th className="text-right py-2 px-4 w-20">变化</th>
                <th className="text-right py-2 px-4 w-20">通过率</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c, i) => (
                <tr key={c.short} className={`border-b border-[#1e1e2e] hover:bg-[#16162a] transition-colors ${i < 5 ? 'bg-[#ff6a00]/5' : ''}`}>
                  <td className="py-2 px-4 text-[#555]">{i + 1}</td>
                  <td className="py-2 px-4">
                    <span className="text-[#ccc]">{courseLabel(c.short)}</span>
                  </td>
                  <td className="text-center py-2 px-3 text-[#666]">{c.cat}</td>
                  <td className="text-right py-2 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-[#1a1a2e] rounded overflow-hidden">
                        <div className="h-full rounded" style={{ width:`${c.rate}%`, background: c.rate>30?'linear-gradient(90deg,#4ade80,#22d3ee)':c.rate>15?'linear-gradient(90deg,#facc15,#ff6a00)':'linear-gradient(90deg,#f87171,#ef4444)' }} />
                      </div>
                      <span className={`font-mono font-bold ${c.rate>30?'text-green-400':c.rate>15?'text-[#ff6a00]':'text-red-400'}`}>{c.rate}%</span>
                    </div>
                  </td>
                  <td className={`text-right py-2 px-4 font-mono ${c.diff>0?'text-green-400':c.diff<0?'text-red-400':'text-[#666]'}`}>
                    <span className="inline-flex items-center gap-0.5">
                      {c.diff>0?<TrendingUp size={10}/>:c.diff<0?<TrendingDown size={10}/>:null}
                      {c.diff>0?'+':''}{c.diff.toFixed(1)}%
                    </span>
                  </td>
                  <td className={`text-right py-2 px-4 ${c.pass>70?'text-green-400':c.pass<55?'text-red-400':'text-[#888]'}`}>{c.pass}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
