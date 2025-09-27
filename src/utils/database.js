/**
 * Database utilities for D1 database operations
 * Handles newsletter subscriptions, contact forms, and analytics
 */

export async function initDatabase(db) {
  try {
    // Create tables if they don't exist
    await createTables(db);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

async function createTables(db) {
  const tables = [
    // Newsletter subscribers table
    {
      name: 'newsletter_subscribers',
      sql: `
        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          name TEXT,
          subscribed_at TEXT NOT NULL,
          confirmed BOOLEAN DEFAULT FALSE,
          unsubscribed BOOLEAN DEFAULT FALSE,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `
    },
    
    // Contact form submissions
    {
      name: 'contact_submissions',
      sql: `
        CREATE TABLE IF NOT EXISTS contact_submissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          message TEXT NOT NULL,
          submitted_at TEXT NOT NULL,
          status TEXT DEFAULT 'new',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `
    },
    
    // Page views for analytics
    {
      name: 'page_views',
      sql: `
        CREATE TABLE IF NOT EXISTS page_views (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          path TEXT NOT NULL,
          user_agent TEXT,
          country TEXT,
          referrer TEXT,
          timestamp TEXT NOT NULL,
          session_id TEXT
        )
      `
    },
    
    // User sessions
    {
      name: 'user_sessions',
      sql: `
        CREATE TABLE IF NOT EXISTS user_sessions (
          id TEXT PRIMARY KEY,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          last_activity TEXT DEFAULT CURRENT_TIMESTAMP,
          page_count INTEGER DEFAULT 1,
          country TEXT,
          user_agent TEXT
        )
      `
    }
  ];
  
  // Execute table creation queries
  for (const table of tables) {
    try {
      await db.prepare(table.sql).run();
      console.log(`Table ${table.name} created/verified`);
    } catch (error) {
      console.error(`Error creating table ${table.name}:`, error);
      throw error;
    }
  }
}

// Newsletter subscription functions
export async function subscribeToNewsletter(db, email, name = '') {
  try {
    const result = await db.prepare(
      'INSERT OR REPLACE INTO newsletter_subscribers (email, name, subscribed_at) VALUES (?, ?, ?)'
    ).bind(email, name, new Date().toISOString()).run();
    
    return { success: true, id: result.meta.last_row_id };
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return { success: false, error: 'Failed to subscribe' };
  }
}

export async function unsubscribeFromNewsletter(db, email) {
  try {
    await db.prepare(
      'UPDATE newsletter_subscribers SET unsubscribed = TRUE WHERE email = ?'
    ).bind(email).run();
    
    return { success: true };
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return { success: false, error: 'Failed to unsubscribe' };
  }
}

// Contact form functions
export async function saveContactSubmission(db, { name, email, message }) {
  try {
    const result = await db.prepare(
      'INSERT INTO contact_submissions (name, email, message, submitted_at) VALUES (?, ?, ?, ?)'
    ).bind(name, email, message, new Date().toISOString()).run();
    
    return { success: true, id: result.meta.last_row_id };
  } catch (error) {
    console.error('Contact form save error:', error);
    return { success: false, error: 'Failed to save submission' };
  }
}

// Analytics functions
export async function trackPageView(db, path, request) {
  try {
    const userAgent = request.headers.get('User-Agent') || '';
    const country = request.cf?.country || 'Unknown';
    const referrer = request.headers.get('Referer') || '';
    const timestamp = new Date().toISOString();
    
    // Generate or retrieve session ID
    const sessionId = await getOrCreateSession(db, request, country, userAgent);
    
    await db.prepare(
      'INSERT INTO page_views (path, user_agent, country, referrer, timestamp, session_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(path, userAgent, country, referrer, timestamp, sessionId).run();
    
    console.log('Page view tracked:', { path, country, sessionId });
  } catch (error) {
    console.error('Page view tracking error:', error);
    // Don't throw error for analytics - it shouldn't break the main flow
  }
}

async function getOrCreateSession(db, request, country, userAgent) {
  try {
    // Simple session ID based on IP and user agent hash
    const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
    const sessionId = await hashString(ip + userAgent + new Date().toDateString());
    
    // Check if session exists
    const existingSession = await db.prepare(
      'SELECT id FROM user_sessions WHERE id = ?'
    ).bind(sessionId).first();
    
    if (existingSession) {
      // Update last activity
      await db.prepare(
        'UPDATE user_sessions SET last_activity = ?, page_count = page_count + 1 WHERE id = ?'
      ).bind(new Date().toISOString(), sessionId).run();
    } else {
      // Create new session
      await db.prepare(
        'INSERT INTO user_sessions (id, country, user_agent) VALUES (?, ?, ?)'
      ).bind(sessionId, country, userAgent).run();
    }
    
    return sessionId;
  } catch (error) {
    console.error('Session management error:', error);
    return 'anonymous-' + Date.now();
  }
}

// Utility function to hash strings for session IDs
async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hash));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
}

// Analytics query functions
export async function getPageViewStats(db, days = 7) {
  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    const stats = await db.prepare(`
      SELECT 
        path,
        COUNT(*) as views,
        COUNT(DISTINCT session_id) as unique_views,
        COUNT(DISTINCT country) as countries
      FROM page_views 
      WHERE timestamp > ? 
      GROUP BY path 
      ORDER BY views DESC
    `).bind(since).all();
    
    return stats.results || [];
  } catch (error) {
    console.error('Analytics query error:', error);
    return [];
  }
}

export async function getSubscriberCount(db) {
  try {
    const result = await db.prepare(
      'SELECT COUNT(*) as count FROM newsletter_subscribers WHERE unsubscribed = FALSE'
    ).first();
    
    return result?.count || 0;
  } catch (error) {
    console.error('Subscriber count error:', error);
    return 0;
  }
}