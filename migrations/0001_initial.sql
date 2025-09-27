-- Initial database schema for GoEvergreen
-- This file creates all the necessary tables for the application

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscribed_at TEXT NOT NULL,
  confirmed BOOLEAN DEFAULT FALSE,
  unsubscribed BOOLEAN DEFAULT FALSE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed ON newsletter_subscribers(unsubscribed, confirmed);

-- Contact form submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create index for contact submissions
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submitted ON contact_submissions(submitted_at);

-- Page views for analytics (privacy-friendly)
CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT NOT NULL,
  user_agent TEXT,
  country TEXT,
  referrer TEXT,
  timestamp TEXT NOT NULL,
  session_id TEXT
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_pageviews_path ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_pageviews_timestamp ON page_views(timestamp);
CREATE INDEX IF NOT EXISTS idx_pageviews_session ON page_views(session_id);

-- User sessions table (anonymous)
CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_activity TEXT DEFAULT CURRENT_TIMESTAMP,
  page_count INTEGER DEFAULT 1,
  country TEXT,
  user_agent TEXT
);

-- Create index for session cleanup
CREATE INDEX IF NOT EXISTS idx_sessions_created ON user_sessions(created_at);

-- Events tracking table
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_name TEXT NOT NULL,
  properties TEXT, -- JSON string
  session_id TEXT,
  timestamp TEXT NOT NULL
);

-- Create indexes for events
CREATE INDEX IF NOT EXISTS idx_events_name ON events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);

-- Conversions tracking table
CREATE TABLE IF NOT EXISTS conversions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  session_id TEXT,
  value REAL,
  timestamp TEXT NOT NULL
);

-- Create indexes for conversions
CREATE INDEX IF NOT EXISTS idx_conversions_type ON conversions(type);
CREATE INDEX IF NOT EXISTS idx_conversions_timestamp ON conversions(timestamp);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT NOT NULL,
  load_time INTEGER, -- milliseconds
  user_agent TEXT,
  timestamp TEXT NOT NULL
);

-- Create indexes for performance queries
CREATE INDEX IF NOT EXISTS idx_performance_path ON performance_metrics(path);
CREATE INDEX IF NOT EXISTS idx_performance_timestamp ON performance_metrics(timestamp);

-- Insert initial data
INSERT OR IGNORE INTO events (event_name, properties, session_id, timestamp) 
VALUES ('database_initialized', '{}', 'system', datetime('now'));

-- Comments for future reference
-- This schema is designed to be:
-- 1. Privacy-friendly (no PII storage)
-- 2. GDPR compliant (data retention limits)
-- 3. Efficient for analytics queries
-- 4. Scalable for growth