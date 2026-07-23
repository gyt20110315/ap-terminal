import { useState } from 'react';
import { useTerminalStore } from '../../store/terminalStore';
import { ArrowLeft, Globe, TrendingUp } from 'lucide-react';
import { courseLabel } from '../../lib/courseNames';

// Simulated regional AP discussion data
const REGIONS = [
  { name: 'United States', lat: 38, lng: -97, volume: 95, courses: ['CALC AB', 'ENG LANG', 'US HISTORY'], sentiment: 0.3 },
  { name: 'Canada', lat: 56, lng: -106, volume: 45, courses: ['CALC BC', 'BIO', 'CHEM'], sentiment: 0.2 },
  { name: 'China', lat: 35, lng: 105, volume: 72, courses: ['CALC BC', 'PHYS C:M', 'CHEM'], sentiment: 0.4 },
  { name: 'India', lat: 20, lng: 78, volume: 38, courses: ['CS A', 'CALC AB', 'STATS'], sentiment: 0.3 },
  { name: 'South Korea', lat: 36, lng: 128, volume: 55, courses: ['CALC BC', 'PHYS 1', 'CHEM'], sentiment: 0.1 },
  { name: 'Japan', lat: 36, lng: 138, volume: 28, courses: ['PHYS 1', 'CALC AB'], sentiment: 0.1 },
  { name: 'United Kingdom', lat: 55, lng: -3, volume: 35, courses: ['ENG LIT', 'EURO HIST', 'BIO'], sentiment: 0.2 },
  { name: 'Germany', lat: 51, lng: 9, volume: 22, courses: ['GERMAN LANG', 'EURO HIST'], sentiment: 0.15 },
  { name: 'Singapore', lat: 1.3, lng: 103.8, volume: 30, courses: ['CALC AB', 'CHEM', 'PHYS 1'], sentiment: 0.35 },
  { name: 'Australia', lat: -25, lng: 133, volume: 18, courses: ['ENVIRO SCI', 'BIO'], sentiment: 0.2 },
  { name: 'Brazil', lat: -10, lng: -55, volume: 12, courses: ['SPAN LANG', 'WORLD HIST'], sentiment: 0.25 },
  { name: 'UAE', lat: 24, lng: 54, volume: 15, courses: ['CALC AB', 'BIO', 'CHEM'], sentiment: 0.3 },
  { name: 'Hong Kong', lat: 22.3, lng: 114.2, volume: 25, courses: ['CALC BC', 'ECON', 'PHYS 1'], sentiment: 0.3 },
  { name: 'Mexico', lat: 23, lng: -102, volume: 10, courses: ['SPAN LANG', 'US HISTORY'], sentiment: 0.1 },
  { name: 'Turkey', lat: 39, lng: 35, volume: 8, courses: ['CALC AB', 'CHEM'], sentiment: 0.2 },
];

const REGIONAL_NEWS: Record<string, string[]> = {
  'United States': ['Record AP enrollment in 2026', 'Digital AP testing expands', 'New AP credit policies'],
  'China': ['AP courses gaining popularity', 'International schools adding AP', 'Students preparing for AP exams'],
  'India': ['AP adoption growing in private schools', 'CS and STEM AP courses in demand'],
  'South Korea': ['Competitive AP exam preparation', 'AP scores for college admissions'],
  'Singapore': ['AP as alternative to A-Levels', 'Integrated AP curriculum'],
};

