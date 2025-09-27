/**
 * Response utilities for creating custom HTML responses
 * with proper SEO optimization and branding
 * Now includes admin panel support and improved newsletter handling
 */

import { generateHeader, getHeaderStyles, getHeaderJS } from '../components/header.js';
import { generateFooter, getFooterStyles } from '../components/footer.js';

export function createCustomResponse(contentData, pathname, env) {
  const { content, title, description, route } = contentData;
  
  const html = generateHTMLTemplate({
    title,
    description,
    content,
    pathname,
    contactEmail: env.CONTACT_EMAIL || 'info@goevergreen.shop',
    domain: env.DOMAIN || 'goevergreen.shop'
  });
  
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  });
}

export function createAdminResponse(contentData, pathname, env) {
  const { content, title, description, cookies } = contentData;
  
  // For admin pages, return minimal HTML with preserved WordPress admin structure
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title || 'GoEvergreen Admin')}</title>
    <meta name="robots" content="noindex, nofollow">
    
    <!-- Preserve WordPress admin styles and scripts -->
    ${extractWordPressAssets(content)}
</head>
<body class="wp-admin">
    ${content}
</body>
</html>`;
  
  const response = new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN'
    }
  });
  
  // Forward any cookies from WordPress
  if (cookies) {
    response.headers.set('Set-Cookie', cookies);
  }
  
  return response;
}

function extractWordPressAssets(html) {
  // Extract CSS and JS from WordPress admin
  const assets = [];
  
  // Extract stylesheets
  const cssRegex = /<link[^>]+rel=["']stylesheet["'][^>]*>/gi;
  let match;
  while ((match = cssRegex.exec(html)) !== null) {
    assets.push(match[0]);
  }
  
  // Extract scripts
  const jsRegex = /<script[^>]*src=[^>]*><\/script>/gi;
  while ((match = jsRegex.exec(html)) !== null) {
    assets.push(match[0]);
  }
  
  return assets.join('\n    ');
}

function generateHTMLTemplate({ title, description, content, pathname, contactEmail, domain }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="robots" content="index, follow">
    <meta name="author" content="GoEvergreen">
    
    <!-- SEO Meta Tags -->
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://${domain}${pathname}">
    <meta property="og:image" content="https://${domain}/assets/favicon.ico">
    <meta property="og:site_name" content="GoEvergreen">
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="https://${domain}/assets/favicon.ico">
    
    <!-- Schema.org markup -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "HealthAndBeautyBusiness",
      "name": "GoEvergreen",
      "description": "${escapeHtml(description)}",
      "url": "https://${domain}",
      "logo": "https://${domain}/assets/favicon.ico",
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "${contactEmail}",
        "contactType": "customer support"
      }
    }
    </script>
    
    <title>${escapeHtml(title)}</title>
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="shortcut icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/assets/favicon.ico">
    
    <!-- Styles -->
    <style>
        ${getCustomCSS()}
        ${getHeaderStyles()}
        ${getFooterStyles()}
    </style>
</head>
<body>
    ${generateHeader(pathname, { DOMAIN: domain, CONTACT_EMAIL: contactEmail })}
    
    <!-- Main Content -->
    <main class="main-content">
        <div class="content-container">
            ${content}
        </div>
    </main>
    
    <!-- Newsletter Section -->
    <section id="newsletter" class="newsletter-section">
        <div class="newsletter-container">
            <div id="newsletter-form-container">
                <h2>Subscribe for Expert Wellness Guidance</h2>
                <p>Get personalized health tips, workout routines, and nutrition advice delivered to your inbox.</p>
                <form class="newsletter-form" id="newsletterForm">
                    <input type="email" name="email" placeholder="Enter your email" required>
                    <input type="text" name="name" placeholder="Your name (optional)">
                    <button type="submit">Subscribe Now</button>
                </form>
            </div>
            <div id="newsletter-success" class="newsletter-success" style="display: none;">
                <h2>✅ Successfully Subscribed!</h2>
                <p>Thank you for joining our wellness community! Check your email for a confirmation message.</p>
                <p>You'll receive expert wellness tips, fitness guidance, and nutrition advice tailored specifically for women.</p>
            </div>
            <div id="newsletter-message" class="form-message"></div>
        </div>
    </section>
    
    ${generateFooter(pathname, { DOMAIN: domain, CONTACT_EMAIL: contactEmail })}
    
    <!-- JavaScript -->
    <script>
        ${getHeaderJS()}
        ${getCustomJS()}
    </script>
</body>
</html>`;
}

