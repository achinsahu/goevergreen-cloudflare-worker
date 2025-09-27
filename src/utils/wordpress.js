/**
 * WordPress Content Proxy Utilities
 * Fetches and processes content from WordPress site with robust error handling
 * Now includes CSS preservation and admin panel routing
 */

const WORDPRESS_BASE_URL = 'https://goevergreen9.wordpress.com';
const FETCH_TIMEOUT = 15000; // 15 seconds for admin pages
const MAX_RETRIES = 2;

// WordPress admin URLs that should be proxied without custom header/footer
const ADMIN_PATHS = [
  '/wp-admin',
  '/wp-login.php',
  '/wp-content',
  '/wp-includes',
  '/xmlrpc.php',
  '/wp-json',
  '/wp-cron.php'
];

export async function getPageContent(route, env, isAdmin = false) {
  let lastError = null;
  
  // Try fetching with retries
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      let wordpressUrl;
      
      // Handle admin routes differently
      if (isAdmin) {
        wordpressUrl = `${env.WORDPRESS_BASE_URL || WORDPRESS_BASE_URL}${route}`;
      } else {
        wordpressUrl = `${env.WORDPRESS_BASE_URL || WORDPRESS_BASE_URL}/${route === 'home' ? '' : route}/`;
      }
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
      
      console.log(`Fetching WordPress content: ${wordpressUrl} (attempt ${attempt})`);
      
      const response = await fetch(wordpressUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'GoEvergreen-Proxy/1.0 (Wellness Website)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Cache-Control': 'no-cache',
          'Referer': env.WORDPRESS_BASE_URL || WORDPRESS_BASE_URL,
          // Forward cookies for admin authentication
          ...(isAdmin && { 'Cookie': getCookiesFromRequest() })
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      
      if (!html || html.trim().length === 0) {
        throw new Error('Empty response from WordPress');
      }
      
      // Process HTML differently for admin vs regular pages
      if (isAdmin) {
        return processWordPressAdminHTML(html, route, env, response);
      } else {
        return processWordPressHTML(html, route, env);
      }
      
    } catch (error) {
      lastError = error;
      console.error(`WordPress fetch error (attempt ${attempt}/${MAX_RETRIES}):`, error.message);
      
      if (error.name === 'AbortError') {
        console.log('WordPress request timed out');
      }
      
      // Wait before retry (except on last attempt)
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  
  console.error(`All WordPress fetch attempts failed for route ${route}:`, lastError?.message);
  
  if (isAdmin) {
    // Return minimal admin error page
    return {
      content: '<div class="admin-error">Admin panel temporarily unavailable. Please try again.</div>',
      isAdmin: true,
      title: 'Admin Panel - GoEvergreen',
      description: 'WordPress Admin Panel'
    };
  }
  
  return getFallbackContent(route, env);
}

function processWordPressAdminHTML(html, route, env, response) {
  try {
    // For admin pages, preserve most of the original HTML but update domains
    let processedHTML = html
      // Update WordPress.com references to custom domain
      .replace(/goevergreen9\.wordpress\.com/gi, env.DOMAIN || 'goevergreen.shop')
      .replace(/https:\/\/wordpress\.com/gi, `https://${env.DOMAIN || 'goevergreen.shop'}`)
      
      // Keep admin functionality but update branding where safe
      .replace(/WordPress\.com/gi, 'GoEvergreen Admin')
      .replace(/wp\.com/gi, env.DOMAIN || 'goevergreen.shop');
    
    // Extract cookies for session management
    const cookies = response.headers.get('set-cookie') || '';
    
    return {
      content: processedHTML,
      isAdmin: true,
      title: extractTitle(html, route) || 'GoEvergreen Admin',
      description: 'WordPress Admin Panel for GoEvergreen',
      cookies: cookies
    };
  } catch (error) {
    console.error('Admin HTML processing error:', error);
    return {
      content: '<div class="admin-error">Admin panel processing failed. Please try again.</div>',
      isAdmin: true,
      title: 'Admin Error - GoEvergreen',
      description: 'WordPress Admin Panel Error'
    };
  }
}

function processWordPressHTML(html, route, env) {
  try {
    // Extract CSS links and inline styles BEFORE removing content
    const cssLinks = extractCSSLinks(html);
    const inlineStyles = extractInlineStyles(html);
    
    // Remove WordPress branding and unwanted elements while preserving CSS
    let processedHTML = html
      // Remove WordPress.com branding but keep functional elements
      .replace(/Design a site like this with WordPress\.com[\s\S]*?Get started/gi, '')
      .replace(/Create a website or blog at WordPress\.com/gi, '')
      .replace(/Powered by WordPress\.com/gi, '')
      
      // Remove admin-specific elements from public pages
      .replace(/<div[^>]*id="wpadminbar"[^>]*>[\s\S]*?<\/div>/gi, '')
      .replace(/<script[^>]*wp-admin[^>]*>[\s\S]*?<\/script>/gi, '')
      
      // Remove subscription forms but keep other forms
      .replace(/<form[^>]*class="[^"]*subscribe[^"]*"[^>]*>[\s\S]*?<\/form>/gi, '')
      .replace(/Subscribe[\s\n]*Subscribed/gi, '')
      
      // Remove WordPress.com promotional elements
      .replace(/Already have a WordPress\.com account\?[\s\S]*?Log in now\./gi, '')
      .replace(/Report this content[\s\S]*?Collapse this bar/gi, '')
      
      // Clean up navigation but preserve structure
      .replace(/"Skip to content"/gi, '"Skip to main content"')
      
      // Update internal links to use custom domain
      .replace(/https:\/\/goevergreen9\.wordpress\.com/gi, `https://${env.DOMAIN || 'goevergreen.shop'}`)
      .replace(/goevergreen9\.wordpress\.com/gi, env.DOMAIN || 'goevergreen.shop')
      
      // Clean up empty elements
      .replace(/<div[^>]*>\s*<\/div>/gi, '')
      .replace(/<p[^>]*>\s*<\/p>/gi, '')
      .replace(/<span[^>]*>\s*<\/span>/gi, '');
    
    // Extract main content more reliably
    let mainContent = extractMainContent(processedHTML);
    
    // Preserve extracted CSS
    if (cssLinks.length > 0 || inlineStyles) {
      const cssSection = `
        <!-- Preserved WordPress CSS -->
        ${cssLinks.join('\n        ')}
        ${inlineStyles ? `<style>${inlineStyles}</style>` : ''}
        <!-- End WordPress CSS -->
      `;
      mainContent = cssSection + mainContent;
    }
    
    // If no content extracted, use fallback
    if (!mainContent || mainContent.trim().length < 50) {
      console.warn(`Insufficient content extracted for route ${route}, using fallback`);
      return getFallbackContent(route, env);
    }
    
    return {
      content: mainContent.trim(),
      route: route,
      title: extractTitle(html, route),
      description: extractDescription(html, route),
      cssLinks: cssLinks,
      isAdmin: false
    };
  } catch (error) {
    console.error('HTML processing error:', error);
    return getFallbackContent(route, env);
  }
}

function extractCSSLinks(html) {
  const cssLinks = [];
  const linkRegex = /<link[^>]+rel=["']stylesheet["'][^>]*>/gi;
  let match;
  
  while ((match = linkRegex.exec(html)) !== null) {
    let link = match[0];
    // Update WordPress.com CSS URLs to use proxy or CDN
    link = link.replace(/https:\/\/[^\s"']+\.wordpress\.com/gi, '');
    // Only include if it's not an admin-specific stylesheet
    if (!link.includes('wp-admin') && !link.includes('login')) {
      cssLinks.push(link);
    }
  }
  
  return cssLinks;
}

function extractInlineStyles(html) {
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let styles = '';
  let match;
  
  while ((match = styleRegex.exec(html)) !== null) {
    const styleContent = match[1];
    // Skip admin-specific styles
    if (!styleContent.includes('wp-admin') && !styleContent.includes('#wpadminbar')) {
      styles += styleContent + '\n';
    }
  }
  
  return styles.trim();
}

function extractMainContent(html) {
  // Try multiple selectors to find main content, prioritizing semantic elements
  const contentSelectors = [
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class="[^"]*post-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*id="content"[^>]*>([\s\S]*?)<\/div>/i,
    /<section[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/section>/i,
    /<body[^>]*>([\s\S]*?)<\/body>/i
  ];
  
  for (const selector of contentSelectors) {
    const match = html.match(selector);
    if (match && match[1] && match[1].trim().length > 100) {
      let content = match[1].trim();
      // Remove header and footer from extracted content
      content = content.replace(/<header[\s\S]*?<\/header>/gi, '');
      content = content.replace(/<footer[\s\S]*?<\/footer>/gi, '');
      content = content.replace(/<nav[^>]*class="[^"]*main[^"]*"[^>]*>[\s\S]*?<\/nav>/gi, '');
      
      if (content.trim().length > 50) {
        return content.trim();
      }
    }
  }
  
  // Fallback: return everything between body tags
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch ? bodyMatch[1].trim() : html;
}

function extractTitle(html, route) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  let title = titleMatch ? titleMatch[1]
    .replace(/\s*–\s*WordPress\.com/gi, '')
    .replace(/\s*\|\s*WordPress\.com/gi, '')
    .replace(/WordPress\.com/gi, '')
    .trim() : '';
  
  // Custom titles for better SEO
  const customTitles = {
    'home': 'GoEvergreen - Premium Wellness & Health Guidance for Women',
    'wellness-guides': 'Comprehensive Wellness Guides - GoEvergreen',
    'benefits-of-exercises': 'Exercise Benefits & Fitness Tips - GoEvergreen',
    'about': 'About GoEvergreen - Your Wellness Journey Partner',
    'blog': 'Health & Wellness Blog - GoEvergreen',
    'reviews': 'Customer Reviews & Testimonials - GoEvergreen',
    'reveiws': 'Customer Reviews & Testimonials - GoEvergreen', // Handle typo
    'contact-us': 'Contact GoEvergreen - Get Expert Wellness Support',
    'donate': 'Support GoEvergreen - Help Us Spread Wellness',
    'privacy-policy': 'Privacy Policy - GoEvergreen',
    'privay-policy': 'Privacy Policy - GoEvergreen' // Handle typo
  };
  
  return customTitles[route] || title || 'GoEvergreen - Wellness & Health';
}

function extractDescription(html, route) {
  // Try to find meta description
  const metaMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  let description = metaMatch ? metaMatch[1].replace(/WordPress\.com/gi, '').trim() : '';
  
  // Custom descriptions for better SEO
  const customDescriptions = {
    'home': 'Discover premium wellness solutions, health guidance, and fitness tips designed specifically for women. Join thousands who trust GoEvergreen for their wellness journey.',
    'wellness-guides': 'Explore our comprehensive wellness guides covering nutrition, mental health, fitness, and holistic living. Expert advice for your complete well-being.',
    'benefits-of-exercises': 'Learn about the incredible benefits of exercise for women\'s health, including weight management, mental clarity, and disease prevention.',
    'about': 'Learn about GoEvergreen\'s mission to empower women with science-based wellness knowledge and personalized health guidance.',
    'blog': 'Stay updated with the latest wellness trends, health research, and expert tips from our team of certified wellness professionals.',
    'reviews': 'Read authentic reviews from women who transformed their health and wellness journey with GoEvergreen\'s guidance and support.',
    'reveiws': 'Read authentic reviews from women who transformed their health and wellness journey with GoEvergreen\'s guidance and support.',
    'contact-us': 'Get in touch with our wellness experts. We\'re here to support your health journey with personalized guidance and care.',
    'donate': 'Support our mission to make premium wellness knowledge accessible to all women. Your contribution helps us reach more lives.',
    'privacy-policy': 'Learn how GoEvergreen protects your privacy and personal information. We\'re committed to your data security and transparency.',
    'privay-policy': 'Learn how GoEvergreen protects your privacy and personal information. We\'re committed to your data security and transparency.'
  };
  
  return customDescriptions[route] || description || 'GoEvergreen - Premium wellness and health guidance for women';
}

function getCookiesFromRequest() {
  // This would be implemented to forward authentication cookies
  // For now, return empty string
  return '';
}

export function isAdminPath(pathname) {
  return ADMIN_PATHS.some(path => pathname.startsWith(path));
}

function getFallbackContent(route, env) {
  const fallbackContent = {
    'home': {
      content: `
        <div class="hero-section">
          <h1>Welcome to GoEvergreen</h1>
          <p>Your premium destination for wellness, health, and fitness guidance designed specifically for women.</p>
          <div class="cta-buttons">
            <a href="/wellness-guides" class="btn btn-primary">Explore Wellness Guides</a>
            <a href="/benefits-of-exercises" class="btn btn-secondary">Fitness Benefits</a>
          </div>
        </div>
        
        <section class="features">
          <div class="feature">
            <h3>🌿 Holistic Wellness</h3>
            <p>Comprehensive guides covering nutrition, mental health, and lifestyle optimization tailored for modern women.</p>
          </div>
          <div class="feature">
            <h3>💪 Fitness Excellence</h3>
            <p>Expert exercise routines and fitness strategies designed for women's unique physiological needs and goals.</p>
          </div>
          <div class="feature">
            <h3>🧠 Mental Clarity</h3>
            <p>Mindfulness practices and stress management techniques for achieving balanced, purposeful living.</p>
          </div>
        </section>
      `,
      title: 'GoEvergreen - Premium Wellness & Health Guidance for Women',
      description: 'Discover premium wellness solutions, health guidance, and fitness tips designed specifically for women.'
    },
    'wellness-guides': {
      content: `
        <h1>Comprehensive Wellness Guides</h1>
        <p>Explore our expertly crafted wellness guides designed to support your journey to optimal health and vitality.</p>
        
        <div class="guide-grid">
          <div class="guide-card">
            <h3>🍎 Nutrition Mastery</h3>
            <p>Learn the fundamentals of healthy eating, meal planning, and nutritional balance for sustainable wellness.</p>
          </div>
          <div class="guide-card">
            <h3>🧘 Mental Wellness</h3>
            <p>Discover evidence-based strategies for stress management, mindfulness, and emotional well-being.</p>
          </div>
          <div class="guide-card">
            <h3>🏃 Fitness Foundation</h3>
            <p>Build strength, flexibility, and endurance with our comprehensive fitness programs for women.</p>
          </div>
          <div class="guide-card">
            <h3>🌛 Sleep Optimization</h3>
            <p>Master the science of quality sleep for better recovery, mental clarity, and overall health.</p>
          </div>
        </div>
      `,
      title: 'Comprehensive Wellness Guides - GoEvergreen',
      description: 'Explore our comprehensive wellness guides covering nutrition, mental health, fitness, and holistic living.'
    },
    'benefits-of-exercises': {
      content: `
        <h1>The Transformative Benefits of Exercise for Women</h1>
        <p>Discover how regular physical activity can revolutionize your health, energy, and quality of life.</p>
        
        <div class="benefits-grid">
          <div class="benefit-card">
            <h3>💪 Physical Strength</h3>
            <p>Build lean muscle mass, improve bone density, and enhance overall physical capabilities.</p>
          </div>
          <div class="benefit-card">
            <h3>🧠 Mental Clarity</h3>
            <p>Boost cognitive function, reduce anxiety, and enhance mood through endorphin release.</p>
          </div>
          <div class="benefit-card">
            <h3>❤️ Heart Health</h3>
            <p>Strengthen cardiovascular system, lower blood pressure, and reduce disease risk.</p>
          </div>
          <div class="benefit-card">
            <h3>⚖️ Weight Management</h3>
            <p>Maintain healthy weight, boost metabolism, and improve body composition naturally.</p>
          </div>
        </div>
      `,
      title: 'Exercise Benefits & Fitness Tips - GoEvergreen',
      description: 'Learn about the incredible benefits of exercise for women\'s health, including weight management, mental clarity, and disease prevention.'
    },
    'about': {
      content: `
        <h1>About GoEvergreen</h1>
        <p>Empowering women with science-based wellness knowledge and personalized health guidance.</p>
        
        <div class="about-content">
          <h2>Our Mission</h2>
          <p>At GoEvergreen, we believe every woman deserves access to premium wellness resources and expert guidance. Our mission is to provide evidence-based health information that empowers you to make informed decisions about your well-being.</p>
          
          <h2>What We Offer</h2>
          <ul>
            <li>Comprehensive wellness guides tailored for women</li>
            <li>Expert fitness and nutrition advice</li>
            <li>Mental health and mindfulness resources</li>
            <li>Personalized wellness support</li>
          </ul>
          
          <h2>Why Choose GoEvergreen?</h2>
          <p>Our content is created by certified wellness professionals and backed by scientific research. We focus specifically on women's unique health needs and challenges, providing practical, actionable guidance you can trust.</p>
        </div>
      `,
      title: 'About GoEvergreen - Your Wellness Journey Partner',
      description: 'Learn about GoEvergreen\'s mission to empower women with science-based wellness knowledge and personalized health guidance.'
    },
    'contact-us': {
      content: `
        <h1>Contact GoEvergreen</h1>
        <p>We're here to support your wellness journey. Get in touch with our team of experts.</p>
        
        <div class="contact-info">
          <div class="contact-method">
            <h3>📧 Email Support</h3>
            <p>For general inquiries and support:</p>
            <p><a href="mailto:info@goevergreen.shop">info@goevergreen.shop</a></p>
          </div>
          
          <div class="contact-method">
            <h3>💬 Expert Consultation</h3>
            <p>Schedule a personalized wellness consultation with our certified professionals.</p>
          </div>
          
          <div class="contact-method">
            <h3>📱 Follow Us</h3>
            <p>Stay connected for daily wellness tips and updates.</p>
          </div>
        </div>
        
        <div class="contact-form-placeholder">
          <p><em>Contact form will be available soon. For immediate assistance, please email us directly.</em></p>
        </div>
      `,
      title: 'Contact GoEvergreen - Get Expert Wellness Support',
      description: 'Get in touch with our wellness experts. We\'re here to support your health journey with personalized guidance and care.'
    }
  };
  
  return fallbackContent[route] || fallbackContent['home'];
}