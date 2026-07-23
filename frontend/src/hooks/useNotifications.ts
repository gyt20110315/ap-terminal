import { useEffect } from 'react';
import { useTerminalStore } from '../store/terminalStore';

export function useNotifications() {
  const { alerts } = useTerminalStore();

  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    // Show notification for new alerts
    if (alerts.length > 0) {
      const latest = alerts[0];
      try {
        new Notification('AP Terminal Alert', {
          body: latest.message || latest.article?.title || 'New alert triggered',
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="%23ff6a00"/><text x="16" y="22" font-size="18" font-family="monospace" font-weight="bold" text-anchor="middle" fill="%230a0a0f">AP</text></svg>',
          tag: 'ap-terminal-alert',
        });
      } catch {
        // Notification failed — ignore
      }
    }
  }, [alerts]);
}
