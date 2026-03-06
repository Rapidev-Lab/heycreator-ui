'use client';

import { useState } from 'react';
import {
  Shield,
  Plus,
  Users,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Send,
  X,
  AlertTriangle,
} from 'lucide-react';
import type { ToSVersion, ToSAcceptance } from '@/types/legal';

// ===== MOCK DATA =====

const MOCK_TOS_VERSIONS: (ToSVersion & { acceptanceCount: number })[] = [
  {
    id: 'tos-v2',
    version: '2.0.0',
    title: 'Updated Billing, Collaboration & Privacy Terms',
    effectiveDate: '2026-02-15T00:00:00Z',
    isActive: true,
    createdAt: '2026-02-10T00:00:00Z',
    acceptanceCount: 89,
    summary:
      'Updated workspace billing and subscription terms. Added multi-user team collaboration policies. Updated data processing and privacy procedures. New agency tier volume discount terms.',
    content:
      'Full terms content for v2.0.0. This version includes comprehensive updates to billing, team collaboration, data processing, and the introduction of agency tier discount terms.',
  },
  {
    id: 'tos-v1',
    version: '1.0.0',
    title: 'Initial Terms of Service',
    effectiveDate: '2025-11-01T00:00:00Z',
    isActive: false,
    createdAt: '2025-10-25T00:00:00Z',
    acceptanceCount: 142,
    summary:
      'Initial terms of service covering platform use, billing, and basic data processing obligations.',
    content:
      'Full terms content for v1.0.0. This was the initial release of the HeyCreator Terms of Service.',
  },
];

const MOCK_V2_ACCEPTANCES: (ToSAcceptance & { userEmail: string; userName: string })[] = [
  { id: 'acc-v2-001', userId: 'mock-brand-user-1', userEmail: 'sarah.johnson@nikeza.com',   userName: 'Sarah Johnson',   tosVersionId: 'tos-v2', acceptedAt: '2026-02-20T11:35:00Z', ipAddress: '196.25.101.42', userAgent: 'Mozilla/5.0 (Mac)' },
  { id: 'acc-v2-002', userId: 'mock-brand-user-2', userEmail: 'david.mokoena@nikeza.com',  userName: 'David Mokoena',   tosVersionId: 'tos-v2', acceptedAt: '2026-02-21T09:12:00Z', ipAddress: '41.21.88.77',   userAgent: 'Mozilla/5.0 (Win)' },
  { id: 'acc-v2-003', userId: 'mock-brand-user-3', userEmail: 'lebo.dlamini@agency.co.za', userName: 'Lebo Dlamini',    tosVersionId: 'tos-v2', acceptedAt: '2026-02-22T14:00:00Z', ipAddress: '105.27.44.11',  userAgent: 'Mozilla/5.0 (Mac)' },
  { id: 'acc-v2-004', userId: 'user-004',           userEmail: 'admin@adidassa.com',         userName: 'Adidas SA Admin', tosVersionId: 'tos-v2', acceptedAt: '2026-02-19T08:45:00Z', ipAddress: '41.55.12.99',   userAgent: 'Mozilla/5.0 (Win)' },
  { id: 'acc-v2-005', userId: 'user-005',           userEmail: 'brand@agencyhub.co.za',      userName: 'Agency Hub',      tosVersionId: 'tos-v2', acceptedAt: '2026-02-23T16:20:00Z', ipAddress: '196.44.21.88',  userAgent: 'Mozilla/5.0 (Mac)' },
];

