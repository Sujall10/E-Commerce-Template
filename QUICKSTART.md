# 🚀 QUICK START GUIDE - Production E-Commerce Store

## ✅ Project Setup Complete!

Your production-ready e-commerce platform has been generated with all necessary files. Here's what you need to do next:

---

## 📋 What's Included

✅ **Full Next.js 14 App Router setup** with TypeScript  
✅ **Complete API routes** for products, auth, payments, admin  
✅ **Prisma ORM** with PostgreSQL schema  
✅ **NextAuth.js v4** with Google OAuth + Email OTP  
✅ **Razorpay payment integration** with webhook handling  
✅ **Admin dashboard** with role-based access  
✅ **Shopping cart** with checkout flow  
✅ **Redis integration** for sessions/OTP storage  
✅ **Email notifications** via Nodemailer  
✅ **Tailwind CSS** styling with responsive design  
✅ **Full README** with deployment instructions  

---

## 🔧 Step 1: Dependencies Installation

```bash
cd "c:\Users\ruhi0\Desktop\E-Commerce Template"
npm install --legacy-peer-deps
# or use: pnpm install
```

⏳ This is currently running in the background...

---

## 📁 Step 2: Environment Configuration

Copy the example to actual env file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in these values:

### Database
```env
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce?schema=public
```

