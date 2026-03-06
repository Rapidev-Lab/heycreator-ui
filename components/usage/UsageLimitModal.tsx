'use client';

import { X, AlertTriangle, ArrowUpCircle, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { OVERAGE_PACKS } from '@/types/usage';
import type { UsageMetricType, OveragePack } from '@/types/usage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UsageLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricType: UsageMetricType;
  currentUsage: number;
  limit: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const METRIC_LABELS: Record<UsageMetricType, { singular: string; plural: string }> = {
  search: { singular: 'search', plural: 'searches' },
  campaign: { singular: 'campaign', plural: 'campaigns' },
  seat: { singular: 'seat', plural: 'seats' },
  export: { singular: 'export', plural: 'exports' },
};

const METRIC_DESCRIPTIONS: Record<UsageMetricType, string> = {
  search:
    "You've run out of influencer searches for this billing cycle. Upgrade your plan or buy an add-on pack to keep discovering creators.",
  campaign:
    "You've reached your active campaign limit. Upgrade your plan or purchase additional campaign slots to launch new campaigns.",
  seat:
    "Your workspace has no remaining team seats. Upgrade to a higher plan to invite more team members.",
  export:
    "You've used all your data exports for this billing cycle. Upgrade or buy an export pack to continue exporting creator data.",
};

// ---------------------------------------------------------------------------
// Sub-component: OveragePackCard
// ---------------------------------------------------------------------------

interface OveragePackCardProps {
  pack: OveragePack;
}

function OveragePackCard({ pack }: OveragePackCardProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50 hover:border-brand-navy/30 hover:bg-brand-navy/5 transition-colors gap-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{pack.name}</p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{pack.description}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-sm font-bold text-gray-900 tabular-nums">
          R{pack.priceZAR.toLocaleString('en-ZA')}
        </span>
        <button
          className="px-3 py-1.5 bg-brand-navy text-white text-xs font-semibold rounded-lg hover:bg-brand-navy/90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-2"
          aria-label={`Buy ${pack.name} for R${pack.priceZAR.toLocaleString('en-ZA')}`}
        >
          Buy
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * UsageLimitModal — shown when a workspace reaches a usage quota limit.
 *
 * Presents two recovery paths:
 * 1. Upgrade your plan → navigates to /brands/settings?tab=plans
 * 2. Buy an overage add-on pack → shows relevant packs for the metric type
 */
export default function UsageLimitModal({
  isOpen,
  onClose,
  metricType,
  currentUsage,
  limit,
}: UsageLimitModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const labels = METRIC_LABELS[metricType];
  const relevantPacks = OVERAGE_PACKS.filter((p) => p.metricType === metricType);
  const description = METRIC_DESCRIPTIONS[metricType];

  function handleUpgrade() {
    onClose();
    router.push('/brands/settings?tab=plans');
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="usage-limit-modal-title"
    >
      {/* Blur overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center">
          {/* Red alert icon */}
          <div className="mx-auto w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7 text-[#FF3B30]" />
          </div>

          <h2
            id="usage-limit-modal-title"
            className="text-xl font-bold text-gray-900"
          >
            {labels.plural.charAt(0).toUpperCase() + labels.plural.slice(1)} limit reached
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            You&apos;ve used{' '}
            <span className="font-semibold text-gray-800">
              {currentUsage.toLocaleString()} of {limit.toLocaleString()} {labels.plural}
            </span>{' '}
            this month.
          </p>

          <p className="mt-2 text-sm text-gray-500">{description}</p>
        </div>

        {/* Divider */}
        <div className="mx-6 border-t border-gray-100" />

        {/* Content */}
        <div className="px-6 py-4 space-y-5">
          {/* Option 1: Upgrade */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ArrowUpCircle className="w-4 h-4 text-brand-navy flex-shrink-0" />
              <h3 className="text-sm font-semibold text-gray-900">Upgrade Your Plan</h3>
            </div>
            <p className="text-xs text-gray-500 pl-6">
              Get more {labels.plural}, extra seats, and advanced features with a higher plan.
            </p>
            <div className="pl-6">
              <button
                onClick={handleUpgrade}
                className="w-full py-2.5 bg-brand-navy text-white text-sm font-semibold rounded-xl hover:bg-brand-navy/90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-2"
              >
                View Plans &amp; Pricing
              </button>
            </div>
          </div>

          {/* Option 2: Add-on packs (only when packs exist for this metric) */}
          {relevantPacks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-brand-navy flex-shrink-0" />
                <h3 className="text-sm font-semibold text-gray-900">Buy an Add-on Pack</h3>
              </div>
              <p className="text-xs text-gray-500 pl-6">
                One-time purchase — no plan change required.
              </p>
              <div className="space-y-2 pl-6">
                {relevantPacks.map((pack) => (
                  <OveragePackCard key={pack.id} pack={pack} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
