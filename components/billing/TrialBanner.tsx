'use client';

import { useState, useMemo } from 'react';
import { X, Clock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

// ===== TYPES =====

interface TrialBannerProps {
  trialEndsAt: string | null;
  onDismiss?: () => void;
}

// ===== HELPERS =====

function computeDaysRemaining(trialEndsAt: string | null): number {
  if (!trialEndsAt) return 0;
  const now = new Date();
  const end = new Date(trialEndsAt);
  const diffMs = end.getTime() - now.getTime();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// ===== COMPONENT =====

export default function TrialBanner({ trialEndsAt, onDismiss }: TrialBannerProps) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  const daysRemaining = useMemo(() => computeDaysRemaining(trialEndsAt), [trialEndsAt]);

  // Resolve urgency level for countdown text coloring
  const isExpired = daysRemaining === 0;
  const isUrgent = !isExpired && daysRemaining <= 3;

  const countdownTextClass = isExpired
    ? 'text-red-600 font-semibold'
    : isUrgent
    ? 'text-red-500 font-semibold'
    : 'text-amber-700 font-medium';

  const countdownLabel = isExpired
    ? 'Trial expired'
    : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left in your trial`;

  const messageText = isExpired
    ? 'Subscribe to regain access to your workspace.'
    : 'Subscribe now to keep your workspace.';

  function handleDismiss() {
    setDismissed(true);
    onDismiss?.();
  }

  function handleSubscribe() {
    router.push('/brands/workspace/billing/plans');
  }

  // Session-level dismiss: do not render once dismissed
  if (dismissed) return null;

  return (
    <div
      role="banner"
      aria-label="Trial countdown"
      className="w-full h-10 flex items-center justify-between px-4 gap-3 bg-amber-50 border-b border-amber-200"
    >
      {/* Left: icon + message */}
      <div className="flex items-center gap-2 min-w-0">
        <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" aria-hidden="true" />

        <p className="text-sm text-gray-700 truncate">
          <span className={countdownLabel ? countdownTextClass : undefined}>
            {countdownLabel}.
          </span>
          {' '}
          <span className="text-gray-600">{messageText}</span>
        </p>
      </div>

      {/* Right: CTA + dismiss */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={handleSubscribe}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-[#001F54] text-white hover:bg-[#001F54]/90 transition-colors whitespace-nowrap"
          aria-label="Subscribe now"
        >
          Subscribe Now
          <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 rounded text-amber-500 hover:text-amber-700 hover:bg-amber-100 transition-colors"
          aria-label="Dismiss trial banner"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
