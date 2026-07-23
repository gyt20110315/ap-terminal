/** Panel layout presets — trader mode & analyst mode */

import type { PanelLayout } from '../types';

export type LayoutMode = 'trader' | 'analyst';

export const TRADER_LAYOUT: PanelLayout[] = [
  { i: 'ticker', x: 0, y: 0, w: 12, h: 1, minW: 4, minH: 1 },
  { i: 'news', x: 0, y: 1, w: 7, h: 8, minW: 3, minH: 5 },
  { i: 'ranking', x: 7, y: 1, w: 5, h: 8, minW: 3, minH: 5 },
  { i: 'stats_overview', x: 0, y: 9, w: 4, h: 4, minW: 3, minH: 3 },
  { i: 'topics', x: 4, y: 9, w: 4, h: 4, minW: 2, minH: 3 },
  { i: 'sentiment', x: 8, y: 9, w: 4, h: 4, minW: 3, minH: 3 },
  { i: 'score', x: 0, y: 13, w: 6, h: 5, minW: 3, minH: 4 },
  { i: 'alert', x: 6, y: 13, w: 6, h: 5, minW: 3, minH: 3 },
];

export const ANALYST_LAYOUT: PanelLayout[] = [
  { i: 'ticker', x: 0, y: 0, w: 12, h: 1, minW: 4, minH: 1 },
  { i: 'stats_overview', x: 0, y: 1, w: 12, h: 3, minW: 6, minH: 2 },
  { i: 'news', x: 0, y: 4, w: 4, h: 7, minW: 3, minH: 5 },
  { i: 'score', x: 4, y: 4, w: 4, h: 7, minW: 3, minH: 5 },
  { i: 'sentiment', x: 8, y: 4, w: 4, h: 7, minW: 3, minH: 5 },
  { i: 'ranking', x: 0, y: 11, w: 6, h: 6, minW: 4, minH: 4 },
  { i: 'topics', x: 6, y: 11, w: 6, h: 6, minW: 3, minH: 4 },
  { i: 'alert', x: 0, y: 17, w: 12, h: 3, minW: 4, minH: 2 },
];

export function getLayoutPreset(mode: LayoutMode): PanelLayout[] {
  const layout = mode === 'trader' ? TRADER_LAYOUT : ANALYST_LAYOUT;
  return JSON.parse(JSON.stringify(layout)); // deep copy
}

// localStorage keys
const LAYOUT_KEY = 'ap-terminal-layout-mode';
const BOOKMARKS_KEY = 'ap-terminal-bookmarks';

export function saveLayoutMode(mode: LayoutMode) {
  try { localStorage.setItem(LAYOUT_KEY, mode); } catch {}
}
export function loadLayoutMode(): LayoutMode {
  try { return (localStorage.getItem(LAYOUT_KEY) as LayoutMode) || 'trader'; } catch { return 'trader'; }
}

// Bookmark functions
export function getBookmarks(): string[] {
  try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]'); } catch { return []; }
}
export function saveBookmarks(bookmarks: string[]) {
  try { localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks)); } catch {}
}
export function toggleBookmark(url: string): boolean {
  const bm = getBookmarks();
  const idx = bm.indexOf(url);
  if (idx >= 0) { bm.splice(idx, 1); saveBookmarks(bm); return false; }
  else { bm.push(url); saveBookmarks(bm); return true; }
}
export function isBookmarked(url: string): boolean {
  return getBookmarks().includes(url);
}
