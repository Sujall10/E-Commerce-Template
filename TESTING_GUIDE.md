# E-Commerce Platform - Testing Guide

## ✅ Quick Start - Testing OTP Feature

### Email OTP Authentication (Works Now - No Setup Required!)

1. **Click "Sign In" button** in the header
2. **Click "Email OTP"** tab in the modal
3. **Enter any email address** (e.g., `test@example.com`)
4. **Click "Send OTP"**
5. **Check the terminal/console logs** for the OTP code
   - You'll see: `[DEV] OTP for test@example.com: 123456`
6. **Enter the 6-digit code** in the verify field
7. **Click "Verify OTP"**
8. ✅ You're now signed in!

**Note:** In development mode, OTPs are printed to the console. In production, configure SMTP credentials to send via email.

---

## 🔧 Google OAuth Setup (Optional)

To enable "Google Sign In":

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google` (for production)
6. Copy your Client ID and Secret
7. Update `.env.local`:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```
8. Restart the server

---

## 📧 Email OTP via Gmail (Optional)

To send OTPs via email instead of console logging:

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Update `.env.local`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```
4. Restart the server

---

## 💳 Razorpay Payment Testing

To enable Razorpay payments:

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Get your Test Keys (for development)
3. Update `.env.local`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=xxxxx
   RAZORPAY_WEBHOOK_SECRET=whsec_xxxxx
   ```
4. Use Razorpay test card numbers for testing

**Test Card (Success):**
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits

---

## 🧪 Features to Test

### 1. **Browse Products** ✅
   - Homepage shows 5 sample products
   - Click product to view details
   - Images load from placeholder service

### 2. **Authentication** ✅
   - Email OTP (currently working)
   - Google OAuth (optional - configure above)
   - Sign Out functionality

### 3. **Shopping Cart** ✅
   - Add products to cart
   - Cart persists in localStorage
   - Update quantities
   - View cart summary

### 4. **Checkout** (Requires Razorpay setup)
   - Add shipping details
   - Review order
   - Razorpay payment modal
   - Order confirmation

### 5. **Admin Panel** (After signing in)
   - Access `/admin`
   - View all orders
   - Manage products (add/edit/delete)
   - View order status

---

## 🐛 Troubleshooting

**Q: OTP not showing?**
- A: Check the browser console (F12) or terminal where server is running
- Look for `[DEV] OTP for email: XXXXXX`

**Q: Google Sign In not working?**
- A: Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in `.env.local`
- Verify redirect URLs match exactly in Google Cloud Console

**Q: Images not loading?**
- A: They're using placeholder service (https://via.placeholder.com)
- Replace with real product images in database seed if needed

**Q: Database connection error?**
- A: Check DATABASE_URL in `.env.local`
- Ensure Neon PostgreSQL connection is active

---

## 📝 Environment Variables Reference

```env
# REQUIRED (already configured)
DATABASE_URL=your_neon_url
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
JWT_SECRET=your_jwt_secret

# OPTIONAL (for enhanced features)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

---

## 🎯 Demo Flow

**Best way to test the full user journey:**

1. Open `http://localhost:3000`
2. Browse products
3. Click a product for details
4. Add to cart
5. Go to cart (header icon)
6. Click "Proceed to Checkout"
7. Click "Sign In"
8. Use Email OTP to authenticate
9. Complete checkout form
10. Try Razorpay payment (if configured)

---

**Happy Testing! 🚀**
