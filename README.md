# E-Commerce Production-Ready Template

A complete, production-ready e-commerce store built with **Next.js 14** (App Router), **TypeScript**, **Prisma**, **PostgreSQL**, **NextAuth.js**, **Redis**, and **Razorpay** payment integration.

## ✨ Features

### Authentication
- ✅ **Google OAuth Sign-In** via NextAuth.js
- ✅ **Email OTP Login** with Redis-based session storage
- ✅ **Role-Based Access Control** (USER | ADMIN)
- ✅ **Secure HTTP-Only Cookies** for session management

### E-Commerce Core
- ✅ **Product Management** (CRUD operations via Admin panel)
- ✅ **Shopping Cart** (localStorage-based, synced to backend)
- ✅ **Product Search & Pagination**
- ✅ **Product Details** with images, pricing, stock tracking

### Payment Integration
- ✅ **Razorpay Checkout** (Client-side payment form)
- ✅ **Server-Side Order Creation** (prevents tampering)
- ✅ **Webhook Verification** (SHA256-HMAC signature validation)
- ✅ **Order Status Tracking** (PENDING → PAID → PROCESSING → SHIPPED → DELIVERED)

### Admin Dashboard
- ✅ **Product CRUD** with SKU & stock management
- ✅ **Order Management** with status updates
- ✅ **Analytics Dashboard** (orders, revenue stats)
- ✅ **Admin Route Protection**

### Data & Infrastructure
- ✅ **PostgreSQL** via Prisma ORM
- ✅ **Redis** for OTP/session ephemeral storage
- ✅ **NextAuth Prisma Adapter** for OAuth persistence
- ✅ **Email Notifications** via Nodemailer (customizable for Sendgrid/Postmark)

### Frontend & UX
- ✅ **Tailwind CSS** styling
- ✅ **Responsive Design** (mobile-first)
- ✅ **Loading states & error handling**
- ✅ **SEO-friendly** with Next.js Metadata API

### Deployment-Ready
- ✅ **Vercel deployment** friendly (serverless API routes)
- ✅ **Environment-based configuration**
- ✅ **Secure secrets management**
- ✅ **Database migration scripts**

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Redis instance
- Google OAuth credentials (optional, for Google Sign-In)
- Razorpay account

### 1. Clone & Install

```bash
git clone <your-repo> ecommerce-prd
cd ecommerce-prd
pnpm install
# or: npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

**Required environment variables:**

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce?schema=public

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-long-random-secret-here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis
REDIS_URL=redis://localhost:6379

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxx

# JWT
JWT_SECRET=your-jwt-secret
```

### 3. Database Setup

```bash
# Run migrations
npx prisma migrate dev --name init

# Seed sample data
node prisma/seed.js

# (Optional) Open Prisma Studio
npx prisma studio
```

### 4. Run Development Server

```bash
pnpm dev
# or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
├── app/                           # Next.js App Router
│   ├── layout.tsx                # Root layout with SessionProvider
│   ├── page.tsx                  # Homepage
│   ├── globals.css               # Global styles + Tailwind
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts  # NextAuth handler
│   │   │   └── otp/
│   │   │       ├── send/route.ts       # OTP send endpoint
│   │   │       └── verify/route.ts     # OTP verify endpoint
│   │   ├── products/
│   │   │   ├── route.ts          # List products
│   │   │   └── [slug]/route.ts   # Get product by slug
│   │   ├── razorpay/
│   │   │   ├── create-order/route.ts   # Create Razorpay order
│   │   │   └── webhook/route.ts        # Razorpay webhook handler
│   │   └── admin/
│   │       ├── products/
│   │       │   ├── route.ts      # Admin: list/create products
│   │       │   └── [id]/route.ts # Admin: update/delete product
│   │       └── orders/route.ts   # Admin: list/update orders
│   ├── product/[slug]/page.tsx   # Product detail page
│   ├── products/page.tsx         # Products listing page
│   ├── cart/page.tsx             # Shopping cart page
│   ├── checkout/page.tsx         # Checkout page
│   └── admin/
│       ├── layout.tsx            # Admin layout with auth guard
│       ├── page.tsx              # Admin dashboard
│       ├── products/page.tsx     # Admin products listing
│       └── orders/page.tsx       # Admin orders listing
├── components/
│   ├── Header.tsx                # Navigation header
│   ├── OTPModal.tsx              # OTP sign-in modal
│   └── ProductCard.tsx           # Product card component
├── lib/
│   ├── prisma.ts                 # Prisma singleton
│   ├── redis.ts                  # Redis client
│   ├── auth.config.ts            # NextAuth configuration
│   ├── email.ts                  # Nodemailer setup & templates
│   ├── constants.ts              # API routes & app routes
│   └── middleware.ts             # Auth middleware helpers
├── prisma/
│   ├── schema.prisma             # Prisma data models
│   └── seed.js                   # Database seed script
├── .env.example                  # Environment template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md                     # This file
```

