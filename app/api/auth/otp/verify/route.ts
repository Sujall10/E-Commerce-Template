import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOTP, deleteOTP } from '@/lib/otp-store';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const VerifyOTPSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = VerifyOTPSchema.parse(body);
    
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Verify OTP using shared storage
    const storedOtp = await getOTP(normalizedEmail);

    if (!storedOtp || storedOtp !== otp) {
      console.log('[OTP] Verification failed - Email:', normalizedEmail, '- Provided OTP:', otp, '- Stored OTP:', storedOtp, '- Match:', storedOtp === otp);
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 401 }
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          role: 'USER',
        },
      });
    }

    // Clean up OTP
    await deleteOTP(normalizedEmail);

    // Generate JWT token
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // In production, set httpOnly cookie instead
    const response = NextResponse.json({
      ok: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });

    // Set secure httpOnly cookie
    response.cookies.set({
      name: 'authToken',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('OTP verify error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
