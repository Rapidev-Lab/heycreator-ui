'use client';

import React from 'react';

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'large';
}

export default function AuthCard({ children, className = '', variant = 'default' }: AuthCardProps) {
  const baseClasses = '';
  const variantClasses = {
    default: 'w-full max-w-md px-4 py-4 pt-3 sm:px-6 sm:py-6 sm:pt-3 md:px-8 md:py-8 md:pt-3',
    large: 'w-full max-w-lg px-4 py-4 pt-3 sm:px-6 sm:py-6 sm:pt-4 md:px-12 md:py-12 md:pt-4'
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}
