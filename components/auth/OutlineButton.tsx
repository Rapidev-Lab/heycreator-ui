'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface OutlineButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export default function OutlineButton({
  children,
  loading = false,
  fullWidth = true,
  className = '',
  disabled,
  ...props
}: OutlineButtonProps) {
  return (
    <button
      className={`
        px-6 py-3 rounded-3xl font-medium
        bg-white border-[1px] border-[#929292] text-brand-navy-dark
        hover:bg-gray-50 active:bg-gray-100
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
}
