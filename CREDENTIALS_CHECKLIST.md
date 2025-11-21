# Deployment Credentials Checklist

## 📋 Complete List of All Credentials Required for Production

Copy this checklist and fill in each credential as you obtain them.

---

## 1. DATABASE - PostgreSQL (Neon)

```
DATABASE_URL = postgresql://USER:PASSWORD@HOST/DATABASE
```

**How to get:**
- Already using Neon
- Connection string: ✅ Already have

**Status:** ✅ COMPLETED

---

## 2. EMAIL SERVICE - OTP Delivery

### Choose ONE provider:

#### Option A: Gmail (FREE - Recommended for small projects)

```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = your_email@gmail.com
SMTP_PASS = xxxx xxxx xxxx xxxx
```

**How to get:**
1. Go to: https://myaccount.google.com/apppasswords
2. Must have 2-Factor Auth enabled first
3. Select "Mail" and "Windows Computer" (or your device)
4. Click "Generate"
5. Copy the 16-character password

**Status:** ⏳ TO DO

---

#### Option B: SendGrid (FREE tier - 100 emails/day)

```
SMTP_HOST = smtp.sendgrid.net
SMTP_PORT = 587
SMTP_USER = apikey
SMTP_PASS = SG.USb58b439a360ea6b9b01ded2b51f12af1
SENDGRID_NAME = Sujal Rajput
```

**Account Details:**
- Full Name: Sujal Rajput
- SID: USb58b439a360ea6b9b01ded2b51f12af1
- API Key: SG.USb58b439a360ea6b9b01ded2b51f12af1

**Status:** ✅ COMPLETED

---

#### Option C: AWS SES (Scalable)

```
SMTP_HOST = email-smtp.us-east-1.amazonaws.com
SMTP_PORT = 587
SMTP_USER = AKIA...
SMTP_PASS = xxxxxxxxxxxx
```

**How to get:**
1. AWS Console → SES → SMTP Settings
2. Create new SMTP credentials
3. Copy Username and Password

**Status:** ⏳ TO DO

---

## 3. AUTHENTICATION - Google OAuth

```
GOOGLE_CLIENT_ID = 123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = GOCSPX-xxxxxxxxxxxx
```

**How to get:**
1. Go to: https://console.cloud.google.com
2. Create a new project
3. Enable Google+ API
4. Create "OAuth 2.0 Client ID" (Web Application)
5. Add authorized redirect URIs:
   - `https://yourdomain.com/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for local dev)
6. Copy Client ID and Secret

**Status:** ⏳ TO DO

---

## 4. PAYMENTS - Razorpay

```
RAZORPAY_KEY_ID = rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET = xxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET = whsec_xxxxxxxxxxxx
```

**How to get:**
1. Go to: https://dashboard.razorpay.com
2. Login/Create account
3. Settings → API Keys
4. **Switch from "Test" to "Live"** 
5. Copy Key ID and Key Secret
6. Setup webhook:
   - Webhooks → Create webhook
   - URL: `https://yourdomain.com/api/razorpay/webhook`
   - Events: `payment.authorized`, `payment.failed`
   - Copy webhook secret

**Status:** ⏳ TO DO

---

## 5. AUTHENTICATION SECRETS - NextAuth

```
NEXTAUTH_SECRET = xxxxxxxxxxxxxxxxxxxxxxxx
JWT_SECRET = xxxxxxxxxxxxxxxxxxxxxxxx
```

**How to get:**
```bash
# Run this command twice to generate two secrets
openssl rand -base64 32
```

**Output will look like:**
```
4Zv7bXc9mK2pQ/R8nL1wS+jU3yV6hZ0aB5cD4eF9gH
```

**Status:** ⏳ TO DO

---

## 6. DOMAIN & HOSTING

```
NEXTAUTH_URL = https://yourdomain.com
NODE_ENV = production
```

**How to get:**
1. Choose hosting: Vercel, AWS Amplify, Railway, etc.
2. Get deployment URL
3. Purchase domain (or use subdomain)
4. Point DNS to hosting provider
5. Add to NEXTAUTH_URL

**Status:** ⏳ TO DO

---

## 7. REDIS - Caching (Optional but Recommended)

```
REDIS_URL = redis://:password@host:port
```

**How to get:**

### Option A: Upstash (FREE - Recommended for Vercel)
1. Go to: https://upstash.com
2. Create free Redis database
3. Copy connection string from details page

