'use client';

import InfluencerSidebar from '@/components/influencers/InfluencerSidebar';
import UserProfileHeader from '@/components/influencers/UserProfileHeader';

export default function InfluencersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Navigation - includes mobile header with hamburger */}
      <InfluencerSidebar />

      {/* Main Content Area */}
      <div className="lg:pl-60">
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
