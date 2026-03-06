'use client';

import { useState } from 'react';
import {
  Shield,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
} from 'lucide-react';
import ToSAcceptanceModal from '@/components/legal/ToSAcceptanceModal';
import type { ToSVersion, ToSAcceptance } from '@/types/legal';

// ===== MOCK DATA =====

const MOCK_TOS_VERSIONS: ToSVersion[] = [
  {
    id: 'tos-v2',
    version: '2.0.0',
    title: 'Terms of Service — v2.0.0',
    effectiveDate: '2026-02-15T00:00:00Z',
    isActive: true,
    createdAt: '2026-02-10T00:00:00Z',
    summary:
      'Updated billing and subscription terms, added multi-user collaboration policies, updated data processing procedures, and introduced agency tier volume discount terms.',
    content: `1. SUBSCRIPTION AND BILLING TERMS

By subscribing to the HeyCreator platform, you agree to pay the applicable subscription fees as detailed in your chosen plan. Subscription fees are billed in advance on a monthly or annual basis, depending on the plan selected. All fees are non-refundable except as expressly set forth in our Refund Policy. We reserve the right to modify pricing with thirty (30) days' written notice to the email address associated with your account.

For workspace billing arrangements involving multiple seats, the workspace owner is responsible for all charges incurred by team members within that workspace. Additional seats added mid-cycle will be prorated to the next billing date. Agency tier subscribers are eligible for volume discounts as outlined in Schedule A of this Agreement, which volume discounts are applied automatically upon reaching the qualifying threshold of five (5) or more active workspace licences.

2. TEAM COLLABORATION AND MULTI-USER ACCESS

HeyCreator workspaces support multi-user collaboration under a single subscription. Each seat grants one named user access to the platform. Seat licences are non-transferable and may not be shared between multiple individuals. The workspace owner may add, remove, or reassign seats at any time through the workspace settings panel.

3. DATA PROCESSING AND PRIVACY OBLIGATIONS

By using the HeyCreator platform, you acknowledge that we collect, process, and store personal data as described in our Privacy Policy. We process data in accordance with the Protection of Personal Information Act 4 of 2013 (POPIA) for South African users, and the General Data Protection Regulation (EU) 2016/679 (GDPR) for European users.

4. INTELLECTUAL PROPERTY

All content, software, technology, and materials made available through the HeyCreator platform are and shall remain the exclusive property of HeyCreator (Pty) Ltd and its licensors. Your subscription grants you a limited, non-exclusive, non-transferable, revocable licence to access and use the platform for your internal business purposes only.

5. LIMITATION OF LIABILITY

To the maximum extent permitted by applicable law, HeyCreator shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the platform. Our total aggregate liability to you shall not exceed the total subscription fees paid by you in the twelve (12) months immediately preceding the event giving rise to the claim.`,
  },
  {
    id: 'tos-v1',
    version: '1.0.0',
    title: 'Terms of Service — v1.0.0',
    effectiveDate: '2025-11-01T00:00:00Z',
    isActive: false,
    createdAt: '2025-10-25T00:00:00Z',
    summary: 'Initial terms of service covering platform use, billing, and data processing.',
    content: `1. USE OF THE PLATFORM

By accessing or using the HeyCreator platform, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, you may not use the platform.

2. BILLING AND PAYMENT

Subscription fees are billed in advance on a monthly basis. All payments are non-refundable. We reserve the right to modify pricing with advance notice.

3. DATA PROTECTION

We process your data in accordance with applicable data protection legislation, including POPIA and GDPR, as applicable to your jurisdiction.

4. INTELLECTUAL PROPERTY

All rights in the HeyCreator platform and its content remain with HeyCreator (Pty) Ltd. You are granted a limited licence to use the platform for your business purposes.`,
  },
];

const MOCK_USER_ACCEPTANCE: ToSAcceptance = {
  id: 'acc-001',
  userId: 'mock-brand-user-1',
  tosVersionId: 'tos-v2',
  acceptedAt: '2026-02-20T11:35:00Z',
  ipAddress: '196.25.101.42',
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
};

// ===== HELPERS =====

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ===== PREVIOUS VERSION CARD =====

interface PreviousVersionProps {
  version: ToSVersion;
}

