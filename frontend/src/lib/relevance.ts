/** Local relevance scoring — keyword-based, instant, zero token cost.
 *  Scores how relevant a news article is to a Chinese high school student
 *  preparing for AP/IELTS/TOEFL/SAT exams. */

import type { NewsArticle } from '../types';

// High-relevance keywords (Chinese & English)
const HIGH_KW = [
  'ap ', 'advanced placement', 'college board', 'ap exam', 'ap course', 'ap test',
  'ap score', 'ap credit', 'ap 考试', 'ap 课程', 'ap 成绩',
  'ielts', '雅思', 'toefl', '托福', 'sat',
  '中国', 'china', 'chinese', '高一', '高二', '高三', '高中',
  '留学', '出国', '申请', '录取', 'admission',
  'international student', '国际学生',
];

const MEDIUM_KW = [
  'university', 'college', '大学', 'test', 'score', '分数',
  'exam', '考试', 'study', '学习', 'preparation', '备考',
  'enrollment', '报名', 'registration',
];

const COURSE_KW: Record<string, number> = {
  'calculus': 15, '微积分': 15, 'physics': 12, '物理': 12,
  'chemistry': 12, '化学': 12, 'biology': 10, '生物': 10,
  'statistics': 10, '统计': 10, 'computer science': 12, '计算机': 12,
  'economics': 10, '经济': 10, 'psychology': 10, '心理学': 10,
  'english': 8, '英语': 8, 'history': 8, '历史': 8,
};

export function localRelevanceScore(article: NewsArticle): {
  score: number; level: string; reason: string;
} {
  const text = [
    article.title, article.title_zh,
    article.summary, article.summary_zh,
    ...(article.keywords || []),
  ].filter(Boolean).join(' ').toLowerCase();

  let score = 25; // base score — any edu news is somewhat relevant

  // Check high-relevance keywords
  for (const kw of HIGH_KW) {
    if (text.includes(kw)) score += 10;
  }
  for (const kw of MEDIUM_KW) {
    if (text.includes(kw)) score += 4;
  }

  // Course-specific bonuses
  for (const [course, bonus] of Object.entries(COURSE_KW)) {
    if (text.includes(course)) score += bonus;
  }

  // Region bonus — explicitly about China/Chinese students
  if (article.region === 'China' || text.includes('china') || text.includes('中国')) {
    score += 15;
  }

  // AP course tags bonus
  if (article.ap_courses && article.ap_courses.length > 0) {
    score += article.ap_courses.length * 8;
  }

  // Clamp to 0-100
  score = Math.min(100, Math.max(0, score));

  const level = score >= 80 ? '极高' : score >= 65 ? '高' : score >= 45 ? '中等' : score >= 25 ? '低' : '极低';
  const reason = score >= 80 ? '与中国考生密切相关的核心信息' :
                  score >= 65 ? '对中国考生有较高的参考价值' :
                  score >= 45 ? '有一定的参考意义' :
                  '关联度一般，可选择性了解';

  return { score, level, reason };
}
