'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Loader2,
  Settings,
  FileText,
  Bookmark,
  CheckCircle2,
  Calendar,
  Search,
  X,
} from 'lucide-react';
import ProfileCompletionGuard from '@/components/auth/ProfileCompletionGuard';
import EmailVerificationGuard from '@/components/auth/EmailVerificationGuard';
import ActiveCampaignsTab from '@/components/influencers/campaigns/ActiveCampaignsTab';
import ApplicationsTableTab from '@/components/influencers/campaigns/ApplicationsTableTab';
import SavedCampaignsTab from '@/components/influencers/campaigns/SavedCampaignsTab';
import CompletedCampaignsTab from '@/components/influencers/campaigns/CompletedCampaignsTab';
import CampaignSearchFilters, { EMPTY_FILTERS, type FilterValues } from '@/components/influencers/campaigns/CampaignSearchFilters';
import { useApplications } from '@/lib/hooks/useApplications';

export const dynamic = 'force-dynamic';

type MyCampaignsTab = 'active' | 'applications' | 'saved' | 'completed' | 'schedule';

const TABS: { key: MyCampaignsTab; label: string; icon: React.ElementType; disabled?: boolean }[] = [
  { key: 'active', label: 'Active', icon: Settings },
  { key: 'applications', label: 'Applications', icon: FileText },
  { key: 'saved', label: 'Saved', icon: Bookmark },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
  { key: 'schedule', label: 'Schedule', icon: Calendar, disabled: true },
];

/** Filter dropdown names per tab */
const TAB_FILTER_NAMES: Record<string, string[]> = {
  active: ['Brand', 'Topic', 'Date', 'Value'],
  applications: ['Status', 'Brand', 'Topic', 'Date', 'Budget'],
  saved: ['Brand', 'Topic', 'Date', 'Budget'],
  completed: ['Brand', 'Topic', 'Date', 'Budget'],
};

const VALID_TABS: MyCampaignsTab[] = ['active', 'applications', 'saved', 'completed', 'schedule'];

function MyCampaignsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') as MyCampaignsTab | null;
  const [activeTab, setActiveTab] = useState<MyCampaignsTab>(
    initialTab && VALID_TABS.includes(initialTab) ? initialTab : 'active'
  );
  const [localSearch, setLocalSearch] = useState('');
  const [dropdownFilters, setDropdownFilters] = useState<FilterValues>({ ...EMPTY_FILTERS });

  // Shared applications data — used by Active, Applications, Completed tabs & filter dropdowns
  const { applications, filteredApplications, isLoading: appsLoading, error: appsError } = useApplications();

  // Reset search & filters when tab changes
  useEffect(() => {
    setLocalSearch('');
    setDropdownFilters({ ...EMPTY_FILTERS });
  }, [activeTab]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
  };

  return (
    <ProfileCompletionGuard>
      <EmailVerificationGuard>
        {/* White header area */}
        <div className="bg-white px-4 sm:px-6 lg:px-8 pt-4 border-b border-gray-200">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-brand-navy">My Campaigns</h1>
            <p className="text-sm text-gray-500 mt-1">
              View and manage all of your campaigns
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => !tab.disabled && setActiveTab(tab.key)}
                  disabled={tab.disabled}
                  className={`pb-3 text-sm font-medium transition-colors relative flex items-center gap-2 whitespace-nowrap ${
                    tab.disabled
                      ? 'text-gray-300 cursor-not-allowed'
                      : activeTab === tab.key
                        ? 'text-brand-navy'
                        : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.key && !tab.disabled && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-navy" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gray content area */}
        <div className="min-h-screen bg-[#F8F9FD] px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Global Search & Filter Bar */}
            {activeTab !== 'schedule' && (
              <div className="bg-white px-4 sm:px-6 py-4 mb-6 rounded-lg border border-gray-200">
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={localSearch}
                      onChange={(e) => setLocalSearch(e.target.value)}
                      placeholder="eg. Food, Lifestyle, #newborn"
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[#F8F9FD]"
                    />
                    {localSearch && (
                      <button
                        type="button"
                        onClick={() => setLocalSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
                  >
                    Search
                  </button>
                </form>

                {/* Filter Dropdowns */}
                <CampaignSearchFilters
                  applications={applications}
                  filterNames={TAB_FILTER_NAMES[activeTab] || []}
                  filters={dropdownFilters}
                  onFiltersChange={setDropdownFilters}
                />
              </div>
            )}

            {activeTab === 'active' && (
              <ActiveCampaignsTab
                searchQuery={localSearch}
                dropdownFilters={dropdownFilters}
                onSwitchTab={(tab: string) => setActiveTab(tab as MyCampaignsTab)}
              />
            )}
            {activeTab === 'applications' && (
              <ApplicationsTableTab
                searchQuery={localSearch}
                dropdownFilters={dropdownFilters}
              />
            )}
            {activeTab === 'saved' && (
              <SavedCampaignsTab
                searchQuery={localSearch}
                dropdownFilters={dropdownFilters}
              />
            )}
            {activeTab === 'completed' && (
              <CompletedCampaignsTab
                searchQuery={localSearch}
                dropdownFilters={dropdownFilters}
                onSwitchTab={(tab: string) => setActiveTab(tab as MyCampaignsTab)}
              />
            )}
          </div>
        </div>
      </EmailVerificationGuard>
    </ProfileCompletionGuard>
  );
}

export default function MyCampaignsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-brand-navy animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading campaigns...</p>
          </div>
        </div>
      }
    >
      <MyCampaignsContent />
    </Suspense>
  );
}
