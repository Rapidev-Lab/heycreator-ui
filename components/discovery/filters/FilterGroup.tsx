'use client';

import { useState, ReactNode } from 'react';
import { ChevronUp } from 'lucide-react';

interface FilterGroupProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
}

export default function FilterGroup({ title, children, defaultExpanded = true }: FilterGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-4 text-left transition-colors"
      >
        <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          {title}
        </span>
        <ChevronUp
          className={`w-4 h-4 text-brand-navy transition-transform ${
            isExpanded ? '' : 'rotate-180'
          }`}
        />
      </button>

      {isExpanded && (
        <div className="pb-6 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}
