/**
 * Privacy-friendly analytics utilities
 * Tracks user behavior without compromising privacy
 */

export async function trackPageView(db, path, request) {
  try {
    // Extract basic information without personally identifiable data
    const userAgent = request.headers.get('User-Agent') || '';
    const country = request.cf?.country || 'Unknown';
    const referrer = request.headers.get('Referer') || '';
    const timestamp = new Date().toISOString();
    
    // Create a privacy-friendly session identifier
    const sessionId = await createSessionId(request);
    
    // Store page view data
    await db.prepare(
      'INSERT INTO page_views (path, user_agent, country, referrer, timestamp, session_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(path, userAgent, country, referrer, timestamp, sessionId).run();
    
    // Update session information
    await updateSession(db, sessionId, country, userAgent);
    
    console.log('Page view tracked:', { path, country, timestamp });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Analytics errors should not break the main application flow
  }
}

async function createSessionId(request) {
  try {
    // Create a session ID using non-personally identifiable information
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const userAgent = request.headers.get('User-Agent') || 'unknown';
    const date = new Date().toDateString(); // Daily rotation for privacy
    
    // Hash the combination to create a consistent but anonymous session ID
    const sessionString = `${ip}-${userAgent}-${date}`;
    const sessionId = await hashString(sessionString);
    
    return sessionId.substring(0, 16); // Use first 16 characters
  } catch (error) {
    console.error('Session ID creation error:', error);
    return 'anonymous-' + Date.now().toString(36);
  }
}

async function updateSession(db, sessionId, country, userAgent) {
  try {
    // Check if session exists
    const existingSession = await db.prepare(
      'SELECT id, page_count FROM user_sessions WHERE id = ?'
    ).bind(sessionId).first();
    
    if (existingSession) {
      // Update existing session
      await db.prepare(
        'UPDATE user_sessions SET last_activity = ?, page_count = page_count + 1 WHERE id = ?'
      ).bind(new Date().toISOString(), sessionId).run();
    } else {
      // Create new session
      await db.prepare(
        'INSERT INTO user_sessions (id, country, user_agent, page_count) VALUES (?, ?, ?, 1)'
      ).bind(sessionId, country, userAgent).run();
    }
  } catch (error) {
    console.error('Session update error:', error);
  }
}

async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hash));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Analytics reporting functions
export async function getAnalyticsSummary(db, days = 7) {
  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    const [pageViews, uniqueVisitors, topPages, topCountries] = await Promise.all([
      // Total page views
      db.prepare(
        'SELECT COUNT(*) as total FROM page_views WHERE timestamp > ?'
      ).bind(since).first(),
      
      // Unique visitors
      db.prepare(
        'SELECT COUNT(DISTINCT session_id) as unique FROM page_views WHERE timestamp > ?'
      ).bind(since).first(),
      
      // Top pages
      db.prepare(`
        SELECT path, COUNT(*) as views, COUNT(DISTINCT session_id) as unique_views
        FROM page_views 
        WHERE timestamp > ? 
        GROUP BY path 
        ORDER BY views DESC 
        LIMIT 10
      `).bind(since).all(),
      
      // Top countries
      db.prepare(`
        SELECT country, COUNT(*) as views, COUNT(DISTINCT session_id) as unique_visitors
        FROM page_views 
        WHERE timestamp > ? AND country != 'Unknown'
        GROUP BY country 
        ORDER BY views DESC 
        LIMIT 10
      `).bind(since).all()
    ]);
    
    return {
      totalPageViews: pageViews?.total || 0,
      uniqueVisitors: uniqueVisitors?.unique || 0,
      topPages: topPages?.results || [],
      topCountries: topCountries?.results || [],
      period: `${days} days`
    };
  } catch (error) {
    console.error('Analytics summary error:', error);
    return {
      totalPageViews: 0,
      uniqueVisitors: 0,
      topPages: [],
      topCountries: [],
      period: `${days} days`,
      error: 'Failed to load analytics'
    };
  }
}

export async function getNewsletterStats(db) {
  try {
    const stats = await Promise.all([
      // Total subscribers
      db.prepare(
        'SELECT COUNT(*) as total FROM newsletter_subscribers WHERE unsubscribed = FALSE'
      ).first(),
      
      // New subscribers this week
      db.prepare(`
        SELECT COUNT(*) as weekly 
        FROM newsletter_subscribers 
        WHERE unsubscribed = FALSE 
        AND subscribed_at > datetime('now', '-7 days')
      `).first(),
      
      // Subscribers by day (last 30 days)
      db.prepare(`
        SELECT 
          DATE(subscribed_at) as date,
          COUNT(*) as count
        FROM newsletter_subscribers 
        WHERE subscribed_at > datetime('now', '-30 days')
        GROUP BY DATE(subscribed_at)
        ORDER BY date DESC
      `).all()
    ]);
    
    return {
      totalSubscribers: stats[0]?.total || 0,
      weeklySubscribers: stats[1]?.weekly || 0,
      dailyStats: stats[2]?.results || []
    };
  } catch (error) {
    console.error('Newsletter stats error:', error);
    return {
      totalSubscribers: 0,
      weeklySubscribers: 0,
      dailyStats: [],
      error: 'Failed to load newsletter stats'
    };
  }
}

// Performance tracking
export async function trackPerformance(db, path, loadTime, userAgent) {
  try {
    await db.prepare(
      'INSERT INTO performance_metrics (path, load_time, user_agent, timestamp) VALUES (?, ?, ?, ?)'
    ).bind(path, loadTime, userAgent, new Date().toISOString()).run();
  } catch (error) {
    console.error('Performance tracking error:', error);
  }
}

// Event tracking for user interactions
export async function trackEvent(db, event, properties = {}, sessionId) {
  try {
    await db.prepare(
      'INSERT INTO events (event_name, properties, session_id, timestamp) VALUES (?, ?, ?, ?)'
    ).bind(
      event,
      JSON.stringify(properties),
      sessionId,
      new Date().toISOString()
    ).run();
  } catch (error) {
    console.error('Event tracking error:', error);
  }
}

// Conversion tracking
export async function trackConversion(db, conversionType, sessionId, value = null) {
  try {
    await db.prepare(
      'INSERT INTO conversions (type, session_id, value, timestamp) VALUES (?, ?, ?, ?)'
    ).bind(
      conversionType,
      sessionId,
      value,
      new Date().toISOString()
    ).run();
    
    console.log('Conversion tracked:', { conversionType, sessionId, value });
  } catch (error) {
    console.error('Conversion tracking error:', error);
  }
}

// Data cleanup - remove old analytics data for privacy
export async function cleanupOldAnalytics(db, retentionDays = 90) {
  try {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
    
    await Promise.all([
      db.prepare('DELETE FROM page_views WHERE timestamp < ?').bind(cutoffDate).run(),
      db.prepare('DELETE FROM user_sessions WHERE created_at < ?').bind(cutoffDate).run(),
      db.prepare('DELETE FROM events WHERE timestamp < ?').bind(cutoffDate).run(),
    ]);
    
    console.log('Old analytics data cleaned up');
  } catch (error) {
    console.error('Analytics cleanup error:', error);
  }
}