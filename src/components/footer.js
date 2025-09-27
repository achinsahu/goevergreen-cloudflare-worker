/**
 * Footer Component for GoEvergreen Website
 * Handles footer content, links, and contact information
 */

export function generateFooter(pathname, env) {
  const domain = env.DOMAIN || 'goevergreen.shop';
  const contactEmail = env.CONTACT_EMAIL || 'info@goevergreen.shop';
  
  return `
    <footer class="site-footer">
        <div class="footer-container">
            <div class="footer-section">
                <h3>🌿 GoEvergreen</h3>
                <p>Empowering women with premium wellness guidance and health solutions.</p>
                <p>Your trusted partner in achieving optimal health and vitality through science-based wellness strategies.</p>
            </div>
            
            <div class="footer-section">
                <h4>Wellness Resources</h4>
                <ul>
                    <li><a href="/wellness-guides" aria-label="Comprehensive wellness guides">Wellness Guides</a></li>
                    <li><a href="/benefits-of-exercises" aria-label="Exercise benefits and fitness tips">Exercise Benefits</a></li>
                    <li><a href="/blog" aria-label="Health and wellness blog">Health Blog</a></li>
                    <li><a href="/reviews" aria-label="Customer reviews and testimonials">Customer Reviews</a></li>
                </ul>
            </div>
            
            <div class="footer-section">
                <h4>Support & Information</h4>
                <ul>
                    <li><a href="/about" aria-label="About GoEvergreen">About Us</a></li>
                    <li><a href="/contact-us" aria-label="Contact our support team">Contact Support</a></li>
                    <li><a href="/privacy-policy" aria-label="Privacy policy">Privacy Policy</a></li>
                    <li><a href="/donate" aria-label="Support our mission">Support Our Mission</a></li>
                </ul>
            </div>
            
            <div class="footer-section">
                <h4>Connect With Us</h4>
                <div class="contact-info">
                    <p>📧 <strong>Email:</strong></p>
                    <p><a href="mailto:${contactEmail}" aria-label="Send us an email">${contactEmail}</a></p>
                    
                    <p>💌 <strong>Newsletter:</strong></p>
                    <p>Get expert wellness tips delivered to your inbox</p>
                    
                    <p>🌐 <strong>Website:</strong></p>
                    <p><a href="https://${domain}" aria-label="Visit our website">https://${domain}</a></p>
                </div>
            </div>
        </div>
        
        <div class="footer-bottom">
            <div class="footer-bottom-content">
                <p>&copy; ${new Date().getFullYear()} GoEvergreen. All rights reserved.</p>
                <div class="footer-links">
                    <a href="/privacy-policy" aria-label="Privacy policy">Privacy Policy</a>
                    <span class="separator">•</span>
                    <a href="/contact-us" aria-label="Contact us">Contact</a>
                    <span class="separator">•</span>
                    <a href="/sitemap.xml" aria-label="Site map">Sitemap</a>
                </div>
            </div>
        </div>
    </footer>
  `;
}

export function getFooterStyles() {
  return `
    /* Footer Styles */
    .site-footer {
        background: linear-gradient(135deg, #2c3e35 0%, #3a4f42 100%);
        color: #a8c09a;
        padding: 3rem 0 0;
        margin-top: 4rem;
        position: relative;
    }
    
    .site-footer::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #7a9b8e 0%, #a8c09a 50%, #7a9b8e 100%);
    }
    
    .footer-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 2rem 2rem;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 2.5rem;
    }
    
    .footer-section {
        padding: 1rem;
    }
    
    .footer-section h3 {
        color: white;
        margin-bottom: 1.5rem;
        font-size: 1.5rem;
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    
    .footer-section h4 {
        color: #e8f5e8;
        margin-bottom: 1.2rem;
        font-size: 1.2rem;
        font-weight: 600;
        border-bottom: 2px solid #7a9b8e;
        padding-bottom: 0.5rem;
    }
    
    .footer-section p {
        margin-bottom: 1rem;
        line-height: 1.6;
        color: #c8d5ca;
    }
    
    .footer-section ul {
        list-style: none;
        padding: 0;
    }
    
    .footer-section ul li {
        margin-bottom: 0.8rem;
        position: relative;
        padding-left: 1.2rem;
    }
    
    .footer-section ul li::before {
        content: '🌿';
        position: absolute;
        left: 0;
        top: 0;
        font-size: 0.8rem;
    }
    
    .footer-section a {
        color: #a8c09a;
        text-decoration: none;
        transition: all 0.3s ease;
        position: relative;
    }
    
    .footer-section a:hover {
        color: white;
        padding-left: 0.5rem;
    }
    
    .footer-section a:hover::before {
        content: '→';
        position: absolute;
        left: -0.5rem;
        transition: all 0.3s ease;
    }
    
    .contact-info p {
        margin-bottom: 0.5rem;
    }
    
    .contact-info strong {
        color: #e8f5e8;
    }
    
    .footer-bottom {
        background: rgba(0, 0, 0, 0.2);
        border-top: 1px solid #4a5a4e;
        padding: 1.5rem 0;
    }
    
    .footer-bottom-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
    }
    
    .footer-links {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
    }
    
    .footer-links a {
        color: #a8c09a;
        text-decoration: none;
        font-size: 0.9rem;
        transition: color 0.3s ease;
    }
    
    .footer-links a:hover {
        color: white;
    }
    
    .separator {
        color: #7a9b8e;
        font-weight: bold;
    }
    
    /* Responsive Footer */
    @media (max-width: 768px) {
        .footer-container {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 2rem;
        }
        
        .footer-section ul li {
            padding-left: 0;
            text-align: center;
        }
        
        .footer-section ul li::before {
            display: none;
        }
        
        .footer-bottom-content {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
        }
        
        .footer-links {
            justify-content: center;
        }
    }
    
    @media (max-width: 480px) {
        .site-footer {
            padding: 2rem 0 0;
            margin-top: 2rem;
        }
        
        .footer-container {
            padding: 0 1rem 1rem;
        }
        
        .footer-section {
            padding: 0.5rem;
        }
        
        .footer-section h3 {
            font-size: 1.3rem;
        }
        
        .footer-section h4 {
            font-size: 1.1rem;
        }
        
        .footer-links {
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .separator {
            display: none;
        }
    }
    
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
        .site-footer {
            background: linear-gradient(135deg, #1a2520 0%, #2a3530 100%);
        }
        
        .footer-section h3,
        .footer-section h4 {
            color: #e8f5e8;
        }
        
        .footer-section p {
            color: #b8c5ba;
        }
        
        .footer-section a {
            color: #98b99a;
        }
        
        .footer-section a:hover {
            color: #e8f5e8;
        }
    }
    
    /* Print styles */
    @media print {
        .site-footer {
            background: none !important;
            color: #000 !important;
            padding: 1rem 0 !important;
            border-top: 1px solid #ccc;
        }
        
        .footer-section h3,
        .footer-section h4,
        .footer-section p,
        .footer-section a {
            color: #000 !important;
        }
        
        .footer-bottom {
            background: none !important;
            border-top: 1px solid #ccc;
        }
        
        .footer-section ul li::before {
            content: '•' !important;
        }
    }
  `;
}