'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  X,
  Calendar,
  ChevronLeft,
  Trash2,
  CheckCircle,
} from 'lucide-react';

interface AccountDeletionFlowProps {
  onCancel: () => void;
}

type Step = 1 | 2 | 3 | 'scheduled';

type DeletionReason =
  | 'too_expensive'
  | 'switching_competitor'
  | 'no_longer_needed'
  | 'missing_features'
  | 'other';

const REASONS: { value: DeletionReason; label: string }[] = [
  { value: 'too_expensive',       label: 'Too expensive' },
  { value: 'switching_competitor', label: 'Switching to a competitor' },
  { value: 'no_longer_needed',    label: 'No longer need it' },
  { value: 'missing_features',    label: 'Missing features I need' },
  { value: 'other',               label: 'Other' },
];

const CONSEQUENCES = [
  'All workspace data will be permanently deleted',
  '3 active campaigns will be cancelled immediately',
  '45 saved creator profiles will be removed',
  'Team members will lose access to the workspace',
  'Billing will be cancelled at end of current period',
];

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ===== STEP 1: REASON =====

interface Step1Props {
  reason: DeletionReason | '';
  feedback: string;
  onReasonChange: (r: DeletionReason) => void;
  onFeedbackChange: (f: string) => void;
  onContinue: () => void;
  onCancel: () => void;
}

function Step1Reason({
  reason,
  feedback,
  onReasonChange,
  onFeedbackChange,
  onContinue,
  onCancel,
}: Step1Props) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Why are you leaving?</h2>
        <p className="text-sm text-gray-500 mt-1">
          Your feedback helps us improve. This information is kept private.
        </p>
      </div>

      {/* Reason radio list */}
      <div className="space-y-2">
        {REASONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
              reason === opt.value
                ? 'border-brand-navy bg-brand-navy/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                reason === opt.value ? 'border-brand-navy' : 'border-gray-300'
              }`}
            >
              {reason === opt.value && (
                <div className="w-2 h-2 rounded-full bg-brand-navy" />
              )}
            </div>
            <input
              type="radio"
              value={opt.value}
              checked={reason === opt.value}
              onChange={() => onReasonChange(opt.value)}
              className="sr-only"
            />
            <span className="text-sm font-medium text-gray-700">{opt.label}</span>
          </label>
        ))}
      </div>

      {/* Optional feedback */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">
          Additional feedback{' '}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={feedback}
          onChange={(e) => onFeedbackChange(e.target.value)}
          placeholder="Tell us more about why you're leaving..."
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!reason}
          className={`flex-[2] px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            reason
              ? 'bg-brand-navy text-white hover:bg-brand-navy-light shadow-sm'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ===== STEP 2: CONSEQUENCES =====

interface Step2Props {
  onBack: () => void;
  onContinue: () => void;
}