const MOCK_V1_ACCEPTANCES: (ToSAcceptance & { userEmail: string; userName: string })[] = [
  { id: 'acc-v1-001', userId: 'mock-brand-user-1', userEmail: 'sarah.johnson@nikeza.com',   userName: 'Sarah Johnson',   tosVersionId: 'tos-v1', acceptedAt: '2025-11-05T10:00:00Z', ipAddress: '196.25.101.42', userAgent: 'Mozilla/5.0 (Mac)' },
  { id: 'acc-v1-002', userId: 'mock-brand-user-2', userEmail: 'david.mokoena@nikeza.com',  userName: 'David Mokoena',   tosVersionId: 'tos-v1', acceptedAt: '2025-11-06T11:30:00Z', ipAddress: '41.21.88.77',   userAgent: 'Mozilla/5.0 (Win)' },
  { id: 'acc-v1-003', userId: 'user-004',           userEmail: 'admin@adidassa.com',         userName: 'Adidas SA Admin', tosVersionId: 'tos-v1', acceptedAt: '2025-11-04T09:00:00Z', ipAddress: '41.55.12.99',   userAgent: 'Mozilla/5.0 (Win)' },
];

const ACCEPTANCES_MAP: Record<string, typeof MOCK_V2_ACCEPTANCES> = {
  'tos-v2': MOCK_V2_ACCEPTANCES,
  'tos-v1': MOCK_V1_ACCEPTANCES,
};

// ===== STATS =====

const TOTAL_USERS = 231;
const ACCEPTED_CURRENT = 89;
const PENDING_REACCEPTANCE = TOTAL_USERS - ACCEPTED_CURRENT;

// ===== HELPERS =====

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ===== CREATE VERSION FORM (modal-like panel) =====

interface CreateVersionFormProps {
  onClose: () => void;
}

function CreateVersionForm({ onClose }: CreateVersionFormProps) {
  const [version, setVersion] = useState('');
  const [title, setTitle] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isValid = version && title && effectiveDate && summary && content;

  const handleSubmit = () => {
    if (!isValid) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
        <p className="text-base font-bold text-green-800">Version created (mock)</p>
        <p className="text-sm text-gray-500 mt-1">
          In production, this would save v{version} to the database and notify affected users.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900">Create New ToS Version</h3>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Version Number</label>
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="e.g. 3.0.0"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Effective Date</label>
          <input
            type="date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Short descriptive title for this version"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-1">Summary of Changes</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Plain-text summary of what changed in this version"
          rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy resize-none"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-1">Full Terms Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Full legal terms text..."
          rows={6}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy resize-none font-mono"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            isValid
              ? 'bg-brand-navy text-white hover:bg-brand-navy-light shadow-sm'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Create Version
        </button>
      </div>
    </div>
  );
}

// ===== VERSION ROW =====

interface VersionRowProps {
  versionData: (typeof MOCK_TOS_VERSIONS)[number];
}

