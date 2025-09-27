# GoEvergreen Cloudflare Worker

🌿 **Premium Wellness Website** - A sophisticated Cloudflare Worker that proxies WordPress.com content with custom branding, SEO optimization, and advanced features for the wellness industry.

## 🚀 Features

- **WordPress Content Proxy**: Seamlessly fetch and display content from WordPress.com
- **Custom Branding**: Remove WordPress branding and apply GoEvergreen styling
- **SEO Optimized**: Advanced meta tags, schema markup, and social sharing
- **Mobile Responsive**: Optimized for all devices with modern CSS
- **Newsletter Integration**: Built-in subscription management
- **Contact Forms**: Direct contact form handling with D1 database storage
- **Privacy-Friendly Analytics**: GDPR compliant visitor tracking
- **Performance Optimized**: Global CDN delivery with caching
- **Nature-Themed Design**: Appealing to wellness-focused women

## 📁 Project Structure

```
goevergreen-cloudflare-worker/
├── src/
│   ├── index.js                 # Main worker entry point
│   ├── handlers/
│   │   └── router.js            # Request routing logic
│   ├── utils/
│   │   ├── wordpress.js         # WordPress content processing
│   │   ├── response.js          # HTML template generation
│   │   ├── database.js          # D1 database utilities
│   │   └── analytics.js         # Privacy-friendly analytics
│   └── assets/
│       └── logo.jpg             # GoEvergreen logo
├── migrations/
│   └── 0001_initial.sql         # Database schema
├── wrangler.toml                # Cloudflare configuration
├── package.json                 # Node.js dependencies
└── README.md                    # This file
```

## 🛠️ Installation & Deployment

### Prerequisites

