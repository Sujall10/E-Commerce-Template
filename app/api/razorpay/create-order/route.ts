import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';

const CreateOrderSchema = z.object({
  amount: z.number().positive(),
  items: z.array(z.any()).optional(),
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, items } = CreateOrderSchema.parse(body);

    const amountInPaise = Math.round(amount);

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `order-${Date.now()}`,
    });

    // Store order in database
    const order = await prisma.order.create({
      data: {
        userId: token.sub as string,
        amount: amountInPaise,
        currency: 'INR',
        razorpayOrderId: razorpayOrder.id,
        status: 'PENDING',
        items: items || [],
      },
    });

    return NextResponse.json({
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
