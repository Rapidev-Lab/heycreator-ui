'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

/**
 * Legacy workspace settings page — redirects to the unified Settings hub.
 * Maps old tab names to new tab IDs:
 *   general  → general
 *   team     → members
 *   usage    → plans
 *   data     → data
 *   danger   → danger
 */
function WorkspaceSettingsRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const oldTab = searchParams.get('tab');

    const tabMap: Record<string, string> = {
      general: 'general',
      team: 'members',
      usage: 'plans',
      data: 'data',
      danger: 'danger',
    };

    const newTab = tabMap[oldTab || ''] || 'general';
    router.replace(`/brands/settings?tab=${newTab}`);
  }, [router, searchParams]);

  return null;
}

export default function WorkspaceSettingsRedirect() {
  return (
    <Suspense fallback={null}>
      <WorkspaceSettingsRedirectContent />
    </Suspense>
  );
}
