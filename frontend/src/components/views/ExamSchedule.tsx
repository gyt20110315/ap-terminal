import { useState } from 'react';
import { useTerminalStore } from '../../store/terminalStore';
import { ArrowLeft, Clock, Calendar, MapPin, Globe } from 'lucide-react';

type ExamTab = 'ap' | 'ielts' | 'toefl' | 'sat';

// ── AP 2027 Exam Schedule ──
const AP_SCHEDULE = [
  { week:'Week 1 · 5月5日 周一', exams:[
    { time:'08:00', name:'AP United States Government and Politics', short:'US GOV', dur:'3h' },
    { time:'12:00', name:'AP Art History', short:'ART HIST', dur:'3h' },
    { time:'12:00', name:'AP Comparative Government and Politics', short:'COMP GOV', dur:'2h30m' },
  ]},
  { week:'Week 1 · 5月6日 周二', exams:[
    { time:'08:00', name:'AP Chemistry', short:'CHEM', dur:'3h15m' },
    { time:'08:00', name:'AP Human Geography', short:'HUMAN GEO', dur:'2h15m' },
    { time:'12:00', name:'AP Environmental Science', short:'ENVIRO SCI', dur:'3h' },
    { time:'12:00', name:'AP Physics 2: Algebra-Based', short:'PHYS 2', dur:'3h' },
  ]},
  { week:'Week 1 · 5月7日 周三', exams:[
    { time:'08:00', name:'AP English Literature and Composition', short:'ENG LIT', dur:'3h' },
    { time:'12:00', name:'AP Computer Science A', short:'CS A', dur:'3h' },
    { time:'12:00', name:'AP Macroeconomics', short:'MACRO ECON', dur:'2h10m' },
  ]},
  { week:'Week 1 · 5月8日 周四', exams:[
    { time:'08:00', name:'AP Statistics', short:'STATS', dur:'3h' },
    { time:'12:00', name:'AP Japanese Language and Culture', short:'JAPANESE LANG', dur:'2h' },
    { time:'12:00', name:'AP World History: Modern', short:'WORLD HIST', dur:'3h15m' },
  ]},
  { week:'Week 1 · 5月9日 周五', exams:[
    { time:'08:00', name:'AP German Language and Culture', short:'GERMAN LANG', dur:'2h' },
    { time:'08:00', name:'AP United States History', short:'US HISTORY', dur:'3h15m' },
    { time:'12:00', name:'AP European History', short:'EURO HIST', dur:'3h15m' },
    { time:'12:00', name:'AP Microeconomics', short:'MICRO ECON', dur:'2h10m' },
  ]},
  { week:'Week 2 · 5月12日 周一', exams:[
    { time:'08:00', name:'AP Calculus AB', short:'CALC AB', dur:'3h15m' },
    { time:'08:00', name:'AP Calculus BC', short:'CALC BC', dur:'3h15m' },
    { time:'12:00', name:'AP Italian Language and Culture', short:'ITALIAN LANG', dur:'2h' },
    { time:'12:00', name:'AP Precalculus', short:'PRECALC', dur:'3h' },
  ]},
  { week:'Week 2 · 5月13日 周二', exams:[
    { time:'08:00', name:'AP English Language and Composition', short:'ENG LANG', dur:'3h15m' },
    { time:'12:00', name:'AP Physics C: Mechanics', short:'PHYS C:M', dur:'1h30m' },
    { time:'14:00', name:'AP Physics C: Electricity and Magnetism', short:'PHYS C:E&M', dur:'1h30m' },
  ]},
  { week:'Week 2 · 5月14日 周三', exams:[
    { time:'08:00', name:'AP Biology', short:'BIO', dur:'3h' },
    { time:'08:00', name:'AP French Language and Culture', short:'FRENCH LANG', dur:'2h' },
    { time:'12:00', name:'AP Spanish Language and Culture', short:'SPAN LANG', dur:'2h' },
    { time:'12:00', name:'AP Spanish Literature and Culture', short:'SPAN LIT', dur:'3h' },
  ]},
  { week:'Week 2 · 5月15日 周四', exams:[
    { time:'08:00', name:'AP Physics 1: Algebra-Based', short:'PHYS 1', dur:'3h' },
    { time:'12:00', name:'AP Chinese Language and Culture', short:'CHINESE LANG', dur:'2h' },
    { time:'12:00', name:'AP Latin', short:'LATIN', dur:'3h' },
  ]},
  { week:'Week 2 · 5月16日 周五', exams:[
    { time:'08:00', name:'AP Psychology', short:'PSYCH', dur:'2h' },
    { time:'12:00', name:'AP Computer Science Principles', short:'CS PRINCIPLES', dur:'2h' },
    { time:'12:00', name:'AP Music Theory', short:'MUSIC THEO', dur:'2h40m' },
  ]},
];

