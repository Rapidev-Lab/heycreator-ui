'use client';

import React from 'react';

interface InfoRowProps {
  label: string;
  value: string | number | null | undefined;
  fallback?: string;
}

export default function InfoRow({ label, value, fallback = 'Not set' }: InfoRowProps) {
  return (
    <div className="flex h-[44px] px-3 justify-between items-center rounded-[10px] bg-[#F8F9FD]">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-brand-navy-dark">
        {value || fallback}
      </span>
    </div>
  );
}
