'use client';

import Link from 'next/link';
import { useSession, signOut, signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import OTPModal from './OTPModal';
import { ROUTES } from '@/lib/constants';

interface UserSession {
  id: string;
  email: string;
  name?: string;
  role: 'USER' | 'ADMIN';
}

export default function Header() {
  const { data: session, status } = useSession();
  const [jwtUser, setJwtUser] = useState<UserSession | null>(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [cartCount] = useState(0);

  // Check for JWT token from OTP login
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        // Decode JWT to get user info (without verification since it's client-side)
        const parts = token.split('.');
        if (parts.length === 3) {
          const decoded = JSON.parse(atob(parts[1]));
          setJwtUser({
            id: decoded.sub,
            email: decoded.email,
            role: decoded.role,
          });
        }
      } catch (error) {
        console.error('[Auth] Failed to decode JWT:', error);
        localStorage.removeItem('authToken');
      }
    }
  }, []);

  const isLoading = status === 'loading';
  const user = session?.user || jwtUser;
  const isAdmin = (user as any)?.role === 'ADMIN';

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    if (session) {
      signOut({ redirect: true, callbackUrl: '/' });
    } else {
      window.location.href = '/';
    }
  };

  return (
    <>
      <header className="border-b border-gray-200 sticky top-0 bg-white z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={ROUTES.HOME} className="text-2xl font-bold">
            ShopHub
          </Link>

          <nav className="hidden md:flex gap-8">
            <Link
              href={ROUTES.PRODUCTS}
              className="text-gray-600 hover:text-black transition"
            >
              Products
            </Link>
            {isAdmin && (
              <Link
                href={ROUTES.ADMIN}
                className="text-gray-600 hover:text-black transition"
              >
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-6">
            <Link
              href={ROUTES.CART}
              className="relative text-gray-600 hover:text-black transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {isLoading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-sm px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowOTPModal(true)}
                  className="text-sm px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
                >
                  Email OTP
                </button>
                <button
                  onClick={() => signIn('google', { redirectTo: '/' })}
                  className="text-sm px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.547 2.914 1.186.092-.923.35-1.546.636-1.903-2.22-.253-4.555-1.113-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.138 18.192 20 14.438 20 10.017 20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                  Google
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
      />
    </>
  );
}
