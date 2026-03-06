'use client';

import { useState } from 'react';
import FilterDropdown from './FilterDropdown';

export default function SearchTypeFilter() {
  const [searchType, setSearchType] = useState('keywords');

  return (
    <FilterDropdown filterName="Search Type" defaultSelection="">
      <div className="space-y-3">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            name="searchType"
            value="keywords"
            checked={searchType === 'keywords'}
            onChange={() => setSearchType('keywords')}
            className="h-4 w-4 text-brand-navy focus:ring-brand-navy-light"
          />
          <span className="text-gray-700">Keywords / Phrases</span>
        </label>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            name="searchType"
            value="topics"
            checked={searchType === 'topics'}
            onChange={() => setSearchType('topics')}
            className="h-4 w-4 text-brand-navy focus:ring-brand-navy-light"
          />
          <span className="text-gray-700">Topics</span>
        </label>
      </div>
    </FilterDropdown>
  );
}
