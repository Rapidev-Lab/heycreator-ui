'use client';

import { useState } from 'react';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  DollarSign,
  Tag,
  Grid3x3,
  ArrowUpDown
} from 'lucide-react';

interface MarketplaceFiltersProps {
  filters: {
    search: string;
    category: string;
    budgetMin: number;
    budgetMax: number;
    platform: string;
    sortBy: 'latest' | 'budget' | 'deadline';
  };
  onFilterChange: (filters: any) => void;
  categories: string[];
  budgetRange: {
    min: number;
    max: number;
  };
}

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'Twitter'];
const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest Campaigns' },
  { value: 'budget', label: 'Highest Budget' },
  { value: 'deadline', label: 'Deadline Soon' },
];

export default function MarketplaceFilters({
  filters,
  onFilterChange,
  categories,
  budgetRange
}: MarketplaceFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = (key: string, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      category: '',
      budgetMin: budgetRange.min,
      budgetMax: budgetRange.max,
      platform: '',
      sortBy: 'latest',
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.category ||
    filters.platform ||
    filters.budgetMin !== budgetRange.min ||
    filters.budgetMax !== budgetRange.max;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Main Search Bar */}
      <div className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy text-sm"
            />
          </div>

          {/* Filter and Sort Container */}
          <div className="flex gap-3 flex-shrink-0">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 border rounded-lg flex items-center gap-2 text-sm font-medium transition-colors relative flex-shrink-0 ${
                showFilters || hasActiveFilters
                  ? 'bg-brand-navy text-white border-brand-navy'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && !showFilters && (
                <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-2 h-2"></span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative flex-1 sm:flex-initial min-w-0">
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="appearance-none w-full sm:w-auto pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy text-sm font-medium text-gray-700 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-4 space-y-4">
            {/* Category Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4" />
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy text-sm bg-white"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Platform Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Grid3x3 className="w-4 h-4" />
                Platform
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateFilter('platform', '')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filters.platform === ''
                      ? 'bg-brand-navy text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  All
                </button>
                {PLATFORMS.map(platform => (
                  <button
                    key={platform}
                    onClick={() => updateFilter('platform', platform)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filters.platform === platform
                        ? 'bg-brand-navy text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Range Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4" />
                Budget Range
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-gray-600 mb-1 block">Min</label>
                    <input
                      type="number"
                      value={filters.budgetMin}
                      onChange={(e) => updateFilter('budgetMin', Number(e.target.value))}
                      min={budgetRange.min}
                      max={filters.budgetMax}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy text-sm"
                      placeholder="Min budget"
                    />
                  </div>
                  <div className="text-gray-400 mt-5">-</div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-600 mb-1 block">Max</label>
                    <input
                      type="number"
                      value={filters.budgetMax}
                      onChange={(e) => updateFilter('budgetMax', Number(e.target.value))}
                      min={filters.budgetMin}
                      max={budgetRange.max}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy text-sm"
                      placeholder="Max budget"
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-600 text-center">
                  R{filters.budgetMin.toLocaleString('en-ZA')} - R{filters.budgetMax.toLocaleString('en-ZA')}
                </div>
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="pt-2">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
