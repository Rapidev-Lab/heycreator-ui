'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Heart, ChevronDown } from 'lucide-react';

type SearchType = 'topic' | 'keyword';

interface SearchBarProps {
  onSearch: (params: {
    query: string;
    location: string;
    vetted: boolean;
  }) => void;
  isLoading?: boolean;
  initialQuery?: string;
  initialLocation?: string;
  initialVetted?: boolean;
  selectedTopics?: string[];
}

export default function SearchBar({
  onSearch,
  isLoading = false,
  initialQuery = '',
  initialLocation = '',
  initialVetted = false,
  selectedTopics = []
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [vetted, setVetted] = useState(initialVetted);
  const [showSearchTypeModal, setShowSearchTypeModal] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>('topic');
  const modalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Update query input when selectedTopics change
  useEffect(() => {
    if (selectedTopics.length > 0) {
      setQuery(selectedTopics.join(', '));
    }
  }, [selectedTopics]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ query, location, vetted });
  };

  const handleSearchTypeChange = (type: SearchType) => {
    setSearchType(type);
    setShowSearchTypeModal(false);
  };

  const getPlaceholder = () => {
    if (searchType === 'topic') {
      return 'e.g. Food, Lifestyle, #newborn';
    } else {
      return 'e.g. fitness coach, vegan recipes, travel blogger';
    }
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowSearchTypeModal(false);
      }
    };

    if (showSearchTypeModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchTypeModal]);

  return (
    <div className="w-full relative">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-2xl shadow-md border border-gray-200 overflow-visible">
          {/* Topic Input */}
          <div className="flex items-center gap-2 px-3 sm:px-4 py-3 flex-1 border-b sm:border-b-0 sm:border-r border-gray-200 relative min-w-0">
            <button
              ref={buttonRef}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowSearchTypeModal(!showSearchTypeModal);
              }}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
            >
              <span className="font-medium">{searchType === 'topic' ? 'Topic' : 'Keyword'}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={getPlaceholder()}
              className="flex-1 outline-none text-sm text-gray-900 placeholder:text-gray-400"
            />
          </div>

        {/* Location Input */}
        <div className="flex items-center px-3 sm:px-4 py-3 w-full sm:w-48 border-b sm:border-b-0 sm:border-r border-gray-200">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="w-full outline-none text-sm text-gray-900 placeholder:text-gray-400"
          />
        </div>

        {/* Bottom Row: Vetted Toggle + Search Button */}
        <div className="flex items-center">
          {/* Vetted Toggle */}
          <button
            type="button"
            onClick={() => setVetted(!vetted)}
            className={`
              flex items-center gap-2 px-3 sm:px-4 py-3 text-sm font-medium transition-colors border-r border-gray-200
              ${vetted ? 'text-pink-600' : 'text-gray-600 hover:text-gray-900'}
            `}
          >
            <Heart className={`w-4 h-4 ${vetted ? 'fill-pink-600' : ''}`} />
            <span className="hidden sm:inline">Vetted</span>
          </button>

          {/* Search Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 sm:px-8 py-3 bg-brand-navy hover:bg-brand-navy-light text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap rounded-r-2xl"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Searching...</span>
              </span>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </div>
    </form>

    {/* Search Type Modal - Positioned absolutely outside form */}
    {showSearchTypeModal && (
      <div
        ref={modalRef}
        className="absolute top-[calc(100%+0.5rem)] left-0 sm:left-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-[100] w-[calc(100%-2rem)] sm:w-80"
        style={{ maxWidth: '320px' }}
      >
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Search Influencers By:
        </h3>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleSearchTypeChange('topic')}
            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
              searchType === 'topic'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                searchType === 'topic' ? 'border-blue-500' : 'border-gray-300'
              }`}>
                {searchType === 'topic' && (
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                )}
              </div>
              <div>
                <div className="font-medium text-sm text-gray-900">Topic</div>
                <div className="text-xs text-gray-500">Search by category or hashtag</div>
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleSearchTypeChange('keyword')}
            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
              searchType === 'keyword'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                searchType === 'keyword' ? 'border-blue-500' : 'border-gray-300'
              }`}>
                {searchType === 'keyword' && (
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                )}
              </div>
              <div>
                <div className="font-medium text-sm text-gray-900">Keyword or Phrase</div>
                <div className="text-xs text-gray-500">Search by specific terms or description</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    )}
  </div>
  );
}