function PreviousVersionCard({ version }: PreviousVersionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <FileText className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-sm font-semibold text-gray-700">{version.title}</p>
            <p className="text-xs text-gray-400">
              Effective {formatDate(version.effectiveDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-medium text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
            Inactive
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-5 py-4 bg-white border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-2">Summary</p>
          <p className="text-sm text-gray-600 mb-4">{version.summary}</p>
          <div className="border border-gray-100 rounded-xl bg-gray-50 p-4 max-h-64 overflow-y-auto">
            {version.content.split('\n\n').map((paragraph, idx) =>
              paragraph.match(/^\d+\./) ? (
                <h5 key={idx} className="text-sm font-bold text-gray-800 mt-3 mb-1 first:mt-0">
                  {paragraph}
                </h5>
              ) : (
                <p key={idx} className="text-sm text-gray-600 leading-relaxed mb-2">
                  {paragraph}
                </p>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== MAIN PAGE =====

export default function TermsOfServicePage() {
  const activeVersion = MOCK_TOS_VERSIONS.find((v) => v.isActive)!;
  const previousVersions = MOCK_TOS_VERSIONS.filter((v) => !v.isActive);

  const hasAcceptedCurrent =
    MOCK_USER_ACCEPTANCE.tosVersionId === activeVersion.id;

  const [showModal, setShowModal] = useState(false);
  const [accepted, setAccepted] = useState(hasAcceptedCurrent);
  const [acceptedAt] = useState<string>(MOCK_USER_ACCEPTANCE.acceptedAt);

  const handleAccept = () => {
    setAccepted(true);
    setShowModal(false);
  };

  return (
    <>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-brand-navy" />
            <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
          </div>
          <p className="text-sm text-gray-500">
            Review and manage your agreement to HeyCreator&apos;s Terms of Service.
          </p>
        </div>

        {/* Current version card */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6">

          {/* Card header */}
          <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-bold text-gray-900">{activeVersion.title}</h2>
                <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                  Current
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Effective {formatDate(activeVersion.effectiveDate)}
              </p>
            </div>

            {/* Acceptance status */}
            {accepted ? (
              <div className="flex items-center gap-2 flex-shrink-0 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-sm font-semibold text-green-800">Accepted</p>
                  <p className="text-xs text-green-600">{formatDateTime(acceptedAt)}</p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="flex-shrink-0 px-4 py-2 bg-brand-navy text-white text-sm font-semibold rounded-xl hover:bg-brand-navy-light transition-colors shadow-sm"
              >
                Review &amp; Accept
              </button>
            )}
          </div>

          {/* Summary */}
          <div className="px-6 py-4 bg-blue-50/50 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Summary of current version
            </p>
            <p className="text-sm text-gray-700">{activeVersion.summary}</p>
          </div>

          {/* Full content */}
          <div className="px-6 py-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Full Terms
            </p>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 max-h-80 overflow-y-auto space-y-2">
              {activeVersion.content.split('\n\n').map((paragraph, idx) =>
                paragraph.match(/^\d+\./) ? (
                  <h4 key={idx} className="text-sm font-bold text-gray-900 mt-3 first:mt-0">
                    {paragraph}
                  </h4>
                ) : (
                  <p key={idx} className="text-sm text-gray-600 leading-relaxed">
                    {paragraph}
                  </p>
                )
              )}
            </div>
          </div>

          {/* Acceptance meta */}
          {accepted && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Accepted on {formatDateTime(acceptedAt)}
                </span>
                <span>IP: {MOCK_USER_ACCEPTANCE.ipAddress}</span>
              </div>
            </div>
          )}
        </div>

        {/* Previous versions */}
        {previousVersions.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3">Previous Versions</h3>
            <div className="space-y-3">
              {previousVersions.map((v) => (
                <PreviousVersionCard key={v.id} version={v} />
              ))}
            </div>
          </div>
        )}

        {/* Not accepted warning */}
        {!accepted && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800">Action required</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Please review and accept the current Terms of Service to maintain full access to your workspace.
              </p>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="mt-2 text-sm font-semibold text-amber-800 underline hover:no-underline"
              >
                Review &amp; Accept Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <ToSAcceptanceModal
        isOpen={showModal}
        version={activeVersion.version}
        onAccept={handleAccept}
        onDecline={() => setShowModal(false)}
      />
    </>
  );
}
