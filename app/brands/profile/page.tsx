'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Legacy profile page — redirects to the unified Settings hub.
 * Preserves old bookmarks / back-button history.
 */
export default function BrandProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/brands/settings?tab=profile');
  }, [router]);

  return null;
}
