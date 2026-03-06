'use client';

import { RefreshCw, Info, Clock } from 'lucide-react';

interface EnrichmentBannerProps {
  variant?: 'enriching' | 'stale';
  onRefresh?: () => void;
  isRefreshing?: boolean;
  enrichmentAgeHours?: number;
}

function formatAge(hours: number): string {
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

export function EnrichmentBanner({
  variant = 'enriching',
  onRefresh,
  isRefreshing,
  enrichmentAgeHours,
}: EnrichmentBannerProps) {
  if (variant === 'stale') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
        <div className="flex-shrink-0">
          <Clock className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-900">
            Data may be outdated
          </p>
          <p className="text-sm text-amber-700">
            Last updated {enrichmentAgeHours ? formatAge(enrichmentAgeHours) : 'a while ago'}. Refreshing in the background.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="ml-2 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
        </div>
      </div>
    );
  }

  // Default: 'enriching' variant
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
      <div className="flex-shrink-0">
        <Info className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-blue-900">
          Enrichment in progress
        </p>
        <p className="text-sm text-blue-700">
          Detailed analytics will appear shortly. This usually takes 2-5 minutes.
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="ml-2 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}
