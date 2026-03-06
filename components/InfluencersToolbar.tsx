'use client';

import React from 'react';
import { ViewMode, SortOption } from '@/types/influencer';
import { Grid3x3, List, ChevronDown, Search, MessageSquare, CheckSquare } from 'lucide-react'; // Import CheckSquare for bulk select icon
import SortDropdown from '@/components/influencers/SortDropdown'; // Import the new SortDropdown
import ActionsDropdown from '@/components/influencers/ActionsDropdown'; // Import the new ActionsDropdown

interface InfluencersToolbarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (direction: 'asc' | 'desc') => void;
  totalCount: number;
  bulkSelectMode: boolean;
  setBulkSelectMode: (mode: boolean) => void;
  selectedCount: number; // Add selectedCount to props
  onBulkAction: (action: string) => void; // Add onBulkAction to props
  onOpenFilters?: () => void; // Add callback for opening filters modal
  onSearch?: (query: string) => void; // Add callback for search
}

export default function InfluencersToolbar({
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
  totalCount,
  bulkSelectMode,
  setBulkSelectMode,
  selectedCount, // Destructure selectedCount
  onBulkAction, // Destructure onBulkAction
  onOpenFilters, // Destructure onOpenFilters
  onSearch, // Destructure onSearch
}: InfluencersToolbarProps) {
    const [showSearchInput, setShowSearchInput] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    const handleSortChange = (newSortBy: SortOption, newSortDirection: 'asc' | 'desc') => {
        setSortBy(newSortBy);
        setSortDirection(newSortDirection);
    };

    const handleActions = (action: string) => {
        console.log("Performing action:", action);
        onBulkAction(action);
    };

    const handleSearchClick = () => {
        setShowSearchInput(true);
        setTimeout(() => searchInputRef.current?.focus(), 0);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim() && onSearch) {
            onSearch(searchQuery.trim());
        }
    };

    const handleSearchClose = React.useCallback(() => {
        setShowSearchInput(false);
        setSearchQuery('');
        if (onSearch) {
            onSearch(''); // Clear search
        }
    }, [onSearch]);

    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
                handleSearchClose();
            }
        };

        if (showSearchInput) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSearchInput, handleSearchClose]);

  return (
    <div className="flex items-center justify-between py-2 sm:py-4">
      {/* Left side - Add Filter - visible on all devices */}
      <button
        onClick={onOpenFilters}
        className="flex items-center gap-2 px-3 sm:px-4 py-[0.3rem] text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-300 transition-colors shadow-sm mr-2"
      >
        <span className="text-xl">+</span>
        <span>Add Filter</span>
      </button>

      {/* Right side - View controls and sort */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Actions Dropdown */}
        <ActionsDropdown selectedCount={selectedCount} onAction={handleActions} />

        {/* Sort */}
        <div className="hidden sm:flex items-center space-x-2">
            <span className="hidden lg:inline text-sm text-gray-600">Sort By</span>
            <SortDropdown
                currentSortBy={sortBy}
                currentSortDirection={sortDirection}
                onSortChange={handleSortChange}
            />
        </div>

        {/* Search - hidden on mobile */}
        {!showSearchInput ? (
          <button
            onClick={handleSearchClick}
            className="hidden sm:block p-2 hover:bg-gray-50 rounded-lg transition-colors"
            title="Search cached influencers"
          >
            <Search className="w-5 h-5 text-gray-600" />
          </button>
        ) : (
          <form onSubmit={handleSearchSubmit} className="hidden sm:block relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name..."
              className="w-48 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleSearchClose}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </form>
        )}

        {/* View mode toggle - always visible */}
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setBulkSelectMode(!bulkSelectMode)}
            className={`p-1.5 sm:p-2 ${
              bulkSelectMode
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50'
            } transition-colors`}
            title="Toggle Bulk Select"
          >
            <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => { setViewMode('grid'); setBulkSelectMode(false); }}
            className={`p-1.5 sm:p-2 ${
              viewMode === 'grid' && !bulkSelectMode
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50'
            } transition-colors`}
            title="Grid View"
          >
            <Grid3x3 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => { setViewMode('list'); setBulkSelectMode(false); }}
            className={`p-1.5 sm:p-2 ${
              viewMode === 'list' && !bulkSelectMode
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50'
            } transition-colors`}
            title="List View"
          >
            <List className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
