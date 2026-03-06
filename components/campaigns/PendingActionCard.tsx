'use client';

import { Clock } from 'lucide-react';

interface PendingActionCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  timeAgo?: string;
  timeLabel?: string;
  actionLabel: string;
  onAction: () => void;
  variant?: 'urgent' | 'normal';
  className?: string;
}

export default function PendingActionCard({
  icon,
  title,
  description,
  timeAgo,
  timeLabel,
  actionLabel,
  onAction,
  variant = 'normal',
  className = '',
}: PendingActionCardProps) {
  return (
    <div
      className={`bg-white p-4 border border-gray-100 shadow-sm rounded-xl ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <h4 className="text-[14px] font-bold text-brand-blue mb-1 truncate">{title}</h4>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">{timeLabel}</span>
        </div>
      </div>

      <p className="text-[13px] font-medium text-gray-400 leading-relaxed mb-4">
        {description}
      </p>

      <button
        onClick={onAction}
        className="w-full py-2.5 rounded-xl border border-gray-100 text-[13px] font-bold text-brand-blue hover:bg-gray-50 transition-colors shadow-sm"
      >
        {actionLabel}
      </button>
    </div>
  );
}
