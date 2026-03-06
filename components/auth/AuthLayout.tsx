'use client';

import React from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { Loader2 } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function AuthLayout({ children, className = '' }: AuthLayoutProps) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-navy-dark" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white flex flex-col items-center px-4 py-6 sm:py-8 ${className}`}>
      {children}
    </div>
  );
}
