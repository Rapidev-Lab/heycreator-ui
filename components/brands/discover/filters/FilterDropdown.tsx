'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterDropdownProps {
  filterName: string;
  defaultSelection: string;
  children: React.ReactNode;
}

export default function FilterDropdown({ filterName, defaultSelection, children }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSelection, setCurrentSelection] = useState(defaultSelection);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // This is a placeholder for more complex state logic
  const handleSelection = (selection: string) => {
    setCurrentSelection(selection);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-transparent text-gray-500 hover:text-gray-800 rounded-lg"
      >
        <span className="text-sm">{filterName}</span>
        <span className="text-sm font-semibold text-gray-800">{currentSelection}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-60 bg-white rounded-lg shadow-lg p-2">
          {/* We can pass the handleSelection to children if needed */}
          {children}
        </div>
      )}
    </div>
  );
}