function getCustomCSS() {
  return `
    /* Reset and Base Styles */
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    
    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #2c3e35;
        background-color: #fafaf8;
    }
    
    /* Main Content */
    .main-content {
        min-height: 60vh;
        padding: 2rem 0;
    }
    
    .content-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 2rem;
    }
    
    /* Newsletter Section */
    .newsletter-section {
        background: linear-gradient(135deg, #e8f5e8 0%, #d4e7d4 100%);
        padding: 4rem 0;
        text-align: center;
    }
    
    .newsletter-container {
        max-width: 600px;
        margin: 0 auto;
        padding: 0 2rem;
    }
    
    .newsletter-section h2 {
        color: #2c3e35;
        font-size: 2.2rem;
        margin-bottom: 1rem;
    }
    
    .newsletter-section p {
        color: #5a6b5d;
        font-size: 1.1rem;
        margin-bottom: 2rem;
    }
    
    .newsletter-form {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        justify-content: center;
        margin-bottom: 1rem;
    }
    
    .newsletter-form input {
        padding: 1rem;
        border: 2px solid #a8c09a;
        border-radius: 25px;
        font-size: 1rem;
        outline: none;
        transition: border-color 0.3s ease;
        min-width: 200px;
    }
    
    .newsletter-form input:focus {
        border-color: #7a9b8e;
    }
    
    .newsletter-form button {
        background: #7a9b8e;
        color: white;
        border: none;
        padding: 1rem 2rem;
        border-radius: 25px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .newsletter-form button:hover {
        background: #6a8b7e;
        transform: translateY(-2px);
    }
    
    .newsletter-form button:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
    }
    
    .newsletter-success {
        background: white;
        padding: 2rem;
        border-radius: 15px;
        box-shadow: 0 5px 25px rgba(122, 155, 142, 0.1);
        border: 2px solid #7a9b8e;
    }
    
    .newsletter-success h2 {
        color: #7a9b8e;
        margin-bottom: 1rem;
    }
    
    .newsletter-success p {
        color: #2c3e35;
        margin-bottom: 1rem;
    }
    
    .form-message {
        margin-top: 1rem;
        padding: 1rem;
        border-radius: 8px;
        display: none;
        font-weight: 500;
    }
    
    .form-message.success {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
        display: block;
    }
    
    .form-message.error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        display: block;
    }
    
    /* Content Styles */
    .hero-section {
        text-align: center;
        padding: 4rem 2rem;
        background: linear-gradient(135deg, #f8fdf8 0%, #e8f5e8 100%);
        border-radius: 15px;
        margin-bottom: 2rem;
    }
    
    .hero-section h1 {
        font-size: 3rem;
        color: #2c3e35;
        margin-bottom: 1rem;
    }
    
    .hero-section p {
        font-size: 1.2rem;
        color: #5a6b5d;
        margin-bottom: 2rem;
    }
    
    .cta-buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
    }
    
    .btn {
        padding: 1rem 2rem;
        border-radius: 25px;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s ease;
        display: inline-block;
    }
    
    .btn-primary {
        background: #7a9b8e;
        color: white;
    }
    
    .btn-secondary {
        background: transparent;
        color: #7a9b8e;
        border: 2px solid #7a9b8e;
    }
    
    .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }
    
    .features {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        margin: 3rem 0;
    }
    
    .feature {
        background: white;
        padding: 2rem;
        border-radius: 15px;
        box-shadow: 0 5px 25px rgba(122, 155, 142, 0.1);
        text-align: center;
    }
    
    .feature h3 {
        color: #7a9b8e;
        font-size: 1.5rem;
        margin-bottom: 1rem;
    }
    
    .guide-grid, .benefits-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 2rem;
        margin: 2rem 0;
    }
    
    .guide-card, .benefit-card {
        background: white;
        padding: 2rem;
        border-radius: 15px;
        box-shadow: 0 5px 25px rgba(122, 155, 142, 0.1);
        transition: transform 0.3s ease;
    }
    
    .guide-card:hover, .benefit-card:hover {
        transform: translateY(-5px);
    }
    
    .guide-card h3, .benefit-card h3 {
        color: #7a9b8e;
        margin-bottom: 1rem;
        font-size: 1.3rem;
    }
    
    /* Contact styles */
    .contact-info {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 2rem;
        margin: 2rem 0;
    }
    
    .contact-method {
        background: white;
        padding: 2rem;
        border-radius: 15px;
        box-shadow: 0 5px 25px rgba(122, 155, 142, 0.1);
        text-align: center;
    }
    
    .contact-method h3 {
        color: #7a9b8e;
        margin-bottom: 1rem;
        font-size: 1.3rem;
    }
    
    .contact-method a {
        color: #7a9b8e;
        text-decoration: none;
        font-weight: 600;
    }
    
    .contact-method a:hover {
        text-decoration: underline;
    }
    
    /* About content */
    .about-content {
        background: white;
        padding: 3rem;
        border-radius: 15px;
        box-shadow: 0 5px 25px rgba(122, 155, 142, 0.1);
        margin: 2rem 0;
    }
    
    .about-content h2 {
        color: #7a9b8e;
        margin-bottom: 1rem;
        font-size: 1.8rem;
    }
    
    .about-content ul {
        margin: 1rem 0;
        padding-left: 2rem;
    }
    
    .about-content li {
        margin-bottom: 0.5rem;
        color: #5a6b5d;
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
        .newsletter-form {
            flex-direction: column;
            align-items: center;
        }
        
        .newsletter-form input,
        .newsletter-form button {
            width: 100%;
            max-width: 300px;
        }
        
        .hero-section h1 {
            font-size: 2rem;
        }
        
        .cta-buttons {
            flex-direction: column;
            align-items: center;
        }
        
        .features,
        .guide-grid,
        .benefits-grid,
        .contact-info {
            grid-template-columns: 1fr;
        }
    }
    
    @media (max-width: 480px) {
        .newsletter-section {
            padding: 2rem 0;
        }
        
        .newsletter-section h2 {
            font-size: 1.8rem;
        }
        
        .hero-section {
            padding: 2rem 1rem;
        }
        
        .feature,
        .guide-card,
        .benefit-card,
        .contact-method {
            padding: 1.5rem;
        }
    }
  `;
}

