'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  AlertTriangle,
  X,
  Check,
  Search,
  FolderOpen,
  Users,
  BarChart3,
  Shield,
} from 'lucide-react';
import { useWorkspace } from '@/lib/context/workspace-context';
import { PLAN_TIERS } from '@/types/workspace';

// ===== WHAT WILL BE LOST =====

function WillLoseSection() {
  const { currentWorkspace } = useWorkspace();
  if (!currentWorkspace) return null;

  const plan = PLAN_TIERS[currentWorkspace.planTier];
  const periodEnd = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const lossItems = [
    {
      icon: <Search className="w-5 h-5 text-red-500" />,
      title: 'Creator search access',
      detail: `${plan.monthlySearches === -1 ? 'Unlimited' : plan.monthlySearches} searches per month`,
    },
    {
      icon: <FolderOpen className="w-5 h-5 text-red-500" />,
      title: 'Active campaigns',
      detail: `${currentWorkspace.usage.campaignsActive} campaign${currentWorkspace.usage.campaignsActive !== 1 ? 's' : ''} will be paused`,
    },
    {
      icon: <Users className="w-5 h-5 text-red-500" />,
      title: 'Team access',
      detail: `${currentWorkspace.usage.seatsUsed} team member${currentWorkspace.usage.seatsUsed !== 1 ? 's' : ''} will lose access`,
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-red-500" />,
      title: 'Analytics & reports',
      detail: 'Historical data will be read-only for 30 days',
    },
  ];

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <h3 className="text-sm font-bold text-red-800">What you&apos;ll lose</h3>
      </div>

      <div className="space-y-3 mb-4">
        {lossItems.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
            <div>
              <p className="text-sm font-medium text-gray-900">{item.title}</p>
              <p className="text-xs text-gray-500">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-white border border-red-100 rounded-lg">
        <p className="text-xs text-red-700 font-medium">
          Your plan will remain <span className="font-bold">active until {periodEnd}</span> (end of
          current billing period). You won&apos;t be charged after that date.
        </p>
      </div>
    </div>
  );
}

// ===== CANCELLATION REASONS =====

const CANCELLATION_REASONS = [
  { value: 'too_expensive', label: 'Too expensive for my budget' },
  { value: 'not_using', label: 'Not using it enough to justify the cost' },
  { value: 'switching', label: 'Switching to a competitor platform' },
  { value: 'missing_features', label: 'Missing features I need' },
  { value: 'campaign_ended', label: 'My campaign ended, not currently running one' },
  { value: 'other', label: 'Other reason' },
];

// ===== TYPE TO CONFIRM =====

interface TypeToConfirmProps {
  workspaceName: string;
  onConfirmed: () => void;
  onCancel: () => void;
}

function TypeToConfirmStep({ workspaceName, onConfirmed, onCancel }: TypeToConfirmProps) {
  const [inputValue, setInputValue] = useState('');
  const isMatch = inputValue.trim().toLowerCase() === 'cancel my plan';

  return (
    <div className="space-y-4">
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
        <p className="text-sm text-red-800 font-medium mb-1">Final confirmation required</p>
        <p className="text-sm text-red-700">
          Type <span className="font-mono font-bold bg-red-100 px-1 rounded">cancel my plan</span>{' '}
          to confirm cancellation
        </p>
      </div>

      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type: cancel my plan"
        className={`w-full px-3 py-3 border-2 rounded-xl text-sm outline-none transition-all ${
          isMatch
            ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200'
            : 'border-gray-300 focus:ring-2 focus:ring-gray-200'
        }`}
      />

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 bg-brand-navy text-white rounded-xl text-sm font-bold hover:bg-brand-navy/90 transition-colors"
        >
          Keep my subscription
        </button>
        <button
          onClick={onConfirmed}
          disabled={!isMatch}
          className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Cancel subscription
        </button>
      </div>
    </div>
  );
}

// ===== SUCCESS STATE =====

function CancellationConfirmedView() {
  const router = useRouter();
  const periodEnd = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <Check className="w-8 h-8 text-gray-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Subscription Cancelled</h2>
      <p className="text-sm text-gray-500 mb-1">
        Your subscription has been cancelled successfully.
      </p>
      <p className="text-sm text-gray-500 mb-6">
        You&apos;ll continue to have full access until{' '}
        <span className="font-semibold text-gray-700">{periodEnd}</span>.
      </p>
      <div className="space-y-2 max-w-xs mx-auto">
        <button
          onClick={() => router.push('/brands/workspace/billing/plans')}
          className="w-full py-3 bg-brand-navy text-white rounded-xl text-sm font-bold hover:bg-brand-navy/90 transition-colors"
        >
          Reactivate Subscription
        </button>
        <button
          onClick={() => router.push('/brands/workspace/billing')}
          className="w-full py-3 border border-gray-200 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Go to Billing Dashboard
        </button>
      </div>
    </div>
  );
}

// ===== MAIN PAGE =====

export default function CancelPage() {
  const router = useRouter();
  const { currentWorkspace, userRole, isLoading } = useWorkspace();

  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [step, setStep] = useState<'form' | 'confirm' | 'done'>('form');

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="h-6 w-36 bg-gray-200 rounded animate-pulse mb-8" />
        <div className="max-w-xl mx-auto space-y-4">
          <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="p-6 lg:p-8 text-center py-20">
        <p className="text-gray-500">No workspace selected.</p>
      </div>
    );
  }

  if (userRole !== 'owner') {
    return (
      <div className="p-6 lg:p-8 text-center py-20">
        <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Only the workspace owner can cancel the subscription.</p>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="p-6 lg:p-8 max-w-xl mx-auto">
        <CancellationConfirmedView />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.push('/brands/workspace/billing')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Billing
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cancel Subscription</h1>
        <p className="text-sm text-gray-500 mt-1">
          We&apos;re sorry to see you go. Your feedback helps us improve.
        </p>
      </div>

      {step === 'form' && (
        <div className="space-y-6">
          {/* What you'll lose */}
          <WillLoseSection />

          {/* Cancellation reason */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Why are you cancelling?
            </h3>
            <div className="space-y-2">
              {CANCELLATION_REASONS.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all ${
                    reason === r.value
                      ? 'border-brand-navy bg-brand-navy/5'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="accent-brand-navy"
                  />
                  <span className="text-sm text-gray-700">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-1">
              Anything else you&apos;d like us to know?
            </h3>
            <p className="text-xs text-gray-400 mb-3">Optional — your feedback helps us improve</p>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us what we could have done better..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none resize-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/brands/workspace/billing')}
              className="flex-1 py-3 bg-brand-navy text-white rounded-xl text-sm font-bold hover:bg-brand-navy/90 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Keep my subscription
            </button>
            <button
              onClick={() => setStep('confirm')}
              disabled={!reason}
              className="flex-1 py-3 border-2 border-red-300 text-red-700 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue to cancel
            </button>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-6">
          <WillLoseSection />
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <TypeToConfirmStep
              workspaceName={currentWorkspace.name}
              onConfirmed={() => setStep('done')}
              onCancel={() => router.push('/brands/workspace/billing')}
            />
          </div>
        </div>
      )}
    </div>
  );
}
