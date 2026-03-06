// @/components/influencers/SortDropdown.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
import { SortOption } from '@/types/influencer';

interface SortDropdownProps {
    currentSortBy: SortOption;
    currentSortDirection: 'asc' | 'desc';
    onSortChange: (sortBy: SortOption, sortDirection: 'asc' | 'desc') => void;
}

const sortOptions: { label: string; value: SortOption }[] = [
    { label: 'Date Viewed', value: 'dateViewed' },
    { label: 'Date Tagged', value: 'dateTagged' },
    { label: 'Name', value: 'name' },
    { label: 'Influence', value: 'influenceScore' },
];

const SortDropdown = ({ currentSortBy, currentSortDirection, onSortChange }: SortDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleToggle = () => {
        setIsOpen(prev => !prev);
    };

    const handleOptionClick = (option: SortOption) => {
        if (option === currentSortBy) {
            onSortChange(option, currentSortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            onSortChange(option, 'desc'); // Default to descending for new sort column
        }
        setIsOpen(false);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const selectedOptionLabel = sortOptions.find(opt => opt.value === currentSortBy)?.label || 'Sort By';

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                className="flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50  transition-colors"
                style={{ height: '40px', minWidth: '150px' }} // Adjusted for UI spec
                onClick={handleToggle}
            >
                <span>{selectedOptionLabel}</span>
                <ChevronDown className={`ml-2 h-4 w-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="sort-menu">
                        {sortOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleOptionClick(option.value)}
                                className={`
                                    flex items-center w-full text-left px-4 py-2 text-sm transition-colors
                                    ${currentSortBy === option.value
                                        ? 'bg-primary/10 text-brand-navy font-medium'
                                        : 'text-gray-700 hover:bg-primary/5 hover:text-brand-navy'
                                    }
                                `}
                                role="menuitem"
                            >
                                {option.label}
                                {currentSortBy === option.value && (
                                    currentSortDirection === 'asc'
                                        ? <ArrowUp className="ml-auto h-4 w-4" />
                                        : <ArrowDown className="ml-auto h-4 w-4" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SortDropdown;
