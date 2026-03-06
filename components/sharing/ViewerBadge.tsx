'use client';

import { Eye } from 'lucide-react';

interface ViewerBadgeProps {
  className?: string;
}

export default function ViewerBadge({ className = '' }: ViewerBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 border border-amber-200 text-amber-700 ${className}`}
      title="You have read-only access to this resource"
    >
      <Eye className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
      View Only
    </span>
  );
}
