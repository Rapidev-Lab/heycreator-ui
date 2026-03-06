'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Gift,
  Sparkles,
} from 'lucide-react';
import { useWorkspace } from '@/lib/context/workspace-context';
import { PLAN_TIERS, type PlanTier } from '@/types/workspace';
import { recommendPlan, type PlanRecommendation } from '@/lib/mock/ai-suggestions';
import PlanCard from '@/components/billing/PlanCard';
import PlanComparisonTable from '@/components/billing/PlanComparisonTable';

const PLAN_ORDER: PlanTier[] = ['discovery', 'growth', 'scale'];

// ===== BILLING CYCLE TOGGLE =====

interface BillingToggleProps {
  value: 'monthly' | 'annual';
  onChange: (v: 'monthly' | 'annual') => void;
}

function BillingToggle({ value, onChange }: BillingToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
      <button
        onClick={() => onChange('monthly')}
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
          value === 'monthly'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Monthly
      </button>
      <button
        onClick={() => onChange('annual')}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
          value === 'annual'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Annual
        <span className="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
          -20%
        </span>
      </button>
    </div>
  );
}

// ===== AI RECOMMENDATION BANNER =====

function RecommendationBanner({ recommendation }: { recommendation: PlanRecommendation }) {
  const plan = PLAN_TIERS[recommendation.recommendedPlan];
  return (
    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
      <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-amber-900">
          AI recommends the <span className="text-brand-navy">{plan.name}</span> plan for you
        </p>
        <p className="text-sm text-amber-700 mt-0.5">{recommendation.reason}</p>
        {recommendation.savingsNote && (
          <p className="text-xs text-amber-600 mt-1 font-medium">{recommendation.savingsNote}</p>
        )}
      </div>
    </div>
  );
}

// ===== SKELETON =====

function PlansSkeleton() {
  return (
    <div className="p-6 lg:p-8">
      <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
      <div className="h-4 w-72 bg-gray-100 rounded-lg animate-pulse mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-96 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// ===== MAIN PAGE CONTENT =====

function PlansPageContent() {
  const router = useRouter();
  const { currentWorkspace, userRole, isLoading } = useWorkspace();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [showComparison, setShowComparison] = useState(false);
  const [recommendation, setRecommendation] = useState<PlanRecommendation | null>(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(true);

  // Fetch AI recommendation based on workspace usage
  useEffect(() => {
    if (!currentWorkspace) return;
    const { usage } = currentWorkspace;
    setLoadingRecommendation(true);
    recommendPlan({
      monthlySearches: usage.searchesUsed,
      activeCampaigns: usage.campaignsActive,
      teamSize: usage.seatsUsed,
    })
      .then(setRecommendation)
      .finally(() => setLoadingRecommendation(false));
  }, [currentWorkspace]);

  if (isLoading) return <PlansSkeleton />;

  if (!currentWorkspace) {
    return (
      <div className="p-6 lg:p-8 text-center py-20">
        <p className="text-gray-500">No workspace selected.</p>
      </div>
    );
  }

  const isOwner = userRole === 'owner';

  if (!isOwner) {
    return (
      <div className="p-6 lg:p-8 text-center py-20">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <ArrowLeft className="w-6 h-6 text-gray-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Access Restricted</h2>
        <p className="text-sm text-gray-500 mb-6">
          Only the workspace owner can manage billing and subscription plans.
        </p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-semibold hover:bg-brand-navy/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    );
  }

  const currentPlan = currentWorkspace.planTier;

  const handleSelectPlan = (plan: PlanTier) => {
    if (plan === currentPlan) return;
    router.push(`/brands/workspace/billing/payment?plan=${plan}&cycle=${billingCycle}`);
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.push('/brands/workspace/billing')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Billing
      </button>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Choose Your Plan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Scale your influencer marketing with the right plan for your team
        </p>
      </div>

      {/* Billing Cycle Toggle + Trial Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <BillingToggle value={billingCycle} onChange={setBillingCycle} />
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
          <Gift className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">14-day free trial on all plans — no credit card required</span>
        </div>
      </div>

      {/* AI Recommendation Banner */}
      {!loadingRecommendation && recommendation && (
        <div className="mb-6">
          <RecommendationBanner recommendation={recommendation} />
        </div>
      )}
      {loadingRecommendation && (
        <div className="mb-6 h-16 bg-amber-50 border border-amber-200 rounded-xl animate-pulse" />
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {PLAN_ORDER.map((planId) => {
          const plan = PLAN_TIERS[planId];
          return (
            <PlanCard
              key={planId}
              plan={plan}
              isCurrentPlan={planId === currentPlan}
              isRecommended={recommendation?.recommendedPlan === planId}
              onSelect={handleSelectPlan}
              billingCycle={billingCycle}
            />
          );
        })}
      </div>

      {/* Collapsible Comparison Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <button
          onClick={() => setShowComparison((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors rounded-xl"
        >
          <span>Compare all features in detail</span>
          {showComparison ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        {showComparison && (
          <div className="border-t border-gray-200">
            <PlanComparisonTable currentPlan={currentPlan} />
          </div>
        )}
      </div>

      {/* Bottom note */}
      <p className="text-xs text-center text-gray-400 mt-6">
        All prices include 15% VAT. Annual billing is charged upfront. You can cancel at any time.
      </p>
    </div>
  );
}

export default function BillingPlansPage() {
  return (
    <Suspense fallback={<PlansSkeleton />}>
      <PlansPageContent />
    </Suspense>
  );
}
