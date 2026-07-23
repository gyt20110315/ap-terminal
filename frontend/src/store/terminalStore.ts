import { create } from 'zustand';
import type {
  NewsArticle, NewsTickerItem, SentimentData, StatsData,
  AlertData, APCourse, PanelLayout, PanelView, ExamType,
  AISummary, RelevanceScore,
} from '../types';

interface TerminalState {
  // Connection
  connected: boolean;
  setConnected: (v: boolean) => void;

  // Current view & exam type filter
  currentView: PanelView;
  setCurrentView: (v: PanelView) => void;
  activeExamType: ExamType;
  setActiveExamType: (e: ExamType) => void;

  // Selected article (for detail page)
  selectedArticle: NewsArticle | null;
  setSelectedArticle: (a: NewsArticle | null) => void;

  // Command history
  commandHistory: string[];
  addCommandToHistory: (cmd: string) => void;

  // News — all exam types stored together
  newsArticles: NewsArticle[];
  addNewsArticle: (article: NewsArticle) => void;
  newsTicker: NewsTickerItem[];
  addTickerItem: (item: NewsTickerItem) => void;

  // Sentiment — per exam type
  sentiment: Record<ExamType, SentimentData | null>;
  setSentiment: (exam: ExamType, s: SentimentData) => void;

  // Stats — per exam type
  stats: Record<ExamType, StatsData | null>;
  setStats: (exam: ExamType, s: StatsData) => void;

  // Topics — per exam type
  topics: Record<ExamType, string[]>;
  setTopics: (exam: ExamType, t: string[]) => void;

  // AI cache — article URL → summary/relevance
  aiSummaries: Record<string, AISummary>;
  setAISummary: (url: string, s: AISummary) => void;
  relevanceScores: Record<string, RelevanceScore>;
  setRelevanceScore: (url: string, r: RelevanceScore) => void;

  // Alerts
  alerts: AlertData[];
  addAlert: (a: AlertData) => void;

  // Courses (AP)
  courses: APCourse[];
  setCourses: (c: APCourse[]) => void;

  // Panel layout
  panels: PanelLayout[];
  setPanels: (p: PanelLayout[]) => void;

  // Messages
  messages: string[];
  addMessage: (m: string) => void;
}

export const useTerminalStore = create<TerminalState>((set, get) => ({
  connected: false,
  setConnected: (v) => set({ connected: v }),

  currentView: 'dashboard',
  setCurrentView: (v) => set({ currentView: v }),
  activeExamType: 'ap',
  setActiveExamType: (e) => set({ activeExamType: e }),

  selectedArticle: null,
  setSelectedArticle: (a) => set({ selectedArticle: a, currentView: a ? 'news_detail' : get().currentView }),

  commandHistory: [],
  addCommandToHistory: (cmd) =>
    set((s) => ({ commandHistory: [...s.commandHistory.slice(-99), cmd] })),

  newsArticles: [],
  addNewsArticle: (article) => {
    // Dedup by URL + title similarity
    const key = article.url || article.title;
    set((s) => {
      const exists = s.newsArticles.some(
        (a) => (a.url && a.url === key) || (a.title === article.title && a.source === article.source)
      );
      if (exists) return {};
      return { newsArticles: [article, ...s.newsArticles].slice(0, 800) };
    });
  },
  newsTicker: [],
  addTickerItem: (item) =>
    set((s) => ({ newsTicker: [item, ...s.newsTicker].slice(0, 30) })),

  sentiment: { ap: null, ielts: null, toefl: null, sat: null },
  setSentiment: (exam, s) =>
    set((st) => ({ sentiment: { ...st.sentiment, [exam]: s } })),

  stats: { ap: null, ielts: null, toefl: null, sat: null },
  setStats: (exam, s) =>
    set((st) => ({ stats: { ...st.stats, [exam]: s } })),

  topics: { ap: [], ielts: [], toefl: [], sat: [] },
  setTopics: (exam, t) =>
    set((st) => ({ topics: { ...st.topics, [exam]: t } })),

  aiSummaries: {},
  setAISummary: (url, s) =>
    set((st) => ({ aiSummaries: { ...st.aiSummaries, [url]: s } })),

  relevanceScores: {},
  setRelevanceScore: (url, r) =>
    set((st) => ({ relevanceScores: { ...st.relevanceScores, [url]: r } })),

  alerts: [],
  addAlert: (alert) =>
    set((s) => ({ alerts: [alert, ...s.alerts].slice(0, 100) })),

  courses: [],
  setCourses: (courses) => set({ courses }),

  panels: [
    { i: 'ticker', x: 0, y: 0, w: 12, h: 1, minW: 4, minH: 1 },
    { i: 'news', x: 0, y: 1, w: 7, h: 8, minW: 3, minH: 5 },
    { i: 'ranking', x: 7, y: 1, w: 5, h: 8, minW: 3, minH: 5 },
    { i: 'stats_overview', x: 0, y: 9, w: 4, h: 4, minW: 3, minH: 3 },
    { i: 'topics', x: 4, y: 9, w: 4, h: 4, minW: 2, minH: 3 },
    { i: 'sentiment', x: 8, y: 9, w: 4, h: 4, minW: 3, minH: 3 },
    { i: 'score', x: 0, y: 13, w: 6, h: 5, minW: 3, minH: 4 },
    { i: 'alert', x: 6, y: 13, w: 6, h: 5, minW: 3, minH: 3 },
  ],
  setPanels: (panels) => set({ panels }),

  messages: [],
  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages.slice(-199), msg] })),
}));