function VersionRow({ versionData }: VersionRowProps) {
  const [showAcceptances, setShowAcceptances] = useState(false);
  const acceptances = ACCEPTANCES_MAP[versionData.id] ?? [];
  const displayedAcceptances = acceptances.slice(0, 5);
  const remaining = versionData.acceptanceCount - displayedAcceptances.length;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

      {/* Version header row */}
      <div className="flex flex-wrap items-center gap-4 px-5 py-4">
        {/* Version + title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-brand-navy/10 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-brand-navy" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-gray-900">v{versionData.version}</span>
              {versionData.isActive ? (
                <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                  Active
                </span>
              ) : (
                <span className="text-xs font-medium text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">{versionData.title}</p>
          </div>
        </div>

        {/* Effective date */}
        <div className="hidden sm:block text-right">
          <p className="text-xs text-gray-400">Effective</p>
          <p className="text-sm font-medium text-gray-700">{formatDate(versionData.effectiveDate)}</p>
        </div>

        {/* Acceptances count */}
        <div className="text-right">
          <p className="text-xs text-gray-400">Acceptances</p>
          <p className="text-sm font-bold text-brand-navy">{versionData.acceptanceCount.toLocaleString()}</p>
        </div>

        {/* Expand button */}
        <button
          type="button"
          onClick={() => setShowAcceptances((prev) => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0"
        >
          <Users className="w-3.5 h-3.5" />
          View Acceptances
          {showAcceptances ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Acceptances sub-table */}
      {showAcceptances && (
        <div className="border-t border-gray-100">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Acceptance Records — v{versionData.version}
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {displayedAcceptances.map((acc) => (
              <div key={acc.id} className="flex items-center gap-4 px-5 py-3">
                <div className="w-7 h-7 rounded-full bg-brand-navy/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-brand-navy">
                    {acc.userName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{acc.userName}</p>
                  <p className="text-xs text-gray-400 truncate">{acc.userEmail}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-500">{formatDateTime(acc.acceptedAt)}</p>
                  <p className="text-xs text-gray-300 font-mono">{acc.ipAddress}</p>
                </div>
              </div>
            ))}
            {remaining > 0 && (
              <div className="px-5 py-3 text-center">
                <p className="text-xs text-gray-400">
                  + {remaining.toLocaleString()} more acceptances not shown in mock data
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== REMINDER MODAL =====

interface ReminderModalProps {
  onClose: () => void;
}

function ReminderModal({ onClose }: ReminderModalProps) {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl p-8 text-center max-w-sm w-full shadow-2xl animate-fade-in-up">
          <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
          <p className="text-base font-bold text-gray-900">Reminders sent (mock)</p>
          <p className="text-sm text-gray-500 mt-1">
            In production, {PENDING_REACCEPTANCE} users would receive a re-acceptance reminder email.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in-up space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Send className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Send Re-acceptance Reminder</h3>
            <p className="text-xs text-gray-500">This will send an email to all pending users</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            <span className="font-semibold">{PENDING_REACCEPTANCE} users</span> have not yet accepted
            the current ToS (v2.0.0). They will receive an email reminder prompting them to review
            and accept.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setSent(true)}
            className="flex-[2] flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-brand-navy text-white rounded-xl hover:bg-brand-navy-light transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
            Send Reminders
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== MAIN PAGE =====

export default function AdminToSPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-gray-50">

        {/* Admin header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-navy flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Admin
                </p>
                <h1 className="text-base font-bold text-gray-900 leading-none">
                  Terms of Service Management
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowReminderModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send Re-acceptance Reminder</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-brand-navy rounded-lg hover:bg-brand-navy-light transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create New Version</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-6 lg:p-8 space-y-6">

          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-gray-400" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Users</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{TOTAL_USERS.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">Registered on platform</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Accepted Current</p>
              </div>
              <p className="text-3xl font-bold text-green-600">{ACCEPTED_CURRENT.toLocaleString()}</p>
              <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-400 rounded-full"
                  style={{ width: `${Math.round((ACCEPTED_CURRENT / TOTAL_USERS) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {Math.round((ACCEPTED_CURRENT / TOTAL_USERS) * 100)}% of all users
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-amber-500" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pending Re-acceptance</p>
              </div>
              <p className="text-3xl font-bold text-amber-600">{PENDING_REACCEPTANCE.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">Have not accepted v2.0.0 yet</p>
            </div>
          </div>

          {/* Create form */}
          {showCreateForm && (
            <CreateVersionForm onClose={() => setShowCreateForm(false)} />
          )}

          {/* Versions table */}
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-3">ToS Versions</h2>
            <div className="space-y-3">
              {MOCK_TOS_VERSIONS.map((v) => (
                <VersionRow key={v.id} versionData={v} />
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 text-xs text-gray-500">
            <p>
              <span className="font-semibold text-gray-700">Admin note:</span> Only one ToS version
              can be active at a time. Creating a new version will mark the current version as
              inactive and require all users to re-accept. Acceptance records are immutable and
              retained indefinitely for compliance purposes.
            </p>
          </div>
        </div>
      </div>

      {/* Reminder modal */}
      {showReminderModal && (
        <ReminderModal onClose={() => setShowReminderModal(false)} />
      )}
    </>
  );
}
