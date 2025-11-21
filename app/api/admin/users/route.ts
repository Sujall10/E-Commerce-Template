import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import jwt from 'jsonwebtoken';

async function checkAdminAuth(request: NextRequest) {
  // Try NextAuth first
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (token && token.role === 'ADMIN') {
    return token;
  }

  // Try JWT token from authorization header or cookie
  const authHeader = request.headers.get('authorization');
  const cookieToken = request.cookies.get('authToken')?.value;
  const jwtToken = authHeader?.replace('Bearer ', '') || cookieToken;

  if (jwtToken) {
    try {
      const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET!) as any;
      if (decoded.role === 'ADMIN') {
        return decoded;
      }
    } catch (error) {
      console.error('[Auth] JWT verification failed:', error);
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  const token = await checkAdminAuth(request);
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const token = await checkAdminAuth(request);
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { userId, role } = body;

    if (!['USER', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
