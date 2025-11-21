'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    // Check for JWT token from OTP login
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const decoded = JSON.parse(atob(parts[1])) as any;
          if (decoded.role === 'ADMIN') {
            setIsAuthorized(true);
            return;
          }
        }
      } catch (error) {
        console.error('[Admin] Failed to decode JWT:', error);
      }
    }

    // Check for NextAuth session
    const userRole = (session?.user as any)?.role;
    if (userRole === 'ADMIN') {
      setIsAuthorized(true);
      return;
    }

    // Not authorized, redirect
    router.push('/');
  }, [session, status, router]);

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
          <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
          <nav className="space-y-2">
            <Link
              href={ROUTES.ADMIN}
              className="block px-4 py-2 rounded hover:bg-gray-100 transition"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/users"
              className="block px-4 py-2 rounded hover:bg-gray-100 transition"
            >
              Users
            </Link>
            <Link
              href={ROUTES.ADMIN_PRODUCTS}
              className="block px-4 py-2 rounded hover:bg-gray-100 transition"
            >
              Products
            </Link>
            <Link
              href={ROUTES.ADMIN_ORDERS}
              className="block px-4 py-2 rounded hover:bg-gray-100 transition"
            >
              Orders
            </Link>
            <Link
              href={ROUTES.HOME}
              className="block px-4 py-2 rounded hover:bg-gray-100 transition text-blue-600"
            >
              Back to Store
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
