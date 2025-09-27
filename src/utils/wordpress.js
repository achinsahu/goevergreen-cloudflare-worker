/**
 * WordPress Content Proxy Utilities
 * Fetches and processes content from WordPress site
 */

const WORDPRESS_BASE_URL = 'https://goevergreen9.wordpress.com';

export async function getPageContent(route, env) {
  try {
    const wordpressUrl = `${WORDPRESS_BASE_URL}/${route === 'home' ? '' : route}/`;
    
    // Fetch content from WordPress
    const response = await fetch(wordpressUrl, {
      headers: {
        'User-Agent': 'GoEvergreen-Proxy/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    if (!response.ok) {
      throw new Error(`WordPress fetch failed: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Process and clean the HTML
    return processWordPressHTML(html, route, env);
    
  } catch (error) {
    console.error('WordPress content fetch error:', error);
    
    // Return fallback content based on route
    return getFallbackContent(route, env);
  }
}

function processWordPressHTML(html, route, env) {
  // Remove WordPress branding and unwanted elements
  let processedHTML = html
    // Remove WordPress.com branding
    .replace(/Design a site like this with WordPress\.com[\s\S]*?Get started/gi, '')
    .replace(/wordpress\.com/gi, '')
    .replace(/wp-content/gi, 'assets')
    
    // Remove WordPress toolbar and admin elements
    .replace(/<div[^>]*class="[^"]*wp-[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<script[^>]*wp-[^>]*[\s\S]*?<\/script>/gi, '')
    
    // Remove "Skip to content" link
    .replace(/Skip to content/gi, '')
    
    // Clean up WordPress-specific CSS classes
    .replace(/wp-block-/gi, 'content-block-')
    .replace(/wordpress/gi, 'goevergreen')
    
    // Remove subscription forms and WordPress branding
    .replace(/<form[^>]*subscribe[^>]*>[\s\S]*?<\/form>/gi, '')
    .replace(/Subscribe[\s\n]*Subscribed/gi, '')
    .replace(/Already have a WordPress\.com account\?[\s\S]*?Log in now\./gi, '')
    
    // Remove WordPress footer elements
    .replace(/Report this content[\s\S]*?Collapse this bar/gi, '');
    
  // Extract main content
  const contentMatch = processedHTML.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let mainContent = contentMatch ? contentMatch[1] : processedHTML;
  
  // Further clean the main content
  mainContent = mainContent
    .replace(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i, '$1')
    .replace(/<article[^>]*>([\s\S]*?)<\/article>/i, '$1')
    .replace(/<main[^>]*>([\s\S]*?)<\/main>/i, '$1');
  
  return {
    content: mainContent.trim(),
    route: route,
    title: extractTitle(html, route),
    description: extractDescription(html, route)
  };
}

function extractTitle(html, route) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  let title = titleMatch ? titleMatch[1].replace(/\s*–\s*WordPress\.com/gi, '') : '';
  
  // Custom titles for better SEO
  const customTitles = {
    'home': 'GoEvergreen - Premium Wellness & Health Guidance for Women',
    'wellness-guides': 'Comprehensive Wellness Guides - GoEvergreen',
    'benefits-of-exercises': 'Exercise Benefits & Fitness Tips - GoEvergreen',
    'about': 'About GoEvergreen - Your Wellness Journey Partner',
    'blog': 'Health & Wellness Blog - GoEvergreen',
    'reviews': 'Customer Reviews & Testimonials - GoEvergreen',
    'contact-us': 'Contact GoEvergreen - Get Expert Wellness Support',
    'donate': 'Support GoEvergreen - Help Us Spread Wellness',
    'privacy-policy': 'Privacy Policy - GoEvergreen'
  };
  
  return customTitles[route] || title || 'GoEvergreen - Wellness & Health';
}

function extractDescription(html, route) {
  // Try to find meta description
  const metaMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  let description = metaMatch ? metaMatch[1] : '';
  
  // Custom descriptions for better SEO
  const customDescriptions = {
    'home': 'Discover premium wellness solutions, health guidance, and fitness tips designed specifically for women. Join thousands who trust GoEvergreen for their wellness journey.',
    'wellness-guides': 'Explore our comprehensive wellness guides covering nutrition, mental health, fitness, and holistic living. Expert advice for your complete well-being.',
    'benefits-of-exercises': 'Learn about the incredible benefits of exercise for women\'s health, including weight management, mental clarity, and disease prevention.',
    'about': 'Learn about GoEvergreen\'s mission to empower women with science-based wellness knowledge and personalized health guidance.',
    'blog': 'Stay updated with the latest wellness trends, health research, and expert tips from our team of certified wellness professionals.',
    'reviews': 'Read authentic reviews from women who transformed their health and wellness journey with GoEvergreen\'s guidance and support.',
    'contact-us': 'Get in touch with our wellness experts. We\'re here to support your health journey with personalized guidance and care.',
    'donate': 'Support our mission to make premium wellness knowledge accessible to all women. Your contribution helps us reach more lives.',
    'privacy-policy': 'Learn how GoEvergreen protects your privacy and personal information. We\'re committed to your data security and transparency.'
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
            <p>Comprehensive guides covering nutrition, mental health, and lifestyle optimization.</p>
          </div>
          <div class="feature">
            <h3>💪 Fitness Excellence</h3>
            <p>Expert exercise routines and fitness strategies tailored for women's unique needs.</p>
          </div>
          <div class="feature">
            <h3>🧠 Mental Clarity</h3>
            <p>Mindfulness practices and stress management techniques for balanced living.</p>
          </div>
        </section>
      `,
      title: 'GoEvergreen - Premium Wellness & Health Guidance for Women',
      description: 'Discover premium wellness solutions, health guidance, and fitness tips designed specifically for women.'
    },
    'wellness-guides': {
      content: `
        <h1>Comprehensive Wellness Guides</h1>
        <p>Explore our expertly crafted wellness guides designed to support your journey to optimal health.</p>
        
        <div class="guide-grid">
          <div class="guide-card">
            <h3>Nutrition Mastery</h3>
            <p>Learn the fundamentals of healthy eating, meal planning, and nutritional balance.</p>
          </div>
          <div class="guide-card">
            <h3>Mental Wellness</h3>
            <p>Discover strategies for stress management, mindfulness, and emotional well-being.</p>
          </div>
          <div class="guide-card">
            <h3>Fitness Foundation</h3>
            <p>Build strength, flexibility, and endurance with our comprehensive fitness programs.</p>
          </div>
          <div class="guide-card">
            <h3>Sleep Optimization</h3>
            <p>Master the art of quality sleep for better recovery and overall health.</p>
          </div>
        </div>
      `,
      title: 'Comprehensive Wellness Guides - GoEvergreen',
      description: 'Explore our comprehensive wellness guides covering nutrition, mental health, fitness, and holistic living.'
    }
  };
  
  return fallbackContent[route] || fallbackContent['home'];
}