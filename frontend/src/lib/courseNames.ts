/** AP course name mappings — English short names → Chinese + English full names */

export const COURSE_NAMES: Record<string, { en: string; zh: string }> = {
  // Mathematics
  'CALC AB':  { en: 'AP Calculus AB',            zh: 'AP微积分AB' },
  'CALC BC':  { en: 'AP Calculus BC',            zh: 'AP微积分BC' },
  'STATS':    { en: 'AP Statistics',             zh: 'AP统计学' },
  'PRECALC':  { en: 'AP Precalculus',            zh: 'AP预备微积分' },

  // Sciences
  'BIO':      { en: 'AP Biology',                zh: 'AP生物学' },
  'CHEM':     { en: 'AP Chemistry',              zh: 'AP化学' },
  'PHYS 1':   { en: 'AP Physics 1: Algebra-Based', zh: 'AP物理1（代数基础）' },
  'PHYS 2':   { en: 'AP Physics 2: Algebra-Based', zh: 'AP物理2（代数基础）' },
  'PHYS C:M': { en: 'AP Physics C: Mechanics',   zh: 'AP物理C：力学' },
  'PHYS C:E&M': { en: 'AP Physics C: Electricity & Magnetism', zh: 'AP物理C：电磁学' },
  'ENVIRO SCI': { en: 'AP Environmental Science', zh: 'AP环境科学' },

  // English
  'ENG LANG': { en: 'AP English Language & Composition', zh: 'AP英语语言与写作' },
  'ENG LIT':  { en: 'AP English Literature & Composition', zh: 'AP英语文学与写作' },

  // History
  'US HISTORY': { en: 'AP United States History', zh: 'AP美国历史' },
  'WORLD HIST': { en: 'AP World History: Modern', zh: 'AP世界历史（现代）' },
  'EURO HIST':  { en: 'AP European History',      zh: 'AP欧洲历史' },
  'US GOV':    { en: 'AP US Government & Politics', zh: 'AP美国政府与政治' },
  'COMP GOV':  { en: 'AP Comparative Government & Politics', zh: 'AP比较政府与政治' },
  'HUMAN GEO': { en: 'AP Human Geography',        zh: 'AP人文地理' },
  'AFAM STUDIES': { en: 'AP African American Studies', zh: 'AP非裔美国人研究' },

  // Social Sciences
  'PSYCH':     { en: 'AP Psychology',          zh: 'AP心理学' },
  'MACRO ECON': { en: 'AP Macroeconomics',      zh: 'AP宏观经济学' },
  'MICRO ECON': { en: 'AP Microeconomics',      zh: 'AP微观经济学' },

  // Computer Science
  'CS A':          { en: 'AP Computer Science A',           zh: 'AP计算机科学A' },
  'CS PRINCIPLES': { en: 'AP Computer Science Principles',  zh: 'AP计算机科学原理' },

  // World Languages
  'CHINESE LANG':  { en: 'AP Chinese Language & Culture',  zh: 'AP中文语言与文化' },
  'JAPANESE LANG': { en: 'AP Japanese Language & Culture', zh: 'AP日语语言与文化' },
  'SPAN LANG':     { en: 'AP Spanish Language & Culture',  zh: 'AP西班牙语语言与文化' },
  'SPAN LIT':      { en: 'AP Spanish Literature & Culture', zh: 'AP西班牙文学与文化' },
  'FRENCH LANG':   { en: 'AP French Language & Culture',   zh: 'AP法语语言与文化' },
  'GERMAN LANG':   { en: 'AP German Language & Culture',   zh: 'AP德语语言与文化' },
  'ITALIAN LANG':  { en: 'AP Italian Language & Culture',  zh: 'AP意大利语语言与文化' },
  'LATIN':         { en: 'AP Latin',                       zh: 'AP拉丁语' },

  // Arts
  'ART HIST':    { en: 'AP Art History',          zh: 'AP艺术史' },
  'MUSIC THEO':  { en: 'AP Music Theory',         zh: 'AP音乐理论' },
  'STUDIO 2D':   { en: 'AP Studio Art: 2-D Design', zh: 'AP工作室艺术：平面设计' },
  'STUDIO 3D':   { en: 'AP Studio Art: 3-D Design', zh: 'AP工作室艺术：立体设计' },
  'STUDIO DRAW': { en: 'AP Studio Art: Drawing',  zh: 'AP工作室艺术：绘画' },

  // Capstone
  'SEMINAR':  { en: 'AP Seminar',  zh: 'AP研讨课' },
  'RESEARCH': { en: 'AP Research', zh: 'AP研究课' },
};

/** Get Chinese + English label for a course short name */
export function courseLabel(short: string): string {
  const c = COURSE_NAMES[short];
  return c ? `${c.zh} (${short})` : short;
}

/** Get Chinese name only */
export function courseZh(short: string): string {
  return COURSE_NAMES[short]?.zh || short;
}

/** Get English name only */
export function courseEn(short: string): string {
  return COURSE_NAMES[short]?.en || short;
}
