/**
 * Database utilities for D1 database operations
 * Handles newsletter subscriptions, contact forms, and analytics
 * Gracefully handles missing database bindings
 */

export async function initDatabase(db) {
  if (!db) {
    console.warn('Database binding not available - continuing without database features');
    return false;
  }
  
  try {
    // Test database connection
    await db.prepare('SELECT 1').first();
    
    // Create tables if they don't exist
    await createTables(db);
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error.message);
    // Don't throw error - let the app continue without database
    return false;
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
      console.error(`Error creating table ${table.name}:`, error.message);
      throw error;
    }
  }
  
  // Create indexes for better performance
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed ON newsletter_subscribers(unsubscribed, confirmed)',
    'CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_submissions(status)',
    'CREATE INDEX IF NOT EXISTS idx_contact_submitted ON contact_submissions(submitted_at)',
    'CREATE INDEX IF NOT EXISTS idx_pageviews_path ON page_views(path)',
    'CREATE INDEX IF NOT EXISTS idx_pageviews_timestamp ON page_views(timestamp)',
    'CREATE INDEX IF NOT EXISTS idx_pageviews_session ON page_views(session_id)',
    'CREATE INDEX IF NOT EXISTS idx_sessions_created ON user_sessions(created_at)'
  ];
  
  for (const indexSQL of indexes) {
    try {
      await db.prepare(indexSQL).run();
    } catch (error) {
      console.warn('Index creation warning:', error.message);
      // Continue even if index creation fails
    }
  }
}

// Newsletter subscription functions
export async function subscribeToNewsletter(db, email, name = '') {
  if (!db) {
    console.warn('Newsletter subscription attempted without database');
    return { success: false, error: 'Database not available' };
  }
  
  try {
    // Validate email
    if (!email || !isValidEmail(email)) {
      return { success: false, error: 'Invalid email address' };
    }
    
    // Sanitize inputs
    email = email.trim().toLowerCase();
    name = name ? name.trim().substring(0, 100) : '';
    
    const result = await db.prepare(
      'INSERT OR REPLACE INTO newsletter_subscribers (email, name, subscribed_at) VALUES (?, ?, ?)'
    ).bind(email, name, new Date().toISOString()).run();
    
    console.log(`Newsletter subscription: ${email}`);
    return { success: true, id: result.meta.last_row_id };
  } catch (error) {
    console.error('Newsletter subscription error:', error.message);
    return { success: false, error: 'Failed to subscribe' };
  }
}

export async function unsubscribeFromNewsletter(db, email) {
  if (!db) {
    return { success: false, error: 'Database not available' };
  }
  
  try {
    await db.prepare(
      'UPDATE newsletter_subscribers SET unsubscribed = TRUE WHERE email = ?'
    ).bind(email.trim().toLowerCase()).run();
    
    return { success: true };
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error.message);
    return { success: false, error: 'Failed to unsubscribe' };
  }
}

// Contact form functions
export async function saveContactSubmission(db, { name, email, message }) {
  if (!db) {
    console.warn('Contact form submission attempted without database');
    return { success: false, error: 'Database not available' };
  }
  
  try {
    // Validate inputs
    if (!name || !email || !message) {
      return { success: false, error: 'All fields are required' };
    }
    
    if (!isValidEmail(email)) {
      return { success: false, error: 'Invalid email address' };
    }
    
    // Sanitize inputs
    const sanitizedName = name.trim().substring(0, 100);
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedMessage = message.trim().substring(0, 1000);
    
    const result = await db.prepare(
      'INSERT INTO contact_submissions (name, email, message, submitted_at) VALUES (?, ?, ?, ?)'
    ).bind(sanitizedName, sanitizedEmail, sanitizedMessage, new Date().toISOString()).run();
    
    console.log(`Contact form submission from: ${sanitizedEmail}`);
    return { success: true, id: result.meta.last_row_id };
  } catch (error) {
    console.error('Contact form save error:', error.message);
    return { success: false, error: 'Failed to save submission' };
  }
}

// Analytics functions with graceful degradation
export async function trackPageView(db, path, request) {
  if (!db) {
    // Silently fail if no database - analytics are optional
    return;
  }
  
  try {
    const userAgent = (request.headers.get('User-Agent') || '').substring(0, 200);
    const country = request.cf?.country || 'Unknown';
    const referrer = (request.headers.get('Referer') || '').substring(0, 200);
    const timestamp = new Date().toISOString();
    
    // Generate session ID
    const sessionId = await getOrCreateSession(db, request, country, userAgent);
    
    await db.prepare(
      'INSERT INTO page_views (path, user_agent, country, referrer, timestamp, session_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(path, userAgent, country, referrer, timestamp, sessionId).run();
    
  } catch (error) {
    console.error('Page view tracking error:', error.message);
    // Don't throw error for analytics - it shouldn't break the main flow
  }
}

async function getOrCreateSession(db, request, country, userAgent) {
  try {
    // Simple session ID based on IP and user agent hash (privacy-friendly)
    const ip = request.headers.get('CF-Connecting-IP') || 
               request.headers.get('X-Forwarded-For') || 
               'unknown';
    const sessionData = ip + userAgent + new Date().toDateString();
    const sessionId = await hashString(sessionData.substring(0, 100));
    
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
      ).bind(sessionId, country, userAgent.substring(0, 200)).run();
    }
    
    return sessionId;
  } catch (error) {
    console.error('Session management error:', error.message);
    return 'anonymous-' + Date.now().toString(36);
  }
}

// Utility function to hash strings for session IDs
async function hashString(str) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hash));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
  } catch (error) {
    // Fallback hash for environments without crypto.subtle
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36).padStart(8, '0');
  }
}

// Analytics query functions
export async function getPageViewStats(db, days = 7) {
  if (!db) {
    return [];
  }
  
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
      LIMIT 20
    `).bind(since).all();
    
    return stats.results || [];
  } catch (error) {
    console.error('Analytics query error:', error.message);
    return [];
  }
}

export async function getSubscriberCount(db) {
  if (!db) {
    return 0;
  }
  
  try {
    const result = await db.prepare(
      'SELECT COUNT(*) as count FROM newsletter_subscribers WHERE unsubscribed = FALSE'
    ).first();
    
    return result?.count || 0;
  } catch (error) {
    console.error('Subscriber count error:', error.message);
    return 0;
  }
}

// Utility function to validate email addresses
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

// Health check function
export async function checkDatabaseHealth(db) {
  if (!db) {
    return { healthy: false, error: 'Database binding not available' };
  }
  
  try {
    await db.prepare('SELECT 1').first();
    return { healthy: true, message: 'Database connection OK' };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
}