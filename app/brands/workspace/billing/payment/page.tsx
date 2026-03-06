'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, X, Shield, Info } from 'lucide-react';
import { useWorkspace } from '@/lib/context/workspace-context';
import { PLAN_TIERS, type PlanTier } from '@/types/workspace';
import CreditCardForm from '@/components/billing/CreditCardForm';

// ===== ORDER SUMMARY =====

interface OrderSummaryProps {
  plan: PlanTier;
  billingCycle: 'monthly' | 'annual';
}

const VAT_RATE = 0.15;

function OrderSummary({ plan, billingCycle }: OrderSummaryProps) {
  const planConfig = PLAN_TIERS[plan];
  const annualDiscount = 0.2;
  const basePrice = billingCycle === 'annual'
    ? Math.round(planConfig.price * (1 - annualDiscount))
    : planConfig.price;
  const subtotal = Math.round(basePrice / (1 + VAT_RATE));
  const vat = basePrice - subtotal;

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 sticky top-6">
      <h3 className="text-sm font-bold text-gray-900 mb-4">Order Summary</h3>

      {/* Plan */}
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

      {/* Line Items */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal (excl. VAT)</span>
          <span className="text-gray-700 font-medium">R{subtotal.toLocaleString('en-ZA')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">VAT (15%)</span>
          <span className="text-gray-700 font-medium">R{vat.toLocaleString('en-ZA')}</span>
        </div>
        {billingCycle === 'annual' && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Annual discount (20%)</span>
            <span className="font-medium">
              -R{(planConfig.price - basePrice).toLocaleString('en-ZA')}/mo
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-3 flex justify-between">
        <span className="text-sm font-bold text-gray-900">Total</span>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-900">
            R{basePrice.toLocaleString('en-ZA')}
          </p>
          <p className="text-xs text-gray-400">
            {billingCycle === 'annual' ? 'per month' : 'billed monthly'}
          </p>
        </div>
      </div>

      {/* Features preview */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs font-semibold text-gray-500 mb-2">Includes:</p>
        <ul className="space-y-1.5">
          {planConfig.features.slice(0, 4).map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
              <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ===== SUCCESS MODAL =====

function SuccessModal({ plan, onClose }: { plan: PlanTier; onClose: () => void }) {
  const planConfig = PLAN_TIERS[plan];
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-sm text-gray-500 mb-1">
          Welcome to the <span className="font-semibold text-brand-navy">{planConfig.name}</span> plan.
        </p>
        <p className="text-xs text-gray-400 mb-6">
          Your subscription is now active. A receipt has been sent to your email.
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 bg-brand-navy text-white rounded-xl text-sm font-bold hover:bg-brand-navy/90 transition-colors"
        >
          Go to Billing Dashboard
        </button>
      </div>
    </div>
  );
}

// ===== SKELETON =====

function PaymentSkeleton() {
  return (
    <div className="p-6 lg:p-8">
      <div className="h-6 w-36 bg-gray-200 rounded animate-pulse mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 h-96 bg-gray-100 rounded-xl animate-pulse" />
        <div className="lg:col-span-2 h-64 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

// ===== MAIN PAGE CONTENT =====

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentWorkspace, userRole, isLoading } = useWorkspace();

  const planParam = searchParams.get('plan') as PlanTier | null;
  const billingCycle = (searchParams.get('cycle') as 'monthly' | 'annual') || 'monthly';
  const mode = searchParams.get('mode');

  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedPlan = planParam && PLAN_TIERS[planParam] ? planParam : 'growth';
  const planConfig = PLAN_TIERS[selectedPlan];

  const basePrice = billingCycle === 'annual'
    ? Math.round(planConfig.price * 0.8)
    : planConfig.price;

  if (isLoading) return <PaymentSkeleton />;

  if (!currentWorkspace || userRole !== 'owner') {
    return (
      <div className="p-6 lg:p-8 text-center py-20">
        <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Access restricted to workspace owner only.</p>
      </div>
    );
  }

  const handleSubmit = (data: unknown) => {
    setIsProcessing(true);
    // Mock payment processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
    }, 2000);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.push('/brands/workspace/billing');
  };

  const pageTitle = mode === 'update' ? 'Update Payment Method' : `Activate ${planConfig.name} Plan`;

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
        <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Secure checkout powered by our payment processor
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Payment Form */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">Card Details</h2>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Shield className="w-3.5 h-3.5 text-green-500" />
                256-bit SSL encrypted
              </div>
            </div>

            <CreditCardForm
              onSubmit={handleSubmit}
              submitLabel={mode === 'update' ? 'Save Card' : 'Pay Now'}
              amount={mode === 'update' ? undefined : basePrice}
              isLoading={isProcessing}
            />

            {/* EFT alternative */}
            {mode !== 'update' && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg mb-3">
                  <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    Prefer to pay via EFT? South African bank transfers are supported.
                  </p>
                </div>
                <button
                  onClick={() =>
                    router.push(
                      `/brands/workspace/billing/eft?plan=${selectedPlan}&cycle=${billingCycle}`
                    )
                  }
                  className="w-full py-2.5 border border-gray-200 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Pay via EFT instead
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        {mode !== 'update' && (
          <div className="lg:col-span-2">
            <OrderSummary plan={selectedPlan} billingCycle={billingCycle} />
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <SuccessModal plan={selectedPlan} onClose={handleSuccessClose} />
      )}
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentSkeleton />}>
      <PaymentPageContent />
    </Suspense>
  );
}
