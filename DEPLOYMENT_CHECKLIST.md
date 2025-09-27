# GoEvergreen Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Repository Setup
- [ ] Repository cloned locally
- [ ] All files present in correct directories
- [ ] Logo file uploaded to `src/assets/logo.jpg`
- [ ] Dependencies installed (`npm install`)

### 2. Cloudflare Account Setup
- [ ] Cloudflare account created
- [ ] Domain `goevergreen.shop` added to Cloudflare
- [ ] DNS records configured (see DNS section below)
- [ ] Wrangler CLI installed globally
- [ ] Logged into Wrangler (`wrangler login`)

### 3. Database Configuration
- [ ] D1 database created: `wrangler d1 create goevergreen-db`
- [ ] Database ID copied to `wrangler.toml`
- [ ] Migration files applied: `wrangler d1 migrations apply goevergreen-db --remote`
- [ ] Database connection tested

### 4. Configuration Files
- [ ] `wrangler.toml` updated with correct database ID
- [ ] Environment variables configured
- [ ] Routes configured for production domain
- [ ] Contact email updated in configuration

## 🔧 Configuration Updates Needed

### wrangler.toml Updates

Replace `YOUR_DATABASE_ID_HERE` with your actual database ID:

```toml
[[env.production.d1_databases]]
binding = "DB"
database_name = "goevergreen-db"
database_id = "12345678-1234-1234-1234-123456789012"  # Your actual ID
```

### Environment Variables

Ensure these are set correctly:

```toml
[vars]
ENVIRONMENT = "production"
DOMAIN = "goevergreen.shop"
CONTACT_EMAIL = "info@goevergreen.shop"
```

## 🔍 DNS Configuration

### Required DNS Records

1. **Root Domain (A Record)**:
   - Name: `@`
   - Type: `A`
   - Value: `192.0.2.1` (placeholder)
   - Proxy: ✅ Orange Cloud

2. **WWW Subdomain (CNAME)**:
   - Name: `www`
   - Type: `CNAME`
   - Value: `goevergreen.shop`
   - Proxy: ✅ Orange Cloud

3. **Email MX Records** (if using custom email):
   - Configure according to your email provider

## 🛠️ Deployment Steps

### Step 1: Test Locally
```bash
# Clone and setup
git clone https://github.com/achinsahu/goevergreen-cloudflare-worker.git
cd goevergreen-cloudflare-worker
npm install

# Test locally
wrangler dev --local
```

### Step 2: Create Database
```bash
# Create D1 database
wrangler d1 create goevergreen-db

# Note the database ID and update wrangler.toml

# Apply migrations
wrangler d1 migrations apply goevergreen-db --remote

# Test database
wrangler d1 execute goevergreen-db --command "SELECT 1;"
```

### Step 3: Deploy Worker
```bash
# Deploy to production
npm run deploy:production

# Or manually
wrangler deploy --env production
```

### Step 4: Configure Routes
```bash
# Add custom domain route
wrangler route add "goevergreen.shop/*" goevergreen-worker
wrangler route add "www.goevergreen.shop/*" goevergreen-worker
```

### Step 5: Test Deployment
```bash
# Test the deployed worker
curl -I https://goevergreen.shop/

# Check specific pages
curl -I https://goevergreen.shop/wellness-guides
curl -I https://goevergreen.shop/contact-us
```

## 🚨 Common Errors and Solutions

### Error 1: "Unknown binding DB"
**Cause**: D1 database not properly configured

**Solution**:
1. Check database exists: `wrangler d1 list`
2. Verify database ID in `wrangler.toml`
3. Apply migrations: `wrangler d1 migrations apply goevergreen-db --remote`

### Error 2: "Worker exceeded CPU time"
**Cause**: WordPress content fetching takes too long

**Solution**:
1. Add timeout to fetch requests
2. Implement caching for WordPress content
3. Use fallback content when WordPress is slow

```javascript
// Add to wordpress.js
const controller = new AbortController();
setTimeout(() => controller.abort(), 10000); // 10s timeout

const response = await fetch(wordpressUrl, {
  signal: controller.signal,
  headers: {
    'User-Agent': 'GoEvergreen-Proxy/1.0'
  }
});
```

