'use client';

import { useRouter } from 'next/navigation';
import { Infinity as InfinityIcon } from 'lucide-react';
import { useWorkspace } from '@/lib/context/workspace-context';

// ===== HELPERS =====

/**
 * Calculates the number of remaining trial days from an ISO date string.
 * Returns null if no date is provided, 0 if the trial has expired.
 */
function getTrialDaysRemaining(trialEndsAt: string | null): number | null {
  if (!trialEndsAt) return null;
  const days = Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86_400_000);
  return Math.max(0, days);
}

/**
 * Calculates usage percentage. Returns null if limit is -1 (unlimited).
 */
function getUsagePercent(used: number, limit: number): number | null {
  if (limit === -1 || limit === 0) return null;
  return Math.min(100, Math.round((used / limit) * 100));
}

/**
 * Resolves the progress bar Tailwind color class based on usage percentage.
 */
function getBarColorClass(percent: number): string {
  if (percent > 80) return 'bg-red-500';
  if (percent > 60) return 'bg-amber-400';
  return 'bg-status-success';
}

// ===== SUB-COMPONENTS =====

interface SearchUsageBarProps {
  used: number;
  limit: number;
}

function SearchUsageBar({ used, limit }: SearchUsageBarProps) {
  const isUnlimited = limit === -1;
  const percent = getUsagePercent(used, limit);

  if (isUnlimited) {
    return (
      <div className="flex items-center gap-1.5">
        <InfinityIcon
          className="w-3 h-3 text-status-success flex-shrink-0"
          aria-hidden="true"
          strokeWidth={2.5}
        />
        <span className="text-[11px] font-medium text-gray-500">Unlimited searches</span>
      </div>
    );
  }

  const barColor = getBarColorClass(percent ?? 0);

  return (
    <div className="space-y-1">
      {/* Label row */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-gray-500 leading-none">
          <span className="font-medium text-gray-700">{used}</span>
          <span className="text-gray-400">/{limit}</span>
          {' searches'}
        </span>
        <span className="text-[11px] font-medium text-gray-400 leading-none tabular-nums">
          {percent}%
        </span>
      </div>

      {/* Progress bar track */}
      <div
        className="h-1 w-full bg-gray-100 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-label={`${used} of ${limit} searches used`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

interface TrialBannerProps {
  trialEndsAt: string | null;
}

function TrialBanner({ trialEndsAt }: TrialBannerProps) {
  const daysLeft = getTrialDaysRemaining(trialEndsAt);

  if (daysLeft === null) return null;

  const isExpired = daysLeft === 0;
  const isUrgent = daysLeft <= 3;

  const textColor = isExpired
    ? 'text-red-600'
    : isUrgent
      ? 'text-amber-600'
      : 'text-amber-500';

  return (
    <p className={`text-[11px] font-semibold leading-none ${textColor}`}>
      {isExpired ? 'Trial expired' : `Trial: ${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
    </p>
  );
}

// ===== MAIN COMPONENT =====

/**
 * UsageMiniBar — compact sidebar widget displaying search usage and trial status
 * for the current workspace. Designed to fit within a 240px sidebar column.
 *
 * Shows:
 * - "X/Y searches" label with a thin colored progress bar
 * - An infinity symbol for unlimited plans (no bar rendered)
 * - A trial countdown row when workspace.status === 'trial'
 */
export default function UsageMiniBar() {
  const router = useRouter();
  const { currentWorkspace, isLoading } = useWorkspace();

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="px-3 py-2 space-y-2 animate-pulse">
        <div className="flex justify-between">
          <div className="h-2.5 bg-gray-200 rounded w-2/3" />
          <div className="h-2.5 bg-gray-200 rounded w-8" />
        </div>
        <div className="h-1 bg-gray-200 rounded-full w-full" />
      </div>
    );
  }

  // No workspace — render nothing rather than broken UI
  if (!currentWorkspace) return null;

  const { usage, status, trialEndsAt } = currentWorkspace;
  const isTrial = status === 'trial';

  return (
    <button
      onClick={() => router.push('/brands/settings?tab=plans')}
      className="w-full px-3 py-2 space-y-1.5 text-left hover:bg-gray-50 rounded-lg transition-colors"
      title="View usage details"
    >
      {/* Trial countdown (shown before usage bar for visual priority) */}
      {isTrial && <TrialBanner trialEndsAt={trialEndsAt} />}

      {/* Search usage bar */}
      <SearchUsageBar used={usage.searchesUsed} limit={usage.searchesLimit} />
    </button>
  );
}
