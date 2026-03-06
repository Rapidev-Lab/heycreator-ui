'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  HelpCircle,
  Mail,
  ArrowLeft,
} from 'lucide-react';
import AccountDeletionFlow from '@/components/legal/AccountDeletionFlow';

// ===== MAIN PAGE =====

export default function DeleteAccountPage() {
  const router = useRouter();
  const [flowStarted, setFlowStarted] = useState(false);

  const handleCancel = () => {
    setFlowStarted(false);
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">

      {/* Page header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Delete Account</h1>
        <p className="text-sm text-gray-500 mt-1">
          Permanently delete your workspace and all associated data.
        </p>
      </div>

      {/* Permanent action warning banner */}
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-base font-bold text-red-800">This action is permanent</p>
            <p className="text-sm text-red-700 mt-1 leading-relaxed">
              Deleting your account will permanently remove all workspace data, including campaigns,
              saved creator profiles, analytics, and team member access. This cannot be undone
              after the 30-day grace period expires.
            </p>
          </div>
        </div>
      </div>

      {/* Deletion flow or start button */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        {!flowStarted ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-gray-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Delete your workspace?
            </h2>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Before proceeding, make sure you have exported any data you wish to keep.
              You will be given a 30-day window to cancel the request.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Keep My Account
              </button>
              <button
                type="button"
                onClick={() => setFlowStarted(true)}
                className="px-5 py-2.5 text-sm font-semibold text-red-600 border-2 border-red-200 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
              >
                Proceed to Delete
              </button>
            </div>
          </div>
        ) : (
          <AccountDeletionFlow onCancel={handleCancel} />
        )}
      </div>

      {/* Need help section */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-800">Need help instead?</p>
            <p className="text-sm text-gray-500 mt-1">
              Before deleting your account, consider reaching out to our support team. We may be
              able to help with billing issues, feature requests, or account problems that are
              leading you to consider deletion.
            </p>
            <a
              href="mailto:support@heycreator.com"
              className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-brand-cyan hover:text-brand-navy transition-colors"
            >
              <Mail className="w-4 h-4" />
              support@heycreator.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
