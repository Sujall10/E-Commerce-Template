import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const ProductSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  images: z.array(z.string()).optional(),
  sku: z.string().optional(),
  stock: z.number().int().default(0),
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

export async function POST(request: NextRequest) {
  const token = await checkAdminAuth(request);
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const data = ProductSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        ...data,
        price: Math.round(data.price),
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
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
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