function Step2Consequences({ onBack, onContinue }: Step2Props) {
  const scheduledDate = addDays(30);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Before you go — here&apos;s what you&apos;ll lose</h2>
        <p className="text-sm text-gray-500 mt-1">
          Deleting your account is permanent. Please review the consequences carefully.
        </p>
      </div>

      {/* Red warning banner */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm font-bold text-red-700">Permanent consequences</p>
        </div>
        <ul className="space-y-2">
          {CONSEQUENCES.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Grace period info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-blue-800">30-day grace period</p>
          <p className="text-sm text-blue-700 mt-0.5">
            Your account will be scheduled for deletion on{' '}
            <span className="font-semibold">{scheduledDate}</span>. You can cancel the
            deletion request at any time during this 30-day window.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Go Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="flex-[2] px-4 py-2.5 text-sm font-semibold text-red-600 border-2 border-red-200 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
        >
          I Understand, Continue
        </button>
      </div>
    </div>
  );
}

// ===== STEP 3: CONFIRM =====

interface Step3Props {
  onBack: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

function Step3Confirm({ onBack, onConfirm, onCancel }: Step3Props) {
  const [confirmText, setConfirmText] = useState('');
  const isValid = confirmText === 'DELETE';

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Final confirmation</h2>
        <p className="text-sm text-gray-500 mt-1">
          This is the last step. Once confirmed, your deletion request will be scheduled.
        </p>
      </div>

      {/* Confirmation input */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3">
        <p className="text-sm text-gray-700">
          To confirm, type{' '}
          <code className="text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded text-xs">
            DELETE
          </code>{' '}
          in the field below:
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Type DELETE here"
          autoComplete="off"
          className={`w-full border rounded-xl px-4 py-3 text-sm font-mono font-bold transition-all focus:outline-none focus:ring-2 ${
            confirmText.length > 0 && !isValid
              ? 'border-red-300 bg-red-50 text-red-600 focus:ring-red-200'
              : isValid
              ? 'border-green-300 bg-green-50 text-green-700 focus:ring-green-200'
              : 'border-gray-200 bg-white text-gray-900 focus:ring-brand-navy/20 focus:border-brand-navy'
          }`}
        />
        {confirmText.length > 0 && !isValid && (
          <p className="text-xs text-red-500">Must match exactly: DELETE</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={!isValid}
          className={`flex-[2] flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            isValid
              ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          Delete My Account
        </button>
      </div>
    </div>
  );
}

// ===== SCHEDULED CARD =====

interface ScheduledCardProps {
  onCancelRequest: () => void;
}

function ScheduledCard({ onCancelRequest }: ScheduledCardProps) {
  const scheduledDate = addDays(30);

  return (
    <div className="space-y-5">
      <div className="text-center py-4">
        <div className="w-14 h-14 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Deletion Scheduled</h2>
        <p className="text-sm text-gray-500 mt-1">
          Your account deletion has been scheduled.
        </p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-red-700">Scheduled deletion date</p>
          <p className="text-sm font-bold text-red-800">{scheduledDate}</p>
        </div>
        <div className="h-px bg-red-200" />
        <p className="text-xs text-red-600">
          All workspace data will be permanently removed on this date. You can cancel this
          request at any time before the scheduled date.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-semibold mb-1">You can cancel this request</p>
        <p className="text-xs">
          You have until{' '}
          <span className="font-semibold">{scheduledDate}</span> to change your mind.
          Click the button below to cancel the deletion request and restore full access.
        </p>
      </div>

      <button
        type="button"
        onClick={onCancelRequest}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-brand-navy text-brand-navy text-sm font-semibold rounded-xl hover:bg-brand-navy/5 transition-colors"
      >
        <CheckCircle className="w-4 h-4" />
        Cancel Deletion Request
      </button>
    </div>
  );
}

// ===== STEP INDICATOR =====

function StepIndicator({ step }: { step: Step }) {
  if (step === 'scheduled') return null;
  const steps: { num: number; label: string }[] = [
    { num: 1, label: 'Reason' },
    { num: 2, label: 'Consequences' },
    { num: 3, label: 'Confirm' },
  ];
  const current = step as number;

  return (
    <div className="flex items-center gap-0 mb-6">
      {steps.map((s, idx) => (
        <div key={s.num} className="flex items-center flex-1">
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                s.num < current
                  ? 'bg-green-500 text-white'
                  : s.num === current
                  ? 'bg-brand-navy text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {s.num < current ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : (
                s.num
              )}
            </div>
            <span
              className={`text-xs font-medium hidden sm:block ${
                s.num === current ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {s.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`flex-1 h-px mx-2 transition-colors ${
                s.num < current ? 'bg-green-300' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ===== MAIN COMPONENT =====

export default function AccountDeletionFlow({ onCancel }: AccountDeletionFlowProps) {
  const [step, setStep] = useState<Step>(1);
  const [reason, setReason] = useState<DeletionReason | ''>('');
  const [feedback, setFeedback] = useState('');

  const handleScheduled = () => setStep('scheduled');
  const handleCancelRequest = () => {
    setStep(1);
    setReason('');
    setFeedback('');
    onCancel();
  };

  return (
    <div>
      <StepIndicator step={step} />

      {step === 1 && (
        <Step1Reason
          reason={reason}
          feedback={feedback}
          onReasonChange={setReason}
          onFeedbackChange={setFeedback}
          onContinue={() => setStep(2)}
          onCancel={onCancel}
        />
      )}

      {step === 2 && (
        <Step2Consequences
          onBack={() => setStep(1)}
          onContinue={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <Step3Confirm
          onBack={() => setStep(2)}
          onConfirm={handleScheduled}
          onCancel={onCancel}
        />
      )}

      {step === 'scheduled' && (
        <ScheduledCard onCancelRequest={handleCancelRequest} />
      )}
    </div>
  );
}
