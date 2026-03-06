'use client';

import { useState } from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-12 h-12 text-sm',
  md: 'w-16 h-16 text-base',
  lg: 'w-20 h-20 text-lg',
  xl: 'w-24 h-24 text-xl'
};

// Generate a consistent color based on the name
const getColorFromName = (name: string): string => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-brand-navy-light',
    'bg-pink-500',
    'bg-brand-navy',
    'bg-yellow-500',
    'bg-red-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500'
  ];

  // Simple hash function to get consistent color for same name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

// Get initials from name
const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

export default function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const initials = getInitials(name);
  const bgColor = getColorFromName(name);
  const sizeClass = sizeClasses[size];

  const showInitials = !src || imageError;

  return (
    <div className={`${sizeClass} relative flex-shrink-0 ${className}`}>
      {showInitials ? (
        // Initials Avatar
        <div
          className={`w-full h-full rounded-lg ${bgColor} flex items-center justify-center text-white font-semibold shadow-sm`}
        >
          {initials}
        </div>
      ) : (
        // Image Avatar
        <>
          {imageLoading && (
            <div className="absolute inset-0 rounded-lg bg-gray-200 animate-pulse" />
          )}
          <Image
            src={src}
            alt={name}
            fill
            className={`rounded-lg object-cover transition-opacity duration-300 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
            onLoad={() => setImageLoading(false)}
          />
        </>
      )}
    </div>
  );
}
