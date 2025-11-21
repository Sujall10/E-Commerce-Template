# 🚀 From Development to Production - Complete Guide

This guide walks you through preparing your e-commerce site for production deployment with real email OTP delivery.

---

## Phase 1: Local Testing with Real Credentials (Week 1)

### Step 1: Get Gmail App Password

1. Go to https://myaccount.google.com
2. Click "Security" (left sidebar)
3. Enable 2-Step Verification if not already done
4. Go back to Security → App passwords
5. Select "Mail" and "Other" (select Windows Computer, etc.)
6. Google generates 16-character password
7. Copy it

### Step 2: Update Local .env

Edit `.env.local`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
```

### Step 3: Test Email OTP Locally

```bash
npm run dev
```

1. Open http://localhost:3000
2. Click "Sign In" → "Email OTP"
3. Enter your real email
4. Click "Send OTP"
5. ✅ Check your email inbox for OTP code
6. Enter code and verify

**If it works locally with real email, it will work in production!**

---

## Phase 2: Prepare All Credentials (Week 1-2)

### Credentials Needed:

**1. Database (Already Done)**
- ✅ Neon PostgreSQL connection string

**2. Email Service** (Gmail)
- App password (from Step 1 above)

**3. Google OAuth**
1. Go to https://console.cloud.google.com
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web)
5. Add redirect URI: `https://yourdomain.com/api/auth/callback/google`
6. Copy Client ID and Secret

**4. Razorpay (Payments)**
1. Go to https://dashboard.razorpay.com
2. Account Settings → API Keys
3. **Switch to LIVE mode** (not test)
4. Copy Key ID and Key Secret
5. Create webhook at `https://yourdomain.com/api/razorpay/webhook`
6. Copy webhook secret

**5. NextAuth Secrets** (Generate)
```bash
# Run twice to get two random secrets
openssl rand -base64 32
```

**6. Domain**
- Purchase domain (or use subdomain from hosting)
- Example: `myecommerce.com` or `shop.mysite.com`

---

## Phase 3: Choose Hosting & Deploy (Week 2)

### Recommended: Vercel (Free tier available)

**Setup:**

1. Create GitHub account if not already done
2. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/ecommerce
   git push -u origin main
   ```

3. Go to https://vercel.com
4. Click "New Project"
5. Select your GitHub repository
6. Click "Import Project"
7. Under "Environment Variables", add all credentials:

```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=generated_secret
JWT_SECRET=generated_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
RAZORPAY_KEY_ID=rzp_live_xxxx
RAZORPAY_KEY_SECRET=xxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxx
NODE_ENV=production
```

8. Click "Deploy"
9. Wait for deployment to complete (~5 minutes)
10. You'll get a URL like: `https://my-project.vercel.app`

### Add Custom Domain:

1. In Vercel dashboard, go to Project Settings → Domains
2. Enter your domain
3. Add DNS records as instructed
4. Wait for verification (~24 hours)
5. Update NEXTAUTH_URL to your custom domain

---

## Phase 4: Post-Deployment Setup (Day 1)

### Step 1: Run Database Migrations

In Vercel dashboard, under "Deployments", find the latest build and open "Logs". Or run manually:

```bash
# You can set this up as a build step or run once after deployment
DATABASE_URL=your_neon_url npx prisma migrate deploy
DATABASE_URL=your_neon_url npx prisma db seed
```

### Step 2: Test All Features

**Visit your deployed site:**
1. Homepage loads ✅
2. Email OTP signup works ✅
3. Receive email with OTP ✅
4. Login succeeds ✅
5. Browse products ✅
6. Add to cart ✅
7. Checkout with Razorpay ✅
8. Admin panel accessible ✅

### Step 3: Setup Razorpay Webhook

1. Razorpay Dashboard → Webhooks
2. Create webhook:
   - URL: `https://yourdomain.com/api/razorpay/webhook`
   - Events: `payment.authorized`, `payment.failed`, `order.paid`
   - Copy webhook secret
3. Add secret to Vercel environment variables
4. Redeploy

---

## Phase 5: Monitor & Maintain (Ongoing)

### Daily Checks:
- [ ] Email OTP works
- [ ] Payments processing
- [ ] No error logs
- [ ] Database responsive

### Weekly Checks:
- [ ] User signups working
- [ ] Payment history in orders
- [ ] Admin dashboard functional

### Monthly Checks:
- [ ] Backup database
- [ ] Review payment trends
- [ ] Check API usage
- [ ] Monitor costs

---

