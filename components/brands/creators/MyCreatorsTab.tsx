'use client';

import { useState, useMemo } from 'react';
import { Search, Instagram, Music2, Youtube, X as TwitterX, Facebook, SlidersHorizontal, ListPlus, Eye, Trash2 } from 'lucide-react';
import FilterSidebar from '@/components/discovery/filters/FilterSidebar';
import ResultsHeader from '@/components/discovery/results/ResultsHeader';
import ResultsGrid from '@/components/discovery/results/ResultsGrid';
import type { CardMenuItem } from '@/components/brands/discover/RecommendedCreatorCard';
import type { InfluencerProfile, DiscoveryFilters } from '@/types/discovery';
import type { CreatorListResponse } from '@/types/creator-list';

type PlatformFilter = 'instagram' | 'tiktok' | 'youtube' | 'x' | 'facebook';
type ViewMode = 'grid' | 'list';
type SortOption = 'relevance' | 'best-match' | 'followers' | 'engagement' | 'cost' | 'name';

interface MyCreatorsTabProps {
  creators: InfluencerProfile[];
  lists: CreatorListResponse[];
  isLoading: boolean;
  onRefresh: () => void;
  onCardClick?: (id: string) => void;
  onAddToList?: (creatorId: string) => void;
  onDeleteCreator?: (creatorId: string) => void;
}

const platformButtons: { id: PlatformFilter; label: string; icon: React.ElementType }[] = [
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'tiktok', label: 'TikTok', icon: Music2 },
  { id: 'youtube', label: 'YouTube', icon: Youtube },
  { id: 'x', label: 'X', icon: TwitterX },
  { id: 'facebook', label: 'Facebook', icon: Facebook },
];