---

## 🔐 Authentication Flow

### Google OAuth (Recommended for Users)
1. User clicks "Sign In" → redirects to Google
2. Google authenticates user → callback to `/api/auth/[...nextauth]`
3. NextAuth creates session + Prisma user record
4. Session stored in httpOnly cookie

### Email OTP (Custom Flow)
1. User enters email → calls `/api/auth/otp/send`
2. OTP generated & stored in Redis (5-min expiry)
3. Email sent with OTP code
4. User enters OTP → calls `/api/auth/otp/verify`
5. User created/found in database
6. JWT token issued & stored in cookie
7. Session available for checkout

### Admin Protection
- Routes like `/admin` check `session.user.role === 'ADMIN'`
- API endpoints verify role in JWT token
- Non-admins redirected to homepage

---

## 💳 Payment Flow (Razorpay)

### Order Creation
1. User adds items to cart
2. Checkout page collects shipping details
3. Frontend calls `/api/razorpay/create-order`
4. Backend creates Razorpay order + stores in DB (status: PENDING)
5. Returns order details to frontend

### Payment Checkout
1. Razorpay Checkout modal opens
2. User enters card/UPI/wallet details
3. Payment processed by Razorpay

### Webhook Verification
1. Razorpay sends webhook to `/api/razorpay/webhook`
2. Backend verifies signature (SHA256-HMAC)
3. On `payment.captured` event → marks order as PAID
4. On `payment.failed` event → marks order as FAILED

### Security Notes
- Never trust client-side amounts; always recalculate on server
- Verify webhook signatures using `RAZORPAY_WEBHOOK_SECRET`
- Use Razorpay hosted checkout (PCI compliant)
- Store `razorpayOrderId` & `razorpayPaymentId` for reconciliation

---

## 📧 Email Setup

### Using Gmail (Development)
1. Enable 2-Step Verification on Google Account
2. Generate App Password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Set in `.env.local`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

### Production: Use Transactional Email Service
Replace Nodemailer with:
- **SendGrid**: `npm install @sendgrid/mail`
- **Postmark**: `npm install postmark`
- **AWS SES**: `npm install aws-sdk`

Update `lib/email.ts` with your provider's SDK.

---

## 🗄️ Database Models

### User
```prisma
- id (CUID, primary key)
- name, email (unique), image
- role (USER | ADMIN)
- createdAt, updatedAt
- relations: orders, accounts, sessions
```

### Product
```prisma
- id (CUID, primary key)
- title, slug (unique), description
- price (in paise, e.g., 49900 = ₹499)
- images (array of URLs)
- sku (unique), stock
- category
- createdAt, updatedAt
```

### Order
```prisma
- id (CUID, primary key)
- userId (FK to User)
- amount (in paise)
- currency (default: "INR")
- razorpayOrderId, razorpayPaymentId
- status (PENDING | PAID | PROCESSING | SHIPPED | DELIVERED | FAILED | REFUNDED | CANCELLED)
- items (JSON array of cart items)
- shippingAddress (JSON)
- createdAt, updatedAt
```

### NextAuth Tables (Auto-created by Prisma Adapter)
- `Account`, `Session`, `VerificationToken`

---

## 🔑 API Routes Reference

### Authentication
- `POST /api/auth/otp/send` - Send OTP email
- `POST /api/auth/otp/verify` - Verify OTP & create session
- `GET /api/auth/signin` - NextAuth sign-in page
- `POST /api/auth/signout` - Logout

### Products
- `GET /api/products?page=1&limit=12` - List products with pagination
- `GET /api/products/[slug]` - Get product by slug

### Admin
- `POST /api/admin/products` - Create product (requires ADMIN role)
- `PUT /api/admin/products/[id]` - Update product (requires ADMIN role)
- `DELETE /api/admin/products/[id]` - Delete product (requires ADMIN role)
- `GET /api/admin/orders` - List all orders (requires ADMIN role)
- `PATCH /api/admin/orders/[id]` - Update order status (requires ADMIN role)

