'use client';

import { Infinity as InfinityIcon, Sparkles } from 'lucide-react';
import type { UsagePrediction } from '@/types/usage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UsageProgressBarProps {
  label: string;
  used: number;
  limit: number;
  icon?: React.ReactNode;
  showPrediction?: boolean;
  prediction?: UsagePrediction;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the fill colour class based on the usage percentage.
 * - ≥95% → red
 * - ≥80% → amber
 * - else  → navy
 */
function getBarColour(percent: number): string {
  if (percent >= 95) return 'bg-[#FF3B30]';
  if (percent >= 80) return 'bg-amber-400';
  return 'bg-[#001F54]';
}

/**
 * Returns the text colour class for the percentage badge.
 */
function getBadgeColour(percent: number): string {
  if (percent >= 95) return 'bg-red-100 text-red-700';
  if (percent >= 80) return 'bg-amber-100 text-amber-700';
  return 'bg-brand-navy/10 text-brand-navy';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * UsageProgressBar — animated horizontal bar showing plan quota consumption.
 *
 * When limit === 0 or limit === -1 the metric is considered "unlimited" and a
 * full green bar with an infinity symbol is rendered instead.
 *
 * If `showPrediction` is true and `prediction` is provided, a sparkle badge
 * with "Limit reached in ~X days" appears below the bar.
 */
export default function UsageProgressBar({
  label,
  used,
  limit,
  icon,
  showPrediction = false,
  prediction,
}: UsageProgressBarProps) {
  const isUnlimited = limit === 0 || limit === -1;

  // ── Unlimited variant ──────────────────────────────────────────────────────
  if (isUnlimited) {
    return (
      <div className="space-y-2">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {icon && (
              <span className="text-status-success flex-shrink-0">{icon}</span>
            )}
            <span className="text-sm font-semibold text-gray-800">{label}</span>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-status-success-light text-status-success">
            <InfinityIcon className="w-3 h-3" strokeWidth={2.5} />
            Unlimited
          </span>
        </div>

        {/* Full green bar */}
        <div
          className="h-2 w-full bg-gray-100 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={used}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label} — unlimited`}
        >
          <div className="h-full w-full bg-status-success rounded-full transition-all duration-500" />
        </div>

        {/* Sub-label */}
        <p className="text-xs text-gray-400 tabular-nums">{used.toLocaleString()} used this month</p>
      </div>
    );
  }

  // ── Capped variant ─────────────────────────────────────────────────────────
  const percent = Math.min(100, Math.round((used / limit) * 100));
  const barColour = getBarColour(percent);
  const badgeColour = getBadgeColour(percent);

  const showPredictionBadge =
    showPrediction &&
    prediction &&
    prediction.daysUntilLimit > 0 &&
    prediction.trend === 'increasing';

  return (
    <div className="space-y-2">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon && (
            <span
              className={
                percent >= 95
                  ? 'text-[#FF3B30]'
                  : percent >= 80
                  ? 'text-amber-500'
                  : 'text-[#001F54]'
              }
            >
              {icon}
            </span>
          )}
          <span className="text-sm font-semibold text-gray-800">{label}</span>
        </div>

        {/* Percentage badge */}
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold tabular-nums ${badgeColour}`}
        >
          {percent}%
        </span>
      </div>

      {/* Progress track */}
      <div
        className="h-2 w-full bg-gray-100 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-label={`${used} of ${limit} ${label.toLowerCase()} used`}
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColour}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Bottom row: used / limit + optional prediction */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gray-500 tabular-nums">
          <span className="font-semibold text-gray-700">{used.toLocaleString()}</span>
          {' / '}
          <span>{limit.toLocaleString()}</span>
        </span>

        {showPredictionBadge && prediction && (
          <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
            <Sparkles className="w-3 h-3 flex-shrink-0" />
            Limit in ~{prediction.daysUntilLimit} day{prediction.daysUntilLimit !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}
