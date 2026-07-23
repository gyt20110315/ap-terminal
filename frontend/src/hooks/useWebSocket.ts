import { useEffect, useRef, useCallback } from 'react';
import { useTerminalStore } from '../store/terminalStore';
import type { WSMessage, NewsArticle, NewsTickerItem, SentimentData, StatsData, TopicsData, SystemMessage, AlertData, ExamType } from '../types';

const WS_URL = 'ws://localhost:8000/ws/terminal?client_id=terminal-2';
const EXAM_TYPES: ExamType[] = ['ap', 'ielts', 'toefl', 'sat'];

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const {
    setConnected, addNewsArticle, addTickerItem, setSentiment, setStats, setTopics,
    addAlert, addMessage, setCurrentView,
  } = useTerminalStore();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      addMessage('SYSTEM: Connected. AP/IELTS/TOEFL/SAT Terminal Ready. Type HELP.');
    };

    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);
        const { channel, data: rawData } = msg;
        let parsed: unknown;
        try { parsed = JSON.parse(rawData); } catch { parsed = rawData; }

        if (channel === 'system') {
          const sysMsg = parsed as SystemMessage;
          if (sysMsg.type === 'help' && sysMsg.commands) {
            const cmds = Object.entries(sysMsg.commands).map(([cmd, desc]) => `  ${cmd.padEnd(20)} ${desc}`).join('\n');
            addMessage(`\nAVAILABLE COMMANDS:\n${cmds}\n`);
          } else if (sysMsg.type === 'navigate') {
            if (sysMsg.view) setCurrentView(sysMsg.view as Parameters<typeof setCurrentView>[0]);
          } else if (sysMsg.error) {
            addMessage(`ERROR: ${sysMsg.error}`);
          } else if (sysMsg.message) {
            addMessage(`ALERT: ${sysMsg.message}`);
          }
          return;
        }

        // Multi-exam-type news channels
        for (const exam of EXAM_TYPES) {
          if (channel === `news_${exam}`) {
            addNewsArticle({ ...(parsed as NewsArticle), exam_type: exam });
            return;
          }
        }

        // Generic news (backward compat)
        if (channel === 'news') {
          addNewsArticle({ ...(parsed as NewsArticle), exam_type: 'ap' });
          return;
        }

        // Ticker
        if (channel === 'news_ticker') {
          addTickerItem(parsed as NewsTickerItem);
          return;
        }

        // Sentiment per exam type
        for (const exam of EXAM_TYPES) {
          if (channel === `sentiment_${exam}`) { setSentiment(exam, parsed as SentimentData); return; }
        }
        if (channel === 'sentiment') { setSentiment('ap', parsed as SentimentData); return; }

        // Stats per exam type
        for (const exam of EXAM_TYPES) {
          if (channel === `stats_${exam}`) { setStats(exam, parsed as StatsData); return; }
        }
        if (channel === 'stats') { setStats('ap', parsed as StatsData); return; }

        // Topics per exam type
        for (const exam of EXAM_TYPES) {
          if (channel === `topics_${exam}`) { setTopics(exam, (parsed as TopicsData).topics); return; }
        }
        if (channel === 'topics') { setTopics('ap', (parsed as TopicsData).topics); return; }

        // Alerts
        if (channel === 'alerts') { addAlert(parsed as AlertData); return; }
      } catch { /* ignore malformed */ }
    };

    ws.onclose = () => {
      setConnected(false);
      addMessage('SYSTEM: Connection lost. Reconnecting...');
      reconnectTimeoutRef.current = window.setTimeout(connect, 2000);
    };
    ws.onerror = () => ws.close();
  }, [setConnected, addNewsArticle, addTickerItem, setSentiment, setStats, setTopics, addAlert, addMessage, setCurrentView]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const sendCommand = useCallback((command: string, args: string = '') => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ command, args }));
      return true;
    }
    addMessage('ERROR: Not connected.');
    return false;
  }, [addMessage]);

  return { sendCommand };
}
