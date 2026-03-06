'use client';

import { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Search,
  X,
  Instagram,
  Music2,
  Youtube,
  Facebook,
} from 'lucide-react';
import { X as TwitterX } from 'lucide-react';

interface FilterState {
  categories: string[];
  platforms: string[];
  budgetMin: string;
  budgetMax: string;
  followerRanges: string[];
  engagementRanges: string[];
  trueReachRanges: string[];
  locations: string[];
  languages: string[];
  verified: string | null;
}

interface CampaignFilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableCategories?: string[];
  className?: string;
}

const PLATFORM_OPTIONS: { id: string; label: string; icon: React.ElementType }[] = [
  { id: 'Instagram', label: 'Instagram', icon: Instagram },
  { id: 'TikTok', label: 'TikTok', icon: Music2 },
  { id: 'YouTube', label: 'YouTube', icon: Youtube },
  { id: 'X', label: 'X', icon: TwitterX },
  { id: 'Facebook', label: 'Facebook', icon: Facebook },
];

const FOLLOWER_RANGES = [
  { label: '0-499', value: '0-499' },
  { label: '500-999', value: '500-999' },
  { label: '1000-3999', value: '1000-3999' },
  { label: '4000-8999', value: '4000-8999' },
  { label: '9000+', value: '9000+' },
];

const ENGAGEMENT_RANGES = [
  { label: '0-4%', value: '0-4' },
  { label: '5%-9%', value: '5-9' },
  { label: '10%-19%', value: '10-19' },
  { label: '20%-50%', value: '20-50' },
  { label: '51%+', value: '51+' },
];

const POPULAR_LOCATIONS = [
  'Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth',
];

export function getEmptyFilters(): FilterState {
  return {
    categories: [],
    platforms: [],
    budgetMin: '',
    budgetMax: '',
    followerRanges: [],
    engagementRanges: [],
    trueReachRanges: [],
    locations: [],
    languages: [],
    verified: null,
  };
}

export type { FilterState };

export default function CampaignFilterSidebar({
  filters,
  onFiltersChange,
  className = '',
}: CampaignFilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    profile: true,
    location: true,
    verified: true,
  });

  const [locationSearch, setLocationSearch] = useState('');

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    const current = filters[key] as string[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [key]: updated });
  };

  const hasActiveFilters = filters.platforms.length > 0 ||
    filters.followerRanges.length > 0 ||
    filters.engagementRanges.length > 0 ||
    (filters.trueReachRanges?.length || 0) > 0 ||
    filters.locations.length > 0 ||
    filters.languages.length > 0 ||
    filters.verified !== null;

  const filteredLocations = locationSearch.trim()
    ? POPULAR_LOCATIONS.filter(l => l.toLowerCase().includes(locationSearch.toLowerCase()))
    : POPULAR_LOCATIONS;

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Header with clear all */}
      {hasActiveFilters && (
        <div className="flex items-center justify-end px-5 pt-3">
          <button
            onClick={() => onFiltersChange(getEmptyFilters())}
            className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        </div>
      )}

      {/* PROFILE section */}
      <FilterSection
        title="PROFILE"
        expanded={expandedSections.profile}
        onToggle={() => toggleSection('profile')}
      >
        {/* Platform */}
        <FilterSubSection title="Platform">
          <div className="space-y-2">
            {PLATFORM_OPTIONS.map(({ id, label, icon: Icon }) => (
              <label key={id} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.platforms.includes(id)}
                  onChange={() => toggleArrayFilter('platforms', id)}
                  className="w-4 h-4 rounded border-gray-300 text-brand-navy focus:ring-brand-navy"
                />
                <Icon className="w-4 h-4 text-gray-500 group-hover:text-brand-navy" />
                <span className="text-sm text-gray-700 group-hover:text-brand-navy">{label}</span>
              </label>
            ))}
          </div>
        </FilterSubSection>

        {/* Follower Count */}
        <FilterSubSection title="Follower Count">
          <div className="space-y-2">
            {FOLLOWER_RANGES.map(range => (
              <label key={range.value} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.followerRanges.includes(range.value)}
                  onChange={() => toggleArrayFilter('followerRanges', range.value)}
                  className="w-4 h-4 rounded border-gray-300 text-brand-navy focus:ring-brand-navy"
                />
                <span className="text-sm text-gray-700 group-hover:text-brand-navy">{range.label}</span>
              </label>
            ))}
          </div>
        </FilterSubSection>

        {/* Engagement Rate */}
        <FilterSubSection title="Engagement Rate">
          <div className="space-y-2">
            {ENGAGEMENT_RANGES.map(range => (
              <label key={range.value} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.engagementRanges.includes(range.value)}
                  onChange={() => toggleArrayFilter('engagementRanges', range.value)}
                  className="w-4 h-4 rounded border-gray-300 text-brand-navy focus:ring-brand-navy"
                />
                <span className="text-sm text-gray-700 group-hover:text-brand-navy">{range.label}</span>
              </label>
            ))}
          </div>
        </FilterSubSection>

      </FilterSection>

      {/* Location section */}
      <FilterSection
        title="Location"
        expanded={expandedSections.location}
        onToggle={() => toggleSection('location')}
      >
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search locations..."
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 bg-gray-50"
          />
        </div>
        {!locationSearch.trim() && (
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Popular</p>
        )}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {filteredLocations.map(loc => (
            <label key={loc} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.locations.includes(loc)}
                onChange={() => toggleArrayFilter('locations', loc)}
                className="w-4 h-4 rounded border-gray-300 text-brand-navy focus:ring-brand-navy"
              />
              <span className="text-gray-400 text-sm">&#x2609;</span>
              <span className="text-sm text-gray-700 group-hover:text-brand-navy">{loc}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Verified section */}
      <FilterSection
        title="Verified"
        expanded={expandedSections.verified}
        onToggle={() => toggleSection('verified')}
      >
        <div className="space-y-2">
          {['Yes', 'No'].map(option => (
            <label key={option} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.verified === option}
                onChange={() => onFiltersChange({
                  ...filters,
                  verified: filters.verified === option ? null : option,
                })}
                className="w-4 h-4 rounded border-gray-300 text-brand-navy focus:ring-brand-navy"
              />
              <span className="text-sm text-gray-700 group-hover:text-brand-navy">{option}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

function FilterSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[#E0E0E0] last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-bold text-brand-navy">{title}</span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {expanded && (
        <div className="px-5 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}

function FilterSubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <p className="text-sm font-semibold text-brand-navy mb-2.5">{title}</p>
      {children}
    </div>
  );
}
