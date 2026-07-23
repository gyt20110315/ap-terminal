import { useCallback } from 'react';
import GridLayout from 'react-grid-layout';
import { useTerminalStore } from '../../store/terminalStore';
import { NewsFeed } from '../panels/NewsFeed';
import { TopicCloud } from '../panels/TopicCloud';
import { SentimentTimeline } from '../panels/SentimentTimeline';
import { AlertPanel } from '../panels/AlertPanel';
import { ExamRanking } from '../panels/ExamRanking';
import { ExamScoreChart } from '../panels/ExamScoreChart';
import { ExamStatsOverview } from '../panels/ExamStatsOverview';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// Universal panels that work with all exam types
const PANEL_REGISTRY: Record<string, React.ComponentType> = {
  ticker: () => null,
  news: NewsFeed,
  topics: TopicCloud,
  sentiment: SentimentTimeline,
  alert: AlertPanel,
  ranking: ExamRanking,
  score: ExamScoreChart,
  stats_overview: ExamStatsOverview,
};

export function PanelGrid() {
  const panels = useTerminalStore((s) => s.panels);
  const setPanels = useTerminalStore((s) => s.setPanels);
  const activeExamType = useTerminalStore((s) => s.activeExamType);

  const handleLayoutChange = useCallback(
    (layout: Array<{ i: string; x: number; y: number; w: number; h: number }>) => {
      setPanels(layout.map((l) => ({ i: l.i, x: l.x, y: l.y, w: l.w, h: l.h })));
    },
    [setPanels]
  );

  const gridPanels = panels.filter((p) => p.i !== 'ticker');

  return (
    <div className="h-full overflow-auto bg-[#0a0a0f]">
      <GridLayout
        key={activeExamType} // Force re-mount on exam switch for clean layout
        className="layout"
        layout={gridPanels.map((p) => ({ i: p.i, x: p.x, y: p.y - 1, w: p.w, h: p.h }))}
        cols={12}
        rowHeight={58}
        width={window.innerWidth}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".panel-drag-handle"
        margin={[2, 2]}
        containerPadding={[2, 2]}
        isResizable={true}
        isDraggable={true}
      >
        {gridPanels.map((panel) => {
          const Component = PANEL_REGISTRY[panel.i];
          if (!Component) return null;
          return (
            <div key={panel.i} className="bg-[#12121a] border border-[#2a2a3a] rounded overflow-hidden flex flex-col">
              <Component />
            </div>
          );
        })}
      </GridLayout>
    </div>
  );
}
