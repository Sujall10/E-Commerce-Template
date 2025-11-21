import { type NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function withAuth(
  request: NextRequest,
  callback: (token: any) => Promise<NextResponse> | NextResponse
) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return callback(token);
}

export async function withAdminAuth(
  request: NextRequest,
  callback: (token: any) => Promise<NextResponse> | NextResponse
) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (token.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return callback(token);
}