// ── IELTS 2026-2027 test dates (China, paper-based) ──
const IELTS_DATES = {
  china: [
    { date:'2026-07-19', type:'学术类+培训类', city:'全国' },
    { date:'2026-07-26', type:'学术类+培训类', city:'全国' },
    { date:'2026-08-02', type:'学术类+培训类', city:'全国' },
    { date:'2026-08-09', type:'学术类+培训类', city:'全国' },
    { date:'2026-08-16', type:'学术类+培训类', city:'全国' },
    { date:'2026-08-23', type:'学术类+培训类', city:'全国' },
    { date:'2026-09-06', type:'学术类+培训类', city:'全国' },
    { date:'2026-09-13', type:'学术类+培训类', city:'全国' },
    { date:'2026-09-20', type:'学术类+培训类', city:'全国' },
    { date:'2026-09-27', type:'学术类+培训类', city:'全国' },
    { date:'2026-10-11', type:'学术类+培训类', city:'全国' },
    { date:'2026-10-18', type:'学术类+培训类', city:'全国' },
  ],
  tips: [
    '雅思纸笔考试通常在周六举行，每年约48场',
    '机考几乎每天都有，出分更快（3-5天）',
    '建议提前1-2个月报名，热门城市考位紧张',
    '报名网址：https://ielts.neea.cn (教育部考试中心)',
  ],
};

// ── TOEFL 2026-2027 test dates ──
const TOEFL_DATES = {
  china: [
    { date:'2026-07', desc:'每月3-6场考试，多数安排在周六、周日' },
    { date:'2026-08', desc:'暑期高峰，建议提前1个月报名' },
    { date:'2026-09', desc:'秋季学期开始，考位充足' },
    { date:'2026-10', desc:'早申截止前高峰，考位紧张' },
    { date:'2026-11', desc:'RD申请截止前最后机会' },
    { date:'2026-12', desc:'年末考次减少' },
    { date:'2027-01', desc:'新年首场' },
  ],
  tips: [
    '托福iBT家考版(Home Edition)每周4天可考',
    '考试中心版每月3-6场，具体日期以NEEA官网为准',
    '报名网址：https://toefl.neea.cn',
    '建议提前1-2个月报名',
  ],
};

// ── SAT 2026-2027 test dates ──
const SAT_DATES = {
  international: [
    { date:'2026-08-23', reg:'2026-07-18', type:'机考' },
    { date:'2026-10-04', reg:'2026-08-29', type:'机考' },
    { date:'2026-11-08', reg:'2026-10-03', type:'机考' },
    { date:'2026-12-06', reg:'2026-10-31', type:'机考' },
    { date:'2027-03-14', reg:'2027-02-07', type:'机考' },
    { date:'2027-05-02', reg:'2027-03-28', type:'机考' },
    { date:'2027-06-06', reg:'2027-05-02', type:'机考' },
  ],
  tips: [
    'SAT 自 2024 年起全面实行机考（Digital SAT）',
    '中国大陆无考场，需赴香港、澳门、新加坡等地考试',
    '报名网址：https://collegereadiness.collegeboard.org/sat/register',
    '国际考场每年7次考试机会',
    '报名截止日期为考前约5周，逾期报名需额外缴费',
  ],
};

