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
  
  // Handle static assets
  if (pathname.startsWith('/assets/') || pathname.startsWith('/images/')) {
    return handleStaticAssets(pathname, env);
  }
  
  // Handle API endpoints
  if (pathname.startsWith('/api/')) {
    return handleAPI(request, env, pathname);
  }
  
  // Handle newsletter subscription
  if (pathname === '/newsletter/subscribe' && request.method === 'POST') {
    return handleNewsletterSubscription(request, env);
  }
  
  // Handle main page routing
  const route = ROUTES[pathname] || 'home';
  
  try {
    // Track page view
    ctx.waitUntil(trackPageView(env.DB, pathname, request));
    
    // Get WordPress content or serve custom pages
    if (route === 'sitemap') {
      return createSitemap(env);
    }
    
    const content = await getPageContent(route, env);
    return createCustomResponse(content, pathname, env);
    
  } catch (error) {
    console.error('Route handling error:', error);
    return new Response('Page not found', { 
      status: 404,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

async function handleStaticAssets(pathname, env) {
  // Serve logo and other static assets
  if (pathname === '/assets/logo.png') {
    // Return the logo image - you'll need to upload this to your worker
    return new Response('Logo placeholder', { 
      headers: { 'Content-Type': 'image/png' }
    });
  }
  
  return new Response('Asset not found', { status: 404 });
}

async function handleAPI(request, env, pathname) {
  const segments = pathname.split('/');
  
  switch (segments[2]) {
    case 'newsletter':
      return handleNewsletterAPI(request, env);
    case 'contact':
      return handleContactAPI(request, env);
    default:
      return new Response('API endpoint not found', { status: 404 });
  }
}

async function handleNewsletterSubscription(request, env) {
  try {
    const formData = await request.formData();
    const email = formData.get('email');
    const name = formData.get('name') || '';
    
    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Valid email required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Store in D1 database
    await env.DB.prepare(
      'INSERT OR REPLACE INTO newsletter_subscribers (email, name, subscribed_at) VALUES (?, ?, ?)'
    ).bind(email, name, new Date().toISOString()).run();
    
    return new Response(JSON.stringify({ success: true, message: 'Successfully subscribed!' }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return new Response(JSON.stringify({ error: 'Subscription failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleNewsletterAPI(request, env) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  return handleNewsletterSubscription(request, env);
}

async function handleContactAPI(request, env) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  try {
    const { name, email, message } = await request.json();
    
    // Store contact form submission
    await env.DB.prepare(
      'INSERT INTO contact_submissions (name, email, message, submitted_at) VALUES (?, ?, ?, ?)'
    ).bind(name, email, message, new Date().toISOString()).run();
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(JSON.stringify({ error: 'Failed to submit' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function createSitemap(env) {
  const baseUrl = `https://${env.DOMAIN}`;
  const pages = Object.keys(ROUTES).filter(route => !route.includes('newsletter') && !route.includes('sitemap'));
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
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