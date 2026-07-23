import { useTerminalStore } from '../../store/terminalStore';

function timeAgo(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

export function AlertPanel() {
  const alerts = useTerminalStore((s) => s.alerts);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#16162a] border-b border-[#2a2a3a] shrink-0 panel-drag-handle cursor-move">
        <span className="text-[10px] font-bold text-[#aaa] tracking-wide">🔔 警报通知</span>
        <span className="text-[9px] text-[#ff6a00]">{alerts.length > 0 ? `${alerts.length} 条触发` : '暂无警报'}</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#444] text-xs">
            设置关键词警报：ALERT &lt;关键词&gt;
          </div>
        ) : (
          alerts.map((alert, i) => (
            <div key={i} className="px-3 py-1.5 border-b border-[#1e1e2e] hover:bg-[#16162a] transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#ff6a00]">⚠</span>
                <span className="text-[11px] text-[#ddd] truncate flex-1">
                  {alert.message || alert.article?.title || 'Alert triggered'}
                </span>
                <span className="text-[9px] text-[#555] shrink-0">
                  {alert.triggered_at ? timeAgo(alert.triggered_at) : 'just now'}
                </span>
              </div>
              {alert.matched_keywords && alert.matched_keywords.length > 0 && (
                <div className="flex gap-1 mt-0.5 ml-4">
                  {alert.matched_keywords.map((kw) => (
                    <span key={kw} className="px-1 py-0.5 rounded bg-[#ff6a00]/20 text-[#ff6a00] text-[9px]">{kw}</span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
