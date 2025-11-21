import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth.config';
import { NextRequest, NextResponse } from 'next/server';

async function checkAdminAuth(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      if (decoded.role === 'ADMIN') {
        return true;
      }
    } catch (error) {
      console.error('JWT verification failed:', error);
    }
  }

  const session = await getServerSession(authConfig);
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (user?.role === 'ADMIN') {
      return true;
    }
  }

  return false;
}

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total orders and revenue
    const orders = await prisma.order.findMany();

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);

    // Count pending orders
    const pendingOrders = orders.filter((order) => order.status === 'PENDING').length;

    // Get total products
    const totalProducts = await prisma.product.count();

    // Get low stock products (less than 10)
    const lowStockProducts = await prisma.product.count({
      where: { stock: { lt: 10 } },
    });

    // Get total users
    const totalUsers = await prisma.user.count();

    // Get order status breakdown
    const ordersByStatus: Record<string, number> = {};
    orders.forEach((order) => {
      const status = order.status || 'UNKNOWN';
      ordersByStatus[status] = (ordersByStatus[status] || 0) + 1;
    });

    // Get recent orders (last 10)
    const recentOrders = await prisma.order.findMany({
      where: {},
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      totalProducts,
      pendingOrders,
      totalUsers,
      lowStockProducts,
      ordersByStatus,
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        userEmail: order.user?.email || 'Unknown',
        amount: order.amount || 0,
        status: order.status,
        createdAt: order.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
