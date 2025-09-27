/**
 * Header Component for GoEvergreen Website
 * Handles navigation, logo, and responsive design
 */

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
                <a href="#newsletter" class="cta-button" aria-label="Subscribe to newsletter">Get Expert Guidance</a>
            </div>
        </div>
    </header>
  `;
}

export function getHeaderStyles() {
  return `
    /* Header Styles */
    .site-header {
        background: linear-gradient(135deg, #7a9b8e 0%, #a8c09a 100%);
        box-shadow: 0 2px 10px rgba(122, 155, 142, 0.2);
        position: sticky;
        top: 0;
        z-index: 1000;
        border-bottom: 3px solid #7a9b8e;
    }
    
    .header-container {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 2rem;
        min-height: 70px;
        position: relative;
    }
    
    .logo-section {
        display: flex;
        align-items: center;
        z-index: 1001;
    }
    
    .logo-link {
        display: flex;
        align-items: center;
        gap: 1rem;
        text-decoration: none;
        transition: transform 0.3s ease;
    }
    
    .logo-link:hover {
        transform: scale(1.05);
    }
    
    .logo {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid rgba(255, 255, 255, 0.3);
        transition: border-color 0.3s ease;
    }
    
    .logo:hover {
        border-color: rgba(255, 255, 255, 0.8);
    }
    
    .site-title {
        color: white;
        font-size: 1.8rem;
        font-weight: 600;
        letter-spacing: -0.5px;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    
    .main-navigation {
        position: relative;
    }
    
    .mobile-menu-toggle {
        display: none;
        flex-direction: column;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        gap: 4px;
        z-index: 1001;
    }
    
    .mobile-menu-toggle span {
        width: 25px;
        height: 3px;
        background: white;
        border-radius: 2px;
        transition: all 0.3s ease;
    }
    
    .mobile-menu-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .mobile-menu-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .mobile-menu-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
    .nav-menu {
        display: flex;
        list-style: none;
        gap: 1.5rem;
        margin: 0;
        padding: 0;
        align-items: center;
    }
    
    .nav-link {
        color: white;
        text-decoration: none;
        font-weight: 500;
        padding: 0.7rem 1.2rem;
        border-radius: 25px;
        transition: all 0.3s ease;
        position: relative;
        font-size: 0.95rem;
    }
    
    .nav-link:hover,
    .nav-link.active {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    .nav-link.active::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 50%;
        transform: translateX(-50%);
        width: 20px;
        height: 2px;
        background: white;
        border-radius: 1px;
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
        border: 2px solid transparent;
        white-space: nowrap;
    }
    
    .cta-button:hover {
        background: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        border-color: rgba(122, 155, 142, 0.3);
    }
    
    /* Mobile Styles */
    @media (max-width: 1024px) {
        .nav-menu {
            gap: 1rem;
        }
        
        .nav-link {
            padding: 0.6rem 1rem;
            font-size: 0.9rem;
        }
    }
    
    @media (max-width: 768px) {
        .header-container {
            padding: 1rem;
        }
        
        .mobile-menu-toggle {
            display: flex;
        }
        
        .nav-menu {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #7a9b8e 0%, #a8c09a 100%);
            flex-direction: column;
            padding: 1rem;
            gap: 0.5rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            border-radius: 0 0 15px 15px;
            z-index: 1000;
        }
        
        .nav-menu.active {
            display: flex;
        }
        
        .nav-link {
            width: 100%;
            text-align: center;
            padding: 1rem;
            margin: 0;
        }
        
        .header-cta {
            order: 3;
            margin-left: 1rem;
        }
        
        .cta-button {
            padding: 0.6rem 1rem;
            font-size: 0.9rem;
        }
    }
    
    @media (max-width: 480px) {
        .site-title {
            font-size: 1.5rem;
        }
        
        .logo {
            width: 40px;
            height: 40px;
        }
        
        .header-container {
            padding: 0.8rem;
        }
        
        .nav-menu {
            padding: 0.5rem;
        }
        
        .nav-link {
            padding: 0.8rem;
            font-size: 0.95rem;
        }
        
        .cta-button {
            padding: 0.5rem 0.8rem;
            font-size: 0.85rem;
        }
    }
    
    /* Accessibility improvements */
    @media (prefers-reduced-motion: reduce) {
        .logo-link,
        .nav-link,
        .cta-button,
        .mobile-menu-toggle span {
            transition: none;
        }
    }
    
    /* High contrast mode */
    @media (prefers-contrast: high) {
        .nav-link {
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .nav-link:hover,
        .nav-link.active {
            border-color: white;
        }
        
        .cta-button {
            border: 2px solid #7a9b8e;
        }
    }
  `;
}

export function getHeaderJS() {
  return `
    // Mobile menu toggle functionality
    document.addEventListener('DOMContentLoaded', function() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (mobileMenuToggle && navMenu) {
            mobileMenuToggle.addEventListener('click', function() {
                navMenu.classList.toggle('active');
                mobileMenuToggle.classList.toggle('active');
                
                // Update ARIA attributes
                const isExpanded = navMenu.classList.contains('active');
                mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', function(e) {
                if (!mobileMenuToggle.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('active');
                    mobileMenuToggle.classList.remove('active');
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                }
            });
            
            // Close menu on escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    mobileMenuToggle.classList.remove('active');
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                    mobileMenuToggle.focus();
                }
            });
            
            // Close menu when nav link is clicked (mobile)
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
    });
  `;
}