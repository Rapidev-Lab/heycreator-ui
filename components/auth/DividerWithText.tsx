'use client';

import React from 'react';

interface DividerWithTextProps {
  text?: string;
  className?: string;
}

export default function DividerWithText({ text = 'or', className = '' }: DividerWithTextProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex-1 h-px bg-gray-300" />
      <span className="text-black text-sm">{text}</span>
      <div className="flex-1 h-px bg-gray-300" />
    </div>
  );
}
