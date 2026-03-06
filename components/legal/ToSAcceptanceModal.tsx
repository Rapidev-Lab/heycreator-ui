'use client';

import { useState, useRef, useCallback } from 'react';
import { Shield, CheckCircle, X, AlertTriangle } from 'lucide-react';

interface ToSAcceptanceModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline?: () => void;
  version?: string;
}

const TOS_CONTENT = `1. SUBSCRIPTION AND BILLING TERMS

By subscribing to the HeyCreator platform, you agree to pay the applicable subscription fees as detailed in your chosen plan. Subscription fees are billed in advance on a monthly or annual basis, depending on the plan selected. All fees are non-refundable except as expressly set forth in our Refund Policy. We reserve the right to modify pricing with thirty (30) days' written notice to the email address associated with your account.

For workspace billing arrangements involving multiple seats, the workspace owner is responsible for all charges incurred by team members within that workspace. Additional seats added mid-cycle will be prorated to the next billing date. Agency tier subscribers are eligible for volume discounts as outlined in Schedule A of this Agreement, which volume discounts are applied automatically upon reaching the qualifying threshold of five (5) or more active workspace licences.

2. TEAM COLLABORATION AND MULTI-USER ACCESS

HeyCreator workspaces support multi-user collaboration under a single subscription. Each seat grants one named user access to the platform. Seat licences are non-transferable and may not be shared between multiple individuals. The workspace owner may add, remove, or reassign seats at any time through the workspace settings panel. Role-based access controls allow workspace owners to restrict or grant access to specific platform features for individual team members.

You acknowledge that all team members added to your workspace are bound by these Terms of Service and your organisation's internal policies. You are solely responsible for ensuring that your team members comply with these terms. HeyCreator shall not be liable for any unauthorised actions taken by team members within your workspace.

3. DATA PROCESSING AND PRIVACY OBLIGATIONS

By using the HeyCreator platform, you acknowledge that we collect, process, and store personal data as described in our Privacy Policy, which is incorporated herein by reference. We process data in accordance with the Protection of Personal Information Act 4 of 2013 (POPIA) for South African users, the General Data Protection Regulation (EU) 2016/679 (GDPR) for European users, and other applicable data protection legislation.

You represent and warrant that you have obtained all necessary consents and have a lawful basis to share with us any personal data relating to third parties, including the personal information of influencers and creators discovered or managed through our platform. You grant HeyCreator a limited licence to process such data solely for the purpose of providing the services described herein.

4. INTELLECTUAL PROPERTY

All content, software, technology, and materials made available through the HeyCreator platform, including but not limited to the discovery algorithms, analytics dashboards, and reporting tools, are and shall remain the exclusive property of HeyCreator (Pty) Ltd and its licensors. Your subscription grants you a limited, non-exclusive, non-transferable, revocable licence to access and use the platform for your internal business purposes only.

You retain ownership of all content, campaign briefs, notes, and data you upload or create within the platform. By uploading content, you grant HeyCreator a limited licence to host, display, and process such content solely for the purpose of delivering the services to you.

5. LIMITATION OF LIABILITY AND INDEMNIFICATION

To the maximum extent permitted by applicable law, HeyCreator shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the platform, including but not limited to loss of revenue, loss of data, or reputational harm. Our total aggregate liability to you shall not exceed the total subscription fees paid by you in the twelve (12) months immediately preceding the event giving rise to the claim.

You agree to indemnify, defend, and hold harmless HeyCreator and its officers, directors, employees, and agents from and against any claims, damages, losses, and expenses arising out of your use of the platform, your violation of these Terms, or your infringement of any third-party rights.`;

const CHANGES_SUMMARY = [
  'Updated workspace billing and subscription terms',
  'Added multi-user team collaboration policies',
  'Updated data processing and privacy procedures',
  'New agency tier volume discount terms',
];

export default function ToSAcceptanceModal({
  isOpen,
  onAccept,
  onDecline,
  version = '2.0.0',
}: ToSAcceptanceModalProps) {
  const [checked, setChecked] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [showDeclineWarning, setShowDeclineWarning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 16;
    if (atBottom) setHasScrolledToBottom(true);
  }, []);

  const handleDeclineClick = () => {
    if (onDecline) {
      setShowDeclineWarning(true);
    }
  };

  const handleConfirmDecline = () => {
    setShowDeclineWarning(false);
    if (onDecline) onDecline();
  };

  const canAccept = checked && hasScrolledToBottom;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-fade-in-up">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-brand-navy/10 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-brand-navy" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900">Updated Terms of Service</h2>
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-brand-navy">v{version}</span>
              {' '}— Effective February 15, 2026
            </p>
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">

          {/* What's Changed */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <h3 className="text-sm font-bold text-blue-900 mb-2.5">What&apos;s Changed</h3>
            <ul className="space-y-1.5">
              {CHANGES_SUMMARY.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-blue-800">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Terms Content */}
          <div className="relative">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="h-[300px] overflow-y-auto border border-gray-200 rounded-xl p-4 text-sm text-gray-600 leading-relaxed space-y-4 bg-gray-50/50 scroll-smooth"
            >
              {TOS_CONTENT.split('\n\n').map((paragraph, idx) => (
                paragraph.match(/^\d+\./) ? (
                  <h4 key={idx} className="font-bold text-gray-900 text-sm mt-4 first:mt-0">
                    {paragraph}
                  </h4>
                ) : (
                  <p key={idx}>{paragraph}</p>
                )
              ))}
              {/* Spacer at bottom so user must scroll past content */}
              <div className="h-2" />
            </div>

            {/* Scroll indicator — fades away when scrolled to bottom */}
            {!hasScrolledToBottom && (
              <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-gray-50 to-transparent rounded-b-xl pointer-events-none flex items-end justify-center pb-2">
                <p className="text-xs text-gray-400 animate-pulse select-none">
                  Scroll to read all terms
                </p>
              </div>
            )}
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  checked
                    ? 'bg-brand-navy border-brand-navy'
                    : 'bg-white border-gray-300 group-hover:border-brand-navy/50'
                }`}
              >
                {checked && <CheckCircle className="w-3.5 h-3.5 text-white" />}
              </div>
            </div>
            <span className="text-sm text-gray-700 leading-snug">
              I have read and agree to the updated{' '}
              <span className="font-semibold text-brand-navy">Terms of Service</span>
            </span>
          </label>

          {/* Hint when scroll not done */}
          {!hasScrolledToBottom && (
            <p className="text-xs text-amber-600 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              Please scroll through the full terms before accepting.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-gray-100 space-y-3">
          {/* Decline warning */}
          {showDeclineWarning && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-red-700 font-medium">Declining will limit your access</p>
                <p className="text-xs text-red-600 mt-0.5">
                  You must accept the updated Terms of Service to continue using HeyCreator. Declining will restrict your account.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* Decline button */}
            {onDecline && (
              !showDeclineWarning ? (
                <button
                  type="button"
                  onClick={handleDeclineClick}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors rounded-xl hover:bg-red-50"
                >
                  Decline
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmDecline}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <X className="w-4 h-4" />
                    Confirm Decline
                  </span>
                </button>
              )
            )}

            {/* Accept button */}
            <button
              type="button"
              onClick={onAccept}
              disabled={!canAccept}
              className={`flex-[2] px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                canAccept
                  ? 'bg-brand-navy text-white hover:bg-brand-navy-light shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Accept &amp; Continue
            </button>
          </div>

          <p className="text-center text-xs text-gray-400">Last updated: February 15, 2026</p>
        </div>
      </div>
    </div>
  );
}
