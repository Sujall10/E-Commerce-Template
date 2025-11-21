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
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await checkAdminAuth(request);
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { status } = body;

    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
