'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Search } from 'lucide-react';
import {
  FilterSection,
  ExpandedSections,
  ActiveFilters,
  FilterData,
} from '@/types/filters';

interface FilterSidebarProps {
  filterData: FilterData;
  activeFilters: ActiveFilters;
  expandedSections: ExpandedSections;
  onFilterChange: (filters: ActiveFilters) => void;
  onToggleSection: (section: FilterSection) => void;
  onAddFilter: () => void;
}

export default function FilterSidebar({
  filterData,
  activeFilters,
  expandedSections,
  onFilterChange,
  onToggleSection,
  onAddFilter,
}: FilterSidebarProps) {
  const [campaignSearchQuery, setCampaignSearchQuery] = useState('');

  // Filter campaigns based on search
  const filteredCampaigns = filterData.campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(campaignSearchQuery.toLowerCase())
  );

  // Toggle tag filter
  const toggleTag = (tagId: string) => {
    const newTags = activeFilters.tags.includes(tagId)
      ? activeFilters.tags.filter((id) => id !== tagId)
      : [...activeFilters.tags, tagId];

    onFilterChange({ ...activeFilters, tags: newTags });
  };

  // Toggle campaign filter
  const toggleCampaign = (campaignId: string) => {
    const newCampaigns = activeFilters.campaigns.includes(campaignId)
      ? activeFilters.campaigns.filter((id) => id !== campaignId)
      : [...activeFilters.campaigns, campaignId];

    onFilterChange({ ...activeFilters, campaigns: newCampaigns });
  };

  // Toggle activity filter
  const toggleActivity = (activityType: string) => {
    const newActivity = activeFilters.activity.includes(activityType as any)
      ? activeFilters.activity.filter((type) => type !== activityType)
      : [...activeFilters.activity, activityType as any];

    onFilterChange({ ...activeFilters, activity: newActivity });
  };

  return (
    <div className="w-[280px] flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
      {/* Add Filter Button */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onAddFilter}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Filter</span>
        </button>
      </div>

      {/* Filter Sections */}
      <div className="divide-y divide-gray-100">
        {/* Tags Filter */}
        <FilterSectionContainer
          title="Tags"
          isExpanded={expandedSections.tags}
          onToggle={() => onToggleSection('tags')}
          count={activeFilters.tags.length}
        >
          <div className="space-y-2 px-4 py-3">
            {filterData.tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  activeFilters.tags.includes(tag.id)
                    ? 'bg-blue-50 border-l-2 border-primary'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-sm text-gray-700">{tag.name}</span>
                </div>
                {tag.count !== undefined && (
                  <span className="text-sm text-gray-500">({tag.count})</span>
                )}
              </button>
            ))}
            {filterData.tags.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No tags yet
              </p>
            )}
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:text-primary-dark transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              <span>Manage Tags</span>
            </button>
          </div>
        </FilterSectionContainer>

        {/* Active Campaigns Filter */}
        <FilterSectionContainer
          title="Active Campaigns"
          isExpanded={expandedSections.campaigns}
          onToggle={() => onToggleSection('campaigns')}
          count={activeFilters.campaigns.length}
        >
          <div className="px-4 py-3 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search Campaign"
                value={campaignSearchQuery}
                onChange={(e) => setCampaignSearchQuery(e.target.value)}
                className="w-full px-3 py-2 pr-8 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Search className="absolute right-2 top-2.5 w-4 h-4 text-gray-400" />
            </div>

            {/* Campaign List */}
            <div className="max-h-[300px] overflow-y-auto space-y-1">
              {filteredCampaigns.map((campaign) => (
                <button
                  key={campaign.id}
                  onClick={() => toggleCampaign(campaign.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                    activeFilters.campaigns.includes(campaign.id)
                      ? 'bg-blue-50 font-medium'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm text-gray-700 truncate">
                    {campaign.name}
                  </span>
                  {campaign.influencerCount !== undefined && campaign.influencerCount > 0 && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({campaign.influencerCount})
                    </span>
                  )}
                </button>
              ))}
              {filteredCampaigns.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  {campaignSearchQuery
                    ? 'No campaigns found'
                    : 'No campaigns yet'}
                </p>
              )}
            </div>
          </div>
        </FilterSectionContainer>

        {/* Custom Variables Filter */}
        <FilterSectionContainer
          title="Custom Variables"
          isExpanded={expandedSections.customVariables}
          onToggle={() => onToggleSection('customVariables')}
          count={activeFilters.customVariables.length}
        >
          <div className="px-4 py-3 space-y-2">
            {filterData.customVariableGroups.map((group) => (
              <div key={group.key} className="space-y-1">
                <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <span className="text-sm text-gray-700 truncate">
                    {group.key.length > 40
                      ? `${group.key.substring(0, 40)}...`
                      : group.key}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">({group.count})</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              </div>
            ))}
            {filterData.customVariableGroups.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No custom variables
              </p>
            )}
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:text-primary-dark transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              <span>Manage Custom Variables</span>
            </button>
          </div>
        </FilterSectionContainer>

        {/* Activity Filter */}
        <FilterSectionContainer
          title="Activity"
          isExpanded={expandedSections.activity}
          onToggle={() => onToggleSection('activity')}
          count={activeFilters.activity.length}
        >
          <div className="px-4 py-3 space-y-1">
            {filterData.activityOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => toggleActivity(option.type)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  activeFilters.activity.includes(option.type)
                    ? 'bg-blue-50 font-medium'
                    : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-sm text-gray-700">{option.label}</span>
                <span className="text-sm text-gray-500">({option.count})</span>
              </button>
            ))}
          </div>
        </FilterSectionContainer>

        {/* Saved Filters */}
        <FilterSectionContainer
          title="Saved Filters"
          isExpanded={expandedSections.savedFilters}
          onToggle={() => onToggleSection('savedFilters')}
        >
          <div className="px-4 py-3 space-y-2">
            {filterData.savedFilters.length > 0 && (
              <div className="space-y-2">
                {filterData.savedFilters.map((filter) => (
                  <button
                    key={filter.id}
                    className="w-full px-3 py-2 text-left rounded-lg border border-gray-200 hover:border-primary hover:shadow-sm transition-all"
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {filter.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Last used: {new Date(filter.lastUsed).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {filterData.savedFilters.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No saved filters
              </p>
            )}
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:text-primary-dark transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              <span>Manage Saved Filters</span>
            </button>
          </div>
        </FilterSectionContainer>
      </div>
    </div>
  );
}

// Reusable Filter Section Container
interface FilterSectionContainerProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  count?: number;
  children: React.ReactNode;
}

function FilterSectionContainer({
  title,
  isExpanded,
  onToggle,
  count,
  children,
}: FilterSectionContainerProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
              {count}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {isExpanded && <div className="bg-gray-50/50">{children}</div>}
    </div>
  );
}
