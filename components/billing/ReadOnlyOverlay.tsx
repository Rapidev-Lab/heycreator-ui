'use client';

import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

// ===== TYPES =====

interface ReadOnlyOverlayProps {
  isVisible: boolean;
}

// ===== COMPONENT =====

export default function ReadOnlyOverlay({ isVisible }: ReadOnlyOverlayProps) {
  const router = useRouter();

  if (!isVisible) return null;

  function handleViewPlans() {
    router.push('/brands/workspace/billing/plans');
  }

  function handleExportData() {
    router.push('/brands/settings?tab=data');
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Trial expired"
      className="fixed inset-0 z-40 flex items-center justify-center"
      // Covers the full content area (sidebar excluded via layout; this covers its own stacking context)
    >
      {/* Semi-transparent backdrop with blur */}
      <div
        className="absolute inset-0 bg-white/60 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Centered card */}
      <div className="relative z-10 w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 flex flex-col items-center text-center gap-5">

        {/* Lock icon in circular navy background */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: '#001F54' }}
          aria-hidden="true"
        >
          <Lock className="w-7 h-7 text-white" />
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-gray-900 leading-tight">
            Your trial has expired
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Subscribe to regain full access to your workspace
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 w-full">
          <button
            type="button"
            onClick={handleViewPlans}
            className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: '#001F54' }}
          >
            View Plans
          </button>

          <button
            type="button"
            onClick={handleExportData}
            className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
}
