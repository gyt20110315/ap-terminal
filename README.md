# AP Terminal — Bloomberg-Style Global AP Courses Real-Time Monitor

A Bloomberg Terminal-inspired real-time dashboard for monitoring global AP (Advanced Placement) course data, news, sentiment, and trends.

## Quick Start

### Prerequisites
- Python 3.12+ 
- Node.js 20+
- Redis (optional, for production)

### 1. Start Backend
```bash
cd backend
pip install -r <(python3 -c "import tomllib; print('\n'.join(tomllib.load(open('pyproject.toml','rb'))['project']['dependencies']))")
PYTHONPATH=$(pwd) python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Open
Navigate to **http://localhost:5173**

## Features

### Real-Time Data Dashboard
- **📰 News Feed** — Live AP news from Google News RSS, Reddit r/APStudents, and education outlets
- **📊 Sentiment Timeline** — Real-time sentiment analysis of AP-related content
- **🏆 Course Heat Ranking** — Track which AP courses are trending globally
- **🔤 Trending Topics** — Live keyword cloud of hot AP discussions
- **📈 Enrollment Trends** — Historical + projected enrollment for top AP courses
- **📊 Score Distribution** — AP exam score distributions (5/4/3/2/1)
- **🔔 Alert System** — Set keyword alerts, get desktop notifications on match
- **📰 News Ticker** — Bloomberg-style scrolling news bar

### Command System (Bloomberg CLI Style)
```
HELP                 Show available commands
DASH                 Return to main dashboard
NEWS <keywords>      Search AP news (e.g., NEWS AP Calculus)
COURSE <name>        View course data (e.g., COURSE CALC AB)
STATS <region>       View regional stats (e.g., STATS US)
TREND <course>       View course trend data
ALERT <keyword>      Set keyword alert (e.g., ALERT exam changes)
HOT                  Show trending topics
```

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `/` | Focus command bar |
| `Esc` | Return to dashboard |
| `F1` | Dashboard view |
| `F2` | News view |
| `Tab` | Autocomplete command |
| `↑/↓` | Command history |

### Real-Time Architecture
- **WebSocket** — Bidirectional real-time communication (< 100ms latency)
- **NLP Pipeline** — Sentiment analysis + keyword extraction + AP course matching
- **Multi-Source Ingestion** — RSS, Reddit, Google News, education feeds
- **Incremental Updates** — New data pushed instantly, no polling from client

## Architecture

```
Frontend (React 19 + TypeScript + Vite + Tailwind)
    ↕ WebSocket (real-time)
Backend (FastAPI + Python 3.12)
    ├── Ingestion Engine (scrapers for RSS, Reddit, Google News)
    ├── NLP Pipeline (TextBlob sentiment + keyword extraction)
    ├── Command Parser (Bloomberg-style CLI)
    └── Broadcast Manager (WebSocket pub/sub to all clients)
    
Data Sources:
    ├── Google News RSS (AP topics)
    ├── Reddit (r/APStudents, r/APTeachers)
    ├── Education RSS (Inside Higher Ed, Education Week)
    └── College Board AP Central (score distributions)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Recharts, react-grid-layout |
| Backend | FastAPI, Python 3.12, TextBlob, httpx, feedparser |
| Real-time | WebSocket (backend ↔ frontend) |
| NLP | TextBlob sentiment analysis, keyword extraction |
| Layout | Draggable/resizable Bloomberg-style panels |

## Project Structure

```
ap-terminal/
├── frontend/           # React SPA
│   └── src/
│       ├── components/
│       │   ├── layout/     # TerminalLayout, CommandBar, PanelGrid
│       │   └── panels/     # NewsFeed, TopicCloud, CourseRanking, etc.
│       ├── hooks/          # useWebSocket, useCommand, useKeyboard
│       └── store/          # Zustand global state
├── backend/            # FastAPI server
│   └── app/
│       ├── api/ws/         # WebSocket endpoints
│       ├── engine/         # Ingestion, scrapers, NLP, dedup
│       ├── commands/       # Command registry
│       └── models/         # SQLAlchemy ORM models
├── data/               # AP course data, score distributions
└── docker-compose.yml  # Redis + PostgreSQL (optional)
```

## Bloomberg Terminal Features Implemented

| Bloomberg Feature | AP Terminal Implementation |
|-------------------|---------------------------|
| Command Line | `/` key → CommandBar with autocomplete |
| Launchpad Dashboard | Multi-panel draggable GridLayout |
| News Ticker | Real-time scrolling news bar |
| IB Chat | (future) WebSocket chat |
| Market Data Panels | AP course stats, scores, rankings |
| Analytics | Sentiment timeline, trend charts, score distributions |
| Alerts | Keyword alerts with desktop notifications |
| Color-Coded Keys | Orange = AP branding, green/red = sentiment |
| HELP System | Built-in command help |
| Excel Integration | (future) CSV export |
