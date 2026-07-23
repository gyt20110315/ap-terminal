import { useTerminalStore } from '../../store/terminalStore';
import { CommandBar } from './CommandBar';
import { PanelGrid } from './PanelGrid';
import { NewsTicker } from '../panels/NewsTicker';
import { ExamCountdown } from '../panels/ExamCountdown';
import { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, Search, Globe, GraduationCap, FileText, PenTool, Coins, Layout, Star, Keyboard, Calculator, Calendar } from 'lucide-react';
import type { ExamType } from '../../types';
import { getLayoutPreset, saveLayoutMode, loadLayoutMode } from '../../lib/layoutPresets';
import type { LayoutMode } from '../../lib/layoutPresets';

const EXAM_TABS: { id: ExamType; label: string; icon: typeof GraduationCap; color: string; borderColor: string; bg: string; bgActive: string }[] = [
  { id: 'ap', label: 'AP', icon: GraduationCap, color: '#ff6a00', borderColor: 'border-[#ff6a00]', bg: 'bg-[#ff6a00]/10', bgActive: 'bg-[#ff6a00]/20' },
  { id: 'ielts', label: 'IELTS', icon: FileText, color: '#f87171', borderColor: 'border-red-400', bg: 'bg-red-400/10', bgActive: 'bg-red-400/20' },
  { id: 'toefl', label: 'TOEFL', icon: PenTool, color: '#4ade80', borderColor: 'border-green-400', bg: 'bg-green-400/10', bgActive: 'bg-green-400/20' },
  { id: 'sat', label: 'SAT', icon: BookOpen, color: '#60a5fa', borderColor: 'border-blue-400', bg: 'bg-blue-400/10', bgActive: 'bg-blue-400/20' },
];

const NAV_TABS = [
  { id: 'dashboard' as const, label: '总览', icon: LayoutDashboard, color: '#ff6a00' },
  { id: 'course_detail' as const, label: '课程', icon: BookOpen, color: '#facc15' },
  { id: 'five_rate' as const, label: '5分率', icon: Star, color: '#4ade80' },
  { id: 'frq_bank' as const, label: '真题', icon: FileText, color: '#22d3ee' },
  { id: 'score_calc' as const, label: '算分', icon: Calculator, color: '#facc15' },
  { id: 'news' as const, label: '归档', icon: Search, color: '#a78bfa' },
  { id: 'schedule' as const, label: '考表', icon: Calendar, color: '#f472b6' },
];