## 🔄 OTP Flow: Local vs Production

### Local Development (Current)
```
User enters email
     ↓
OTP generated → Printed to terminal
     ↓
User copies from console
     ↓
Verification works
```

### Production (After Setup)
```
User enters email
     ↓
OTP generated → Stored in Redis
     ↓
Email sent via Gmail SMTP
     ↓
User checks inbox
     ↓
Enters code from email
     ↓
Verification works
```

**Same code, different storage!** The backend code automatically detects environment and uses the right storage.

---

## 📊 Deployment Timeline

| Task | Time | Status |
|------|------|--------|
| Get Gmail app password | 5 min | ⏳ |
| Test locally with email | 10 min | ⏳ |
| Get Google OAuth credentials | 15 min | ⏳ |
| Setup Razorpay live keys | 20 min | ⏳ |
| Generate NextAuth secrets | 2 min | ⏳ |
| Deploy to Vercel | 10 min | ⏳ |
| Test production | 15 min | ⏳ |
| Setup custom domain | 24h (async) | ⏳ |
| **TOTAL** | **~77 min** | ⏳ |

---

## 🛠️ Troubleshooting Production Issues

### OTP not arriving
**Cause:** SMTP not configured correctly
**Fix:**
1. Verify SMTP credentials in Vercel env vars
2. Check Gmail app password is 16 chars
3. Verify sending email is the same as SMTP_USER

### Payments failing
**Cause:** Using test keys instead of live keys
**Fix:**
1. Go to Razorpay dashboard
2. Switch from Test to Live mode
3. Copy live keys to Vercel
4. Redeploy

### Database errors
**Cause:** DATABASE_URL not set or wrong
**Fix:**
1. Verify DATABASE_URL in Vercel env vars
2. Test connection: `npx prisma db push`
3. Redeploy if changed

### "Session invalid" after login
**Cause:** NEXTAUTH_SECRET changed
**Fix:**
1. Don't regenerate NEXTAUTH_SECRET
2. Keep same secret across deploys
3. All users will be logged out once if you change it

---

## 📝 Code Changes for Production

**No code changes needed!** The backend already handles:
- Development: OTP in memory, logged to console
- Production: OTP in Redis, sent via email

The `NODE_ENV` variable automatically triggers the right behavior.

---

## ✅ Pre-Launch Checklist

Before going live publicly:

- [ ] Local test with real Gmail credentials successful
- [ ] Site deployed to Vercel
- [ ] Custom domain working
- [ ] Database migrations completed
- [ ] Email OTP tested with real inbox
- [ ] Google OAuth button tested
- [ ] Razorpay live keys configured
- [ ] Webhook URL set in Razorpay
- [ ] Test payment processed
- [ ] Admin panel secured (only for admin users)
- [ ] Privacy policy added
- [ ] Terms & conditions added
- [ ] Support contact page updated
- [ ] Error page is user-friendly
- [ ] Monitoring/alerts setup

---

## 🎯 Next Actions

1. **TODAY:** Get Gmail app password, test locally
2. **TOMORROW:** Setup Vercel, deploy
3. **THIS WEEK:** Get all other credentials, add to production
4. **NEXT WEEK:** Monitor and adjust

---

## 💡 Pro Tips

**Tip 1: Test on Local First**
- Always test new credentials locally before deploying
- Saves time debugging in production

**Tip 2: Use Environment Variables**
- Never commit secrets to GitHub
- Always use platform UI to add variables

**Tip 3: Monitor Emails**
- Check spam folder if OTP not arriving
- Gmail might filter automated emails
- Add domain to Gmail whitelist

**Tip 4: Start Small**
- Keep using test Razorpay mode for first week
- Switch to live only after confirming OTP works

**Tip 5: Backup Important**
- Enable database backups in Neon
- Export order data regularly

---

## 📞 Support

**If stuck on:**
- **Gmail setup:** https://support.google.com/accounts/answer/2911696
- **Google OAuth:** https://developers.google.com/identity/protocols/oauth2
- **Razorpay:** https://razorpay.com/docs
- **Vercel:** https://vercel.com/docs
- **Prisma:** https://www.prisma.io/docs

---

## 🎉 You're Ready!

Follow this guide step-by-step and your site will be production-ready with:
- ✅ Real email OTP delivery
- ✅ Google login
- ✅ Razorpay payments
- ✅ Secure authentication
- ✅ Production database
- ✅ Custom domain

**Estimated time to production: 2-3 hours of actual work**

Start with Phase 1 today! 🚀
