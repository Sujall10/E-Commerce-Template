'use client';

import { SessionProvider } from 'next-auth/react';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>E-Commerce Store - Premium Products</title>
        <meta name="description" content="Shop premium products online with secure payments" />
      </head>
      <body className="antialiased">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
