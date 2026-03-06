'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';
import PlatformSelector from './PlatformSelector';
import SearchBar from './SearchBar';
import { Platform } from '@/types/discovery';

interface DiscoveryHeaderProps {
  showFiltersButton?: boolean;
  onFiltersClick?: () => void;
  initialPlatforms?: Platform[];
  initialQuery?: string;
  initialLocation?: string;
  initialVetted?: boolean;
  selectedTopics?: string[];
}

export default function DiscoveryHeader({
  showFiltersButton = false,
  onFiltersClick,
  initialPlatforms = ['instagram'],
  initialQuery = '',
  initialLocation = '',
  initialVetted = false,
  selectedTopics = []
}: DiscoveryHeaderProps) {
  const router = useRouter();
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(initialPlatforms);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (params: { query: string; location: string; vetted: boolean }) => {
    setIsSearching(true);

    // Build query parameters
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.set('query', params.query);
    if (params.location) searchParams.set('location', params.location);
    if (params.vetted) searchParams.set('vetted', 'true');
    if (selectedPlatforms.length > 0) {
      searchParams.set('platforms', selectedPlatforms.join(','));
    }

    // Navigate to results page
    router.push(`/brands/discover/results?${searchParams.toString()}`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Platform Selector */}
      <div className="w-full overflow-x-auto">
        <PlatformSelector
          selectedPlatforms={selectedPlatforms}
          onChange={setSelectedPlatforms}
        />
      </div>

      {/* Search Bar with Filters Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <SearchBar
            onSearch={handleSearch}
            isLoading={isSearching}
            initialQuery={initialQuery}
            initialLocation={initialLocation}
            initialVetted={initialVetted}
            selectedTopics={selectedTopics}
          />
        </div>

        {showFiltersButton && (
          <button
            onClick={onFiltersClick}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors whitespace-nowrap"
          >
            <SlidersHorizontal className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
