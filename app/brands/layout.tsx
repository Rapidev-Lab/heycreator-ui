'use client';

import { Sidebar, UserProfileHeader } from '@/components/campaigns';
import { WorkspaceProvider, useWorkspace } from '@/lib/context/workspace-context';
import TrialBanner from '@/components/billing/TrialBanner';

function BrandLayoutInner({ children }: { children: React.ReactNode }) {
  const { currentWorkspace } = useWorkspace();

  // Show trial banner if workspace is on trial
  const showTrialBanner =
    currentWorkspace?.status === 'trial' && currentWorkspace.trialEndsAt;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Navigation - includes mobile header with hamburger */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Trial Banner - shown above header when workspace is on trial */}
        {showTrialBanner && (
          <TrialBanner trialEndsAt={currentWorkspace.trialEndsAt!} />
        )}

        {/* Top Header - Only visible on desktop, aligned with sidebar logo */}
        <header className="hidden lg:flex lg:items-center lg:justify-end sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 h-16">
          <UserProfileHeader />
        </header>

        {/* Page Content - Add top padding for mobile header */}
        <main className="pt-16 lg:pt-0">{children}</main>
      </div>
    </div>
  );
}

export default function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider>
      <BrandLayoutInner>{children}</BrandLayoutInner>
    </WorkspaceProvider>
  );
}
