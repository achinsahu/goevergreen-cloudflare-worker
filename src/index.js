/**
 * GoEvergreen.shop Cloudflare Worker
 * Proxies WordPress content with custom branding and SEO optimization
 * Version: 1.0.0
 */

import { handleRequest } from './handlers/router.js';
import { initDatabase } from './utils/database.js';

// Worker main handler
export default {
  async fetch(request, env, ctx) {
    try {
      // Validate environment bindings
      if (!env) {
        console.error('Environment bindings not available');
        return createErrorResponse('Service temporarily unavailable', 500);
      }

      // Set default environment variables if not provided
      env.DOMAIN = env.DOMAIN || 'goevergreen.shop';
      env.CONTACT_EMAIL = env.CONTACT_EMAIL || 'info@goevergreen.shop';
      env.ENVIRONMENT = env.ENVIRONMENT || 'production';
      env.WORDPRESS_BASE_URL = env.WORDPRESS_BASE_URL || 'https://goevergreen9.wordpress.com';
      
      // Initialize database with error recovery
      if (env.DB) {
        try {
          await initDatabase(env.DB);
        } catch (dbError) {
          console.error('Database initialization failed:', dbError.message);
          // Continue without database - analytics and forms will be disabled but site will work
        }
      } else {
        console.warn('Database binding (DB) not found - running without database features');
      }
      
      // Handle the request with custom routing
      const response = await handleRequest(request, env, ctx);
      
      // Add security headers
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'SAMEORIGIN');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      return response;
      
    } catch (error) {
      console.error('Worker critical error:', error);
      return createErrorResponse(`Internal server error: ${error.message}`, 500);
    }
  },

  async scheduled(controller, env, ctx) {
    try {
      console.log('Scheduled task triggered at:', controller.scheduledTime);
      
      // Perform maintenance tasks
      if (env.DB) {
        try {
          // Clean up old analytics data (keep last 90 days)
          const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
          
          await env.DB.prepare(
            'DELETE FROM page_views WHERE timestamp < ?'
          ).bind(cutoffDate).run();
          
          await env.DB.prepare(
            'DELETE FROM user_sessions WHERE created_at < ?'
          ).bind(cutoffDate).run();
          
          console.log('Database cleanup completed');
          
        } catch (cleanupError) {
          console.error('Database cleanup failed:', cleanupError.message);
        }
      }
      
    } catch (error) {
      console.error('Scheduled task error:', error.message);
    }
  },

  async email(message, env, ctx) {
    // Handle email forwarding if configured
    console.log('Email handler triggered');
    return new Response('Email forwarding not configured');
  }
};

/**
 * Create a user-friendly error response
 */
function createErrorResponse(message, status = 500) {
  const errorHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GoEvergreen - Service Issue</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #e8f5e8 0%, #d4e7d4 100%);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .error-container {
            background: white;
            padding: 3rem;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(122, 155, 142, 0.2);
            text-align: center;
            max-width: 500px;
            margin: 2rem;
        }
        .logo {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        h1 {
            color: #7a9b8e;
            font-size: 2rem;
            margin-bottom: 1rem;
        }
        p {
            color: #5a6b5d;
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 2rem;
        }
        .contact-link {
            background: #7a9b8e;
            color: white;
            padding: 1rem 2rem;
            border-radius: 25px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            display: inline-block;
        }
        .contact-link:hover {
            background: #6a8b7e;
            transform: translateY(-2px);
        }
        .error-code {
            color: #999;
            font-size: 0.9rem;
            margin-top: 2rem;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="logo">🌿</div>
        <h1>GoEvergreen</h1>
        <p>${message}</p>
        <p>We're working to resolve this issue quickly. Thank you for your patience.</p>
        <a href="mailto:info@goevergreen.shop" class="contact-link">Contact Support</a>
        <div class="error-code">Error ${status} - ${new Date().toISOString()}</div>
    </div>
</body>
</html>`;
  
  return new Response(errorHtml, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}