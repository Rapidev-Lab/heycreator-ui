'use client';

import { useState, useEffect } from 'react';
import FilterGroup from './FilterGroup';
import { DiscoveryFilters, InfluenceLevel, Gender } from '@/types/discovery';
import { Instagram, Music2, Youtube, X as TwitterX, Facebook, ChevronUp, ChevronDown } from 'lucide-react';

interface FilterSidebarProps {
  filters: DiscoveryFilters;
  onChange: (filters: DiscoveryFilters) => void;
  onApply?: () => void;
  isLoading?: boolean;
  hidePlatformFilter?: boolean;
  initialPlatforms?: Platform[];
}

type Platform = 'instagram' | 'tiktok' | 'youtube' | 'x' | 'facebook';
type FollowerRange = '0-499' | '500-999' | '1000-3999' | '4000-8999' | '9000+';
type PercentageRange = '0-4%' | '5%-9%' | '10%-19%' | '20%-50%' | '51%+';

export default function FilterSidebar({ filters, onChange, onApply, isLoading = false, hidePlatformFilter = false, initialPlatforms = [] }: FilterSidebarProps) {
  // State for collapsible sections
  const [profileExpanded, setProfileExpanded] = useState(true);
  const [platformExpanded, setPlatformExpanded] = useState(true);
  const [followerCountExpanded, setFollowerCountExpanded] = useState(true);
  const [engagementRateExpanded, setEngagementRateExpanded] = useState(true);
  const [trueReachExpanded, setTrueReachExpanded] = useState(true);

  // Audience section states
  const [audienceExpanded, setAudienceExpanded] = useState(true);
  const [locationExpanded, setLocationExpanded] = useState(true);
  const [ageExpanded, setAgeExpanded] = useState(true);
  const [genderExpanded, setGenderExpanded] = useState(true);
  const [brandAffinityExpanded, setBrandAffinityExpanded] = useState(true);

  // Content section state
  const [contentExpanded, setContentExpanded] = useState(false);

  // Platform icons mapping
  const platformIcons: Record<Platform, React.ElementType> = {
    instagram: Instagram,
    tiktok: Music2,
    youtube: Youtube,
    x: TwitterX,
    facebook: Facebook,
  };

  // State for selected filters - PROFILE
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(initialPlatforms);

  // Sync when parent changes initialPlatforms (e.g. chip toggled externally)
  useEffect(() => {
    const next = [...initialPlatforms].sort().join(',');
    const curr = [...selectedPlatforms].sort().join(',');
    if (next !== curr) {
      setSelectedPlatforms(initialPlatforms);
      notifyFilterChange({ selectedPlatforms: initialPlatforms });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPlatforms.join(',')]);
  const [selectedFollowerRanges, setSelectedFollowerRanges] = useState<FollowerRange[]>([]);
  const [selectedEngagementRanges, setSelectedEngagementRanges] = useState<PercentageRange[]>([]);
  const [selectedTrueReachRanges, setSelectedTrueReachRanges] = useState<PercentageRange[]>([]);

  // State for selected filters - AUDIENCE
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedAgeRanges, setSelectedAgeRanges] = useState<string[]>([]);
  const [femaleSliderValue, setFemaleSliderValue] = useState(0);
  const [maleSliderValue, setMaleSliderValue] = useState(0);
  const [selectedBrandAffinities, setSelectedBrandAffinities] = useState<string[]>([]);

  // Toggle handlers - PROFILE
  const togglePlatform = (platform: Platform) => {
    const newPlatforms = selectedPlatforms.includes(platform)
      ? selectedPlatforms.filter(p => p !== platform)
      : [...selectedPlatforms, platform];
    setSelectedPlatforms(newPlatforms);
    notifyFilterChange({ selectedPlatforms: newPlatforms });
  };

  const toggleFollowerRange = (range: FollowerRange) => {
    const newRanges = selectedFollowerRanges.includes(range)
      ? selectedFollowerRanges.filter(r => r !== range)
      : [...selectedFollowerRanges, range];
    setSelectedFollowerRanges(newRanges);
    notifyFilterChange({ selectedFollowerRanges: newRanges });
  };

  const toggleEngagementRange = (range: PercentageRange) => {
    const newRanges = selectedEngagementRanges.includes(range)
      ? selectedEngagementRanges.filter(r => r !== range)
      : [...selectedEngagementRanges, range];
    setSelectedEngagementRanges(newRanges);
    notifyFilterChange({ selectedEngagementRanges: newRanges });
  };

  const toggleTrueReachRange = (range: PercentageRange) => {
    const newRanges = selectedTrueReachRanges.includes(range)
      ? selectedTrueReachRanges.filter(r => r !== range)
      : [...selectedTrueReachRanges, range];
    setSelectedTrueReachRanges(newRanges);
    notifyFilterChange({ selectedTrueReachRanges: newRanges });
  };

  // Toggle handlers - AUDIENCE
  const toggleLocation = (location: string) => {
    const newLocations = selectedLocations.includes(location)
      ? selectedLocations.filter(l => l !== location)
      : [...selectedLocations, location];
    setSelectedLocations(newLocations);
    notifyFilterChange({ selectedLocations: newLocations });
  };

  const toggleAgeRange = (range: string) => {
    const newRanges = selectedAgeRanges.includes(range)
      ? selectedAgeRanges.filter(r => r !== range)
      : [...selectedAgeRanges, range];
    setSelectedAgeRanges(newRanges);
    notifyFilterChange({ selectedAgeRanges: newRanges });
  };

  const toggleBrandAffinity = (affinity: string) => {
    const newAffinities = selectedBrandAffinities.includes(affinity)
      ? selectedBrandAffinities.filter(a => a !== affinity)
      : [...selectedBrandAffinities, affinity];
    setSelectedBrandAffinities(newAffinities);
    notifyFilterChange({ selectedBrandAffinities: newAffinities });
  };

  const handleFemaleSliderChange = (value: number) => {
    setFemaleSliderValue(value);
    notifyFilterChange({ femaleSliderValue: value });
  };

  const handleMaleSliderChange = (value: number) => {
    setMaleSliderValue(value);
    notifyFilterChange({ maleSliderValue: value });
  };

  // Helper to notify parent of filter changes
  const notifyFilterChange = (updatedFields: any) => {
    onChange({
      ...filters,
      // Add all current filter state to ensure parent has complete picture
      selectedPlatforms,
      selectedFollowerRanges,
      selectedEngagementRanges,
      selectedTrueReachRanges,
      selectedLocations,
      selectedAgeRanges,
      femaleSliderValue,
      maleSliderValue,
      selectedBrandAffinities,
      // Apply the updates
      ...updatedFields,
    });
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="w-full animate-pulse">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="h-5 bg-gray-200 rounded w-20" />
          </div>
          <div className="space-y-4 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const followerRanges: FollowerRange[] = ['0-499', '500-999', '1000-3999', '4000-8999', '9000+'];
  const percentageRanges: PercentageRange[] = ['0-4%', '5%-9%', '10%-19%', '20%-50%', '51%+'];

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200">
      {/* PROFILE Header */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => setProfileExpanded(!profileExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="font-semibold text-gray-900 text-sm tracking-wide">PROFILE</h3>
          {profileExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      {profileExpanded && (
        <div className="divide-y divide-gray-200">
          {/* Platform Section */}
          {!hidePlatformFilter && (
          <div className="p-4">
            <button
              onClick={() => setPlatformExpanded(!platformExpanded)}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <h4 className="font-medium text-gray-700 text-sm">Platform</h4>
              {platformExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {platformExpanded && (
              <div className="space-y-2">
                {(['instagram', 'tiktok', 'youtube', 'x', 'facebook'] as Platform[]).map((platform) => {
                  const Icon = platformIcons[platform];
                  return (
                    <label key={platform} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.includes(platform)}
                        onChange={() => togglePlatform(platform)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                      />
                      <Icon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700 capitalize">{platform}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          )}

          {/* Follower Count Section */}
          <div className="p-4">
            <button
              onClick={() => setFollowerCountExpanded(!followerCountExpanded)}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <h4 className="font-medium text-gray-700 text-sm">Follower Count</h4>
              {followerCountExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {followerCountExpanded && (
              <div className="space-y-2">
                {followerRanges.map((range) => (
                  <label key={range} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedFollowerRanges.includes(range)}
                      onChange={() => toggleFollowerRange(range)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{range}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Engagement Rate Section */}
          <div className="p-4">
            <button
              onClick={() => setEngagementRateExpanded(!engagementRateExpanded)}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <h4 className="font-medium text-gray-700 text-sm">Engagement Rate</h4>
              {engagementRateExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {engagementRateExpanded && (
              <div className="space-y-2">
                {percentageRanges.map((range) => (
                  <label key={range} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedEngagementRanges.includes(range)}
                      onChange={() => toggleEngagementRange(range)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{range}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* True Reach Section */}
          <div className="p-4">
            <button
              onClick={() => setTrueReachExpanded(!trueReachExpanded)}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <h4 className="font-medium text-gray-700 text-sm">True Reach</h4>
              {trueReachExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {trueReachExpanded && (
              <div className="space-y-2">
                {percentageRanges.map((range) => (
                  <label key={range} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedTrueReachRanges.includes(range)}
                      onChange={() => toggleTrueReachRange(range)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{range}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AUDIENCE Section */}
      <div className="p-4 border-b border-gray-200 mt-6">
        <button
          onClick={() => setAudienceExpanded(!audienceExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="font-semibold text-gray-900 text-sm tracking-wide">AUDIENCE</h3>
          {audienceExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      {audienceExpanded && (
        <div className="divide-y divide-gray-200">
          {/* Location Section */}
          <div className="p-4">
            <button
              onClick={() => setLocationExpanded(!locationExpanded)}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <h4 className="font-medium text-gray-700 text-sm">Location</h4>
              {locationExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {locationExpanded && (
              <div className="space-y-3">
                {/* Search Input — press Enter to add custom location */}
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && locationSearch.trim()) {
                      const loc = locationSearch.trim();
                      if (!selectedLocations.includes(loc)) {
                        const newLocations = [...selectedLocations, loc];
                        setSelectedLocations(newLocations);
                        notifyFilterChange({ selectedLocations: newLocations });
                      }
                      setLocationSearch('');
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                {/* Selected custom locations (not in popular list) */}
                {selectedLocations
                  .filter(l => !['Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth'].includes(l))
                  .map((loc) => (
                    <label key={loc} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked
                        onChange={() => toggleLocation(loc)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{loc}</span>
                    </label>
                  ))}

                {/* Popular Cities — filtered by search text */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Popular</p>
                  {['Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth']
                    .filter((city) => city.toLowerCase().includes(locationSearch.toLowerCase()))
                    .map((city) => (
                    <label key={city} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedLocations.includes(city)}
                        onChange={() => toggleLocation(city)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{city}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Age Section */}
          <div className="p-4">
            <button
              onClick={() => setAgeExpanded(!ageExpanded)}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <h4 className="font-medium text-gray-700 text-sm">Age</h4>
              {ageExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {ageExpanded && (
              <div className="space-y-2">
                {['18-24', '25-39', '40-59', '60+'].map((ageRange) => (
                  <label key={ageRange} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedAgeRanges.includes(ageRange)}
                      onChange={() => toggleAgeRange(ageRange)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{ageRange}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Gender Section */}
          <div className="p-4">
            <button
              onClick={() => setGenderExpanded(!genderExpanded)}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <h4 className="font-medium text-gray-700 text-sm">Gender</h4>
              {genderExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {genderExpanded && (
              <div className="space-y-4">
                {/* Female Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700">Female</label>
                    <span className="text-xs text-gray-500">Min: {femaleSliderValue}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={femaleSliderValue}
                    onChange={(e) => handleFemaleSliderChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Male Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700">Male</label>
                    <span className="text-xs text-gray-500">Min: {maleSliderValue}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={maleSliderValue}
                    onChange={(e) => handleMaleSliderChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Brand Affinity Section */}
          <div className="p-4">
            <button
              onClick={() => setBrandAffinityExpanded(!brandAffinityExpanded)}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <h4 className="font-medium text-gray-700 text-sm">Brand Affinity</h4>
              {brandAffinityExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {brandAffinityExpanded && (
              <div className="space-y-2">
                {['Strong', 'Moderate', 'Low'].map((affinity) => (
                  <label key={affinity} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedBrandAffinities.includes(affinity)}
                      onChange={() => toggleBrandAffinity(affinity)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{affinity}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTENT Section */}
      <div className="p-4 border-b border-gray-200 mt-6">
        <button
          onClick={() => setContentExpanded(!contentExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="font-semibold text-gray-900 text-sm tracking-wide">CONTENT</h3>
          {contentExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      {contentExpanded && (
        <div className="divide-y divide-gray-200">
          {/* Placeholder for future content filters */}
          <div className="p-4">
            <p className="text-sm text-gray-500 italic">Content filters coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
}
