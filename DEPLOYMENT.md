# 🌍 Deployment Guide - Production E-Commerce Store

This guide walks you through deploying your e-commerce store to production on Vercel with managed PostgreSQL, Redis, and Razorpay.

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Code pushed to GitHub
- ✅ All local tests passing
- ✅ `.env.local` with all values configured
- ✅ Razorpay account with test credentials working
- ✅ Email sending tested and working

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│              Vercel (Next.js App)                       │
│  - /api/* endpoints                                     │
│  - Frontend pages                                       │
│  - NextAuth session management                          │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
    ┌────────┐ ┌────────┐ ┌────────┐
    │ Neon   │ │Upstash │ │Razorpay│
    │Postgres│ │ Redis  │ │  API   │
    └────────┘ └────────┘ └────────┘
        ▲          ▲          ▲
        └──────────┴──────────┘
         Environment Variables
```

---

## 🚀 Step 1: Prepare for Deployment

### 1.1 Clean Up Code
```bash
# Remove .env.local (never commit secrets)
rm .env.local

# Verify all files are clean
git status
```

### 1.2 Update Next.js Config (Optional Production Optimizations)
Edit `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  compress: true, // Enable gzip compression
};

module.exports = nextConfig;
```

### 1.3 Push to GitHub
```bash
git add .
git commit -m "Production-ready e-commerce store"
git push origin main
```

---

## 💾 Step 2: Setup Database (PostgreSQL)

### Option A: Neon (Recommended for Vercel)

1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub (easier OAuth)
3. Create new project
4. Copy connection string: `postgresql://user:password@...`
5. Save for later (Step 3)

### Option B: Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Project Settings → Database
4. Copy connection string

### Option C: Railway

1. Go to [railway.app](https://railway.app)
2. Create new project → PostgreSQL
3. Go to Variables tab
4. Copy `DATABASE_URL`

---

## 🔴 Step 3: Setup Redis Cache (Upstash)

1. Go to [upstash.com](https://upstash.com)
2. Sign up
3. Create new database (Redis)
4. Select region close to your server
5. Copy `UPSTASH_REDIS_REST_URL` (for serverless)
6. Format as: `redis://default:password@host:port`
7. Save for later

---

## 🛠️ Step 4: Deploy to Vercel

### 4.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository

### 4.2 Configure Project
When importing:

1. **Project Name**: `ecommerce-store` (or your choice)
2. **Framework**: Next.js (should auto-detect)
3. **Build Command**: `npx prisma migrate deploy && next build` (important!)
4. **Install Command**: `npm install --legacy-peer-deps`
5. **Output Directory**: `.next`

### 4.3 Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```
# Database
DATABASE_URL=postgresql://user:password@host/dbname

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-random-secret-here
# Generate with: openssl rand -base64 32

# Google OAuth (if using)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis/Cache
REDIS_URL=redis://default:password@host:port

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxx  # Use LIVE keys for production!
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxx

# JWT
JWT_SECRET=your-jwt-secret
NODE_ENV=production
```

### 4.4 Deploy
Click "Deploy" button and wait for build to complete.

---

## ✅ Step 5: Post-Deployment Setup

### 5.1 Verify Deployment
1. Open `https://yourdomain.com` (or Vercel-generated URL)
2. Check homepage loads
3. Test authentication flow
4. Test a product purchase with Razorpay test card

### 5.2 Configure Razorpay Webhook

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Settings → Webhooks → Add Endpoint
3. **Webhook URL**: `https://yourdomain.com/api/razorpay/webhook`
4. **Events**: 
   - ✅ payment.authorized
   - ✅ payment.captured
   - ✅ payment.failed
5. **Secret**: Use your `RAZORPAY_WEBHOOK_SECRET`
6. Click Save

Test webhook:
1. Click "Test" button next to webhook
2. Should return success

### 5.3 Test Email Notifications

In app, trigger:
1. OTP send (check email arrives)
2. Order confirmation (after payment)

### 5.4 Setup Domain (Custom Domain)

In Vercel Dashboard → Domains:

1. Add your custom domain
2. Update DNS records at your registrar
3. Wait for DNS propagation (can take 24h)

Or use Vercel's provided URL (vercel app).

---

## 🔐 Step 6: Security Hardening

### 6.1 HTTPS Enforcement
- Vercel automatically enables HTTPS
- Update `NEXTAUTH_URL` to `https://yourdomain.com`

### 6.2 Rate Limiting
Add rate limiting to OTP endpoint in `app/api/auth/otp/send/route.ts`:

```typescript
// Already included in seed! Check the code for rate limit implementation
```

### 6.3 Environment Separation
For staging/production:

**`.env.staging`**
```
RAZORPAY_KEY_ID=rzp_test_xxx  # Test keys
NODE_ENV=staging
```

**`.env.production`**
```
RAZORPAY_KEY_ID=rzp_live_xxx  # Live keys
NODE_ENV=production
```

Deploy to different Vercel projects or use branches.

---

## 📈 Step 7: Monitoring & Logs

### 7.1 Vercel Logs
- Dashboard → Deployments → Logs
- Real-time function logs, builds, errors

### 7.2 Setup Error Tracking (Sentry)

1. Go to [sentry.io](https://sentry.io)
2. Create project for Next.js
3. Add to `package.json`:

```bash
npm install @sentry/nextjs
```

4. Configure in `next.config.js`:

```javascript
const withSentryConfig = require("@sentry/nextjs/withSentryConfig");

module.exports = withSentryConfig(
  nextConfig,
  { org: "your-org", project: "your-project" }
);
```

### 7.3 Database Backups
- **Neon**: Auto-backups every 24h
- **Supabase**: Auto-backups, point-in-time recovery
- **Railway**: Managed backups

Verify backup settings in your database provider dashboard.

---

## 💰 Step 8: Switch to Live Razorpay Keys

⚠️ **IMPORTANT**: Only do this when ready for real payments!

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Settings → API Keys → Switch to Production
3. Copy live keys
4. In Vercel Dashboard, update:
   ```
   RAZORPAY_KEY_ID=rzp_live_xxx
   RAZORPAY_KEY_SECRET=xxx
   ```
5. Redeploy

---

## 🧪 Step 9: Production Testing Checklist

- [ ] Homepage loads in <3 seconds
- [ ] Products page pagination works
- [ ] Search/filter functionality works
- [ ] Can add items to cart
- [ ] OTP email sends and verifies
- [ ] Google login works
- [ ] Checkout form validates
- [ ] Razorpay modal opens for payment
- [ ] Test payment with live card (small amount)
- [ ] Order confirmation email sends
- [ ] Admin can view orders
- [ ] Admin can update order status
- [ ] Webhook processes payments correctly

---

## 🔄 Step 10: Continuous Deployment

### Enable Auto-Deploy
In Vercel Dashboard → Settings → Git:
- Auto-deploy on push to `main` branch
- Deploy previews for pull requests

### Pre-Deployment Checklist
```bash
# Before pushing to main
npm run build          # Test build succeeds
npm run lint           # Check for errors
npm test               # Run tests (if added)
```

---

## 📊 Monitoring Dashboard

Setup monitoring for:
- **Page performance**: Vercel Analytics
- **Error rates**: Sentry
- **Database queries**: Database provider dashboard
- **API response times**: Vercel Observability
- **Redis usage**: Upstash dashboard

---

## 🚨 Troubleshooting Deployment

### Build Fails
```
Error: Prisma client missing
Solution: npm install --legacy-peer-deps in build command
```

Check Vercel Logs → Build for details.

### Environment Variables Not Loaded
- Verify variables added in Vercel Dashboard
- Restart deployment after adding variables
- Check `process.env.VAR_NAME` logs

### Database Connection Error
- Test connection locally: `node -e "require('./lib/prisma').default.$disconnect()"`
- Verify DATABASE_URL is correct
- Check database firewall/IP whitelist (Vercel IPs allowed)

### Razorpay Webhook Not Triggering
- Verify webhook URL is `https://yourdomain.com/api/razorpay/webhook`
- Test button in Razorpay dashboard
- Check server logs for signature verification errors

### Email Not Sending
- For Gmail: Enable "Less secure apps" OR generate App Password
- For SendGrid/Postmark: Verify API keys
- Test in server logs: `console.log(emailResult)`

---

## 🎉 You're Live!

Congrats! Your e-commerce store is now live in production! 

### Post-Launch
1. Monitor error logs daily
2. Check Razorpay payments daily
3. Respond to customer emails
4. Monitor database size
5. Plan feature additions

### Resources
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [NextAuth Production Setup](https://next-auth.js.org/getting-started/deployment)

---

**Questions?** See main `README.md` or check docs for each service.

Good luck! 🚀
