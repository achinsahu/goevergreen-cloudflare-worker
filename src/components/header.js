export function generateHeader(pathname, env) {
  const domain = env.DOMAIN || 'goevergreen.shop';
  const contactEmail = env.CONTACT_EMAIL || 'info@goevergreen.shop';
  return `
    <header class="site-header">
      <div class="header-container">
        <div class="logo-section">
          <a href="/" class="logo-link">
            <img src="/assets/favicon.ico" alt="GoEvergreen Logo" class="logo" loading="eager">
            <span class="site-title">GoEvergreen</span>
          </a>
        </div>
        <nav class="main-navigation" role="navigation" aria-label="Main menu">
          <button class="mobile-menu-toggle" aria-label="Toggle mobile menu" id="mobileMenuToggle">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <ul class="nav-menu" id="navMenu">
            <li><a href="/" class="nav-link ${pathname === '/' ? 'active' : ''}" aria-current="${pathname === '/' ? 'page' : 'false'}">Home</a></li>
            <li><a href="/wellness-guides" class="nav-link ${pathname === '/wellness-guides' ? 'active' : ''}" aria-current="${pathname === '/wellness-guides' ? 'page' : 'false'}">Wellness Guides</a></li>
            <li><a href="/benefits-of-exercises" class="nav-link ${pathname === '/benefits-of-exercises' ? 'active' : ''}" aria-current="${pathname === '/benefits-of-exercises' ? 'page' : 'false'}">Exercise Benefits</a></li>
            <li><a href="/blog" class="nav-link ${pathname === '/blog' ? 'active' : ''}" aria-current="${pathname === '/blog' ? 'page' : 'false'}">Blog</a></li>
            <li><a href="/reviews" class="nav-link ${pathname === '/reviews' ? 'active' : ''}" aria-current="${pathname === '/reviews' ? 'page' : 'false'}">Reviews</a></li>
            <li><a href="/about" class="nav-link ${pathname === '/about' ? 'active' : ''}" aria-current="${pathname === '/about' ? 'page' : 'false'}">About</a></li>
            <li><a href="/contact-us" class="nav-link ${pathname === '/contact-us' ? 'active' : ''}" aria-current="${pathname === '/contact-us' ? 'page' : 'false'}">Contact</a></li>
          </ul>
        </nav>
        <div class="header-cta">
          <!-- Scrolls smoothly to footer’s newsletter form! -->
          <a href="#newsletter-footer-form" class="cta-button" aria-label="Subscribe to newsletter" id="getExpertGuidanceBtn">
            Get Expert Guidance
          </a>
        </div>
      </div>
    </header>
  `;
}

export function getHeaderJS() {
  return `
    document.addEventListener('DOMContentLoaded', function() {
      // Mobile nav logic as usual
      const mobileMenuToggle = document.getElementById('mobileMenuToggle');
      const navMenu = document.getElementById('navMenu');
      const expertBtn = document.getElementById('getExpertGuidanceBtn');
      if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
          navMenu.classList.toggle('active');
          mobileMenuToggle.classList.toggle('active');
          mobileMenuToggle.setAttribute('aria-expanded', navMenu.classList.contains('active'));
        });
        document.addEventListener('click', function(e) {
          if (!mobileMenuToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
          }
        });
        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            mobileMenuToggle.focus();
          }
        });
        navMenu.querySelectorAll('.nav-link').forEach(link => {
          link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
              navMenu.classList.remove('active');
              mobileMenuToggle.classList.remove('active');
              mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
          });
        });
      }
      // Smooth scroll to the newsletter footer only
      if (expertBtn) {
        expertBtn.addEventListener('click', function(e) {
          e.preventDefault();
          const footerSub = document.getElementById('newsletter-footer-form');
          if (footerSub) footerSub.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
    });
  `;
}