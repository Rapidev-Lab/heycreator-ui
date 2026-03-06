'use client';

import React from 'react';

interface ExternalAuthPromptProps {
  provider: string;
  providerIcon?: React.ReactNode;
  onCancel: () => void;
  onContinue: () => void;
  loading?: boolean;
}

export default function ExternalAuthPrompt({
  provider,
  providerIcon,
  onCancel,
  onContinue,
  loading = false
}: ExternalAuthPromptProps) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full">
      <div className="text-center mb-8">
        {providerIcon && (
          <div className="flex justify-center mb-4">
            {providerIcon}
          </div>
        )}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Allow Hey Creator to access your {provider} account?
        </h3>
        <p className="text-gray-600 text-sm">
          This will allow Hey Creator to verify your identity and access your public profile information.
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={onContinue}
          disabled={loading}
          className="w-full px-6 py-3 bg-brand-navy text-white rounded-xl font-semibold hover:bg-brand-navy-light transition-all duration-200 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Continue'}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="w-full px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
