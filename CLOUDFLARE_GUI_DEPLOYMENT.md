# Cloudflare GUI Deployment Guide

## 🚀 Deploy GoEvergreen Worker via Cloudflare Dashboard

This guide will walk you through deploying your GoEvergreen Worker using the Cloudflare Web Interface (GUI) instead of the command line.

## 📝 Prerequisites

- [x] Cloudflare account (free or paid)
- [x] GitHub account with this repository
- [x] Domain `goevergreen.shop` added to Cloudflare (DNS)

## Step 1: Connect GitHub Repository

### 1.1 Access Workers & Pages Dashboard
1. Login to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account
3. Go to **Workers & Pages**
4. Click **Create Application**
5. Select **Pages** tab
6. Click **Connect to Git**

### 1.2 Connect Repository
1. Select **GitHub** as your Git provider
2. Authorize Cloudflare to access your GitHub
3. Select repository: `achinsahu/goevergreen-cloudflare-worker`
4. Click **Begin setup**

## Step 2: Configure Build Settings

### 2.1 Project Configuration
- **Project name**: `goevergreen-worker`
- **Production branch**: `main`
- **Build command**: `echo "No build required"`
- **Build output directory**: `/` (root)
- **Root directory**: `/` (leave empty)

### 2.2 Environment Variables
Add these environment variables:

```
ENVIRONMENT=production
DOMAIN=goevergreen.shop
CONTACT_EMAIL=info@goevergreen.shop
WORDPRESS_BASE_URL=https://goevergreen9.wordpress.com
```

Click **Save and Deploy**

## Step 3: Create D1 Database

### 3.1 Create Database
1. In Cloudflare Dashboard, go to **Workers & Pages**
2. Select **D1 SQL Database** from the sidebar
3. Click **Create Database**
4. Name: `goevergreen-db`
5. Click **Create**

### 3.2 Get Database ID
1. Click on your new database
2. Copy the **Database ID** (it looks like: `12345678-1234-1234-1234-123456789012`)
3. Keep this ID for the next step

### 3.3 Apply Database Schema
1. In your database dashboard, go to **Console**
2. Copy the content from `migrations/0001_initial.sql` in your repository
3. Paste it into the console and click **Execute**
4. Verify tables were created successfully

## Step 4: Connect Database to Worker

### 4.1 Bind Database
1. Go back to **Workers & Pages**
2. Select your `goevergreen-worker` project
3. Go to **Settings** > **Variables**
4. Scroll to **D1 database bindings**
5. Click **Add binding**
6. **Variable name**: `DB`
7. **D1 database**: Select `goevergreen-db`
8. Click **Save**

### 4.2 Deploy with Database
1. Go to **Deployments** tab
2. Click **Create deployment**
3. Select **main** branch
4. Click **Save and Deploy**

## Step 5: Configure Custom Domain

### 5.1 Add Custom Domain
1. In your worker settings, go to **Triggers**
2. Click **Add Custom Domain**
3. Enter: `goevergreen.shop`
4. Click **Add Custom Domain**

### 5.2 Configure DNS (if not done)
1. Go to **DNS** in your Cloudflare dashboard
2. Add these records if they don't exist:

**A Record**:
- **Name**: `@`
- **IPv4 address**: `192.0.2.1` (placeholder)
- **Proxy status**: 🟠 Proxied (Orange cloud)

**CNAME Record**:
- **Name**: `www`
- **Target**: `goevergreen.shop`
- **Proxy status**: 🟠 Proxied (Orange cloud)

## Step 6: Test Your Deployment

### 6.1 Basic Testing
1. Open: `https://goevergreen.shop`
2. Verify the homepage loads
3. Test navigation menu links
4. Check that WordPress branding is removed

### 6.2 Feature Testing
1. **Newsletter Signup**: Try subscribing with a test email
2. **Contact Form**: Test the contact form (if implemented)
3. **Mobile**: Check mobile responsiveness
4. **SEO**: View page source and verify meta tags

### 6.3 Performance Testing
1. Use [PageSpeed Insights](https://pagespeed.web.dev/)
2. Check loading speed: should be < 3 seconds
3. Verify all assets load correctly

## Step 7: Monitor and Debug

### 7.1 View Logs
1. In your worker dashboard, go to **Functions**
2. Click **View live logs**
3. Monitor real-time activity and errors

### 7.2 Analytics
1. Go to **Analytics & Logs**
2. Monitor:
   - Requests per minute
   - Error rate
   - CPU usage
   - Duration

## 🚨 Troubleshooting Common Issues

### Issue 1: "Error 1101: Worker threw exception"
**Cause**: Database binding not configured or database doesn't exist

**Solution**:
1. Check D1 database binding in **Settings > Variables**
2. Ensure database exists and schema is applied
3. Redeploy the worker

### Issue 2: "Custom domain not working"
**Cause**: DNS not properly configured

**Solution**:
1. Check DNS records in Cloudflare Dashboard
2. Ensure records are proxied (orange cloud)
3. Wait 5-10 minutes for propagation

### Issue 3: "WordPress content not loading"
**Cause**: Network issues or WordPress.com blocking requests

**Solution**:
1. Check worker logs for fetch errors
2. Verify WordPress.com site is accessible
3. Worker will show fallback content automatically

### Issue 4: "Logo not displaying"
**Cause**: Binary assets need special handling

**Solution**:
1. Logo will show as placeholder initially
2. For production, upload logo to a CDN
3. Update logo URL in the router.js file

## 🔄 Updates and Maintenance

### Automatic Deployments
- Any push to `main` branch will trigger automatic deployment
- Monitor deployments in the **Deployments** tab
- Rollback if needed by selecting a previous deployment

### Manual Deployments
1. Go to **Deployments**
2. Click **Create deployment**
3. Select branch and commit
4. Click **Save and Deploy**

### Database Maintenance
1. **View Data**: Use D1 Console to query data
2. **Backup**: Export data using SQL queries
3. **Cleanup**: Old analytics data auto-cleans every 90 days

## ✅ Success Checklist

Your deployment is successful when:

- [ ] `https://goevergreen.shop` loads without errors
- [ ] Navigation works on all pages
- [ ] WordPress branding is removed
- [ ] Custom GoEvergreen branding is applied
- [ ] Newsletter form accepts subscriptions
- [ ] Mobile version works properly
- [ ] Page load speed < 3 seconds
- [ ] SEO meta tags are present
- [ ] Database is connected and working
- [ ] Analytics are being collected

## 📞 Support

### Cloudflare Support
- **Community**: [Cloudflare Community](https://community.cloudflare.com/)
- **Documentation**: [Workers Docs](https://developers.cloudflare.com/workers/)
- **Status**: [Cloudflare Status](https://www.cloudflarestatus.com/)

### Repository Issues
- **GitHub Issues**: [Create an Issue](https://github.com/achinsahu/goevergreen-cloudflare-worker/issues)
- **Email**: info@goevergreen.shop

---

**🎉 Congratulations!** Your GoEvergreen wellness website is now live at `https://goevergreen.shop` 🌿✨

**Next Steps:**
1. Set up Google Analytics (optional)
2. Configure email marketing integration
3. Add more wellness content
4. Monitor performance and user engagement