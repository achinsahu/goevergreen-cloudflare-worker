/**
 * WordPress Content Proxy Utilities
 * Fetches and processes content from WordPress site with robust error handling
 */

const WORDPRESS_BASE_URL = 'https://goevergreen9.wordpress.com';
const FETCH_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 2;

export async function getPageContent(route, env) {
  let lastError = null;
  
  // Try fetching with retries
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const wordpressUrl = `${env.WORDPRESS_BASE_URL || WORDPRESS_BASE_URL}/${route === 'home' ? '' : route}/`;
      
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
          'Cache-Control': 'no-cache'
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
      
      // Process and clean the HTML
      return processWordPressHTML(html, route, env);
      
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
  return getFallbackContent(route, env);
}

function processWordPressHTML(html, route, env) {
  try {
    // Remove WordPress branding and unwanted elements
    let processedHTML = html
      // Remove WordPress.com branding
      .replace(/Design a site like this with WordPress\.com[\s\S]*?Get started/gi, '')
      .replace(/wordpress\.com/gi, '')
      .replace(/wp-content/gi, 'assets')
      .replace(/wp-admin/gi, '')
      .replace(/wp-includes/gi, '')
      
      // Remove WordPress toolbar and admin elements
      .replace(/<div[^>]*class="[^"]*wp-[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
      .replace(/<script[^>]*wp-[^>]*[\s\S]*?<\/script>/gi, '')
      .replace(/<link[^>]*wp-[^>]*[^>]*>/gi, '')
      
      // Remove "Skip to content" link
      .replace(/Skip to content/gi, '')
      
      // Clean up WordPress-specific CSS classes
      .replace(/wp-block-/gi, 'content-block-')
      .replace(/\bwordpress\b/gi, 'goevergreen')
      
      // Remove subscription forms and WordPress branding
      .replace(/<form[^>]*subscribe[^>]*>[\s\S]*?<\/form>/gi, '')
      .replace(/Subscribe[\s\n]*Subscribed/gi, '')
      .replace(/Already have a WordPress\.com account\?[\s\S]*?Log in now\./gi, '')
      
      // Remove WordPress footer elements
      .replace(/Report this content[\s\S]*?Collapse this bar/gi, '')
      .replace(/Powered by WordPress\.com/gi, '')
      .replace(/Create a website or blog at WordPress\.com/gi, '')
      
      // Remove WordPress navigation elements
      .replace(/<nav[^>]*wp-[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<div[^>]*wp-nav[^>]*>[\s\S]*?<\/div>/gi, '')
      
      // Remove WordPress comments system
      .replace(/<div[^>]*comment[^>]*>[\s\S]*?<\/div>/gi, '')
      .replace(/Leave a comment/gi, '')
      
      // Clean up empty elements
      .replace(/<div[^>]*>\s*<\/div>/gi, '')
      .replace(/<p[^>]*>\s*<\/p>/gi, '')
      .replace(/<span[^>]*>\s*<\/span>/gi, '');
    
    // Extract main content more reliably
    let mainContent = extractMainContent(processedHTML);
    
    // If no content extracted, use fallback
    if (!mainContent || mainContent.trim().length < 50) {
      console.warn(`Insufficient content extracted for route ${route}, using fallback`);
      return getFallbackContent(route, env);
    }
    
    return {
      content: mainContent.trim(),
      route: route,
      title: extractTitle(html, route),
      description: extractDescription(html, route)
    };
  } catch (error) {
    console.error('HTML processing error:', error);
    return getFallbackContent(route, env);
  }
}

function extractMainContent(html) {
  // Try multiple selectors to find main content
  const contentSelectors = [
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class="[^"]*post[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<body[^>]*>([\s\S]*?)<\/body>/i
  ];
  
  for (const selector of contentSelectors) {
    const match = html.match(selector);
    if (match && match[1] && match[1].trim().length > 100) {
      return match[1].trim();
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