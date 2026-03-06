'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Grid3x3, List, Star, Download, Share2, Bookmark, Users, Database, Zap, GitMerge } from 'lucide-react';

type ViewMode = 'grid' | 'list';
type SortOption = 'relevance' | 'best-match' | 'followers' | 'engagement' | 'cost' | 'name';
type SearchSource = 'database' | 'live' | 'hybrid';

interface ResultsHeaderProps {
  title?: string;
  count: number;
  sortInfo?: string;
  relatedTopics?: string[];
  onTopicClick?: (topic: string) => void;
  selectedCount?: number;
  onSelectAll?: (selected: boolean) => void;
  allSelected?: boolean;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  sortBy?: SortOption;
  onSortChange?: (sort: SortOption) => void;
  searchSource?: SearchSource;
}

export default function ResultsHeader({
  title,
  count,
  sortInfo,
  relatedTopics = [],
  onTopicClick,
  selectedCount = 0,
  onSelectAll,
  allSelected = false,
  viewMode = 'grid',
  onViewModeChange,
  sortBy = 'relevance',
  onSortChange,
  searchSource
}: ResultsHeaderProps) {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsActionsOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };

    if (isActionsOpen || isSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActionsOpen, isSortOpen]);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'followers', label: 'Followers (High to Low)' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'engagement', label: 'Engagement Rate' },
    { value: 'relevance', label: 'Relevance' },
    { value: 'cost', label: 'Cost (Low to High)' },
    { value: 'best-match', label: 'Last Active' },
  ];

  // Get current sort label
  const currentSortLabel = sortOptions.find(opt => opt.value === sortBy)?.label || 'Relevance';

  // Get search source badge configuration
  const getSourceBadge = () => {
    if (!searchSource) return null;

    const configs = {
      database: {
        icon: Database,
        label: 'Database',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        iconColor: 'text-blue-500',
        description: 'Results from saved influencers'
      },
      live: {
        icon: Zap,
        label: 'Live Search',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        iconColor: 'text-green-500',
        description: 'Fresh results from social platforms'
      },
      hybrid: {
        icon: GitMerge,
        label: 'Hybrid',
        bgColor: 'bg-brand-navy-50',
        textColor: 'text-brand-navy',
        iconColor: 'text-brand-navy',
        description: 'Combined database + live results'
      }
    };

    return configs[searchSource];
  };

  const sourceBadge = getSourceBadge();

  return (
    <div className="space-y-6">
      {/* Header with Count, Sort, and View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Creators Found Count with Source Badge */}
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            {count.toLocaleString()} Creators Found
          </h2>

          {/* Search Source Badge */}
          {sourceBadge && (
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sourceBadge.bgColor} ${sourceBadge.textColor}`}
              title={sourceBadge.description}
            >
              <sourceBadge.icon className={`w-3.5 h-3.5 ${sourceBadge.iconColor}`} />
              <span>{sourceBadge.label}</span>
            </div>
          )}
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent transition-all"
            >
              <span>{currentSortLabel}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2 px-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortChange?.(option.value);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 text-sm transition-colors rounded-md ${
                      sortBy === option.value
                        ? 'bg-brand-navy text-white font-semibold'
                        : 'text-gray-700 hover:bg-gray-50 font-normal'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grid/List View Toggle */}
          <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1 bg-white">
            <button
              onClick={() => onViewModeChange?.('grid')}
              className={`p-2 rounded transition-all ${
                viewMode === 'grid'
                  ? 'bg-brand-navy text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Grid view"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange?.('list')}
              className={`p-2 rounded transition-all ${
                viewMode === 'list'
                  ? 'bg-brand-navy text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
