import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

async function buffer(readable: any): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of readable) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-razorpay-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    const body = await buffer(request.body);
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body.toString());

    // Handle payment.captured event
    if (payload.event === 'payment.captured') {
      const payment = payload.payload.payment.entity;
      const razorpayOrderId = payment.order_id;

      await prisma.order.updateMany({
        where: { razorpayOrderId },
        data: {
          status: 'PAID',
          razorpayPaymentId: payment.id,
        },
      });

      console.log(`Order ${razorpayOrderId} marked as PAID`);
    }

    // Handle payment.failed event
    if (payload.event === 'payment.failed') {
      const payment = payload.payload.payment.entity;
      const razorpayOrderId = payment.order_id;

      await prisma.order.updateMany({
        where: { razorpayOrderId },
        data: {
          status: 'FAILED',
        },
      });

      console.log(`Order ${razorpayOrderId} marked as FAILED`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