export default function MyCreatorsTab({
  creators,
  lists,
  isLoading,
  onRefresh,
  onCardClick,
  onAddToList,
  onDeleteCreator,
}: MyCreatorsTabProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformFilter[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('followers');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sidebarFilters, setSidebarFilters] = useState<DiscoveryFilters>({} as DiscoveryFilters);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const togglePlatform = (platform: PlatformFilter) => {
    setSelectedPlatforms(prev => {
      const next = prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform];
      return next;
    });
  };

  // When sidebar filters change, sync platform checkboxes back to chips
  const handleSidebarChange = (newFilters: DiscoveryFilters) => {
    setSidebarFilters(newFilters);
    const sidebarPlatforms = (newFilters as any).selectedPlatforms || [];
    // Only sync if sidebar platforms actually differ from chips
    const chipsKey = [...selectedPlatforms].sort().join(',');
    const sideKey = [...sidebarPlatforms].sort().join(',');
    if (chipsKey !== sideKey) {
      setSelectedPlatforms(sidebarPlatforms);
    }
  };

  // Client-side filtering on InfluencerProfile data points
  const filteredCreators = useMemo(() => {
    let result = [...creators];

    // Search query — name, username, bio, topics
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => {
        return (
          (c.name || '').toLowerCase().includes(q) ||
          (c.username || '').toLowerCase().includes(q) ||
          (c.bio || '').toLowerCase().includes(q) ||
          (c.topics || []).some(t => t.toLowerCase().includes(q))
        );
      });
    }

    // Sidebar filters — Platform checkboxes
    const sidebarPlatforms = (sidebarFilters as any).selectedPlatforms || [];
    if (sidebarPlatforms.length > 0) {
      result = result.filter(c =>
        c.platforms.some((p: string) => sidebarPlatforms.includes(p))
      );
    }

    // Sidebar filters — Follower ranges
    const selectedFollowerRanges = (sidebarFilters as any).selectedFollowerRanges || [];
    if (selectedFollowerRanges.length > 0) {
      result = result.filter(c => {
        const followers = c.follower_count || 0;
        return selectedFollowerRanges.some((range: string) => {
          if (range === '0-499') return followers >= 0 && followers <= 499;
          if (range === '500-999') return followers >= 500 && followers <= 999;
          if (range === '1000-3999') return followers >= 1000 && followers <= 3999;
          if (range === '4000-8999') return followers >= 4000 && followers <= 8999;
          if (range === '9000+') return followers >= 9000;
          return true;
        });
      });
    }

    // Sidebar filters — Engagement rate ranges
    const selectedEngagementRanges = (sidebarFilters as any).selectedEngagementRanges || [];
    if (selectedEngagementRanges.length > 0) {
      result = result.filter(c => {
        const rate = (c.engagement_rate || 0) * 100;
        return selectedEngagementRanges.some((range: string) => {
          if (range === '0-4%') return rate >= 0 && rate <= 4;
          if (range === '5%-9%') return rate >= 5 && rate <= 9;
          if (range === '10%-19%') return rate >= 10 && rate <= 19;
          if (range === '20%-50%') return rate >= 20 && rate <= 50;
          if (range === '51%+') return rate >= 51;
          return true;
        });
      });
    }

    // Sidebar filters — True Reach ranges (uses computed true_reach_percentage from API)
    const selectedTrueReachRanges = (sidebarFilters as any).selectedTrueReachRanges || [];
    if (selectedTrueReachRanges.length > 0) {
      result = result.filter(c => {
        const reach = (c as any).true_reach_percentage || 0;
        return selectedTrueReachRanges.some((range: string) => {
          if (range === '0-4%') return reach >= 0 && reach <= 4;
          if (range === '5%-9%') return reach >= 5 && reach <= 9;
          if (range === '10%-19%') return reach >= 10 && reach <= 19;
          if (range === '20%-50%') return reach >= 20 && reach <= 50;
          if (range === '51%+') return reach >= 51;
          return true;
        });
      });
    }

    // Sidebar filters — Location (enhanced: checks influencer location AND audience locations)
    const selectedLocations = (sidebarFilters as any).selectedLocations || [];
    if (selectedLocations.length > 0) {
      result = result.filter(c => {
        return selectedLocations.some((l: string) => {
          const lLower = l.toLowerCase();
          // Check influencer's own location
          if (c.location?.city?.toLowerCase().includes(lLower) ||
              c.location?.country?.toLowerCase().includes(lLower)) {
            return true;
          }
          // Check audience top_locations
          if (c.audience?.top_locations?.some(
            (loc: any) => loc.country?.toLowerCase().includes(lLower)
          )) {
            return true;
          }
          // Check audience_demographics top_countries and top_cities
          const demo = (c as any).audience_demographics;
          if (demo?.top_countries?.some(
            (loc: any) => loc.country?.toLowerCase().includes(lLower)
          )) {
            return true;
          }
          if (demo?.top_cities?.some(
            (loc: any) => loc.city?.toLowerCase().includes(lLower) ||
                          loc.country?.toLowerCase().includes(lLower)
          )) {
            return true;
          }
          return false;
        });
      });
    }

    // Sidebar filters — Age Ranges (audience demographic filter)
    const selectedAgeRanges = (sidebarFilters as any).selectedAgeRanges || [];
    if (selectedAgeRanges.length > 0) {
      const AGE_THRESHOLD = 20; // Audience age group must be >= 20% to qualify
      // Map sidebar ranges to enrichment ranges
      const sidebarToEnrichmentMap: Record<string, string[]> = {
        '18-24': ['18-24'],
        '25-39': ['25-34', '35-44'],
        '40-59': ['35-44', '45-54', '55+'],
        '60+': ['55+'],
      };
      result = result.filter(c => {
        const ageRanges = (c as any).audience_demographics?.age_ranges || [];
        if (ageRanges.length === 0) return false;
        return selectedAgeRanges.some((sidebarRange: string) => {
          const enrichmentRanges = sidebarToEnrichmentMap[sidebarRange] || [];
          const totalPct = enrichmentRanges.reduce((sum: number, eRange: string) => {
            const match = ageRanges.find((ar: any) => ar.range === eRange);
            return sum + (match?.percentage || 0);
          }, 0);
          return totalPct >= AGE_THRESHOLD;
        });
      });
    }

    // Sidebar filters — Gender (minimum percentage thresholds from sliders)
    const femaleMin = (sidebarFilters as any).femaleSliderValue || 0;
    const maleMin = (sidebarFilters as any).maleSliderValue || 0;
    if (femaleMin > 0 || maleMin > 0) {
      result = result.filter(c => {
        const genderData = (c as any).audience_demographics?.gender_split
          || c.audience?.gender_split;
        if (!genderData || (genderData.male === 0 && genderData.female === 0)) {
          return false;
        }
        if (femaleMin > 0 && (genderData.female || 0) < femaleMin) return false;
        if (maleMin > 0 && (genderData.male || 0) < maleMin) return false;
        return true;
      });
    }

    // Sidebar filters — Brand Affinity (Strong/Moderate/Low)
    const selectedBrandAffinities = (sidebarFilters as any).selectedBrandAffinities || [];
    if (selectedBrandAffinities.length > 0) {
      result = result.filter(c => {
        const brands = (c as any).brand_affinity || [];
        const brandCount = brands.length;
        const maxPct = brands.reduce((max: number, b: any) =>
          Math.max(max, b.percentage || 0), 0);
        let level: string;
        if (brandCount >= 3 || maxPct >= 70) {
          level = 'Strong';
        } else if (brandCount >= 1 || maxPct >= 40) {
          level = 'Moderate';
        } else {
          level = 'Low';
        }
        return selectedBrandAffinities.includes(level);
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'followers':
          return (b.follower_count || 0) - (a.follower_count || 0);
        case 'engagement':
          return (b.engagement_rate || 0) - (a.engagement_rate || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'cost':
        case 'best-match':
          return 0;
        case 'relevance':
        default:
          return (b.follower_count || 0) - (a.follower_count || 0);
      }
    });

    return result;
  }, [creators, selectedPlatforms, searchQuery, sortBy, sidebarFilters]);

  // Count active sidebar filters for badge
  const activeFilterCount = [
    (sidebarFilters as any).selectedPlatforms,
    (sidebarFilters as any).selectedFollowerRanges,
    (sidebarFilters as any).selectedEngagementRanges,
    (sidebarFilters as any).selectedTrueReachRanges,
    (sidebarFilters as any).selectedLocations,
    (sidebarFilters as any).selectedAgeRanges,
    (sidebarFilters as any).selectedBrandAffinities,
  ].filter(arr => arr && arr.length > 0).length
    + ((sidebarFilters as any).femaleSliderValue > 0 ? 1 : 0)
    + ((sidebarFilters as any).maleSliderValue > 0 ? 1 : 0);

  return (
    <div>
      {/* Mobile Filter Overlay */}
      {showMobileFilters && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowMobileFilters(false)}
        />
      )}

      {/* Mobile Filter Drawer */}
      <div
        className={`
          ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'}
          lg:hidden
          fixed top-0 left-0 h-screen w-80
          bg-white border-r border-gray-200
          z-50 transition-transform duration-300
          overflow-y-auto
        `}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <TwitterX className="w-5 h-5" />
            </button>
          </div>
          <FilterSidebar
            filters={sidebarFilters}
            onChange={handleSidebarChange}
            initialPlatforms={selectedPlatforms}
          />
        </div>
      </div>

      <div className="bg-white px-4 sm:px-6 lg:px-8 py-4 lg:py-6 mb-4 rounded-lg border border-gray-200">
        {/* Search Bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="eg. TikTok, Lifestyle, #fashion"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
            />
          </div>
          <button
            onClick={() => {}}
            className="px-6 py-2.5 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
          >
            Search
          </button>
        </div>

        {/* Platform Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {platformButtons.map(({ id, label, icon: Icon }) => {
            const isActive = selectedPlatforms.includes(id);
            return (
              <button
                key={id}
                onClick={() => togglePlatform(id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#FF385C] text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Filters Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-brand-navy text-white text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6">
        {/* Left: Filter Sidebar (desktop) */}
        <div className="w-[250px] flex-shrink-0 hidden lg:block">
          <FilterSidebar
            filters={sidebarFilters}
            onChange={handleSidebarChange}
            initialPlatforms={selectedPlatforms}
          />
        </div>

        {/* Right: Results */}
        <div className="flex-1">
          {/* Results Header — count + sort + grid/list toggle */}
          <ResultsHeader
            count={filteredCreators.length}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {/* Creator Cards via ResultsGrid (RecommendedCreatorCard + grid/list) */}
          <div className="mt-4">
            <ResultsGrid
              influencers={filteredCreators}
              isLoading={isLoading}
              viewMode={viewMode}
              onCardClick={onCardClick}
              getMenuItems={(influencer) => {
                const items: CardMenuItem[] = [];
                if (onAddToList) {
                  items.push({
                    label: 'Add to List',
                    icon: ListPlus,
                    onClick: () => onAddToList(influencer.id),
                  });
                }
                if (onCardClick) {
                  items.push({
                    label: 'View / Edit Creator',
                    icon: Eye,
                    onClick: () => onCardClick(influencer.id),
                  });
                }
                if (onDeleteCreator) {
                  items.push({
                    label: 'Delete',
                    icon: Trash2,
                    onClick: () => onDeleteCreator(influencer.id),
                    variant: 'danger',
                  });
                }
                return items;
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
