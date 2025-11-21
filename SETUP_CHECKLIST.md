# Setup Checklist

Complete these steps to get your e-commerce platform fully working:

## Phase 1: Environment Setup (Required)

- [ ] Copy `.env.example` to `.env.local`
- [ ] Set `NEXTAUTH_SECRET` - generate with: `openssl rand -base64 32`
- [ ] Set `JWT_SECRET` - generate with: `openssl rand -base64 32`
- [ ] Set `DATABASE_URL` pointing to your PostgreSQL database
- [ ] Set `NEXTAUTH_URL` to `http://localhost:3000` (dev) or your production URL

### Minimal .env.local for testing:
```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/ecommerce?schema=public
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here_at_least_32_chars
JWT_SECRET=your_random_jwt_secret_here_at_least_32_chars
NODE_ENV=development
```

## Phase 2: Database Setup (Required)

- [ ] Ensure PostgreSQL is running
- [ ] Run: `npm install` (if not already done)
- [ ] Run: `npx prisma migrate dev --name init` (creates tables)
- [ ] Run: `node prisma/seed.js` (adds sample data)

## Phase 3: Email Setup (For OTP, Optional but Recommended)

For Gmail:
- [ ] Create Google App Password at https://myaccount.google.com/apppasswords
- [ ] Add to `.env.local`:
```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_app_specific_password
```

**Without email setup:**
- OTP codes will still be logged to browser console in development
- You can test locally without real email

## Phase 4: Test OTP Authentication (Required)

- [ ] Start dev server: `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Click "Email OTP" button
- [ ] Enter any email (e.g., `admin@example.com`)
- [ ] Check console for OTP code (or email if SMTP configured)
- [ ] Enter the 6-digit code
- [ ] Verify: You should be logged in and see your email in header
- [ ] Refresh page - you should still be logged in

## Phase 5: Test Admin Features (Required)

### Create first admin user:
- [ ] Sign in with OTP to user account
- [ ] Open browser dev tools → Storage → localStorage
- [ ] Copy `authToken` value
- [ ] In database directly or via Prisma Studio:
  - Find your user by email
  - Set `role` column to `'ADMIN'`
- [ ] Refresh page - you should see "Admin" link in header
- [ ] Click "Admin" and you should access admin dashboard

### Alternative: Use Prisma Studio
```bash
npm run prisma:studio
```
- Go to User table
- Find your user by email
- Edit `role` field to `ADMIN`
- Save

### Test Admin Panel:
- [ ] Access `/admin` - should show dashboard
- [ ] Go to Users tab - see all registered users
- [ ] Go to Products tab - see products (empty initially)
- [ ] Go to Orders tab - see orders (empty initially)
- [ ] Try adding a product
- [ ] Try changing a user's role

## Phase 6: Google OAuth Setup (Optional)

If you want Google sign-in:

- [ ] Go to https://console.cloud.google.com
- [ ] Create new project or select existing
- [ ] Enable "Google+ API"
- [ ] Go to "Credentials"
- [ ] Create OAuth 2.0 Client ID (Web application)
- [ ] Add authorized redirect URIs:
  - `http://localhost:3000/api/auth/callback/google` (dev)
  - `https://yourdomain.com/api/auth/callback/google` (prod)
- [ ] Copy Client ID and Client Secret
- [ ] Add to `.env.local`:
```dotenv
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
```
- [ ] Restart dev server
- [ ] Test: Click "Google" button - should work

## Phase 7: Production Preparation (When Ready)

- [ ] Update `NEXTAUTH_URL` to your production domain
- [ ] Use production PostgreSQL database URL
- [ ] Enable Redis if deploying to production (optional, for better performance)
- [ ] Set up production SMTP credentials if different from dev
- [ ] Generate new `NEXTAUTH_SECRET` and `JWT_SECRET` for production
- [ ] Update Google OAuth redirect URIs to production domain
- [ ] Run database migrations on production: `npx prisma migrate deploy`
- [ ] Set `NODE_ENV=production`
- [ ] Deploy application

## Verification

Run this checklist after setup:

- [ ] Can sign in with OTP
- [ ] Can see dashboard after login
- [ ] Can be promoted to admin
- [ ] Can access admin panel
- [ ] Can view users list
- [ ] Can change user roles
- [ ] Can add products (if admin)
- [ ] Can view orders (if admin)
- [ ] Google OAuth works (if configured)
- [ ] Page refresh maintains login
- [ ] Sign out clears session

## Troubleshooting

### OTP code not received?
- Check `.env.local` has SMTP configured
- Check browser console for OTP (shown in dev mode)
- Check spam folder in email
- Review server logs for SMTP errors

### Admin panel returns 401?
- Make sure user has `role: 'ADMIN'` in database
- Check browser console for errors
- Verify JWT token exists in localStorage
- Try refreshing page

### Database connection errors?
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env.local`
- Run: `npx prisma db push` to sync schema

### Port 3000 already in use?
- Run on different port: `npm run dev -- -p 3001`
- Or kill process using port 3000

## Next: Production Deployment

Once everything works locally:
1. Choose hosting (Vercel, Railway, Heroku, AWS, etc.)
2. Set up production database
3. Deploy code (usually just `git push`)
4. Configure production environment variables
5. Monitor logs and test live

## Support

- Check `FIXES_IMPLEMENTED.md` for technical details
- Check server logs for error messages
- Check browser console for client-side errors
- Review `.env.example` for all available options

You're all set! Start with Phase 1 and work through each phase. 🚀
