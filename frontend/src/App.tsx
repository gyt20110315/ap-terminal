import { Component } from 'react';
import { TerminalLayout } from './components/layout/TerminalLayout';
import { CourseDetailView } from './components/views/CourseDetailView';
import { NewsArchiveView } from './components/views/NewsArchiveView';
import { GlobalMapView } from './components/views/GlobalMapView';
import { NewsDetailPage } from './components/views/NewsDetailPage';
import { FiveRateRanking } from './components/views/FiveRateRanking';
import { FRQBank } from './components/views/FRQBank';
import { ScoreCalculator } from './components/views/ScoreCalculator';
import { TokenPage } from './components/views/TokenPage';
import { ExamSchedule } from './components/views/ExamSchedule';
import { useWebSocket } from './hooks/useWebSocket';
import { useKeyboard } from './hooks/useKeyboard';
import { useNotifications } from './hooks/useNotifications';
import { useTerminalStore } from './store/terminalStore';

class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: '#0a0a0f', color: '#ff4444', padding: 32, fontFamily: 'monospace', height: '100vh' }}>
          <h1 style={{ color: '#ff6a00' }}>AP Terminal Error</h1>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{this.state.error.message}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, color: '#888', marginTop: 16 }}>{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppRoutes() {
  useWebSocket();
  useKeyboard();
  useNotifications();
  const currentView = useTerminalStore((s) => s.currentView);

  switch (currentView) {
    case 'news_detail':    return <NewsDetailPage />;
    case 'course_detail':  return <CourseDetailView />;
    case 'news':           return <NewsArchiveView />;
    case 'stats':          return <GlobalMapView />;
    case 'tokens':         return <TokenPage />;
    case 'five_rate':      return <FiveRateRanking />;
    case 'frq_bank':       return <FRQBank />;
    case 'score_calc':     return <ScoreCalculator />;
    case 'schedule':       return <ExamSchedule />;
    default:               return <TerminalLayout />;
  }
}

function App() {
  return <ErrorBoundary><AppRoutes /></ErrorBoundary>;
}

export default App;
