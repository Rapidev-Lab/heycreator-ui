'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Clock, Info } from 'lucide-react';
import { useWorkspace } from '@/lib/context/workspace-context';
import { PLAN_TIERS, type PlanTier } from '@/types/workspace';
import { HEYCREATOR_BANKING_DETAILS } from '@/types/subscription';
import EFTBankingDetails from '@/components/billing/EFTBankingDetails';
import ProofOfPaymentUpload from '@/components/billing/ProofOfPaymentUpload';

// ===== HELPERS =====

const VAT_RATE = 0.15;

function generateReference(workspaceSlug: string): string {
  const slug = workspaceSlug.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  const now = new Date();
  const monthYear = now.toLocaleString('en-ZA', { month: 'short', year: '2-digit' })
    .replace(' ', '').replace("'", '').toUpperCase();
  return `${HEYCREATOR_BANKING_DETAILS.referencePrefix}-${slug}-${monthYear}`;
}

// ===== ORDER SUMMARY =====

interface OrderSummaryProps {
  plan: PlanTier;
  billingCycle: 'monthly' | 'annual';
}

function OrderSummary({ plan, billingCycle }: OrderSummaryProps) {
  const planConfig = PLAN_TIERS[plan];
  const basePrice = billingCycle === 'annual'
    ? Math.round(planConfig.price * 0.8)
    : planConfig.price;
  const subtotal = Math.round(basePrice / (1 + VAT_RATE));
  const vat = basePrice - subtotal;

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-4">Order Summary</h3>

      <div className="flex items-center gap-3 p-3 bg-brand-navy rounded-xl mb-4">
        <div className="flex-1">
          <p className="text-sm font-bold text-white">{planConfig.name} Plan</p>
          <p className="text-xs text-white/70">
            {billingCycle === 'annual' ? 'Annual billing' : 'Monthly billing'}
          </p>
        </div>
        <span className="text-sm font-bold text-white">
          R{basePrice.toLocaleString('en-ZA')}/mo
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal (excl. VAT)</span>
          <span className="text-gray-700 font-medium">R{subtotal.toLocaleString('en-ZA')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">VAT (15%)</span>
          <span className="text-gray-700 font-medium">R{vat.toLocaleString('en-ZA')}</span>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-3 flex justify-between">
        <span className="text-sm font-bold text-gray-900">Total to Transfer</span>
        <span className="text-sm font-bold text-gray-900">
          R{basePrice.toLocaleString('en-ZA')}
        </span>
      </div>

      {/* Processing note */}
      <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <Clock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          EFT payments typically take <span className="font-semibold">1–2 business days</span> to
          verify. Your plan will activate once payment is confirmed.
        </p>
      </div>
    </div>
  );
}

// ===== SUBMISSION CONFIRMATION MODAL =====

function SubmissionConfirmModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Proof Submitted!</h2>
        <p className="text-sm text-gray-500 mb-1">
          We&apos;ve received your proof of payment. Our team will verify it within
          1&ndash;2 business days.
        </p>
        <p className="text-xs text-gray-400 mb-6">
          You&apos;ll receive an email confirmation once your payment is approved and your plan
          is activated.
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-left p-3 bg-gray-50 rounded-lg">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            <p className="text-xs text-gray-600">Proof of payment received</p>
          </div>
          <div className="flex items-center gap-2 text-left p-3 bg-gray-50 rounded-lg">
            <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-gray-600">Verification in progress (1–2 business days)</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-brand-navy text-white rounded-xl text-sm font-bold hover:bg-brand-navy/90 transition-colors"
        >
          Return to Billing
        </button>
      </div>
    </div>
  );
}

// ===== SKELETON =====

function EFTSkeleton() {
  return (
    <div className="p-6 lg:p-8">
      <div className="h-6 w-36 bg-gray-200 rounded animate-pulse mb-6" />
      <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="h-72 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div className="lg:col-span-2 h-48 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

// ===== MAIN PAGE CONTENT =====

function EFTPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentWorkspace, userRole, isLoading } = useWorkspace();

  const planParam = searchParams.get('plan') as PlanTier | null;
  const billingCycle = (searchParams.get('cycle') as 'monthly' | 'annual') || 'monthly';

  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPlan = planParam && PLAN_TIERS[planParam] ? planParam : 'growth';

  if (isLoading) return <EFTSkeleton />;

  if (!currentWorkspace || userRole !== 'owner') {
    return (
      <div className="p-6 lg:p-8 text-center py-20">
        <p className="text-sm text-gray-500">Access restricted to workspace owner only.</p>
      </div>
    );
  }

  const referenceNumber = generateReference(currentWorkspace.slug);

  const handleProofSubmit = (data: { file: File; reference: string; amount: number }) => {
    setIsSubmitting(true);
    // Mock submission
    setTimeout(() => {
      setIsSubmitting(false);
      setShowConfirm(true);
    }, 1500);
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to plans
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Pay via EFT</h1>
        <p className="text-sm text-gray-500 mt-1">
          Transfer payment directly to HeyCreator&apos;s bank account
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Step 1: Banking Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-brand-navy text-white text-xs font-bold flex items-center justify-center">
                1
              </div>
              <h2 className="text-base font-bold text-gray-900">
                Transfer to This Account
              </h2>
            </div>
            <EFTBankingDetails referenceNumber={referenceNumber} />
          </div>

          {/* Step 2: Upload Proof */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-brand-navy text-white text-xs font-bold flex items-center justify-center">
                2
              </div>
              <h2 className="text-base font-bold text-gray-900">
                Upload Proof of Payment
              </h2>
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg mb-5">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                Upload your bank confirmation slip or EFT screenshot. Make sure the
                reference number{' '}
                <span className="font-mono font-semibold">{referenceNumber}</span> is
                visible in the document.
              </p>
            </div>

            <ProofOfPaymentUpload onSubmit={handleProofSubmit} isLoading={isSubmitting} />
          </div>
        </div>

        {/* Sidebar — Order Summary + Card alt */}
        <div className="lg:col-span-2 space-y-4">
          <OrderSummary plan={selectedPlan} billingCycle={billingCycle} />

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <p className="text-xs font-semibold text-gray-500 mb-2">
              Prefer to pay by card?
            </p>
            <button
              onClick={() =>
                router.push(
                  `/brands/workspace/billing/payment?plan=${selectedPlan}&cycle=${billingCycle}`
                )
              }
              className="w-full py-2.5 border border-brand-navy/30 text-brand-navy text-sm font-semibold rounded-lg hover:bg-brand-navy/5 transition-colors"
            >
              Pay with Credit Card
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <SubmissionConfirmModal
          onClose={() => {
            setShowConfirm(false);
            router.push('/brands/workspace/billing');
          }}
        />
      )}
    </div>
  );
}

export default function EFTPage() {
  return (
    <Suspense fallback={<EFTSkeleton />}>
      <EFTPageContent />
    </Suspense>
  );
}
