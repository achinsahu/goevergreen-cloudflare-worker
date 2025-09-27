import { createCustomResponse } from '../utils/response.js';
import { getPageContent } from '../utils/wordpress.js';
import { trackPageView } from '../utils/analytics.js';

const ROUTES = {
  '/': 'home',
  '/wellness-guides': 'wellness-guides',
  '/privacy-policy': 'privay-policy', // Note: WordPress URL has typo
  '/donate': 'donate',
  '/contact-us': 'contact-us',
  '/benefits-of-exercises': 'benefits-of-exercises',
  '/about': 'about',
  '/blog': 'blog',
  '/reviews': 'reveiws', // Note: WordPress URL has typo
  '/newsletter/subscribe': 'newsletter-subscribe',
  '/sitemap.xml': 'sitemap'
};

export async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  try {
    // Handle static assets
    if (pathname.startsWith('/assets/')) {
      return await handleStaticAssets(pathname, env);
    }
    
    // Handle API endpoints
    if (pathname.startsWith('/api/')) {
      return await handleAPI(request, env, pathname);
    }
    
    // Handle newsletter subscription
    if (pathname === '/newsletter/subscribe' && request.method === 'POST') {
      return await handleNewsletterSubscription(request, env);
    }
    
    // Handle main page routing
    const route = ROUTES[pathname] || 'home';
    
    // Track page view (non-blocking)
    ctx.waitUntil(trackPageView(env.DB, pathname, request));
    
    // Handle special routes
    if (route === 'sitemap') {
      return createSitemap(env);
    }
    
    // Get WordPress content or serve custom pages
    const content = await getPageContent(route, env);
    return createCustomResponse(content, pathname, env);
    
  } catch (error) {
    console.error('Route handling error:', error);
    return createErrorResponse(error.message, 500);
  }
}

async function handleStaticAssets(pathname, env) {
  try {
    // Handle logo
    if (pathname === '/assets/logo.jpg') {
      // Note: In a real deployment, you'd need to handle binary assets differently
      // For now, we'll redirect to a placeholder or serve from a CDN
      return new Response(null, {
        status: 302,
        headers: {
          'Location': 'https://via.placeholder.com/200x200/7a9b8e/ffffff?text=GoEvergreen',
          'Cache-Control': 'public, max-age=86400'
        }
      });
    }
    
    // Handle favicon
    if (pathname === '/assets/favicon.ico') {
      return new Response(null, {
        status: 302,
        headers: {
          'Location': 'https://via.placeholder.com/32x32/7a9b8e/ffffff?text=GE',
          'Cache-Control': 'public, max-age=86400'
        }
      });
    }
    
    return createErrorResponse('Asset not found', 404);
  } catch (error) {
    console.error('Static asset error:', error);
    return createErrorResponse('Asset unavailable', 500);
  }
}

async function handleAPI(request, env, pathname) {
  const segments = pathname.split('/');
  
  try {
    switch (segments[2]) {
      case 'newsletter':
        return await handleNewsletterAPI(request, env);
      case 'contact':
        return await handleContactAPI(request, env);
      case 'analytics':
        return await handleAnalyticsAPI(request, env);
      default:
        return createErrorResponse('API endpoint not found', 404);
    }
  } catch (error) {
    console.error('API error:', error);
    return createErrorResponse('API error', 500);
  }
}

async function handleNewsletterSubscription(request, env) {
  try {
    const contentType = request.headers.get('Content-Type') || '';
    
    let email, name;
    
    if (contentType.includes('application/json')) {
      const data = await request.json();
      email = data.email;
      name = data.name || '';
    } else {
      const formData = await request.formData();
      email = formData.get('email');
      name = formData.get('name') || '';
    }
    
    // Validate email
    if (!email || !email.includes('@') || email.length > 255) {
      return new Response(JSON.stringify({ error: 'Valid email required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Sanitize inputs
    email = email.trim().toLowerCase();
    name = name ? name.trim().substring(0, 100) : '';
    
    // Store in D1 database
    await env.DB.prepare(
      'INSERT OR REPLACE INTO newsletter_subscribers (email, name, subscribed_at) VALUES (?, ?, ?)'
    ).bind(email, name, new Date().toISOString()).run();
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Successfully subscribed to our wellness newsletter!' 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return new Response(JSON.stringify({ error: 'Subscription failed. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleNewsletterAPI(request, env) {
  if (request.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }
  
  return handleNewsletterSubscription(request, env);
}

async function handleContactAPI(request, env) {
  if (request.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }
  
  try {
    const { name, email, message } = await request.json();
    
    // Validate inputs
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!email.includes('@') || email.length > 255) {
      return new Response(JSON.stringify({ error: 'Valid email required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Sanitize inputs
    const sanitizedName = name.trim().substring(0, 100);
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedMessage = message.trim().substring(0, 1000);
    
    // Store contact form submission
    await env.DB.prepare(
      'INSERT INTO contact_submissions (name, email, message, submitted_at) VALUES (?, ?, ?, ?)'
    ).bind(sanitizedName, sanitizedEmail, sanitizedMessage, new Date().toISOString()).run();
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Thank you for contacting us! We\'ll get back to you soon.' 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(JSON.stringify({ error: 'Failed to submit. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleAnalyticsAPI(request, env) {
  try {
    // Simple analytics endpoint (you might want to add authentication)
    const stats = await env.DB.prepare(`
      SELECT 
        path,
        COUNT(*) as views,
        COUNT(DISTINCT session_id) as unique_views
      FROM page_views 
      WHERE timestamp > datetime('now', '-7 days')
      GROUP BY path 
      ORDER BY views DESC
      LIMIT 10
    `).all();
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: stats.results || [] 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Analytics API error:', error);
    return createErrorResponse('Analytics unavailable', 500);
  }
}

function createSitemap(env) {
  const baseUrl = `https://${env.DOMAIN}`;
  const pages = Object.keys(ROUTES).filter(route => 
    !route.includes('newsletter') && 
    !route.includes('sitemap')
  );
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${page === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;
  
  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}

function createErrorResponse(message, status = 500) {
  return new Response(JSON.stringify({ 
    error: message,
    timestamp: new Date().toISOString()
  }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}