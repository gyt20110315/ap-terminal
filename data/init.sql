-- AP Terminal database initialization
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- News articles table
CREATE TABLE IF NOT EXISTS news_articles (
    id SERIAL PRIMARY KEY,
    source VARCHAR(100) NOT NULL,
    source_url TEXT,
    title TEXT NOT NULL,
    content TEXT,
    summary TEXT,
    url TEXT UNIQUE NOT NULL,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sentiment_score FLOAT,
    sentiment_label VARCHAR(20),
    keywords TEXT[],
    ap_courses TEXT[],
    region VARCHAR(100),
    language VARCHAR(10) DEFAULT 'en'
);

-- AP Courses reference table
CREATE TABLE IF NOT EXISTS ap_courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    short_name VARCHAR(50),
    category VARCHAR(100),
    enrollment INTEGER,
    avg_score FLOAT,
    passing_rate FLOAT,
    score_5_pct FLOAT,
    score_4_pct FLOAT,
    score_3_pct FLOAT,
    score_2_pct FLOAT,
    score_1_pct FLOAT,
    data_year INTEGER,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User alerts table
CREATE TABLE IF NOT EXISTS user_alerts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    keywords TEXT[] NOT NULL,
    courses TEXT[],
    sentiment_threshold FLOAT,
    regions TEXT[],
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_triggered_at TIMESTAMPTZ
);

-- Alert hits table
CREATE TABLE IF NOT EXISTS alert_hits (
    id SERIAL PRIMARY KEY,
    alert_id INTEGER REFERENCES user_alerts(id) ON DELETE CASCADE,
    article_id INTEGER REFERENCES news_articles(id) ON DELETE CASCADE,
    matched_keywords TEXT[],
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trending topics table (time-series)
CREATE TABLE IF NOT EXISTS trending_topics (
    time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    topic TEXT NOT NULL,
    mention_count INTEGER NOT NULL,
    sentiment_avg FLOAT,
    source VARCHAR(50)
);

SELECT create_hypertable('trending_topics', 'time', if_not_exists => TRUE);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_source ON news_articles(source);
CREATE INDEX IF NOT EXISTS idx_news_sentiment ON news_articles(sentiment_label);
CREATE INDEX IF NOT EXISTS idx_news_ap_courses ON news_articles USING GIN(ap_courses);
CREATE INDEX IF NOT EXISTS idx_news_keywords ON news_articles USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_alert_hits_triggered ON alert_hits(triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_trending_time ON trending_topics(time DESC);

-- Insert initial AP courses data
INSERT INTO ap_courses (name, short_name, category) VALUES
    ('AP English Language and Composition', 'ENG LANG', 'English'),
    ('AP English Literature and Composition', 'ENG LIT', 'English'),
    ('AP United States History', 'US HISTORY', 'History'),
    ('AP World History: Modern', 'WORLD HIST', 'History'),
    ('AP European History', 'EURO HIST', 'History'),
    ('AP US Government and Politics', 'US GOV', 'History'),
    ('AP Comparative Government and Politics', 'COMP GOV', 'History'),
    ('AP Human Geography', 'HUMAN GEO', 'History'),
    ('AP Psychology', 'PSYCH', 'Social Sciences'),
    ('AP Macroeconomics', 'MACRO ECON', 'Social Sciences'),
    ('AP Microeconomics', 'MICRO ECON', 'Social Sciences'),
    ('AP Calculus AB', 'CALC AB', 'Mathematics'),
    ('AP Calculus BC', 'CALC BC', 'Mathematics'),
    ('AP Statistics', 'STATS', 'Mathematics'),
    ('AP Precalculus', 'PRECALC', 'Mathematics'),
    ('AP Biology', 'BIO', 'Sciences'),
    ('AP Chemistry', 'CHEM', 'Sciences'),
    ('AP Physics 1: Algebra-Based', 'PHYS 1', 'Sciences'),
    ('AP Physics 2: Algebra-Based', 'PHYS 2', 'Sciences'),
    ('AP Physics C: Mechanics', 'PHYS C:M', 'Sciences'),
    ('AP Physics C: Electricity and Magnetism', 'PHYS C:E&M', 'Sciences'),
    ('AP Environmental Science', 'ENVIRO SCI', 'Sciences'),
    ('AP Computer Science A', 'CS A', 'Computer Science'),
    ('AP Computer Science Principles', 'CS PRINCIPLES', 'Computer Science'),
    ('AP Spanish Language and Culture', 'SPAN LANG', 'World Languages'),
    ('AP French Language and Culture', 'FRENCH LANG', 'World Languages'),
    ('AP Chinese Language and Culture', 'CHINESE LANG', 'World Languages'),
    ('AP Japanese Language and Culture', 'JAPANESE LANG', 'World Languages'),
    ('AP German Language and Culture', 'GERMAN LANG', 'World Languages'),
    ('AP Italian Language and Culture', 'ITALIAN LANG', 'World Languages'),
    ('AP Latin', 'LATIN', 'World Languages'),
    ('AP Art History', 'ART HIST', 'Arts'),
    ('AP Music Theory', 'MUSIC THEO', 'Arts'),
    ('AP Studio Art: 2-D Design', 'STUDIO 2D', 'Arts'),
    ('AP Studio Art: 3-D Design', 'STUDIO 3D', 'Arts'),
    ('AP Studio Art: Drawing', 'STUDIO DRAW', 'Arts'),
    ('AP Seminar', 'SEMINAR', 'Capstone'),
    ('AP Research', 'RESEARCH', 'Capstone'),
    ('AP African American Studies', 'AFAM STUDIES', 'History')
ON CONFLICT DO NOTHING;
