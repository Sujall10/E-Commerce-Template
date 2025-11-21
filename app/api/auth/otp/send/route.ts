import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, generateOTPEmail } from '@/lib/email';
import { storeOTP, rateLimitStore } from '@/lib/otp-store';
import { randomInt } from 'crypto';
import { z } from 'zod';

const SendOTPSchema = z.object({
  email: z.string().email(),
});

const RATE_LIMIT_WINDOW = 60; // 1 minute in seconds
const RATE_LIMIT_MAX = 3; // Max 3 OTP attempts per email per window

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = SendOTPSchema.parse(body);
    
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check rate limiting
    const now = Date.now();
    let rateLimitData = rateLimitStore.get(normalizedEmail);

    if (!rateLimitData || now > rateLimitData.resetAt) {
      rateLimitData = { count: 0, resetAt: now + RATE_LIMIT_WINDOW * 1000 };
    }

    rateLimitData.count++;

    if (rateLimitData.count > RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: 'Too many OTP requests. Please try again in 1 minute.' },
        { status: 429 }
      );
    }

    rateLimitStore.set(normalizedEmail, rateLimitData);

    // Generate OTP
    const otp = String(randomInt(100000, 999999));

    // Store OTP using shared storage
    await storeOTP(normalizedEmail, otp, 300); // 5 minutes
    console.log(`[DEV] OTP for ${normalizedEmail}: ${otp}`);

    // Send email
    const emailResult = await sendEmail({
      to: normalizedEmail,
      subject: 'Your E-Commerce Login Code',
      html: generateOTPEmail(otp),
    }).catch((error) => {
      console.error('Email sending failed:', error);
      return { success: false };
    });

    if (emailResult.success) {
      return NextResponse.json({
        ok: true,
        message: 'OTP sent successfully. Check your email.',
      });
    } else {
      // In dev, still allow login with console OTP
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          ok: true,
          message: 'OTP generated. Check browser console for code.',
        });
      }
      return NextResponse.json(
        { error: 'Failed to send OTP email. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('OTP send error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
