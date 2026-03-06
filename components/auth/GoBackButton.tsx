'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GoBackButtonProps {
  onClick?: () => void;
  href?: string;
  className?: string;
}

export default function GoBackButton({ onClick, href, className = '' }: GoBackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        flex items-center gap-2 py-2 text-gray-600 hover:text-gray-900
        transition-colors duration-200 font-medium
        ${className}
      `}
      aria-label="Go back"
    >
      <ArrowLeft className="w-5 h-5" />
      <span>Go back</span>
    </button>
  );
}
