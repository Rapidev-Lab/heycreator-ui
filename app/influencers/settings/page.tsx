'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Settings page redirect — all settings functionality has been consolidated
 * into the My Profile page under the Settings tab.
 */
export default function InfluencerSettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/influencers/profile?tab=settings');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-sm text-gray-500">Redirecting to Profile Settings...</p>
    </div>
  );
}
