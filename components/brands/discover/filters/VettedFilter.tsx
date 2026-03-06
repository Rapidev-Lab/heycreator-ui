'use client';

import { useState } from 'react';
import FilterDropdown from './FilterDropdown';

export default function VettedFilter() {
  const [isVetted, setIsVetted] = useState(false);

  return (
    <FilterDropdown filterName="Vetted" defaultSelection="">
      <div className="flex items-center justify-between">
        <span className="text-gray-700 font-medium">Only show vetted creators</span>
        <button
          onClick={() => setIsVetted(!isVetted)}
          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors
            ${isVetted ? 'bg-brand-navy' : 'bg-gray-300'}`}
        >
          <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform
              ${isVetted ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Vetted creators are influencers verified by the HeyCreator team.
      </p>
    </FilterDropdown>
  );
}
