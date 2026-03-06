'use client';

import { useState, useMemo } from 'react';
import { FolderPlus, Search, ChevronDown, Grid3x3, List } from 'lucide-react';
import ListCard from './ListCard';
import type { CreatorListResponse } from '@/types/creator-list';

type ViewMode = 'grid' | 'list';
type SortOption = 'relevance' | 'name' | 'count' | 'newest';

interface MyListsTabProps {
  lists: CreatorListResponse[];
  isLoading: boolean;
  onCreateList: () => void;
  onSelectList: (listId: string) => void;
  onEditList: (list: CreatorListResponse) => void;
  onDeleteList: (listId: string) => void;
  onAddCreatorsToList?: (listId: string) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest First' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'count', label: 'Most Creators' },
];

export default function MyListsTab({
  lists,
  isLoading,
  onCreateList,
  onSelectList,
  onEditList,
  onDeleteList,
  onAddCreatorsToList,
}: MyListsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Client-side filtering + sorting
  const filteredLists = useMemo(() => {
    let result = [...lists];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          (l.description || '').toLowerCase().includes(q) ||
          (l.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'count':
          return b.creatorCount - a.creatorCount;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'relevance':
        default:
          return 0;
      }
    });

    return result;
  }, [lists, searchQuery, sortBy]);

  const currentSortLabel = sortOptions.find((o) => o.value === sortBy)?.label || 'Relevance';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border-2 border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
              <div className="border-t border-gray-200 my-4" />
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-gray-100 rounded-full w-16" />
                <div className="h-6 bg-gray-100 rounded-full w-20" />
              </div>
              <div className="flex gap-2">
                <div className="h-10 bg-gray-200 rounded flex-1" />
                <div className="h-10 bg-gray-200 rounded flex-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white px-4 sm:px-6 py-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Food, Lifestyle, #newborn"
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
      </div>

      {/* Results Header: Count + Sort + View Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">
          {filteredLists.length} List{filteredLists.length !== 1 ? 's' : ''}
        </h3>

        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:border-gray-400 transition-all"
            >
              <span>{currentSortLabel}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-2 px-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => { setSortBy(option.value); setIsSortOpen(false); }}
                      className={`w-full text-left px-3 py-2.5 text-sm rounded-md transition-colors ${
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
                viewMode === 'grid'
                  ? 'bg-brand-navy text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-all ${
                viewMode === 'list'
                  ? 'bg-brand-navy text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* List Cards Grid/List */}
      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'flex flex-col gap-4'
      }>
        {filteredLists.map((list) => (
          <ListCard
            key={list.id}
            list={list}
            onView={() => onSelectList(list.id)}
            onEdit={() => onEditList(list)}
            onAddCreators={() => onAddCreatorsToList?.(list.id)}
            onDelete={() => onDeleteList(list.id)}
          />
        ))}

        {/* Create New List CTA */}
        <button
          onClick={onCreateList}
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-6 text-gray-400 hover:border-brand-navy hover:text-brand-navy transition-colors min-h-[200px]"
        >
          <FolderPlus className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">Create New List</span>
        </button>
      </div>

      {/* Empty state */}
      {filteredLists.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500 font-medium">
            {searchQuery ? 'No lists match your search.' : 'No lists created yet.'}
          </p>
        </div>
      )}
    </div>
  );
}