export function TerminalLayout() {
  const { connected, currentView, setCurrentView, activeExamType, setActiveExamType, setPanels } = useTerminalStore();
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(loadLayoutMode);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Apply layout preset on mode change
  const switchLayout = (mode: LayoutMode) => {
    setLayoutMode(mode);
    setPanels(getLayoutPreset(mode));
    saveLayoutMode(mode);
  };

  // Listen for ? key to show shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '?' && !(e.target as HTMLElement).matches('input,textarea')) {
        e.preventDefault();
        setShowShortcuts((v) => !v);
      }
      if (e.key === 'Escape') setShowShortcuts(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a0a0f] text-[#e0e0e0] overflow-hidden font-mono">
      {/* ===== HEADER ===== */}
      <header className="flex items-center justify-between px-3 py-1 bg-[#0d0d18] border-b border-[#2a2a3a] shrink-0 gap-2">
        {/* Logo + Exam Tabs */}
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-black tracking-[0.15em] text-[#ff6a00] whitespace-nowrap">
            EXAM<span className="text-[#555]">|</span>TERMINAL
          </h1>

          {/* Exam Type Tabs */}
          <div className="flex items-center gap-1">
            {EXAM_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeExamType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveExamType(tab.id)}
                  style={isActive ? { borderColor: tab.color, boxShadow: `0 0 8px ${tab.color}20` } : {}}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-bold transition-all border ${
                    isActive
                      ? `${tab.bgActive} text-white border-current`
                      : 'text-[#666] border-transparent hover:text-[#aaa] hover:bg-[#1a1a2e]'
                  }`}
                >
                  <Icon size={13} style={isActive ? { color: tab.color } : {}} />
                  <span className="tracking-wide">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right side: layout mode + page nav + status */}
        <div className="flex items-center gap-3">
          {/* Layout mode toggle */}
          <button
            onClick={() => switchLayout(layoutMode === 'trader' ? 'analyst' : 'trader')}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-[#aaa] hover:bg-[#1a1a2e] border border-transparent hover:border-[#2a2a3a] transition-all shrink-0"
            title={`当前: ${layoutMode === 'trader' ? '交易员模式' : '分析师模式'} (点击切换)`}
          >
            <Layout size={12} />
            {layoutMode === 'trader' ? '交易员' : '分析师'}
          </button>

          {/* Keyboard shortcuts */}
          <button
            onClick={() => setShowShortcuts(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-[#666] hover:bg-[#1a1a2e] border border-transparent hover:border-[#2a2a3a] transition-all shrink-0"
            title="快捷键 (?)"
          >
            <Keyboard size={12} /> ?
          </button>
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id)}
                style={isActive ? { borderColor: tab.color } : {}}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all border ${
                  isActive
                    ? 'bg-[#1e1e32] text-white'
                    : 'text-[#666] border-transparent hover:text-[#aaa] hover:bg-[#1a1a2e]'
                }`}
              >
                <Icon size={12} style={isActive ? { color: tab.color } : {}} />
                {tab.label}
              </button>
            );
          })}

          <span className="text-[#333]">|</span>

          {/* Token usage button */}
          <button
            onClick={() => setCurrentView('tokens')}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-[#a78bfa] hover:bg-[#a78bfa]/10 border border-transparent hover:border-[#a78bfa]/30 transition-all shrink-0"
            title="查看Token消耗"
          >
            <Coins size={12} />
            Token
          </button>

          <span className="flex items-center gap-1.5 text-[10px] shrink-0">
            <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-green-400 animate-pulse shadow-[0_0_4px_#4ade80]' : 'bg-red-500'}`} />
            <span className={`font-bold ${connected ? 'text-green-400' : 'text-red-400'}`}>
              {connected ? 'LIVE' : 'OFFLINE'}
            </span>
          </span>
        </div>
      </header>

      {/* ===== NEWS TICKER ===== */}
      <NewsTicker />

      {/* ===== COMMAND BAR ===== */}
      <CommandBar />

      {/* ===== EXAM COUNTDOWN ===== */}
      <ExamCountdown />

      {/* ===== MAIN PANELS ===== */}
      <main className="flex-1 overflow-hidden">
        <PanelGrid />
      </main>

      {/* ===== STATUS BAR ===== */}
      <footer className="flex items-center justify-between px-3 py-1 bg-[#0d0d18] border-t border-[#2a2a3a] shrink-0 text-[10px] text-[#555]">
        <span>
          {activeExamType.toUpperCase()} 终端
          <span className="text-[#666] ml-1">· 按</span>
          <kbd className="mx-1 px-1 py-0.5 rounded bg-[#1a1a2e] text-[9px] text-[#aaa] border border-[#2a2a3a]">/</kbd>
          <span className="text-[#666]">输入命令</span>
        </span>
        <span className="text-[#666]">{new Date().toLocaleTimeString()}</span>
      </footer>

      {/* ══ Keyboard Shortcuts Overlay ══ */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowShortcuts(false)}>
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-6 w-[480px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Keyboard size={16} className="text-[#ff6a00]" /> 快捷键速查</h3>
              <button onClick={() => setShowShortcuts(false)} className="text-[#666] hover:text-white text-xs">ESC 关闭</button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                ['/', '聚焦命令栏'],
                ['?', '显示此面板'],
                ['Esc', '回到总览'],
                ['Tab', '命令自动补全'],
                ['↑ / ↓', '命令历史'],
                ['Ctrl+D', '回到总览'],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center gap-2 p-2 rounded bg-[#1a1a2e]">
                  <kbd className="px-2 py-0.5 rounded bg-[#0a0a0f] text-[#ff6a00] text-[10px] font-bold border border-[#2a2a3a] min-w-[40px] text-center">{key}</kbd>
                  <span className="text-[#aaa]">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
