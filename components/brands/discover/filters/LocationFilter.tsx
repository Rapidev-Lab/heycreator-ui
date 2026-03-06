'use client';

import { useState } from 'react';
import FilterDropdown from './FilterDropdown';
import { Search } from 'lucide-react';

export default function LocationFilter() {
  const [location, setLocation] = useState('');

  return (
    <FilterDropdown filterName="Location" defaultSelection="">
      <div className="space-y-3">
        <p className="text-sm text-gray-600">Enter a city, state, or country.</p>
        <div className="relative">
          <input
            type="text"
            placeholder="e.g. California"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>
    </FilterDropdown>
  );
}
