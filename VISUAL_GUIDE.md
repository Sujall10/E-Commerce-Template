# Visual Setup Guide

## 🎯 Goal Flow

```
Your E-Commerce Platform
├── Users can sign up/login
│   ├── Via Email OTP (Primary) ✅
│   └── Via Google (Ready) ⚠️
├── Users get dashboard
│   └── View products, make purchases
└── Admins get special access
    ├── User Management ✅
    ├── Product Management ✅
    └── Order Management ✅
```

---

## 📍 User Journey

### New User (OTP Login)
```
1. Click "Email OTP"
   ↓
2. Enter email → "john@example.com"
   ↓
3. Receive OTP → "123456"
   ↓
4. Enter OTP Code
   ↓
5. ✅ Logged In! (See email in header)
```

### Admin Promotion
```
Admin User (existing):
1. Go to `/admin/users`
2. Find user in list
3. Click "Make Admin"
4. User is now admin!

Regular User (after promotion):
1. Refresh page / Log out & back in
2. "Admin" link now visible in header
3. Access full admin panel
```

### Admin Features
```
/admin
├── Dashboard
│   ├── Total Orders
│   ├── Revenue
│   └── Recent Activity
├── Users Management
│   ├── See all users
│   ├── View user details
│   ├── Change user roles
│   └── View order history
├── Products Management
│   ├── Create new product
│   ├── Edit product
│   ├── Delete product
│   └── View inventory
└── Orders Management
    ├── View all orders
    ├── See customer info
    ├── Update order status
    └── Track fulfillment
```

---

## 🛠️ Technical Setup Path

### Step 1: Clone & Install
```bash
# Get the project
git clone your-repo-url
cd E-Commerce\ Template

# Install dependencies
npm install
```

### Step 2: Environment Setup
```bash
# Create .env.local from example
cp .env.example .env.local

# Edit .env.local and add:
# - DATABASE_URL (PostgreSQL)
# - NEXTAUTH_SECRET (generate: openssl rand -base64 32)
# - JWT_SECRET (generate: openssl rand -base64 32)
# - NEXTAUTH_URL=http://localhost:3000
```

### Step 3: Database Setup
```bash
# Create database tables
npx prisma migrate dev --name init

# Add sample data (optional)
node prisma/seed.js

# View database (optional)
npm run prisma:studio
```

### Step 4: Start Server
```bash
npm run dev
# Opens at http://localhost:3000
```

### Step 5: Create First Admin
```
Method A: Via Prisma Studio
1. Run: npm run prisma:studio
2. Go to http://localhost:5555
3. Click Users table
4. Find your user
5. Set role to ADMIN
6. Save

Method B: Via Database Query
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

### Step 6: Test Everything
```
1. Open http://localhost:3000
2. Click "Email OTP"
3. Enter your email
4. Enter OTP from console
5. Sign in - you should see your email in header!
6. (If promoted to admin) Click "Admin" link
7. You're now in admin panel!
```

---

## 📱 UI Locations

### Main Site (`/`)
```
Header
├── Logo (ShopHub)
├── Nav (Products, Admin*)
├── Cart Icon
└── Auth Buttons
    ├── Email OTP
    └── Google SignIn

*Admin link only shows if you're an admin
```

### Auth Modal (Email OTP)
```
Step 1: Enter Email
├── Email input field
├── "Send OTP" button
└── Error messages

Step 2: Verify Code
├── Shows: "Enter code sent to john@example.com"
├── 6-digit input field
├── "Verify OTP" button
├── "Use different email" link
└── Error/Success messages
```

### Admin Panel (`/admin`)
```
Sidebar Navigation
├── Dashboard
├── Users
├── Products
├── Orders
└── Back to Store

Main Content Area
└── Page content changes based on selection
```

### Users Management (`/admin/users`)
```
Table of Users
├── Email (Required)
├── Name (Optional)
├── Role (USER/ADMIN)
├── Orders Count
├── Joined Date
└── Actions
    ├── "Make Admin" button (if USER)
    └── "Remove Admin" button (if ADMIN)
