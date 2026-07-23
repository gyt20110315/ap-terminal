/** Core type definitions for AP/IELTS/TOEFL/SAT Terminal */

export type ExamType = 'ap' | 'ielts' | 'toefl' | 'sat';

export interface NewsArticle {
  title: string;
  title_zh?: string;
  summary_zh?: string;
  source: string;
  source_url?: string;
  content?: string | null;
  summary?: string | null;
  url: string;
  published_at: string;
  fetched_at?: string;
  sentiment_score?: number | null;
  sentiment_label?: 'positive' | 'negative' | 'neutral' | 'mixed' | null;
  keywords?: string[];
  ap_courses?: string[];
  region?: string;
  language?: string;
  exam_type?: ExamType;
}

export interface NewsTickerItem {
  title: string;
  source: string;
  sentiment: string;
  exam_type?: ExamType;
}

export interface SentimentData {
  score: number;
  positive_ratio: number;
  negative_ratio: number;
  neutral_ratio: number;
  timestamp: number;
}

export interface StatsData {
  total_articles: number;
  articles_today: number;
  active_sources: number;
  exams_tracked?: number;
  courses_tracked?: number;
  timestamp: number;
}

export interface TopicsData {
  topics: string[];
  timestamp: number;
}

export interface AISummary {
  headline_summary: string;
  detailed_summary: string;
  key_points: string[];
  background_context: string;
  stakeholder_impact: string;
  action_items: string;
  sentiment: string;
  credibility_note: string;
  fallback?: boolean;
}

export interface RelevanceScore {
  relevance_score: number;
  relevance_level: string;
  target_grade: string;
  why_relevant: string;
  affected_courses: string[];
  urgency: string;
  action_suggestion: string;
  key_takeaway_for_students: string;
  fallback?: boolean;
}

export interface AlertData {
  id?: number;
  keyword?: string;
  matched_keywords?: string[];
  article?: NewsArticle;
  triggered_at?: string;
  message?: string;
}

export interface APCourse {
  name: string;
  short_name: string;
  category: string;
  enrollment?: number;
  avg_score?: number;
  passing_rate?: number;
  score_5_pct?: number;
  score_4_pct?: number;
  score_3_pct?: number;
  score_2_pct?: number;
  score_1_pct?: number;
}

export interface SystemMessage {
  type?: string;
  status?: string;
  error?: string;
  commands?: Record<string, string>;
  view?: string;
  query?: string;
  course?: string;
  region?: string;
  keyword?: string;
  message?: string;
  client_id?: string;
}

export interface WSMessage {
  channel: string;
  data: string;
  timestamp: number;
}

export type PanelView = 'dashboard' | 'news' | 'course_detail' | 'stats' | 'trend' | 'news_detail' | 'tokens' | 'five_rate' | 'frq_bank' | 'score_calc' | 'schedule';

export interface PanelLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}
