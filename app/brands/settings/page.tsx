'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  SettingsLayout,
  type SettingsTab,
  ProfileTab,
  SecurityTab,
  NotificationsTab,
  ConnectedAccountsTab,
  GeneralTab,
  MembersTab,
  PlansBillingTab,
  DataExportTab,
  IntegrationsTab,
  DangerZoneTab,
} from '@/components/settings';
import PageLoader from '@/components/ui/PageLoader';

// ===== INNER COMPONENT (uses hooks that require Suspense) =====

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read active tab from URL — default to 'profile'
  const activeTab = (searchParams.get('tab') as SettingsTab) || 'profile';

  const handleTabChange = (tab: SettingsTab) => {
    router.replace(`/brands/settings?tab=${tab}`, { scroll: false });
  };

  // Render active tab content
  function renderTabContent() {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab />;
      case 'security':
        return <SecurityTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'connected':
        return <ConnectedAccountsTab />;
      case 'general':
        return <GeneralTab />;
      case 'members':
        return <MembersTab />;
      case 'plans':
        return <PlansBillingTab />;
      case 'data':
        return <DataExportTab />;
      case 'integrations':
        return <IntegrationsTab />;
      case 'danger':
        return <DangerZoneTab />;
      default:
        return <ProfileTab />;
    }
  }

  return (
    <SettingsLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {renderTabContent()}
    </SettingsLayout>
  );
}

// ===== PAGE EXPORT =====

export default function BrandSettingsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <SettingsPageContent />
    </Suspense>
  );
}
