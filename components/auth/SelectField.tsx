import React from 'react';
import { LucideIcon, ChevronDown } from 'lucide-react';

interface SelectFieldProps {
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

export default function SelectField({
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
}: SelectFieldProps) {
  return (
    <div className={className}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Sub-label */}
      {subLabel && (
        <p className="text-xs text-gray-500 mb-2">{subLabel}</p>
      )}

      {/* Select container */}
      <div className="relative">
        {/* Icon */}
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}

        {/* Select element */}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full px-4 py-3 rounded-full border appearance-none cursor-pointer
            ${Icon ? 'pl-12' : 'pl-4'} pr-12
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#00A8CC]'}
            focus:outline-none focus:ring-2 focus:border-transparent
            text-gray-900 bg-white
            transition-all duration-200
            ${!value ? 'text-gray-400' : 'text-gray-900'}
          `}
          required={required}
        >
          {/* Placeholder option */}
          <option value="" disabled>
            {placeholder}
          </option>

          {/* Options */}
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-gray-900">
              {option.label}
            </option>
          ))}
        </select>

        {/* Chevron icon */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
