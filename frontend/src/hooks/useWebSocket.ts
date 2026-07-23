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

    // Track reconnect attempts for demo fallback
    let reconnectCount = 0;
    ws.onclose = () => {
      setConnected(false);
      reconnectCount++;
      if (reconnectCount >= 2) {
        addMessage('SYSTEM: 后端未连接，已切换至演示模式（离线数据）。启动后端即可连接。');
        startDemoMode();
        return;
      }
      addMessage('SYSTEM: 连接断开，重连中...');
      reconnectTimeoutRef.current = window.setTimeout(connect, 2000);
    };
    ws.onerror = () => ws.close();
  }, [setConnected, addNewsArticle, addTickerItem, setSentiment, setStats, setTopics, addAlert, addMessage, setCurrentView]);

  // Client-side demo mode — generates news when backend is unavailable
  const startDemoMode = useCallback(() => {
    const DEMO_POOL = [
      {title:'AP微积分AB报考人数创纪录增长12%',title_zh:'AP微积分AB报考人数创纪录增长12%',source:'Education Week',summary:'2026年AP微积分AB注册人数同比增长12%',summary_zh:'2026年AP微积分AB注册人数同比增长12%',sentiment_label:'positive',region:'US',keywords:['微积分','报名','增长'],ap_courses:['CALC AB'],exam_type:'ap',url:'demo-1'},
      {title:'2027年SAT全面机考：中国考生平均分1310',title_zh:'2027年SAT全面机考：中国考生平均分1310',source:'College Board',summary:'中国SAT考生数学平均720分，阅读写作590分',summary_zh:'中国SAT考生数学平均720分，阅读写作590分',sentiment_label:'positive',region:'China',keywords:['SAT','机考','中国考生'],exam_type:'sat',url:'demo-2'},
      {title:'英国Top10大学提高雅思成绩要求至7.0',title_zh:'英国Top10大学提高雅思成绩要求至7.0',source:'British Council',summary:'牛津剑桥等名校将雅思最低要求提高至总分7.0',summary_zh:'牛津剑桥等名校将雅思最低要求提高至总分7.0',sentiment_label:'negative',region:'UK',keywords:['雅思','英国','要求提高'],exam_type:'ielts',url:'demo-3'},
      {title:'托福家考版在中国考生中占比突破40%',title_zh:'托福家考版在中国考生中占比突破40%',source:'ETS',summary:'越来越多的中国考生选择托福Home Edition',summary_zh:'越来越多的中国考生选择托福Home Edition',sentiment_label:'positive',region:'China',keywords:['托福','家考','中国'],exam_type:'toefl',url:'demo-4'},
      {title:'AP计算机科学A成为增长最快的STEM科目',title_zh:'AP计算机科学A成为增长最快的STEM科目',source:'Education Week',summary:'CS A报考人数三年增长35%，成为仅次于微积分的热门科目',summary_zh:'CS A报考人数三年增长35%',sentiment_label:'positive',region:'US',keywords:['计算机','CS','STEM'],ap_courses:['CS A'],exam_type:'ap',url:'demo-5'},
      {title:'新加坡新增5个SAT机考考点',title_zh:'新加坡新增5个SAT机考考点',source:'College Board',summary:'为满足东南亚考生需求，新加坡增设SAT考点',summary_zh:'新加坡增设SAT考点以满足东南亚考生需求',sentiment_label:'positive',region:'Singapore',keywords:['SAT','考点','新加坡'],exam_type:'sat',url:'demo-6'},
    ];
    let idx = 0;
    const interval = setInterval(() => {
      const article = {...DEMO_POOL[idx % DEMO_POOL.length], published_at: new Date().toISOString(), url: `demo-${idx}`};
      addNewsArticle(article as NewsArticle);
      addTickerItem({title:(article.title_zh||article.title),source:article.source,sentiment:article.sentiment_label,exam_type:article.exam_type as ExamType});
      idx++;
    }, 4000);
    return () => clearInterval(interval);
  }, [addNewsArticle, addTickerItem]);

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
