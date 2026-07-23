import { useEffect } from 'react';
import { useTerminalStore } from '../store/terminalStore';

export function useKeyboard() {
  const { setCurrentView, addMessage } = useTerminalStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'h':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            addMessage('SYSTEM: Ctrl+H — Type HELP for command list');
          }
          break;
        case 'd':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setCurrentView('dashboard');
            addMessage('SYSTEM: Dashboard view');
          }
          break;
        case 'escape':
          setCurrentView('dashboard');
          break;
        case 'f1':
          e.preventDefault();
          setCurrentView('dashboard');
          addMessage('SYSTEM: Dashboard view (F1)');
          break;
        case 'f2':
          e.preventDefault();
          setCurrentView('news');
          addMessage('SYSTEM: News view (F2)');
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setCurrentView, addMessage]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
}
