'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Mail, Briefcase, MessageSquare, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import SeatCounter from './SeatCounter';
import RoleSelector, { type SelectableRole } from './RoleSelector';

// ===== TYPES =====

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceName: string;
  seatsUsed: number;
  seatsTotal: number;
}

// ===== AI ROLE SUGGESTION =====

type AISuggestion = {
  role: SelectableRole;
  reason: string;
} | null;

function inferRoleFromInput(email: string, jobTitle: string): AISuggestion {
  const emailLower = email.toLowerCase();
  const titleLower = jobTitle.toLowerCase();

  // Admin signals
  const adminEmailPatterns = /ceo|cto|coo|cmo|founder|director|owner|head\.|vp\.|president/;
  const adminTitlePatterns = /ceo|cto|coo|cmo|founder|director|head of|vice president|vp |president|chief/;

  if (adminEmailPatterns.test(emailLower) || adminTitlePatterns.test(titleLower)) {
    return {
      role: 'admin',
      reason: 'Leadership roles typically need full admin access',
    };
  }

  // Viewer signals
  const viewerEmailPatterns = /analytics|data|finance|legal|compliance|reporting|stakeholder/;
  const viewerTitlePatterns = /analyst|data |finance|legal|compliance|reporter|stakeholder|auditor|accountant/;

  if (viewerEmailPatterns.test(emailLower) || viewerTitlePatterns.test(titleLower)) {
    return {
      role: 'viewer',
      reason: 'Analytics and data roles typically need read-only access',
    };
  }

  // Editor signals — marketing, creative, content roles
  const editorEmailPatterns = /marketing|social|content|creative|brand|campaign|influencer|pr\.|comms/;
  const editorTitlePatterns = /marketing|social media|content|creative|brand|campaign|influencer|pr |communications|copywriter|designer/;

  if (editorEmailPatterns.test(emailLower) || editorTitlePatterns.test(titleLower)) {
    return {
      role: 'editor',
      reason: 'Marketing roles typically need editing access',
    };
  }

  return null;
}

// ===== SUCCESS STATE =====

function SuccessState({ email, onClose }: { email: string; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
      <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-500" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900">Invitation sent!</h3>
        <p className="text-sm text-gray-500 mt-1">
          An invitation has been sent to{' '}
          <span className="font-medium text-gray-700">{email}</span>.
        </p>
        <p className="text-xs text-gray-400 mt-1">The link expires in 7 days.</p>
      </div>
      <button
        onClick={onClose}
        className="px-6 py-2 bg-brand-navy text-white text-sm font-semibold rounded-lg hover:bg-brand-navy/90 transition-colors"
      >
        Done
      </button>
    </div>
  );
}

// ===== MAIN COMPONENT =====

export default function InviteMemberModal({
  isOpen,
  onClose,
  workspaceName,
  seatsUsed,
  seatsTotal,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [role, setRole] = useState<SelectableRole>('editor');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const isFull = seatsUsed >= seatsTotal;
  const canSubmit = email.trim().length > 0 && !isFull && !isSubmitting;

  // Debounced AI suggestion
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const suggestion = inferRoleFromInput(email, jobTitle);
      setAiSuggestion(suggestion);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [email, jobTitle]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setJobTitle('');
      setRole('editor');
      setMessage('');
      setIsSubmitting(false);
      setSent(false);
      setAiSuggestion(null);
    }
  }, [isOpen]);

  // Auto-focus email on open
  useEffect(() => {
    if (isOpen && !isFull) {
      requestAnimationFrame(() => emailRef.current?.focus());
    }
  }, [isOpen, isFull]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleApplySuggestion = useCallback(() => {
    if (aiSuggestion) {
      setRole(aiSuggestion.role);
    }
  }, [aiSuggestion]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    // Mock API call delay
    await new Promise((res) => setTimeout(res, 900));

    setIsSubmitting(false);
    setSent(true);
  }, [canSubmit]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="invite-modal-title"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 animate-fade-in" aria-hidden="true" />

      {/* Modal card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl z-10 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-0">
          <div className="flex-1 min-w-0 pr-4">
            <h2 id="invite-modal-title" className="text-lg font-bold text-gray-900">
              Invite Team Member
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              to <span className="font-medium text-gray-700">{workspaceName}</span>
            </p>
          </div>

          {/* SeatCounter in top-right */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <SeatCounter used={seatsUsed} total={seatsTotal} />
            <button
              onClick={onClose}
              className="p-2 -mr-2 -mt-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {sent ? (
            <SuccessState email={email} onClose={onClose} />
          ) : (
            <div className="space-y-4">
              {/* Seats full warning */}
              {isFull && (
                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-amber-800">No seats available</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Upgrade your plan to invite more members.{' '}
                      <Link
                        href="/brands/settings?tab=plans"
                        className="underline font-medium hover:text-amber-800 transition-colors"
                      >
                        View plans
                      </Link>
                    </p>
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  htmlFor="invite-email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    ref={emailRef}
                    id="invite-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    disabled={isFull}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                  />
                </div>
              </div>

              {/* Job title */}
              <div>
                <label
                  htmlFor="invite-job-title"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Job title{' '}
                  <span className="text-xs font-normal text-gray-400">(optional)</span>
                </label>
                <div className="relative">
                  <Briefcase
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="invite-job-title"
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Marketing Manager"
                    disabled={isFull}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                  />
                </div>
              </div>

              {/* Role selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Role
                </label>
                <RoleSelector
                  value={role}
                  onChange={setRole}
                  showPermissions
                  disabled={isFull}
                />

                {/* AI suggestion badge */}
                {aiSuggestion && aiSuggestion.role !== role && (email.trim() || jobTitle.trim()) && (
                  <div className="flex items-center gap-2 mt-2 p-2.5 bg-brand-navy/5 border border-brand-navy/10 rounded-lg">
                    <Sparkles className="w-3.5 h-3.5 text-brand-navy flex-shrink-0" aria-hidden="true" />
                    <p className="flex-1 text-xs text-gray-700">
                      <span className="font-semibold text-brand-navy">AI suggests: </span>
                      <span className="font-medium capitalize">{aiSuggestion.role}</span>
                      {' '}&mdash; {aiSuggestion.reason}
                    </p>
                    <button
                      type="button"
                      onClick={handleApplySuggestion}
                      className="text-xs font-semibold text-brand-navy hover:text-brand-navy/80 transition-colors whitespace-nowrap"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Personal message */}
              <div>
                <label
                  htmlFor="invite-message"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Personal message{' '}
                  <span className="text-xs font-normal text-gray-400">(optional)</span>
                </label>
                <div className="relative">
                  <MessageSquare
                    className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none"
                    aria-hidden="true"
                  />
                  <textarea
                    id="invite-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Add a personal note..."
                    disabled={isFull}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none resize-none disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!sent && (
          <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-5 py-2 bg-brand-navy text-white text-sm font-semibold rounded-lg hover:bg-brand-navy/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Sending...
                </>
              ) : (
                'Send Invitation'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