### Razorpay
- `POST /api/razorpay/create-order` - Create order for checkout
- `POST /api/razorpay/webhook` - Webhook endpoint (configure in Razorpay dashboard)

---

## 🎨 Customization

### Styling
- Tailwind CSS is pre-configured
- Modify `tailwind.config.ts` for custom colors, fonts, etc.
- CSS variables in `app/globals.css`

### Email Templates
- Edit functions in `lib/email.ts`:
  - `generateOTPEmail(otp)`
  - `generateOrderConfirmationEmail(orderData)`

### Database Schema
- Modify `prisma/schema.prisma`
- Run `npx prisma migrate dev --name your_change_name`
- Update seed in `prisma/seed.js` if needed

### Product Fields
- Add fields to `Product` model in Prisma schema
- Update admin product form in `app/admin/products/page.tsx`

---

## 🚢 Deployment (Vercel)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/ecommerce-prd.git
git push -u origin main
```

### 2. Create Vercel Project
- Go to [vercel.com](https://vercel.com)
- Import repository
- Select Next.js framework preset

### 3. Set Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:

```
DATABASE_URL=postgresql://...  # Managed Postgres (Neon, Supabase)
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=random-secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
REDIS_URL=...  # Managed Redis (Upstash)
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
JWT_SECRET=...
```

### 4. Configure Razorpay Webhook
- Go to Razorpay Dashboard → Settings → Webhooks
- Add Endpoint: `https://yourdomain.com/api/razorpay/webhook`
- Paste `RAZORPAY_WEBHOOK_SECRET` value

### 5. Run Migrations
Option A: Vercel CLI
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

Option B: Vercel Deployment Settings
- Add build script in `package.json`:
  ```json
  "scripts": {
    "build": "npx prisma migrate deploy && next build"
  }
  ```

### 6. Deploy
```bash
git push
# Vercel auto-deploys on push to main
```

---

## 🔒 Security Checklist

- [ ] Set strong `NEXTAUTH_SECRET` (use `openssl rand -base64 32`)
- [ ] Use HTTPS only (Vercel enforces this)
- [ ] Enable `secure` & `httpOnly` cookies in production
- [ ] Configure CORS if frontend is on different domain
- [ ] Validate all user inputs with Zod schemas
- [ ] Rate-limit OTP endpoint to prevent abuse
- [ ] Use environment variables for secrets (never commit `.env.local`)
- [ ] Enable database backups (auto-enabled on managed services)
- [ ] Monitor for errors (Sentry, LogFlare)
- [ ] Regularly update dependencies

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Google Sign-In flow
- [ ] Email OTP sign-in flow
- [ ] Add product to cart
- [ ] Checkout with shipping details
- [ ] Razorpay payment (use test card: 4111111111111111)
- [ ] Admin: Create/edit/delete product
- [ ] Admin: Update order status
- [ ] Order webhook processing

### E2E Tests (Playwright)
```bash
npm install -D @playwright/test
npx playwright test
```

---

## 📚 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Cache/Session**: Redis
- **Auth**: NextAuth.js + Google OAuth
- **Payment**: Razorpay
- **Email**: Nodemailer
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

---

## 📝 License

MIT License - feel free to use for personal and commercial projects.

---

## 🆘 Troubleshooting

### "Prisma client not found"
```bash
npm install @prisma/client
npx prisma generate
```

### "Redis connection refused"
- Ensure Redis is running: `redis-cli ping` → should return `PONG`
- Check `REDIS_URL` in `.env.local`

### "NextAuth session not persisting"
- Verify `NEXTAUTH_SECRET` is set
- Check cookies in browser DevTools
- Ensure `NEXTAUTH_URL` matches your domain

### "Razorpay webhook not triggering"
- Configure webhook in Razorpay dashboard with exact URL
- Verify webhook secret matches
- Check server logs for signature mismatch errors

### "Email not sending"
- Test SMTP credentials with standalone script
- Check spam folder
- Enable "Less secure app access" if using Gmail
- Switch to transactional email service for production

---

## 📞 Support

- Documentation: [Next.js](https://nextjs.org), [Prisma](https://prisma.io), [NextAuth](https://next-auth.js.org)
- Razorpay Docs: [razorpay.com/docs](https://razorpay.com/docs)
- Issues? Open a GitHub issue or email support

---

**Happy selling! 🛍️**
