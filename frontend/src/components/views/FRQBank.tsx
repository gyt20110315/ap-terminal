import { useState } from 'react';
import { useTerminalStore } from '../../store/terminalStore';
import { ArrowLeft, FileText, ExternalLink } from 'lucide-react';
import { courseLabel } from '../../lib/courseNames';

// College Board publicly released FRQs (Free Response Questions) — links to official PDFs
const FRQ_DATA: Record<string, { years: number[]; url: string; desc: string }> = {
  'CALC AB': { years:[2024,2023,2022,2021,2019], url:'https://apcentral.collegeboard.org/courses/ap-calculus-ab/exam/past-exam-questions', desc:'微积分AB历年FRQ及评分标准' },
  'CALC BC': { years:[2024,2023,2022,2021,2019], url:'https://apcentral.collegeboard.org/courses/ap-calculus-bc/exam/past-exam-questions', desc:'微积分BC历年FRQ及评分标准' },
  'STATS': { years:[2024,2023,2022,2021,2019], url:'https://apcentral.collegeboard.org/courses/ap-statistics/exam/past-exam-questions', desc:'统计学历年FRQ' },
  'BIO': { years:[2024,2023,2022,2021,2019], url:'https://apcentral.collegeboard.org/courses/ap-biology/exam/past-exam-questions', desc:'生物学历年FRQ' },
  'CHEM': { years:[2024,2023,2022,2021,2019], url:'https://apcentral.collegeboard.org/courses/ap-chemistry/exam/past-exam-questions', desc:'化学历年FRQ' },
  'PHYS 1': { years:[2024,2023,2022,2021,2019], url:'https://apcentral.collegeboard.org/courses/ap-physics-1/exam/past-exam-questions', desc:'物理1历年FRQ' },
  'PHYS C:M': { years:[2024,2023,2022,2021,2019], url:'https://apcentral.collegeboard.org/courses/ap-physics-c-mechanics/exam/past-exam-questions', desc:'物理C力学历年FRQ' },
  'PHYS C:E&M': { years:[2024,2023,2022,2021,2019], url:'https://apcentral.collegeboard.org/courses/ap-physics-c-electricity-and-magnetism/exam/past-exam-questions', desc:'物理C电磁学历年FRQ' },
  'CS A': { years:[2024,2023,2022,2021,2019], url:'https://apcentral.collegeboard.org/courses/ap-computer-science-a/exam/past-exam-questions', desc:'计算机科学A历年FRQ及Java代码示例' },
  'US HISTORY': { years:[2024,2023,2022,2021,2019], url:'https://apcentral.collegeboard.org/courses/ap-united-states-history/exam/past-exam-questions', desc:'美国历史历年DBQ及FRQ' },
  'WORLD HIST': { years:[2024,2023,2022,2021,2019], url:'https://apcentral.collegeboard.org/courses/ap-world-history/exam/past-exam-questions', desc:'世界历史历年DBQ及FRQ' },
  'ENG LANG': { years:[2024,2023,2022,2021,2019], url:'https://apcentral.collegeboard.org/courses/ap-english-language-and-composition/exam/past-exam-questions', desc:'英语语言历年FRQ及范文' },
};

const COURSES_WITH_FRQ = Object.keys(FRQ_DATA);

export function FRQBank() {
  const [selected, setSelected] = useState('CALC AB');
  const setCurrentView = useTerminalStore((s) => s.setCurrentView);
  const data = FRQ_DATA[selected];

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] overflow-y-auto">
      <div className="sticky top-0 z-10 flex items-center gap-4 px-4 py-3 bg-[#12121a]/95 backdrop-blur border-b border-[#2a2a3a]">
        <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-1 text-[#666] hover:text-white text-xs"><ArrowLeft size={14} /> 总览</button>
        <h2 className="text-sm font-bold text-cyan-400 tracking-wide">AP 真题 FRQ 题库</h2>
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className="ml-auto bg-[#1a1a2e] border border-[#2a2a3a] text-xs text-[#ccc] px-3 py-1.5 rounded">
          {COURSES_WITH_FRQ.map((c) => <option key={c} value={c}>{courseLabel(c)}</option>)}
        </select>
      </div>
      <div className="max-w-3xl mx-auto w-full p-5 space-y-4">
        {data ? (
          <>
            <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-5">
              <h3 className="text-sm font-bold text-white mb-2">{courseLabel(selected)} — FRQ 历年真题</h3>
              <p className="text-xs text-[#888] mb-4">{data.desc}</p>
              <div className="grid grid-cols-5 gap-2">
                {data.years.map((y) => (
                  <a key={y} href={data.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 p-3 rounded-lg bg-[#1a1a2e] hover:bg-[#252540] text-xs text-[#ccc] border border-[#2a2a3a] hover:border-[#ff6a00]/50 transition-all">
                    <FileText size={14} className="text-[#ff6a00]" /> {y}
                  </a>
                ))}
              </div>
            </div>
            <div className="bg-[#1a1a20] border border-[#ff6a00]/20 rounded-lg p-4 flex items-center gap-3">
              <FileText size={20} className="text-[#ff6a00] shrink-0" />
              <div>
                <p className="text-xs text-[#bbb]">所有 FRQ 真题均由 College Board 官方公开发布，点击年份即可跳转至 AP Central 下载 PDF（含评分标准和学生范文）。</p>
              </div>
              <a href={data.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#ff6a00]/20 hover:bg-[#ff6a00]/30 text-[#ff6a00] text-xs font-medium transition-colors shrink-0">
                <ExternalLink size={14} /> 打开官方页面
              </a>
            </div>
          </>
        ) : (
          <div className="text-center text-[#666] text-sm py-20">该课程暂无 FRQ 收录，请直接访问 AP Central 官网。</div>
        )}
      </div>
    </div>
  );
}