**Get PostgreSQL:**
- Local: [postgresql.org](https://www.postgresql.org/download/)
- Cloud: [Neon](https://neon.tech) | [Supabase](https://supabase.com) | [Railway](https://railway.app)

### Authentication
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-here
# Generate with: openssl rand -base64 32

# Optional: Google OAuth
GOOGLE_CLIENT_ID=get-from-google-cloud-console
GOOGLE_CLIENT_SECRET=get-from-google-cloud-console
```

**Get Google OAuth Credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web application)
4. Set redirect URI: `http://localhost:3000/api/auth/callback/google`

### Email (Nodemailer)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Setup Gmail App Password:**
1. Enable 2-Step Verification: [myaccount.google.com/security](https://myaccount.google.com/security)
2. Generate App Password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Copy password to `SMTP_PASS`

### Redis
```env
REDIS_URL=redis://localhost:6379
```

**Get Redis:**
- Local: [redis.io/download](https://redis.io/download)
- Cloud: [Upstash](https://upstash.com) (serverless, perfect for Vercel)

### Razorpay Payments
```env
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxx
JWT_SECRET=your-jwt-secret
```

**Get Razorpay Credentials:**
1. Sign up at [razorpay.com](https://razorpay.com)
2. Go to Settings → API Keys → Test mode
3. Copy Key ID and Key Secret
4. Generate Webhook Secret (use in webhook setup later)

---

## 🗄️ Step 3: Database Setup

Once dependencies finish installing and `.env.local` is configured:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev --name init

# Seed sample data (products, etc.)
node prisma/seed.js

# (Optional) Open Prisma Studio GUI
npx prisma studio
```

---

## ▶️ Step 4: Run Development Server

```bash
npm run dev
# or: pnpm dev
```

Open **[http://localhost:3000](http://localhost:3000)** in browser

---

## ✨ Step 5: Test Core Features

### 🏠 Homepage
- [ ] Homepage loads with featured products
- [ ] Navigation bar visible with Sign In options

### 🛍️ Shopping
- [ ] Browse products page works
- [ ] Click product → details page loads
- [ ] Add to cart → item saved to localStorage

### 🔐 Authentication
- [ ] **Email OTP**: Click "Email Login" → enter email → verify OTP
- [ ] **Google Sign-In**: Click "Sign In" → Google OAuth popup
- [ ] After login, cart icon shows user session

### 💳 Checkout
- [ ] Add product to cart
- [ ] Go to cart page → see items
- [ ] Click "Proceed to Checkout"
- [ ] Fill shipping details
- [ ] Click "Pay Now" → Razorpay modal opens

### 💰 Razorpay Test Payment
- [ ] Use test card: **4111 1111 1111 1111**
- [ ] Any future expiry date, any CVV
- [ ] Click Pay
- [ ] After payment, order confirmation appears

### 👨‍💼 Admin Panel
- [ ] Go to `/admin` (only works if user role = ADMIN)
- [ ] See dashboard with stats
- [ ] Go to Products → add/edit/delete products
- [ ] Go to Orders → see and update order statuses

---

## 📊 Project Structure

```
E-Commerce Template/
├── app/                              # Next.js App Router
│   ├── api/
│   │   ├── auth/                    # Authentication endpoints
│   │   │   ├── [...nextauth]/       # NextAuth handler
│   │   │   └── otp/                 # Email OTP flow
│   │   ├── products/                # Product endpoints
│   │   ├── razorpay/                # Payment endpoints
│   │   └── admin/                   # Admin product/order endpoints
│   ├── admin/                       # Admin pages (protected)
│   ├── product/[slug]/              # Product detail page
│   ├── products/                    # Products listing
│   ├── checkout/                    # Checkout page
│   ├── cart/                        # Shopping cart
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Homepage
│   └── globals.css                  # Global styles
├── components/                      # React components
│   ├── Header.tsx                   # Navigation
│   ├── OTPModal.tsx                 # Email login modal
│   └── ProductCard.tsx              # Product display
├── lib/
│   ├── prisma.ts                    # Database client
│   ├── redis.ts                     # Cache/sessions
│   ├── auth.config.ts               # NextAuth configuration
│   ├── email.ts                     # Email templates
│   ├── constants.ts                 # Routes & API paths
│   └── middleware.ts                # Auth helpers
├── prisma/
│   ├── schema.prisma                # Database schema
│   └── seed.js                      # Sample data
├── .env.example                     # Environment template
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── tailwind.config.ts              # Tailwind config
├── next.config.js                   # Next.js config
└── README.md                        # Full documentation
```

---

## 🔗 Important Routes

### Customer Routes
- `/` - Homepage
- `/products` - Product listing
- `/product/[slug]` - Product details
- `/cart` - Shopping cart
- `/checkout` - Checkout page
- `/api/auth/signin` - Sign in page

### Admin Routes (Protected)
- `/admin` - Dashboard
- `/admin/products` - Product management
- `/admin/orders` - Order management

### API Endpoints
- `POST /api/auth/otp/send` - Send OTP
- `POST /api/auth/otp/verify` - Verify OTP
- `GET /api/products` - List products
- `GET /api/products/[slug]` - Get product
- `POST /api/razorpay/create-order` - Create order
- `POST /api/razorpay/webhook` - Razorpay webhook
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/[id]` - Update product
- `DELETE /api/admin/products/[id]` - Delete product
- `GET /api/admin/orders` - List orders

---

## 🎯 Next Steps for Production

### 1. Test Everything Locally
- [ ] All features tested with real data
- [ ] Email sending verified
- [ ] Payment flow tested with Razorpay test keys

### 2. Customize Branding
- [ ] Update site name in `Header.tsx`
- [ ] Customize colors in `tailwind.config.ts`
- [ ] Update product categories in database
- [ ] Add company logo

### 3. Security Hardening
- [ ] Replace Nodemailer with SendGrid/Postmark
- [ ] Add rate limiting to OTP endpoint
- [ ] Add CAPTCHA to prevent abuse
- [ ] Enable CORS properly

### 4. Deploy to Vercel
```bash
# Push code to GitHub
git add .
git commit -m "Initial e-commerce setup"
git push

# Deploy to Vercel
# 1. Go to vercel.com
# 2. Import GitHub repository
# 3. Set environment variables
# 4. Deploy
```

### 5. Configure Razorpay Webhook
- Razorpay Dashboard → Settings → Webhooks
- Add Endpoint: `https://yourdomain.com/api/razorpay/webhook`
- Events: `payment.captured`, `payment.failed`
- Secret: Use `RAZORPAY_WEBHOOK_SECRET` from `.env`

---

## 🆘 Troubleshooting

### "npm install" fails
```bash
npm install --legacy-peer-deps
```

### Prisma Client not found
```bash
npx prisma generate
npm install @prisma/client
```

### Redis connection error
- Ensure Redis is running: `redis-cli ping`
- Check `REDIS_URL` in `.env.local`

### Email not sending
- Check SMTP credentials
- Gmail: Enable "Less secure apps" OR use App Password
- For production: Switch to SendGrid/Postmark

### Database migration fails
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### NextAuth session not working
- Verify `NEXTAUTH_SECRET` is set
- Check cookies in browser DevTools
- Clear browser cache and cookies

### Razorpay payment not processing
- Use test keys from dashboard
- Use test card: 4111 1111 1111 1111
- Check webhook configuration
- Verify webhook secret matches

---

## 📚 Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Run production build

# Database
npx prisma migrate dev   # Create and run migration
npx prisma studio       # Open database GUI
npx prisma generate     # Generate Prisma client

# Seed data
node prisma/seed.js     # Add sample products

# Code quality
npm run lint            # Run linter (when configured)
```

---

## 📖 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [Razorpay Docs](https://razorpay.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

## 🎉 You're All Set!

Your production-ready e-commerce platform is ready to roll. Start with Step 1 and follow through all steps above.

**Questions?** Check the full `README.md` for detailed documentation.

**Good luck! 🚀**
