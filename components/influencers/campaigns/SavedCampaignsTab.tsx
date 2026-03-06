'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  Grid3x3,
  List,
  Loader2,
  Clipboard,
  Bookmark,
  ArrowRight,
} from 'lucide-react';
import MarketplaceCampaignCard from '@/components/influencers/marketplace/MarketplaceCampaignCard';
import PaginationBar from '@/components/ui/PaginationBar';
import { useSavedCampaigns } from '@/lib/hooks/useSavedCampaigns';
import type { FilterValues } from '@/components/influencers/campaigns/CampaignSearchFilters';
import type { MarketplaceCampaignExtended } from '@/types/marketplace';

type ViewMode = 'grid' | 'list';
type SortOption = 'relevance' | 'latest' | 'budget-high' | 'budget-low' | 'deadline';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'latest', label: 'Latest' },
  { value: 'budget-high', label: 'Budget (High to Low)' },
  { value: 'budget-low', label: 'Budget (Low to High)' },
  { value: 'deadline', label: 'Ending Soon' },
];

function sortCampaigns(
  campaigns: MarketplaceCampaignExtended[],
  sortBy: SortOption
): MarketplaceCampaignExtended[] {
  if (sortBy === 'relevance' || sortBy === 'latest') return campaigns;
  return [...campaigns].sort((a, b) => {
    switch (sortBy) {
      case 'budget-high': return b.budgetMax - a.budgetMax;
      case 'budget-low': return a.budgetMin - b.budgetMin;
      case 'deadline': return a.daysRemaining - b.daysRemaining;
      default: return 0;
    }
  });
}

/** Map the unified budgetRange filter value to min/max numbers */
function parseBudgetRange(budgetRange: string | null): { min: number; max: number } | null {
  if (!budgetRange) return null;
  switch (budgetRange) {
    case 'under-1k': return { min: 0, max: 999 };
    case '1k-5k': return { min: 1000, max: 5000 };
    case '5k-10k': return { min: 5000, max: 10000 };
    case '10k+': return { min: 10000, max: Infinity };
    default: return null;
  }
}

interface SavedCampaignsTabProps {
  searchQuery: string;
  dropdownFilters: FilterValues;
}

export default function SavedCampaignsTab({
  searchQuery,
  dropdownFilters,
}: SavedCampaignsTabProps) {
  const router = useRouter();
  const { savedCampaigns: expandedCampaigns, isLoading, isSaved, toggleSave } = useSavedCampaigns({ expand: true });

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [sortOpen, setSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // Reset page when search/filters/sort/viewMode change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, dropdownFilters, sortBy, viewMode]);

  // Apply page-level filters to the expanded saved campaigns
  const savedCampaigns = useMemo(() => {
    let result = [...expandedCampaigns];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.brandName.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    // Topic filter (from dropdownFilters.topics → category matching)
    if (dropdownFilters.topics.length > 0) {
      result = result.filter((c) =>
        dropdownFilters.topics.some(
          (cat) =>
            c.category.toLowerCase() === cat.toLowerCase() ||
            c.categories.some((cc) => cc.toLowerCase() === cat.toLowerCase())
        )
      );
    }

    // Brand filter
    if (dropdownFilters.brands.length > 0) {
      result = result.filter((c) =>
        dropdownFilters.brands.includes(c.brandName)
      );
    }

    // Budget filter (from dropdownFilters.budgetRange)
    const budget = parseBudgetRange(dropdownFilters.budgetRange);
    if (budget) {
      result = result.filter((c) => c.budgetMax >= budget.min && c.budgetMin <= budget.max);
    }

    // Date filter
    if (dropdownFilters.dateRange) {
      const now = new Date();
      let cutoff: Date;
      switch (dropdownFilters.dateRange) {
        case '7d':
          cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '3m':
          cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          cutoff = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          cutoff = new Date(0);
      }
      result = result.filter((c) => {
        const d = c.applicationDeadlineDate ? new Date(c.applicationDeadlineDate) : null;
        return d && !isNaN(d.getTime()) && d >= cutoff;
      });
    }

    return sortCampaigns(result, sortBy);
  }, [expandedCampaigns, searchQuery, dropdownFilters, sortBy]);

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Relevance';

  return (
    <>
      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {savedCampaigns.length} saved campaign{savedCampaigns.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:border-gray-400 transition-all"
            >
              <span>{currentSortLabel}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2 px-2">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => { setSortBy(option.value); setSortOpen(false); }}
                      className={`w-full text-left px-3 py-2.5 text-sm transition-colors rounded-md ${
                        sortBy === option.value
                          ? 'bg-brand-navy text-white font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1 bg-white">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-all ${
                viewMode === 'grid' ? 'bg-brand-navy text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Grid view"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-all ${
                viewMode === 'list' ? 'bg-brand-navy text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading — skeleton cards */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-5/6 mb-4" />
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="h-5 bg-gray-200 rounded w-24" />
                <div className="h-8 bg-gray-100 rounded-lg w-20" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && savedCampaigns.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Saved Campaigns</h3>
          <p className="text-gray-600 mb-4">
            Save campaigns you&apos;re interested in to find them here later.
          </p>
          <button
            onClick={() => router.push('/influencers/marketplace')}
            className="px-6 py-2 bg-brand-navy text-white rounded-full hover:bg-brand-navy-light transition-colors"
          >
            Browse Marketplace
          </button>
        </div>
      )}

      {/* Campaign Grid/List */}
      {!isLoading && savedCampaigns.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedCampaigns.slice(currentPage * 6, (currentPage + 1) * 6).map((campaign) => (
                <MarketplaceCampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  viewMode="grid"
                  isSaved={isSaved(campaign.id)}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {savedCampaigns.slice(currentPage * 6, (currentPage + 1) * 6).map((campaign) => (
                <MarketplaceCampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  viewMode="list"
                  isSaved={isSaved(campaign.id)}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          )}
          <PaginationBar
            currentPage={currentPage}
            totalCount={savedCampaigns.length}
            pageSize={6}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </>
  );
}