1. **Cloudflare Account**: Sign up at [Cloudflare.com](https://cloudflare.com)
2. **Domain**: Add your `goevergreen.shop` domain to Cloudflare
3. **Node.js**: Install Node.js 18+ from [nodejs.org](https://nodejs.org)
4. **Git**: Install Git for version control

### Step 1: Clone the Repository

```bash
git clone https://github.com/achinsahu/goevergreen-cloudflare-worker.git
cd goevergreen-cloudflare-worker
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Wrangler

1. **Install Wrangler CLI**:
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Update wrangler.toml**:
   ```toml
   name = "goevergreen-worker"
   main = "src/index.js"
   compatibility_date = "2024-09-25"
   
   [env.production]
   route = "goevergreen.shop/*"
   
   [[env.production.d1_databases]]
   binding = "DB"
   database_name = "goevergreen-db"
   database_id = "YOUR_DATABASE_ID_HERE"
   ```

### Step 4: Create D1 Database

1. **Create the database**:
   ```bash
   wrangler d1 create goevergreen-db
   ```

2. **Copy the database ID** from the output and update `wrangler.toml`

3. **Run migrations**:
   ```bash
   wrangler d1 migrations apply goevergreen-db --remote
   ```

### Step 5: Deploy the Worker

1. **Test locally**:
   ```bash
   npm run dev
   ```

2. **Deploy to production**:
   ```bash
   npm run deploy:production
   ```

### Step 6: Configure DNS

1. Go to Cloudflare Dashboard → DNS
2. Add a CNAME record:
   - **Name**: `@` (for root domain)
   - **Target**: `goevergreen.shop`
   - **Proxy status**: ✅ Proxied

### Step 7: Set Custom Domain Route

1. Go to Cloudflare Dashboard → Workers & Pages
2. Select your worker
3. Go to Settings → Triggers
4. Add custom domain: `goevergreen.shop`

## 🔧 Configuration

### Environment Variables

Update these in your `wrangler.toml`:

```toml
[vars]
ENVIRONMENT = "production"
DOMAIN = "goevergreen.shop"
CONTACT_EMAIL = "info@goevergreen.shop"
```

### WordPress Source URLs

The worker proxies content from these WordPress.com URLs:
- Home: `https://goevergreen9.wordpress.com/`
- Wellness Guides: `https://goevergreen9.wordpress.com/wellness-guides/`
- Privacy Policy: `https://goevergreen9.wordpress.com/privay-policy/`
- Contact: `https://goevergreen9.wordpress.com/contact-us/`
- And more...

## 🎨 Customization

### Logo
Replace `src/assets/logo.jpg` with your custom logo (recommended: 200x200px, JPG/PNG)

### Colors
Edit the CSS variables in `src/utils/response.js`:
```css
:root {
  --primary-color: #7a9b8e;    /* Nature green */
  --secondary-color: #a8c09a;  /* Light green */
  --accent-color: #f4f4f2;     /* Cream white */
  --text-color: #2c3e35;       /* Dark green */
}
```

### Content
Modify fallback content in `src/utils/wordpress.js` for custom pages

## 📊 Analytics & Data

### View Analytics
Analytics data is stored in D1 database:
```bash
wrangler d1 execute goevergreen-db --command "SELECT path, COUNT(*) as views FROM page_views GROUP BY path ORDER BY views DESC;"
```

### Newsletter Subscribers
```bash
wrangler d1 execute goevergreen-db --command "SELECT COUNT(*) as subscribers FROM newsletter_subscribers WHERE unsubscribed = FALSE;"
```

### Contact Forms
```bash
wrangler d1 execute goevergreen-db --command "SELECT * FROM contact_submissions ORDER BY submitted_at DESC LIMIT 10;"
```

## 🔍 Troubleshooting

### Common Issues

#### 1. "Worker exceeded CPU time limit"
**Solution**: Optimize WordPress content processing
```javascript
// Add caching headers
response.headers.set('Cache-Control', 'public, max-age=300');
```

#### 2. "Database binding not found"
**Solution**: Ensure D1 database is properly configured in wrangler.toml
```bash
wrangler d1 list  # Check if database exists
```

#### 3. "Route not working"
**Solution**: Verify DNS and route configuration
```bash
wrangler routes list  # Check current routes
```

#### 4. "WordPress content not loading"
**Solution**: Check WordPress site availability
```javascript
// Add error handling in wordpress.js
if (!response.ok) {
  console.log('WordPress fetch failed:', response.status);
  return getFallbackContent(route, env);
}
```

#### 5. "Logo not displaying"
**Solution**: Ensure logo is properly uploaded
```bash
# Check if logo file exists
ls -la src/assets/logo.jpg
```

### Debug Mode

Enable debug logging:
```bash
wrangler tail  # View real-time logs
```

### Database Issues

**Reset database**:
```bash
wrangler d1 execute goevergreen-db --command "DROP TABLE IF EXISTS page_views;"
wrangler d1 migrations apply goevergreen-db --remote
```

**Backup data**:
```bash
wrangler d1 execute goevergreen-db --command ".dump" --json
```

## 🚨 Error Handling

### WordPress.com Down
- Automatic fallback to custom content
- Cached content served when available
- Error logging for monitoring

### Database Errors
- Graceful degradation (site works without analytics)
- Error logging without breaking user experience
- Automatic retry mechanisms

### Network Issues
- Timeout handling (30s max)
- Retry logic for failed requests
- CDN caching for reliability

## 🔒 Security Features

- **Content Security Policy**: XSS protection
- **HTTPS Only**: Secure connections enforced
- **Input Validation**: All form inputs sanitized
- **Rate Limiting**: Built-in Cloudflare protection
- **Privacy Compliant**: GDPR-friendly analytics

## 📈 Performance Optimization

- **Global CDN**: Cloudflare edge caching
- **Image Optimization**: Automatic image compression
- **Minified Assets**: CSS and JS optimization
- **Gzip Compression**: Reduced bandwidth usage
- **Service Worker**: Offline functionality (optional)

## 🤝 Support

### Getting Help

1. **Check Logs**:
   ```bash
   wrangler tail --format=pretty
   ```

2. **Debug Locally**:
   ```bash
   wrangler dev --local
   ```

3. **Test Database**:
   ```bash
   wrangler d1 execute goevergreen-db --command "SELECT 1;"
   ```

### Contact

- **Email**: info@goevergreen.shop
- **GitHub Issues**: [Create an issue](https://github.com/achinsahu/goevergreen-cloudflare-worker/issues)

## 📝 License

MIT License - feel free to modify and distribute

## 🙏 Acknowledgments

- Built with ❤️ for the wellness community
- Powered by Cloudflare Workers
- Designed for women's health and wellness

---

**GoEvergreen** - Empowering women with premium wellness guidance 🌿✨