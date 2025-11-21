'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode, useEffect, useState } from 'react';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Check if we have a JWT token from OTP login
    const token = localStorage.getItem('authToken');
    if (token) {
      // Token is stored, it will be sent with API requests via the header/cookie mechanism
      console.log('[Auth] JWT token found in localStorage');
    }
    setSessionReady(true);
  }, []);

  if (!sessionReady) {
    return null;
  }

  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
