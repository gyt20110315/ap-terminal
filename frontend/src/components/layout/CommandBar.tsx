import { useState, useRef, useEffect, useCallback } from 'react';
import { useTerminalStore } from '../../store/terminalStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useCommand } from '../../hooks/useCommand';

export function CommandBar() {
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { commandHistory, addCommandToHistory, addMessage } = useTerminalStore();
  const { sendCommand } = useWebSocket();
  const { parseCommand } = useCommand();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
        setInput('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const updateSuggestions = useCallback((value: string) => {
    if (!value.trim()) { setSuggestions([]); return; }
    const upper = value.toUpperCase().trim();
    setSuggestions(
      ['HELP', 'DASH', 'NEWS', 'COURSE', 'STATS', 'TREND', 'ALERT', 'HOT', 'CLEAR']
        .filter((c) => c.startsWith(upper))
    );
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    addCommandToHistory(trimmed);
    setHistoryIndex(-1);
    const result = parseCommand(trimmed);
    if (result) {
      addMessage(`> ${result.command} ${result.args}`.trim());
      sendCommand(result.command, result.args);
    }
    setInput('');
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && suggestions.length > 0) {
      e.preventDefault();
      setInput(suggestions[0] + ' ');
      setSuggestions([]);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIdx = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
      setHistoryIndex(newIdx);
      if (commandHistory.length > 0 && newIdx >= 0) {
        setInput(commandHistory[commandHistory.length - 1 - newIdx]);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIdx = historyIndex > 0 ? historyIndex - 1 : -1;
      setHistoryIndex(newIdx);
      setInput(newIdx >= 0 ? commandHistory[commandHistory.length - 1 - newIdx] : '');
      return;
    }
  };

  return (
    <div className="shrink-0 bg-[#0d0d18] border-b border-[#2a2a3a]">
      <div className="flex items-center">
        <span className="text-[#ff6a00] font-black px-3 py-1.5 text-xs select-none tracking-wide">
          CMD&gt;
        </span>
        <form onSubmit={handleSubmit} className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); updateSuggestions(e.target.value); }}
            onKeyDown={handleKeyDown}
            placeholder="Type command... HELP, NEWS, COURSE, DASH, STATS"
            className="w-full bg-transparent text-[#e0e0e0] text-xs py-1.5 outline-none font-mono placeholder:text-[#3a3a4a]"
            spellCheck={false}
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 bg-[#12121a] border border-[#2a2a3a] rounded-b-lg z-50 min-w-[220px] shadow-xl">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="block w-full text-left px-4 py-2 text-xs text-[#aaa] hover:bg-[#1e1e32] hover:text-white transition-colors"
                  onClick={() => { setInput(s + ' '); setSuggestions([]); inputRef.current?.focus(); }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </form>
        <span className="text-[10px] text-[#555] px-3 shrink-0">⏎</span>
      </div>
    </div>
  );
}
