'use client';

import { useState } from 'react';
import FilterDropdown from './filters/FilterDropdown';
import { SlidersHorizontal } from 'lucide-react';

const influenceOptions = ['Any', 'Mega', 'Macro', 'Micro', 'Nano'];
const genderOptions = ['Any', 'Women', 'Men'];
const locationOfOptions = ['Audience', 'Influencer'];
const mentionedInOptions = ['Last 6 Months', 'Last 2 years', 'Last Year', 'Last 3 Months', 'Last 30 Days', 'Last 7 Days'];
const mentionedCountOptions = ['At least once', 'At least 5 Times', 'At least 10 Times'];

// A simple component for dropdown items
const DropdownItem = ({ label }: { label: string }) => (
  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
    {label}
  </a>
);

interface SecondaryFilterBarProps {
  showToggle?: boolean; // Whether to show the toggle button (default: true on discovery page, false on results page)
}

export default function SecondaryFilterBar({ showToggle = true }: SecondaryFilterBarProps) {
  const [filtersVisible, setFiltersVisible] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
      {/* Filters container - hidden by default on all screen sizes */}
      <div className={`flex items-center gap-4 flex-wrap transition-opacity duration-300 w-full ${filtersVisible ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
        <FilterDropdown filterName="Influence" defaultSelection="Any">
          {influenceOptions.map(opt => <DropdownItem key={opt} label={opt} />)}
        </FilterDropdown>

        <FilterDropdown filterName="Gender" defaultSelection="Any">
          {genderOptions.map(opt => <DropdownItem key={opt} label={opt} />)}
        </FilterDropdown>

        <FilterDropdown filterName="Location of" defaultSelection="Audience">
          {locationOfOptions.map(opt => <DropdownItem key={opt} label={opt} />)}
        </FilterDropdown>

        <FilterDropdown filterName="Mentioned in" defaultSelection="Last 6 Months">
          {mentionedInOptions.map(opt => <DropdownItem key={opt} label={opt} />)}
        </FilterDropdown>
        
        <FilterDropdown filterName="Mentioned" defaultSelection="At least once">
          {mentionedCountOptions.map(opt => <DropdownItem key={opt} label={opt} />)}
        </FilterDropdown>
      </div>

      {/* Toggle button - visible on discovery page, hidden on results page */}
      {showToggle && (
        <button
          onClick={() => setFiltersVisible(!filtersVisible)}
          className={`p-2 rounded-lg transition-colors sm:self-center ${
            filtersVisible
              ? "text-brand-navy bg-blue-50"
              : "text-gray-500 hover:text-brand-navy hover:bg-gray-50"
          }`}
          title={filtersVisible ? "Hide filters" : "Show filters"}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