function getCustomJS() {
  return `
    // Newsletter form handling with improved UX
    document.addEventListener('DOMContentLoaded', function() {
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const messageDiv = document.getElementById('newsletter-message');
                const formContainer = document.getElementById('newsletter-form-container');
                const successContainer = document.getElementById('newsletter-success');
                const submitButton = this.querySelector('button[type="submit"]');
                
                const email = this.email.value;
                const name = this.name.value;
                
                // Disable submit button
                submitButton.disabled = true;
                submitButton.textContent = 'Subscribing...';
                
                // Hide any previous messages
                messageDiv.style.display = 'none';
                
                try {
                    const response = await fetch('/api/newsletter', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email, name })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        // Hide form and show success message
                        formContainer.style.display = 'none';
                        successContainer.style.display = 'block';
                        
                        // Add celebration effect
                        successContainer.style.animation = 'slideIn 0.5s ease-out';
                        
                        // Track subscription event
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'newsletter_subscription', {
                                event_category: 'engagement',
                                event_label: 'newsletter_form'
                            });
                        }
                        
                    } else {
                        messageDiv.textContent = result.error || 'Subscription failed. Please try again.';
                        messageDiv.className = 'form-message error';
                        messageDiv.style.display = 'block';
                        
                        // Re-enable submit button
                        submitButton.disabled = false;
                        submitButton.textContent = 'Subscribe Now';
                    }
                } catch (error) {
                    messageDiv.textContent = 'Network error. Please check your connection and try again.';
                    messageDiv.className = 'form-message error';
                    messageDiv.style.display = 'block';
                    
                    // Re-enable submit button
                    submitButton.disabled = false;
                    submitButton.textContent = 'Subscribe Now';
                }
            });
        }
    });
    
    // Add CSS animation for success message
    const style = document.createElement('style');
    style.textContent = \`
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    \`;
    document.head.appendChild(style);
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Analytics tracking (privacy-friendly)
    function trackEvent(eventName, properties = {}) {
        // Simple analytics without third-party tracking
        console.log('Event:', eventName, properties);
        
        // Send to internal analytics if available
        if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/analytics/event', JSON.stringify({
                event: eventName,
                properties: properties,
                timestamp: new Date().toISOString(),
                path: window.location.pathname
            }));
        }
    }
    
    // Track page views
    trackEvent('page_view', {
        path: window.location.pathname,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent.substring(0, 100)
    });
    
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', function() {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            if (maxScroll >= 75 && maxScroll < 80) {
                trackEvent('scroll_depth', { depth: '75%' });
            } else if (maxScroll >= 90) {
                trackEvent('scroll_depth', { depth: '90%' });
            }
        }
    });
    
    // Track link clicks
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            const href = e.target.getAttribute('href');
            if (href && href.startsWith('http') && !href.includes(window.location.hostname)) {
                trackEvent('external_link_click', {
                    url: href,
                    text: e.target.textContent.trim().substring(0, 50)
                });
            }
        }
    });
  `;
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}