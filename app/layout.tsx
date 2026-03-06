'use client';

import { usePathname } from 'next/navigation';
import './globals.css';
import ClientProviders from '@/components/ClientProviders';
import Header from '@/components/Header';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Show header on authenticated app pages, but not on:
  // - Landing/role selection page (/)
  // - Auth flows (/auth/*)
  // - Brand flows (/brands/*) - they have their own Sidebar navigation
  // - Influencer flows (/influencers/*) - they have their own Sidebar navigation
  const showHeader =
    pathname !== '/' &&
    !pathname.startsWith('/auth') &&
    !pathname.startsWith('/brands') &&
    !pathname.startsWith('/influencers');

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000546" />
      </head>
      <body className="antialiased">
        <ClientProviders>
          {showHeader && <Header />}
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
