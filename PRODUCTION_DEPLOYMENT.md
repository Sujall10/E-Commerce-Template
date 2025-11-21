# Production Deployment Guide

## 🚀 Complete Production Checklist

### Phase 1: Environment Credentials Setup

#### 1. **Database (PostgreSQL)**
- ✅ Already using: Neon (managed PostgreSQL)
- No additional setup needed for production
- Connection string already in `.env`

#### 2. **Email Service (OTP Delivery)**
Choose ONE option:

##### **Option A: Gmail (Free, Easiest)**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
```

**Steps:**
1. Go to https://myaccount.google.com/apppasswords
2. Enable 2-Factor Authentication first
3. Generate "App Password" for Mail
4. Copy the 16-character password
5. Add to `.env` or `.env.production`

##### **Option B: SendGrid (Professional)**
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your_api_key_here
```

**Steps:**
1. Sign up at https://sendgrid.com
2. Create API Key with Mail Send permission
3. Add credentials to `.env.production`

##### **Option C: AWS SES (Scalable)**
```
SMTP_HOST=email-smtp.region.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_iam_username
SMTP_PASS=your_generated_password
```

**Steps:**
1. Setup AWS SES (https://aws.amazon.com/ses/)
2. Verify sending email
3. Generate SMTP credentials
4. Add to `.env.production`

---

#### 3. **Authentication (Google OAuth)**
```
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
```

**Steps to Get:**
1. Go to https://console.cloud.google.com
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web Application)
5. Add authorized redirect URIs:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```
6. Copy Client ID and Secret

---

#### 4. **Payment Gateway (Razorpay)**
```
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxx
```

**Steps to Get:**
1. Go to https://dashboard.razorpay.com
2. Login/Signup
3. Go to Settings → API Keys
4. Switch from Test to Live
5. Copy Key ID and Key Secret
6. Setup webhook at: `https://yourdomain.com/api/razorpay/webhook`
7. Get webhook secret from Razorpay dashboard

---

#### 5. **NextAuth Secrets**
```
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=generate_random_secret
JWT_SECRET=generate_random_secret
```

**Generate Secrets:**
```bash
# In terminal, run:
openssl rand -base64 32
```

Generate this command twice for two different secrets.

---

### Phase 2: Redis Setup (Optional but Recommended)

For production OTP rate limiting and caching:

#### **Option A: Upstash (Easiest for Vercel)**
```
REDIS_URL=redis://:password@xxxxx.upstash.io:xxxxx
```

**Steps:**
1. Go to https://upstash.com
2. Create free Redis database
3. Copy connection string
4. Add to `.env.production`

#### **Option B: AWS ElastiCache**
1. Create Redis cluster in AWS
2. Get connection endpoint
3. Add to `.env.production`

---

### Phase 3: Production .env Template

```bash
# Database
DATABASE_URL=postgresql://user:password@host/dbname

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_random_secret_here
JWT_SECRET=your_jwt_secret_here

# Email (OTP Delivery)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Google OAuth
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx

# Razorpay (Live Keys)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxx

# Redis (Optional)
REDIS_URL=redis://:password@host:port

# Environment
NODE_ENV=production
```

---

## 🌐 Deployment Platforms

### **Option 1: Vercel (Recommended - Official Next.js)**

**Steps:**
1. Push code to GitHub
2. Go to https://vercel.com
3. Click "Import Project"
4. Select your GitHub repo
5. Add environment variables (from Phase 3)
6. Click "Deploy"
7. Add custom domain if needed

**Vercel + Upstash Redis:**
- Perfect combination
- Free tier available
- Auto-scales

### **Option 2: AWS Amplify**

**Steps:**
1. Connect GitHub repo
2. Build settings auto-detected
3. Add environment variables
4. Deploy

### **Option 3: Railway.app**

**Steps:**
1. Connect GitHub
2. Add environment variables
3. Deploy

### **Option 4: Self-hosted (DigitalOcean/AWS/Linode)**

**Requirements:**
- Node.js 18+
- PostgreSQL
- Redis
- Domain with SSL

---

## 📝 What to Deploy

**Files to include:**
```
✅ app/
✅ components/
✅ lib/
✅ prisma/
✅ public/
✅ next.config.js
✅ package.json
✅ tsconfig.json
✅ tailwind.config.ts
❌ .env.local (NOT INCLUDED - add in deployment platform)
❌ node_modules/ (auto-installed)
❌ .next/ (auto-built)
```