### Option B: AWS ElastiCache
1. Create Redis cluster
2. Get endpoint and port

**Status:** ⏳ OPTIONAL (works without it)

---

## 📝 Complete Production .env Template

Save this as `.env.production` or add to your hosting platform:

```bash
# ============== DATABASE ==============
DATABASE_URL=postgresql://user:password@host/dbname

# ============== NEXTAUTH ==============
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_random_secret_from_openssl
JWT_SECRET=your_jwt_secret_from_openssl

# ============== EMAIL (SMTP) ==============
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password

# ============== GOOGLE OAUTH ==============
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx

# ============== RAZORPAY (LIVE KEYS) ==============
RAZORPAY_KEY_ID=rzp_live_xxxx
RAZORPAY_KEY_SECRET=xxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxx

# ============== REDIS (OPTIONAL) ==============
REDIS_URL=redis://:password@host:port

# ============== ENVIRONMENT ==============
NODE_ENV=production
```

---

## 🚀 Deployment Platform Setup

### Vercel (Recommended)

**Steps:**
1. Push code to GitHub
2. Go to https://vercel.com
3. Click "Import Project"
4. Select your GitHub repository
5. Under "Environment Variables":
   - Add each variable from the `.env.production` template above
6. Click "Deploy"

**Add after deployment:**
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records
4. Update NEXTAUTH_URL in environment variables to your domain

---

### AWS Amplify

**Steps:**
1. Connect GitHub repository
2. Select branch (main)
3. Build settings (auto-detected)
4. Under "Environment variables":
   - Add all credentials
5. Deploy

---

### Railway.app

**Steps:**
1. Connect GitHub
2. Create new project
3. Add environment variables
4. Deploy

---

## ✅ Pre-Deployment Checklist

- [ ] DATABASE_URL obtained (Neon)
- [ ] SMTP credentials obtained (Gmail/SendGrid/AWS)
- [ ] GOOGLE_CLIENT_ID & SECRET obtained
- [ ] RAZORPAY live keys obtained
- [ ] RAZORPAY webhook configured
- [ ] NEXTAUTH_SECRET generated
- [ ] JWT_SECRET generated
- [ ] Domain purchased and configured
- [ ] Hosting platform chosen
- [ ] All credentials added to deployment platform
- [ ] Local test with credentials complete
- [ ] Database migrations ready (`npx prisma migrate deploy`)

---

## 🔐 Security Notes

**DO NOT:**
- ❌ Commit `.env.production` to GitHub
- ❌ Share credentials in emails
- ❌ Use test keys in production
- ❌ Hardcode secrets in code

**DO:**
- ✅ Add credentials via platform UI (Vercel, AWS, etc.)
- ✅ Rotate keys periodically
- ✅ Use different keys for dev/prod
- ✅ Monitor API usage
- ✅ Setup alerts for unusual activity

---

## 📊 Cost Summary

| Service | Free Tier | Monthly Cost |
|---------|-----------|-------------|
| Neon (Database) | 3GB | $15 |
| Gmail SMTP | Unlimited* | $0 |
| Vercel (Hosting) | 100GB | $20 |
| Upstash (Redis) | Free | Free |
| SendGrid | 100/day | $10 |
| Razorpay | No fee | 2% + ₹3/txn |
| **TOTAL** | **Free tier possible** | **~$45/month** |

*Gmail has limits (~500 emails/day). Use SendGrid for high volume.

---

## 🐛 Troubleshooting

**Q: "SMTP Error: connect ECONNREFUSED"**
- Check SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
- Verify credentials are correct

**Q: "OTP not arriving"**
- Check SMTP credentials work locally first
- Gmail: Verify app password is 16 characters
- SendGrid: Check API key has Mail Send permission

**Q: "Razorpay payment failing"**
- Verify using LIVE keys, not TEST keys
- Check webhook URL is correct
- Verify webhook secret matches

**Q: "NextAuth session not working"**
- NEXTAUTH_SECRET must be same on all deployments
- Don't regenerate - will invalidate all sessions

---

## 📞 Next Steps

1. **Gather credentials** (use checklist above)
2. **Test locally** with real credentials
3. **Choose hosting** (Vercel recommended)
4. **Add environment variables** to platform
5. **Deploy** and test
6. **Monitor** for errors in first 24 hours

**You're ready for production! 🎉**
