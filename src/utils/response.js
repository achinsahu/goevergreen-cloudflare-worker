/**
 * Response utilities for creating custom HTML responses
 * with proper SEO optimization and branding
 */

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
    <meta property="og:image" content="https://${domain}/assets/logo.jpg">
    <meta property="og:site_name" content="GoEvergreen">
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="https://${domain}/assets/logo.jpg">
    
    <!-- Schema.org markup -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "HealthAndBeautyBusiness",
      "name": "GoEvergreen",
      "description": "${escapeHtml(description)}",
      "url": "https://${domain}",
      "logo": "https://${domain}/assets/logo.jpg",
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "${contactEmail}",
        "contactType": "customer support"
      }
    }
    </script>
    
    <title>${escapeHtml(title)}</title>
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/assets/favicon.ico">
    <link rel="apple-touch-icon" href="/assets/logo.jpg">
    
    <!-- Styles -->
    <style>
        ${getCustomCSS()}
    </style>
</head>
<body>
    <!-- Header -->
    <header class="site-header">
        <div class="header-container">
            <div class="logo-section">
                <img src="/assets/logo.jpg" alt="GoEvergreen Logo" class="logo">
                <h1 class="site-title">GoEvergreen</h1>
            </div>
            
            <nav class="main-navigation">
                <ul class="nav-menu">
                    <li><a href="/" class="${pathname === '/' ? 'active' : ''}">Home</a></li>
                    <li><a href="/wellness-guides" class="${pathname === '/wellness-guides' ? 'active' : ''}">Wellness Guides</a></li>
                    <li><a href="/benefits-of-exercises" class="${pathname === '/benefits-of-exercises' ? 'active' : ''}">Exercise Benefits</a></li>
                    <li><a href="/blog" class="${pathname === '/blog' ? 'active' : ''}">Blog</a></li>
                    <li><a href="/reviews" class="${pathname === '/reviews' ? 'active' : ''}">Reviews</a></li>
                    <li><a href="/about" class="${pathname === '/about' ? 'active' : ''}">About</a></li>
                    <li><a href="/contact-us" class="${pathname === '/contact-us' ? 'active' : ''}">Contact</a></li>
                </ul>
            </nav>
            
            <div class="header-cta">
                <a href="#newsletter" class="cta-button">Get Expert Guidance</a>
            </div>
        </div>
    </header>
    
    <!-- Main Content -->
    <main class="main-content">
        <div class="content-container">
            ${content}
        </div>
    </main>
    
    <!-- Newsletter Section -->
    <section id="newsletter" class="newsletter-section">
        <div class="newsletter-container">
            <h2>Subscribe for Expert Wellness Guidance</h2>
            <p>Get personalized health tips, workout routines, and nutrition advice delivered to your inbox.</p>
            <form class="newsletter-form" id="newsletterForm">
                <input type="email" name="email" placeholder="Enter your email" required>
                <input type="text" name="name" placeholder="Your name (optional)">
                <button type="submit">Subscribe Now</button>
            </form>
            <div id="newsletter-message" class="form-message"></div>
        </div>
    </section>
    
    <!-- Footer -->
    <footer class="site-footer">
        <div class="footer-container">
            <div class="footer-section">
                <h3>GoEvergreen</h3>
                <p>Empowering women with premium wellness guidance and health solutions.</p>
            </div>
            
            <div class="footer-section">
                <h4>Quick Links</h4>
                <ul>
                    <li><a href="/wellness-guides">Wellness Guides</a></li>
                    <li><a href="/benefits-of-exercises">Exercise Benefits</a></li>
                    <li><a href="/about">About Us</a></li>
                    <li><a href="/reviews">Reviews</a></li>
                </ul>
            </div>
            
            <div class="footer-section">
                <h4>Support</h4>
                <ul>
                    <li><a href="/contact-us">Contact Us</a></li>
                    <li><a href="/privacy-policy">Privacy Policy</a></li>
                    <li><a href="/donate">Support Our Mission</a></li>
                </ul>
            </div>
            
            <div class="footer-section">
                <h4>Connect With Us</h4>
                <p>Email: <a href="mailto:${contactEmail}">${contactEmail}</a></p>
                <p>For expert guidance and personalized support</p>
            </div>
        </div>
        
        <div class="footer-bottom">
            <p>&copy; 2025 GoEvergreen. All rights reserved. | <a href="/privacy-policy">Privacy Policy</a></p>
        </div>
    </footer>
    
    <!-- JavaScript -->
    <script>
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
    
    /* Header Styles */
    .site-header {
        background: linear-gradient(135deg, #7a9b8e 0%, #a8c09a 100%);
        box-shadow: 0 2px 10px rgba(122, 155, 142, 0.2);
        position: sticky;
        top: 0;
        z-index: 1000;
    }
    
    .header-container {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 2rem;
        flex-wrap: wrap;
    }
    
    .logo-section {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .logo {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
    }
    
    .site-title {
        color: white;
        font-size: 1.8rem;
        font-weight: 600;
        letter-spacing: -0.5px;
    }
    
    .main-navigation ul {
        display: flex;
        list-style: none;
        gap: 2rem;
        flex-wrap: wrap;
    }
    
    .main-navigation a {
        color: white;
        text-decoration: none;
        font-weight: 500;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        transition: all 0.3s ease;
    }
    
    .main-navigation a:hover,
    .main-navigation a.active {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
    }
    
    .cta-button {
        background: #f4f4f2;
        color: #7a9b8e;
        padding: 0.8rem 1.5rem;
        border-radius: 25px;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .cta-button:hover {
        background: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
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
    
    .form-message {
        margin-top: 1rem;
        padding: 0.5rem;
        border-radius: 5px;
        display: none;
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
    
    /* Footer */
    .site-footer {
        background: #2c3e35;
        color: #a8c09a;
        padding: 3rem 0 1rem;
    }
    
    .footer-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 2rem;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 2rem;
    }
    
    .footer-section h3,
    .footer-section h4 {
        color: white;
        margin-bottom: 1rem;
    }
    
    .footer-section ul {
        list-style: none;
    }
    
    .footer-section ul li {
        margin-bottom: 0.5rem;
    }
    
    .footer-section a {
        color: #a8c09a;
        text-decoration: none;
        transition: color 0.3s ease;
    }
    
    .footer-section a:hover {
        color: white;
    }
    
    .footer-bottom {
        max-width: 1200px;
        margin: 2rem auto 0;
        padding: 1rem 2rem;
        border-top: 1px solid #4a5a4e;
        text-align: center;
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
    
    .guide-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 2rem;
        margin: 2rem 0;
    }
    
    .guide-card {
        background: white;
        padding: 2rem;
        border-radius: 15px;
        box-shadow: 0 5px 25px rgba(122, 155, 142, 0.1);
        transition: transform 0.3s ease;
    }
    
    .guide-card:hover {
        transform: translateY(-5px);
    }
    
    .guide-card h3 {
        color: #7a9b8e;
        margin-bottom: 1rem;
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
        .header-container {
            flex-direction: column;
            gap: 1rem;
        }
        
        .main-navigation ul {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
        }
        
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
    }
  `;
}

function getCustomJS() {
  return `
    // Newsletter form handling
    document.getElementById('newsletterForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const messageDiv = document.getElementById('newsletter-message');
        const email = this.email.value;
        const name = this.name.value;
        
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
                messageDiv.textContent = 'Successfully subscribed! Check your email for confirmation.';
                messageDiv.className = 'form-message success';
                this.reset();
            } else {
                messageDiv.textContent = result.error || 'Subscription failed. Please try again.';
                messageDiv.className = 'form-message error';
            }
        } catch (error) {
            messageDiv.textContent = 'Network error. Please try again later.';
            messageDiv.className = 'form-message error';
        }
    });
    
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
    }
    
    // Track page views
    trackEvent('page_view', {
        path: window.location.pathname,
        timestamp: new Date().toISOString()
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