**Don't commit to GitHub:**
- `.env.local`
- `.env.production`
- `node_modules/`
- `.next/`

---

## 🔄 Production OTP Flow

```
User enters email
        ↓
System generates 6-digit OTP
        ↓
Stores in Redis with 5-min TTL (rate-limited)
        ↓
Sends via SMTP (Gmail/SendGrid/AWS SES)
        ↓
User receives email with OTP code
        ↓
User enters OTP in login modal
        ↓
System verifies from Redis storage
        ↓
Creates JWT token + Sets secure cookie
        ↓
User authenticated & logged in
```

---

## ⚙️ Production Code Changes

Update these for production:

### 1. **Enable Redis OTP Storage**
File: `app/api/auth/otp/send/route.ts`

Change from:
```typescript
const otpStore = new Map(...) // In-memory
```

To:
```typescript
const redis = await getRedisClient() // Redis
await redis.set(otpKey, otp, { EX: 300 })
```

### 2. **Security Headers**
File: `next.config.js`

Add:
```javascript
async headers() {
  return [{
    source: '/:path*',
    headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-XSS-Protection', value: '1; mode=block' }
    ]
  }]
}
```

### 3. **Disable Dev Logging**
File: `app/api/auth/otp/send/route.ts`

Remove:
```typescript
console.log(`[DEV] OTP for ${email}: ${otp}`); // Remove this
```

### 4. **HTTPS Only**
File: `.env.production`

Set:
```
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com (not http)
```

---

## 🧪 Pre-Deployment Testing

Before deploying:

1. **Test OTP Email Sending**
   ```bash
   # Update .env.local with real Gmail credentials
   npm run dev
   # Test email OTP flow
   ```

2. **Test Database Connection**
   ```bash
   npx prisma migrate status
   npx prisma db seed
   ```

3. **Test All Features**
   - Email OTP signup
   - Google OAuth login
   - Add to cart
   - Razorpay checkout (test mode)
   - Admin panel access

4. **Check Environment**
   ```bash
   npm run build
   # Should complete with no errors
   ```

---

## 🔐 Security Checklist

- [ ] NEXTAUTH_SECRET is strong (32+ chars)
- [ ] JWT_SECRET is strong
- [ ] No credentials in git (check .gitignore)
- [ ] HTTPS enabled (not HTTP)
- [ ] CORS properly configured
- [ ] Rate limiting enabled on APIs
- [ ] Admin routes protected
- [ ] Payment webhook signature verified
- [ ] Database backups configured
- [ ] Error logs don't expose secrets

---

## 📊 Cost Estimation

**Monthly costs for small app:**

| Service | Free Tier | Paid |
|---------|-----------|------|
| Vercel | Yes | $20/mo |
| Neon DB | 3GB free | $15/mo |
| Upstash Redis | Free | $5/mo |
| Gmail SMTP | Free | - |
| SendGrid Email | 100/day free | $10/mo |
| Razorpay | Transaction fee: 2% + ₹3 | - |
| **Total** | **$0** | **$50/mo** |

---

## 🚨 Common Deployment Errors

### "SMTP Error: connect ECONNREFUSED"
- **Cause**: SMTP credentials wrong
- **Fix**: Check SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS

### "Razorpay webhook signature invalid"
- **Cause**: Using test keys in production
- **Fix**: Switch to live keys in dashboard

### "Database connection failed"
- **Cause**: DATABASE_URL not set
- **Fix**: Add to platform environment variables

### "NextAuth session not working"
- **Cause**: NEXTAUTH_SECRET not set or different per deploy
- **Fix**: Set once and keep consistent

---

## ✅ Final Checklist Before Going Live

- [ ] All credentials added to deployment platform
- [ ] Database migrations run (`npx prisma migrate deploy`)
- [ ] Seed data loaded (`npx prisma db seed`)
- [ ] Email delivery tested (send test OTP)
- [ ] Google OAuth tested
- [ ] Razorpay live keys configured
- [ ] Redis connected (if using)
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Monitoring/logging setup
- [ ] Backup strategy in place
- [ ] Support email/contact configured

---

## 📞 Support & Documentation

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **NextAuth Docs**: https://next-auth.js.org
- **Prisma Docs**: https://www.prisma.io/docs
- **Razorpay Docs**: https://razorpay.com/docs
- **SendGrid Docs**: https://docs.sendgrid.com

**You're ready for production!** 🎉
