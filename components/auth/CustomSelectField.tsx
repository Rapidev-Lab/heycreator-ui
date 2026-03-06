'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LucideIcon, ChevronDown } from 'lucide-react';

interface CustomSelectFieldProps {
  label: string;
  icon?: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  subLabel?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export default function CustomSelectField({
  label,
  icon: Icon,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  subLabel,
  error,
  required = false,
  className = ''
}: CustomSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  return (
    <div className={className} ref={containerRef}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Sub-label */}
      {subLabel && (
        <p className="text-xs text-gray-500 mb-2">{subLabel}</p>
      )}

      {/* Custom Select Button */}
      <div className="relative">
        {/* Icon */}
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}

        {/* Select Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full px-4 py-3 rounded-full border appearance-none cursor-pointer
            ${Icon ? 'pl-12' : 'pl-4'} pr-12
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#00A8CC]'}
            focus:outline-none focus:ring-2 focus:border-transparent
            text-gray-900 bg-white
            transition-all duration-200
            flex items-center justify-between
            ${!value ? 'text-gray-400' : 'text-gray-900'}
            text-left
          `}
        >
          <span>{selectedLabel}</span>
        </button>

        {/* Chevron icon */}
        <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-3xl shadow-lg z-50 overflow-hidden">
            <div className="max-h-60 overflow-y-auto">
              {options.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors
                    ${value === option.value ? 'bg-blue-50 text-primary font-medium' : 'text-gray-900'}
                    ${index !== options.length - 1 ? 'border-b border-gray-100' : ''}
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