```

---

## 🔐 Authentication Flow Diagram

### OTP Authentication
```
┌─────────────────┐
│   User at Home  │
│   Click OTP     │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  Frontend: OTPModal Component        │
│  ├─ User enters email               │
│  ├─ Validates format                │
│  └─ Calls /api/auth/otp/send        │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  Backend: OTP Send Route            │
│  ├─ Normalize email (lowercase)     │
│  ├─ Check rate limit                │
│  ├─ Generate 6-digit OTP            │
│  ├─ Store OTP (with 5 min expiry)   │
│  ├─ Send email (if SMTP config)     │
│  └─ Return success                  │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  Frontend: User sees "Check email"  │
│  ├─ Shows OTPModal step 2           │
│  ├─ 6-digit input field             │
│  ├─ User enters OTP code            │
│  └─ Calls /api/auth/otp/verify      │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  Backend: OTP Verify Route          │
│  ├─ Normalize email                 │
│  ├─ Retrieve stored OTP             │
│  ├─ Compare with provided OTP       │
│  ├─ If match: Find or create user   │
│  ├─ Generate JWT token              │
│  ├─ Set httpOnly cookie             │
│  ├─ Delete used OTP                 │
│  └─ Return JWT + user data          │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  Frontend: Success!                 │
│  ├─ Store JWT in localStorage       │
│  ├─ Redirect to home                │
│  ├─ Page reloads                    │
│  └─ Header shows user email         │
└─────────────────────────────────────┘
```

### Admin Access Flow
```
┌─────────────────────────┐
│  Admin Opens /admin     │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────────────────────────┐
│  Admin Layout Check                          │
│  ├─ Check for NextAuth session? NO          │
│  ├─ Check for JWT in localStorage? YES      │
│  ├─ Decode JWT to extract role              │
│  ├─ role === 'ADMIN'? YES                   │
│  └─ Allow access ✅                          │
└────────┬────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────┐
│  Admin Dashboard Loads                       │
│  ├─ Show sidebar with all admin options     │
│  ├─ Load dashboard data                     │
│  └─ Render main content                     │
└─────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema (Key Tables)

### User Table
```
id: String (Primary Key)
email: String (Unique)
name: String (Optional)
image: String (Optional)
role: 'USER' | 'ADMIN'
createdAt: DateTime
updatedAt: DateTime
```

### Product Table
```
id: String (Primary Key)
title: String
slug: String (Unique)
description: String
price: Int (in paise, e.g., 10000 = ₹100)
images: String[] (URLs)
sku: String (Optional)
stock: Int
category: String (Optional)
createdAt: DateTime
updatedAt: DateTime
```

### Order Table
```
id: String (Primary Key)
userId: String (Foreign Key)
amount: Int (in paise)
currency: String ('INR')
razorpayOrderId: String (Optional)
razorpayPaymentId: String (Optional)
status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'FAILED' | 'REFUNDED' | 'CANCELLED'
items: JSON (cart items)
shippingAddress: JSON
paymentMethod: String (Optional)
notes: String (Optional)
createdAt: DateTime
updatedAt: DateTime
```

---

## 📊 Data Flow Diagram

### Product Display Flow
```
User visits homepage
        ↓
Frontend: page.tsx calls getProducts()
        ↓
API: /api/products (public)
        ↓
Database: SELECT * FROM Product
        ↓
Return products JSON
        ↓
Frontend: Render ProductCard for each
```

### Order Creation Flow
```
User clicks "Buy Now"
        ↓
Frontend: Cart page
        ↓
Frontend: Calls /api/razorpay/create-order
        ↓
Backend: Creates Order record (PENDING status)
        ↓
Returns Razorpay order ID
        ↓
Frontend: Opens Razorpay payment modal
        ↓
User pays via Razorpay
        ↓
Razorpay webhook calls /api/razorpay/webhook
        ↓
Backend: Updates Order status to PAID
        ↓
User sees order confirmation
```

---

## 🎯 Common URLs

### Public Pages
- `http://localhost:3000/` - Homepage
- `http://localhost:3000/products` - Products listing
- `http://localhost:3000/product/[slug]` - Product detail
- `http://localhost:3000/cart` - Shopping cart
- `http://localhost:3000/checkout` - Checkout page

### Admin Pages (Requires Admin Role)
- `http://localhost:3000/admin` - Admin dashboard
- `http://localhost:3000/admin/users` - User management
- `http://localhost:3000/admin/products` - Product management
- `http://localhost:3000/admin/orders` - Order management

### Auth Endpoints (API)
- `POST /api/auth/otp/send` - Send OTP
- `POST /api/auth/otp/verify` - Verify OTP
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints

---

## ✅ Verification Checklist

After setup, verify these work:

```
Basic Setup
☐ npm install completes without errors
☐ npm run dev starts without errors
☐ http://localhost:3000 loads in browser
☐ Database migrations complete

OTP Authentication
☐ "Email OTP" button visible
☐ Can enter email
☐ OTP generates (check console)
☐ Can enter 6-digit code
☐ Can sign in successfully
☐ Email shows in header after login

Session Persistence
☐ Refresh page - still logged in
☐ JWT token in localStorage
☐ Sign out removes token
☐ Page redirects to home

Admin Features
☐ Admin user has "Admin" link in header
☐ Can access /admin dashboard
☐ Can see Users page
☐ Can see Products page
☐ Can see Orders page
☐ Can promote users to admin
☐ User changes take effect immediately
```

---

## 🚀 You're Ready!

Follow the setup steps above and you'll have a fully functional e-commerce platform with:
- ✅ OTP-based authentication
- ✅ Admin management panel
- ✅ User role system
- ✅ Product & Order management
- ✅ Secure JWT authentication
- ✅ Production-ready architecture

**Start with SETUP_CHECKLIST.md for detailed instructions!**
