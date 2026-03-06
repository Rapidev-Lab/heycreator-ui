'use client';

import React from 'react';

interface ProgressDotsProps {
  total: number;
  current: number;
  className?: string;
}

export default function ProgressDots({ total, current, className = '' }: ProgressDotsProps) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {Array.from({ length: total }, (_, index) => (
        <div
          key={index}
          className={`
            w-2 h-2 rounded-full transition-all duration-300
            ${index + 1 === current
              ? 'bg-black w-2'
              : 'bg-gray-300'
            }
          `}
          aria-label={`Step ${index + 1} of ${total}${index + 1 === current ? ' (current)' : ''}`}
        />
      ))}
    </div>
  );
}
