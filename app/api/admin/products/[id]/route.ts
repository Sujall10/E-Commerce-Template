import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const ProductUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  images: z.array(z.string()).optional(),
  sku: z.string().optional(),
  stock: z.number().int().optional(),
  category: z.string().optional(),
});

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

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const data = ProductUpdateSchema.parse(body);

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...data,
        ...(data.price && { price: Math.round(data.price) }),
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Product delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
