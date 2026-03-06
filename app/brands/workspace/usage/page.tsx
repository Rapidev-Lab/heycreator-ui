'use client';

import { Suspense } from 'react';
import { useWorkspace } from '@/lib/context/workspace-context';
import UsageDashboard from '@/components/usage/UsageDashboard';
import PageLoader from '@/components/ui/PageLoader';

// ---------------------------------------------------------------------------
// Inner component — renders after workspace context resolves
// ---------------------------------------------------------------------------

function UsagePageContent() {
  const { currentWorkspace, isLoading } = useWorkspace();

  if (isLoading) {
    return <PageLoader message="Loading workspace data…" />;
  }

  if (!currentWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-7 h-7 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
            />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">No workspace selected</h2>
        <p className="text-sm text-gray-500 max-w-xs">
          Please select a workspace from the sidebar to view usage and limits.
        </p>
      </div>
    );
  }

  return <UsageDashboard workspaceId={currentWorkspace.id} />;
}

// ---------------------------------------------------------------------------
// Page export — wrapped in Suspense to satisfy Next.js SSR requirements
// ---------------------------------------------------------------------------

/**
 * Usage & Limits page for the brand workspace.
 *
 * Route: /brands/workspace/usage
 *
 * Renders the UsageDashboard component with the current workspace's ID,
 * sourced from the WorkspaceContext that is provided by BrandLayout.
 */
export default function WorkspaceUsagePage() {
  return (
    <Suspense fallback={<PageLoader message="Loading usage data…" />}>
      <UsagePageContent />
    </Suspense>
  );
}