const TAB_COLORS: Record<ExamtTab, string> = { ap:'#ff6a00', ielts:'#f87171', toefl:'#4ade80', sat:'#60a5fa' };
const TAB_LABELS: Record<ExamtTab, string> = { ap:'AP', ielts:'雅思', toefl:'托福', sat:'SAT' };

export function ExamSchedule() {
  const [tab, setTab] = useState<ExamtTab>('ap');
  const setCurrentView = useTerminalStore((s) => s.setCurrentView);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-4 px-4 py-3 bg-[#12121a]/95 backdrop-blur border-b border-[#2a2a3a]">
        <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-1 text-[#666] hover:text-white text-xs"><ArrowLeft size={14} /> 总览</button>
        <h2 className="text-sm font-bold tracking-wide" style={{color:TAB_COLORS[tab]}}>考试时间表</h2>
        <div className="flex gap-1 ml-4">
          {(Object.keys(TAB_COLORS) as ExamtTab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${tab===t ? 'text-white border-current' : 'text-[#666] border-transparent hover:text-[#aaa]'}`}
              style={tab===t?{borderColor:TAB_COLORS[t],background:`${TAB_COLORS[t]}15`}:{}}
            >{TAB_LABELS[t]}</button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full p-5 space-y-5">
        {/* ═══ AP ═══ */}
        {tab === 'ap' && (
          <>
            <div className="bg-[#12121a] border border-[#ff6a00]/30 rounded-lg p-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1"><Calendar size={16} className="text-[#ff6a00]" /> 2027年AP考试时间表</h3>
              <p className="text-[10px] text-[#888] mb-4">以下为College Board官方公布的2027年5月AP考试安排（预计，最终以官方公告为准）。上午场08:00开始，下午场12:00开始。</p>
              <div className="space-y-4">
                {AP_SCHEDULE.map((day) => (
                  <div key={day.week} className="border border-[#2a2a3a] rounded-lg overflow-hidden">
                    <div className="bg-[#16162a] px-4 py-2 text-[11px] font-bold text-[#ff6a00]">{day.week}</div>
                    <div className="divide-y divide-[#1e1e2e]">
                      {day.exams.map((exam) => (
                        <div key={exam.short} className="flex items-center gap-4 px-4 py-2.5 hover:bg-[#16162a] transition-colors">
                          <span className="text-[10px] font-mono text-[#555] w-12 shrink-0">{exam.time}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-[#ccc]">{exam.name}</div>
                            <div className="text-[9px] text-[#666]">{exam.short}</div>
                          </div>
                          <span className="text-[9px] text-[#555] bg-[#1a1a2e] px-2 py-0.5 rounded">{exam.dur}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#1a1a20] border border-[#ff6a00]/20 rounded-lg p-4 text-[11px] text-[#888]">
              <span className="text-[#ff6a00] font-bold">注意：</span>AP Capstone（Seminar/Research）、AP 工作室艺术（2D/3D/Drawing）无统一笔试日期，作品集提交截止日期通常为5月初。
            </div>
          </>
        )}

        {/* ═══ IELTS ═══ */}
        {tab === 'ielts' && (
          <>
            <div className="bg-[#12121a] border border-red-400/30 rounded-lg p-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1"><Globe size={16} className="text-red-400" /> 2026年下半年雅思纸笔考试日期（中国）</h3>
              <p className="text-[10px] text-[#888] mb-4">以下为英国文化协会(British Council)公布的2026年中国大陆雅思纸笔考试日期。机考几乎每天都有。</p>
              <div className="grid grid-cols-3 gap-2">
                {IELTS_DATES.china.map((d) => {
                  const days = Math.ceil((new Date(d.date).getTime() - Date.now()) / 86400000);
                  return (
                    <div key={d.date} className={`p-3 rounded-lg border ${days < 0 ? 'bg-[#1a1a2e] border-[#2a2a3a] opacity-50' : days <= 30 ? 'bg-red-400/5 border-red-400/30' : 'bg-[#1a1a2e] border-[#2a2a3a]'}`}>
                      <div className="text-[11px] font-bold text-white">{d.date}</div>
                      <div className="text-[9px] text-[#666] mt-0.5">{d.type}</div>
                      <div className="text-[9px] text-[#555]">{d.city}</div>
                      {days > 0 && <div className={`text-[9px] mt-1 ${days <= 30 ? 'text-red-400 font-bold' : 'text-[#666]'}`}>距考试{days}天</div>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-[#1a1a20] border border-red-400/20 rounded-lg p-4">
              <h4 className="text-[11px] font-bold text-red-400 mb-2">📝 报名须知</h4>
              <ul className="space-y-1">
                {IELTS_DATES.tips.map((t, i) => <li key={i} className="text-[10px] text-[#888]">· {t}</li>)}
              </ul>
            </div>
          </>
        )}

        {/* ═══ TOEFL ═══ */}
        {tab === 'toefl' && (
          <>
            <div className="bg-[#12121a] border border-green-400/30 rounded-lg p-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1"><Globe size={16} className="text-green-400" /> 2026-2027年托福iBT考试安排（中国）</h3>
              <p className="text-[10px] text-[#888] mb-4">托福iBT考试中心版由NEEA统一安排，家考版(Home Edition)每周4天可选。具体日期请登录NEEA官网查询。</p>
              <div className="space-y-2">
                {TOEFL_DATES.china.map((d) => (
                  <div key={d.date} className="flex items-center gap-4 p-3 rounded-lg bg-[#1a1a2e] border border-[#2a2a3a]">
                    <span className="text-xs font-bold text-green-400 w-20 shrink-0">{d.date}</span>
                    <span className="text-[11px] text-[#aaa]">{d.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#1a1a20] border border-green-400/20 rounded-lg p-4">
              <h4 className="text-[11px] font-bold text-green-400 mb-2">📝 报名须知</h4>
              <ul className="space-y-1">
                {TOEFL_DATES.tips.map((t, i) => <li key={i} className="text-[10px] text-[#888]">· {t}</li>)}
              </ul>
            </div>
          </>
        )}

        {/* ═══ SAT ═══ */}
        {tab === 'sat' && (
          <>
            <div className="bg-[#12121a] border border-blue-400/30 rounded-lg p-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1"><MapPin size={16} className="text-blue-400" /> 2026-2027年SAT国际考场日期</h3>
              <p className="text-[10px] text-[#888] mb-4">SAT自2024年起全面机考(Digital SAT)。中国大陆无考场，需赴香港/澳门/新加坡等地考试。</p>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-[#666] border-b border-[#2a2a3a]">
                      <th className="text-left py-2 px-3">考试日期</th>
                      <th className="text-left py-2 px-3">报名截止</th>
                      <th className="text-left py-2 px-3">形式</th>
                      <th className="text-right py-2 px-3">剩余天数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SAT_DATES.international.map((d) => {
                      const days = Math.ceil((new Date(d.date).getTime() - Date.now()) / 86400000);
                      return (
                        <tr key={d.date} className={`border-b border-[#1e1e2e] ${days <= 30 ? 'bg-red-400/5' : ''}`}>
                          <td className="py-2 px-3 text-white font-bold">{d.date}</td>
                          <td className="py-2 px-3 text-[#888]">{d.reg}</td>
                          <td className="py-2 px-3"><span className="px-2 py-0.5 rounded bg-blue-400/20 text-blue-400 text-[9px]">{d.type}</span></td>
                          <td className={`py-2 px-3 text-right font-mono ${days <= 30 ? 'text-red-400 font-bold' : days <= 60 ? 'text-[#ff6a00]' : 'text-[#666]'}`}>
                            {days <= 0 ? '已过' : `${days}天`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-[#1a1a20] border border-blue-400/20 rounded-lg p-4">
              <h4 className="text-[11px] font-bold text-blue-400 mb-2">📝 报名须知</h4>
              <ul className="space-y-1">
                {SAT_DATES.tips.map((t, i) => <li key={i} className="text-[10px] text-[#888]">· {t}</li>)}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