### Error 3: "Route not found"
**Cause**: Custom domain not properly configured

**Solution**:
1. Check DNS configuration in Cloudflare
2. Verify route exists: `wrangler routes list`
3. Add route manually: `wrangler route add "goevergreen.shop/*" goevergreen-worker`

### Error 4: "Logo not displaying"
**Cause**: Logo file not properly uploaded or referenced

**Solution**:
1. Check file exists: `ls -la src/assets/logo.jpg`
2. Verify file size is reasonable (< 1MB)
3. Update logo reference in response.js if needed

### Error 5: "Newsletter form not working"
**Cause**: Database table doesn't exist or API endpoint not working

**Solution**:
1. Check database tables: `wrangler d1 execute goevergreen-db --command "SELECT name FROM sqlite_master WHERE type='table';"`
2. Test newsletter endpoint: `curl -X POST https://goevergreen.shop/api/newsletter -d '{"email":"test@example.com"}'`
3. Check browser console for JavaScript errors

## 📋 Post-Deployment Testing

### Page Testing
- [ ] Homepage loads correctly: `https://goevergreen.shop/`
- [ ] Wellness guides: `https://goevergreen.shop/wellness-guides`
- [ ] Contact page: `https://goevergreen.shop/contact-us`
- [ ] About page: `https://goevergreen.shop/about`
- [ ] Blog: `https://goevergreen.shop/blog`
- [ ] Reviews: `https://goevergreen.shop/reviews`
- [ ] Privacy policy: `https://goevergreen.shop/privacy-policy`
- [ ] Donate page: `https://goevergreen.shop/donate`

### Functionality Testing
- [ ] Logo displays correctly
- [ ] Navigation works on all pages
- [ ] Newsletter subscription form works
- [ ] Contact form submits successfully
- [ ] Mobile responsive design
- [ ] Page load speed < 3 seconds
- [ ] SEO meta tags present
- [ ] Analytics tracking working

### SEO Testing
- [ ] Meta titles unique for each page
- [ ] Meta descriptions present
- [ ] Open Graph tags working
- [ ] Schema markup present
- [ ] Sitemap accessible: `https://goevergreen.shop/sitemap.xml`
- [ ] Robots.txt (if needed)

## 📊 Monitoring and Maintenance

### Analytics Dashboard
Create a simple analytics query:
```bash
# View page views
wrangler d1 execute goevergreen-db --command "SELECT path, COUNT(*) as views FROM page_views WHERE timestamp > datetime('now', '-7 days') GROUP BY path ORDER BY views DESC;"

# View newsletter subscribers
wrangler d1 execute goevergreen-db --command "SELECT COUNT(*) as total, COUNT(CASE WHEN subscribed_at > datetime('now', '-7 days') THEN 1 END) as weekly FROM newsletter_subscribers WHERE unsubscribed = FALSE;"
```

### Performance Monitoring
```bash
# Monitor worker performance
wrangler tail --format=pretty

# Check worker usage
wrangler metrics
```

### Regular Maintenance Tasks
- [ ] Weekly analytics review
- [ ] Monthly database cleanup (old analytics data)
- [ ] WordPress content sync check
- [ ] Security updates check
- [ ] Performance optimization review

## 🎆 Success Criteria

Deployment is successful when:
- [ ] All pages load without errors
- [ ] WordPress content is properly proxied
- [ ] Custom branding is applied (no WordPress.com references)
- [ ] Newsletter subscriptions work
- [ ] Contact forms submit successfully
- [ ] Analytics data is being collected
- [ ] SEO meta tags are properly set
- [ ] Mobile experience is optimized
- [ ] Page load times are acceptable
- [ ] All functionality works across different browsers

## 📞 Support Contacts

- **Technical Issues**: Check GitHub issues
- **Cloudflare Support**: Cloudflare Dashboard
- **Domain Issues**: Domain registrar support
- **WordPress Issues**: WordPress.com support (for source content)

---

**Remember**: Test everything in development before deploying to production! 🚀