export function GlobalMapView() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const { newsArticles } = useTerminalStore();

  const regionData = selectedRegion ? REGIONS.find((r) => r.name === selectedRegion) : null;

  // Calculate "mention density" from real articles
  const getRegionDensity = (regionName: string) => {
    const baseVol = REGIONS.find((r) => r.name === regionName)?.volume || 10;
    const realMentions = newsArticles.filter((a) => a.region === regionName || a.region === 'Global').length;
    return Math.min(100, baseVol + realMentions);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 bg-[#12121a] border-b border-[#2a2a3a] shrink-0">
        <button
          onClick={() => useTerminalStore.getState().setCurrentView('dashboard')}
          className="flex items-center gap-1 text-[#666] hover:text-white transition-colors text-xs"
        >
          <ArrowLeft size={14} />
          Dashboard
        </button>
        <h2 className="text-sm font-bold text-green-400 tracking-wide">GLOBAL AP HEATMAP</h2>
        <Globe size={14} className="text-[#666]" />
      </div>

      {/* Map + Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Map area (simplified heatmap grid) */}
        <div className="flex-1 p-4 grid grid-cols-4 gap-2 content-start">
          {REGIONS.map((region) => {
            const density = getRegionDensity(region.name);
            const isSelected = selectedRegion === region.name;
            const intensity = density > 70 ? 'bg-[#ff6a00]' : density > 40 ? 'bg-[#ff6a00]/70' : density > 20 ? 'bg-[#ff6a00]/40' : 'bg-[#1a1a2e]';
            return (
              <button
                key={region.name}
                onClick={() => setSelectedRegion(isSelected ? null : region.name)}
                className={`
                  relative rounded border p-2 text-left transition-all cursor-pointer
                  ${isSelected ? 'border-[#ff6a00] scale-105 z-10 shadow-lg shadow-[#ff6a00]/20' : 'border-[#2a2a3a] hover:border-[#3a3a4a]'}
                  ${intensity}
                `}
              >
                <div className="text-[10px] font-bold text-white truncate">{region.name}</div>
                <div className="text-[9px] text-white/60 mt-0.5">Volume: {density}%</div>
                <div className="flex gap-0.5 mt-1 flex-wrap">
                  {region.courses.slice(0, 2).map((c) => (
                    <span key={c} className="px-1 py-0.5 rounded bg-white/10 text-[7px] text-white/80">{courseLabel(c)}</span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Region detail panel */}
        <div className="w-72 border-l border-[#2a2a3a] bg-[#0d0d15] p-3 overflow-y-auto shrink-0">
          {regionData ? (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">{regionData.name}</h3>

              {/* Volume gauge */}
              <div>
                <div className="flex justify-between text-[9px] mb-1">
                  <span className="text-[#666]">Discussion Volume</span>
                  <span className="text-[#ff6a00]">{getRegionDensity(regionData.name)}%</span>
                </div>
                <div className="h-1.5 bg-[#1a1a2e] rounded overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#ff6a00]/50 to-[#ff6a00] rounded transition-all"
                    style={{ width: `${getRegionDensity(regionData.name)}%` }}
                  />
                </div>
              </div>

              {/* Sentiment */}
              <div>
                <div className="flex justify-between text-[9px] mb-1">
                  <span className="text-[#666]">Sentiment</span>
                  <span className={regionData.sentiment > 0.2 ? 'text-green-400' : regionData.sentiment > 0 ? 'text-yellow-400' : 'text-red-400'}>
                    {regionData.sentiment > 0.2 ? 'Positive ↑' : 'Neutral →'}
                  </span>
                </div>
              </div>

              {/* Top courses */}
              <div>
                <div className="text-[9px] text-[#666] mb-1 uppercase tracking-wide">Top AP Courses</div>
                <div className="space-y-1">
                  {regionData.courses.map((c) => (
                    <div key={c} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff6a00]" />
                      <span className="text-[10px] text-[#ccc]">{courseLabel(c)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent news */}
              {REGIONAL_NEWS[regionData.name] && (
                <div>
                  <div className="text-[9px] text-[#666] mb-1 uppercase tracking-wide">Recent News</div>
                  <div className="space-y-1">
                    {REGIONAL_NEWS[regionData.name].map((n, i) => (
                      <div key={i} className="text-[10px] text-[#888] leading-relaxed">· {n}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[#444] gap-2">
              <Globe size={32} />
              <span className="text-[10px] text-center">Click a region to view AP activity</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
