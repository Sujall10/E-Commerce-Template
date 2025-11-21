# Quick Reference - OTP Testing

## The One-Minute Test

```
1. Open http://localhost:3000
2. Click "Sign In" button (top right)
3. Click "Email OTP"
4. Type: test@example.com
5. Click "Send OTP"
6. 👀 Look at TERMINAL where server is running
   👇 You should see this:
   [DEV] OTP for test@example.com: 123456
7. Paste the 6-digit code into the modal
8. Click "Verify OTP"
9. ✅ Signed in!
```

## Where to Find Your OTP Code

**Terminal Output Example:**
```
✓ Compiled /api/auth/otp/send in 2s
[DEV] OTP for test@example.com: 456789
GET /api/auth/otp/send 200 in 145ms
```

Look for the line with `[DEV] OTP for YOUR_EMAIL: XXXXXX`

## Files Changed for OTP

```
✅ app/api/auth/otp/send/route.ts    - In-memory storage, console logging
✅ app/api/auth/otp/verify/route.ts  - OTP verification logic
✅ components/Header.tsx              - Added Google signin button
✅ prisma/seed.js                     - Fixed product images
```

## Google Sign In Button

Already visible in Header. To make it work:

1. Get Google OAuth credentials (setup in TESTING_GUIDE.md)
2. Add to .env.local:
   ```
   GOOGLE_CLIENT_ID=your_id
   GOOGLE_CLIENT_SECRET=your_secret
   ```
3. Restart server

## The Full OTP Flow

```
User enters email
        ↓
Generates random 6-digit OTP
        ↓
Stores in memory with 5-min expiry
        ↓
Logs to console: [DEV] OTP for email: 123456
        ↓
User copies code from terminal
        ↓
Enters code in modal
        ↓
Verifies against stored OTP
        ↓
If correct: Creates user, generates JWT token
        ↓
Sets auth cookie, redirects to home
```

## In Production

When deploying to production, the OTP system will:
1. Not log to console (remove [DEV] prefix)
2. Use Redis for storage (if configured)
3. Send via email (if SMTP configured)

But for local testing - everything works as-is! 🎉
