'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import type { CampaignApplicationData } from '@/components/ui/CampaignApplicationCard';

export interface FilterValues {
  brands: string[];
  topics: string[];
  dateRange: string | null;
  budgetRange: string | null;
  statuses: string[];
}

export const EMPTY_FILTERS: FilterValues = {
  brands: [],
  topics: [],
  dateRange: null,
  budgetRange: null,
  statuses: [],
};

const DATE_OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '3m', label: 'Last 3 months' },
  { value: 'year', label: 'This year' },
];

const BUDGET_OPTIONS = [
  { value: 'under-1k', label: 'Under R1,000' },
  { value: '1k-5k', label: 'R1,000 - R5,000' },
  { value: '5k-10k', label: 'R5,000 - R10,000' },
  { value: '10k+', label: 'R10,000+' },
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Approved' },
  { value: 'declined', label: 'Rejected' },
  { value: 'expired', label: 'Withdrawn' },
];

/** Apply filter values to a list of applications.
 *  @param dateField — which date field to use for the Date filter (default: appliedAt).
 *  Pass 'campaignEndDate' for the Completed tab so the filter uses the campaign end date.
 */
export function applyFilters(
  applications: CampaignApplicationData[],
  filters: FilterValues,
  dateField: 'appliedAt' | 'campaignEndDate' = 'appliedAt',
): CampaignApplicationData[] {
  return applications.filter((app) => {
    // Brand
    if (filters.brands.length > 0 && !filters.brands.includes(app.brandName)) {
      return false;
    }

    // Topic
    if (filters.topics.length > 0) {
      const appTopics = [app.category, ...(app.categories || [])];
      if (!filters.topics.some((t) => appTopics.includes(t))) return false;
    }

    // Date — use the specified date field, fall back to appliedAt then startDate
    if (filters.dateRange) {
      const dateStr = (dateField === 'campaignEndDate' ? app.campaignEndDate : app.appliedAt) || app.appliedAt || app.startDate;
      const date = dateStr ? new Date(dateStr) : null;
      if (!date || isNaN(date.getTime())) return false;
      const now = new Date();
      let cutoff: Date;
      switch (filters.dateRange) {
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
      if (date < cutoff) return false;
    }

    // Budget / Value
    if (filters.budgetRange) {
      const amount = app.yourBid || app.budgetMax || 0;
      switch (filters.budgetRange) {
        case 'under-1k':
          if (amount >= 1000) return false;
          break;
        case '1k-5k':
          if (amount < 1000 || amount > 5000) return false;
          break;
        case '5k-10k':
          if (amount < 5000 || amount > 10000) return false;
          break;
        case '10k+':
          if (amount < 10000) return false;
          break;
      }
    }

    // Status
    if (filters.statuses.length > 0 && !filters.statuses.includes(app.status)) {
      return false;
    }

    return true;
  });
}

interface CampaignSearchFiltersProps {
  applications: CampaignApplicationData[];
  filterNames: string[];
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
}

export default function CampaignSearchFilters({
  applications,
  filterNames,
  filters,
  onFiltersChange,
}: CampaignSearchFiltersProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Extract unique brand names from data
  const uniqueBrands = useMemo(() => {
    const set = new Set<string>();
    applications.forEach((a) => {
      if (a.brandName) set.add(a.brandName);
    });
    return Array.from(set).sort();
  }, [applications]);

  // Extract unique topics/categories from data
  const uniqueTopics = useMemo(() => {
    const set = new Set<string>();
    applications.forEach((a) => {
      if (a.category) set.add(a.category);
      (a.categories || []).forEach((c) => set.add(c));
    });
    return Array.from(set).sort();
  }, [applications]);

  const toggleArrayFilter = (key: 'brands' | 'topics' | 'statuses', value: string) => {
    const current = filters[key];
    const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onFiltersChange({ ...filters, [key]: updated });
  };

  const activeFilterCount =
    filters.brands.length +
    filters.topics.length +
    (filters.dateRange ? 1 : 0) +
    (filters.budgetRange ? 1 : 0) +
    filters.statuses.length;

  const clearAll = () => onFiltersChange({ ...EMPTY_FILTERS });

  const getFilterCount = (name: string): number => {
    switch (name) {
      case 'Brand':
        return filters.brands.length;
      case 'Topic':
        return filters.topics.length;
      case 'Date':
        return filters.dateRange ? 1 : 0;
      case 'Value':
      case 'Budget':
        return filters.budgetRange ? 1 : 0;
      case 'Status':
        return filters.statuses.length;
      default:
        return 0;
    }
  };

  const renderDropdownContent = (name: string) => {
    switch (name) {
      case 'Brand':
        return uniqueBrands.length === 0 ? (
          <p className="px-3 py-2 text-sm text-gray-400">No brands available</p>
        ) : (
          uniqueBrands.map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={filters.brands.includes(brand)}
                onChange={() => toggleArrayFilter('brands', brand)}
                className="rounded border-gray-300 text-brand-navy focus:ring-brand-navy"
              />
              <span className="truncate">{brand}</span>
            </label>
          ))
        );

      case 'Topic':
        return uniqueTopics.length === 0 ? (
          <p className="px-3 py-2 text-sm text-gray-400">No topics available</p>
        ) : (
          uniqueTopics.map((topic) => (
            <label
              key={topic}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={filters.topics.includes(topic)}
                onChange={() => toggleArrayFilter('topics', topic)}
                className="rounded border-gray-300 text-brand-navy focus:ring-brand-navy"
              />
              <span className="truncate">{topic}</span>
            </label>
          ))
        );

      case 'Date':
        return DATE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              onFiltersChange({
                ...filters,
                dateRange: filters.dateRange === opt.value ? null : opt.value,
              });
            }}
            className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
              filters.dateRange === opt.value
                ? 'bg-brand-navy text-white font-medium'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            {opt.label}
          </button>
        ));

      case 'Value':
      case 'Budget':
        return BUDGET_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              onFiltersChange({
                ...filters,
                budgetRange: filters.budgetRange === opt.value ? null : opt.value,
              });
            }}
            className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
              filters.budgetRange === opt.value
                ? 'bg-brand-navy text-white font-medium'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            {opt.label}
          </button>
        ));

      case 'Status':
        return STATUS_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer text-sm"
          >
            <input
              type="checkbox"
              checked={filters.statuses.includes(opt.value)}
              onChange={() => toggleArrayFilter('statuses', opt.value)}
              className="rounded border-gray-300 text-brand-navy focus:ring-brand-navy"
            />
            <span>{opt.label}</span>
          </label>
        ));

      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap" ref={containerRef}>
      {filterNames.map((filter) => {
        const count = getFilterCount(filter);
        const isOpen = openDropdown === filter;
        return (
          <div key={filter} className="relative">
            <button
              onClick={() => setOpenDropdown(isOpen ? null : filter)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                count > 0 ? 'bg-brand-navy text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {filter}
              {count > 0 && (
                <span className="bg-white text-brand-navy text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {count}
                </span>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isOpen && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2 px-1 max-h-64 overflow-y-auto">
                {renderDropdownContent(filter)}
              </div>
            )}
          </div>
        );
      })}

      {activeFilterCount > 0 ? (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-auto"
        >
          <X className="w-3.5 h-3.5" />
          Clear filters
        </button>
      ) : (
        <button className="p-2 ml-auto text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
