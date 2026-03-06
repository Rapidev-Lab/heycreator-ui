'use client';

import { useEffect, useCallback } from 'react';
import { TrendingUp, X, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PLAN_TIERS, PlanTier } from '@/types/workspace';

// ===== TYPES =====

export type LimitType = 'searches' | 'campaigns' | 'seats';

interface UpgradePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: LimitType;
  currentLimit: number;
  currentPlan: string;
}

// ===== HELPERS =====

/** Returns the next tier up from the current plan name, or 'scale' as the ceiling. */
function getRecommendedPlan(currentPlan: string): PlanTier {
  const normalised = currentPlan.toLowerCase() as PlanTier;
  const ladder: PlanTier[] = ['discovery', 'growth', 'scale'];
  const currentIndex = ladder.indexOf(normalised);
  // If unrecognised or already at top, recommend 'scale'
  if (currentIndex === -1 || currentIndex >= ladder.length - 1) return 'scale';
  return ladder[currentIndex + 1];
}

// ===== LIMIT MESSAGE RENDERER =====
// Rendered as a JSX component so apostrophes are correctly escaped via &apos;.

function LimitMessage({ limitType, currentLimit }: { limitType: LimitType; currentLimit: number }) {
  switch (limitType) {
    case 'searches':
      return (
        <p className="text-sm text-gray-600 leading-relaxed">
          You&apos;ve used all {currentLimit} monthly searches. Upgrade for more.
        </p>
      );
    case 'campaigns':
      return (
        <p className="text-sm text-gray-600 leading-relaxed">
          You&apos;ve reached your {currentLimit} active campaign limit.
        </p>
      );
    case 'seats':
      return (
        <p className="text-sm text-gray-600 leading-relaxed">
          All {currentLimit} team seats are filled.
        </p>
      );
    default:
      return (
        <p className="text-sm text-gray-600 leading-relaxed">
          You&apos;ve reached a usage limit on your current plan.
        </p>
      );
  }
}

// ===== COMPONENT =====

export default function UpgradePromptModal({
  isOpen,
  onClose,
  limitType,
  currentLimit,
  currentPlan,
}: UpgradePromptModalProps) {
  const router = useRouter();

  const recommendedTierId = getRecommendedPlan(currentPlan);
  const recommendedTierConfig = PLAN_TIERS[recommendedTierId];
  const recommendedPlanName = recommendedTierConfig?.name ?? 'Scale';

  // Normalise currentPlan display name: look it up in PLAN_TIERS first, fall back to capitalising
  const currentPlanDisplay =
    PLAN_TIERS[currentPlan.toLowerCase() as PlanTier]?.name ?? currentPlan;

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  function handleUpgrade() {
    router.push('/brands/workspace/billing/plans');
    onClose();
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      aria-hidden="false"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
        aria-describedby="upgrade-modal-description"
        className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-5"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Close upgrade modal"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Icon */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 mx-auto"
          style={{ backgroundColor: '#001F54' }}
          aria-hidden="true"
        >
          <TrendingUp className="w-6 h-6 text-white" />
        </div>

        {/* Heading + message */}
        <div className="flex flex-col gap-1.5 text-center">
          <h2
            id="upgrade-modal-title"
            className="text-lg font-bold text-gray-900"
          >
            You&apos;ve reached your limit
          </h2>
          <div id="upgrade-modal-description">
            <LimitMessage limitType={limitType} currentLimit={currentLimit} />
          </div>
        </div>

        {/* Plan context */}
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-600 gap-2">
          <span>
            Current plan:{' '}
            <span className="font-semibold text-gray-800">{currentPlanDisplay}</span>
          </span>
          <span aria-hidden="true" className="text-gray-300">
            →
          </span>
          <span>
            Recommended:{' '}
            <span className="font-semibold" style={{ color: '#00A8CC' }}>
              {recommendedPlanName}
            </span>
          </span>
        </div>

        {/* AI recommendation nudge */}
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-[#001F54]/5 border border-[#001F54]/10">
          <Sparkles
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            style={{ color: '#00A8CC' }}
            aria-hidden="true"
          />
          <p className="text-xs text-gray-600 leading-relaxed">
            Based on your usage, we recommend the{' '}
            <span className="font-semibold text-gray-800">{recommendedPlanName}</span> plan.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleUpgrade}
            className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#001F54' }}
          >
            Upgrade Plan
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
