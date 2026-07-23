import { useState, useMemo } from 'react';
import { useTerminalStore } from '../../store/terminalStore';
import { ArrowLeft, Calculator } from 'lucide-react';
import { courseLabel } from '../../lib/courseNames';

// Simplified AP score calculation models (approximate cut scores)
const SCORE_MODELS: Record<string, { mcCount:number; mcWeight:number; frqCount:number; frqWeight:number; cut5:number; cut4:number; cut3:number; cut2:number }> = {
  'CALC AB': { mcCount:45, mcWeight:0.50, frqCount:6, frqWeight:0.50, cut5:63, cut4:50, cut3:38, cut2:28 },
  'CALC BC': { mcCount:45, mcWeight:0.50, frqCount:6, frqWeight:0.50, cut5:63, cut4:50, cut3:38, cut2:28 },
  'STATS': { mcCount:40, mcWeight:0.50, frqCount:6, frqWeight:0.50, cut5:70, cut4:57, cut3:44, cut2:33 },
  'BIO': { mcCount:60, mcWeight:0.50, frqCount:6, frqWeight:0.50, cut5:77, cut4:63, cut3:48, cut2:36 },
  'CHEM': { mcCount:60, mcWeight:0.50, frqCount:7, frqWeight:0.50, cut5:72, cut4:58, cut3:42, cut2:27 },
  'PHYS 1': { mcCount:50, mcWeight:0.50, frqCount:5, frqWeight:0.50, cut5:71, cut4:55, cut3:42, cut2:31 },
  'PSYCH': { mcCount:100, mcWeight:0.67, frqCount:2, frqWeight:0.33, cut5:75, cut4:62, cut3:49, cut2:36 },
  'MACRO ECON': { mcCount:60, mcWeight:0.67, frqCount:3, frqWeight:0.33, cut5:76, cut4:62, cut3:48, cut2:36 },
  'MICRO ECON': { mcCount:60, mcWeight:0.67, frqCount:3, frqWeight:0.33, cut5:76, cut4:62, cut3:48, cut2:36 },
};

const COURSES = Object.keys(SCORE_MODELS);

export function ScoreCalculator() {
  const [course, setCourse] = useState('CALC AB');
  const [mcCorrect, setMcCorrect] = useState(30);
  const [frqAvg, setFrqAvg] = useState(50);
  const setCurrentView = useTerminalStore((s) => s.setCurrentView);
  const model = SCORE_MODELS[course];

  const result = useMemo(() => {
    if (!model) return null;
    const mcScore = (mcCorrect / model.mcCount) * 100 * model.mcWeight;
    const frqScore = (frqAvg / 100) * 100 * model.frqWeight;
    const total = mcScore + frqScore;
    let apScore = 1;
    if (total >= model.cut5) apScore = 5;
    else if (total >= model.cut4) apScore = 4;
    else if (total >= model.cut3) apScore = 3;
    else if (total >= model.cut2) apScore = 2;
    return { mcScore, frqScore, total: Math.round(total), apScore };
  }, [course, mcCorrect, frqAvg, model]);

  const scoreColors = ['#ef4444','#f87171','#facc15','#22d3ee','#4ade80'];

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] overflow-y-auto">
      <div className="sticky top-0 flex items-center gap-4 px-4 py-3 bg-[#12121a]/95 backdrop-blur border-b border-[#2a2a3a]">
        <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-1 text-[#666] hover:text-white text-xs"><ArrowLeft size={14} /> 总览</button>
        <h2 className="text-sm font-bold text-yellow-400 tracking-wide">AP 分数计算器</h2>
        <select value={course} onChange={(e) => { setCourse(e.target.value); setMcCorrect(Math.floor(SCORE_MODELS[e.target.value]?.mcCount * 0.7 || 30)); }} className="ml-auto bg-[#1a1a2e] border border-[#2a2a3a] text-xs text-[#ccc] px-3 py-1.5 rounded">
          {COURSES.map((c) => <option key={c} value={c}>{courseLabel(c)}</option>)}
        </select>
      </div>
      <div className="max-w-2xl mx-auto w-full p-5 space-y-5">
        {/* Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-5">
            <div className="text-[9px] text-[#666] uppercase mb-1">选择题正确数</div>
            <div className="flex items-center gap-3">
              <input type="range" min={0} max={model?.mcCount || 60} value={mcCorrect} onChange={(e) => setMcCorrect(+e.target.value)} className="flex-1 accent-[#ff6a00]" />
              <span className="text-lg font-bold text-white w-12 text-right">{mcCorrect}<span className="text-[#666] text-xs">/{model?.mcCount}</span></span>
            </div>
          </div>
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-5">
            <div className="text-[9px] text-[#666] uppercase mb-1">FRQ 预估得分率</div>
            <div className="flex items-center gap-3">
              <input type="range" min={0} max={100} value={frqAvg} onChange={(e) => setFrqAvg(+e.target.value)} className="flex-1 accent-[#ff6a00]" />
              <span className="text-lg font-bold text-white w-12 text-right">{frqAvg}<span className="text-[#666] text-xs">%</span></span>
            </div>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-6 text-center">
            <div className="text-[10px] text-[#666] uppercase tracking-wide mb-3">预估 AP 得分</div>
            <div className="text-6xl font-black" style={{ color: scoreColors[result.apScore - 1] }}>{result.apScore}</div>
            <div className="flex justify-center gap-2 mt-3">
              {[1,2,3,4,5].map((s) => (
                <span key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${s === result.apScore ? 'text-white ring-2 ring-offset-2 ring-offset-[#0a0a0f]' : 'text-[#555] bg-[#1a1a2e]'}`} style={s===result.apScore?{background:scoreColors[s-1],ringColor:scoreColors[s-1]}:{}}>{s}</span>
              ))}
            </div>
            <div className="text-[11px] text-[#888] mt-3">综合得分: {result.total}% &nbsp;|&nbsp; 选择: {Math.round(result.mcScore)}% &nbsp;|&nbsp; FRQ: {Math.round(result.frqScore)}%</div>
          </div>
        )}

        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-4">
          <h3 className="text-[10px] font-bold text-[#888] uppercase tracking-wide mb-2">📐 各分数段截断线 (近似)</h3>
          <div className="grid grid-cols-4 gap-2 text-[10px]">
            {[
              ['5分', model?.cut5, '#4ade80'],
              ['4分', model?.cut4, '#22d3ee'],
              ['3分', model?.cut3, '#facc15'],
              ['2分', model?.cut2, '#f87171'],
            ].map(([label, cut, color]) => (
              <div key={label as string} className="bg-[#1a1a2e] rounded p-2 text-center">
                <div className="text-[#666]">{label}</div>
                <div className="font-bold" style={{ color: color as string }}>{cut}%+</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
