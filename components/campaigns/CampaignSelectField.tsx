"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface CampaignSelectFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

const CampaignSelectField: React.FC<CampaignSelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  error,
  required = false,
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel =
    options.find((opt) => opt.value === value)?.label || "";

  return (
    <div className={`w-full ${className}`} ref={containerRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Trigger Button - Styled to match CampaignInputField */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-4 py-3 border rounded-lg text-left bg-white
            flex items-center justify-between transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-brand-navy-dark focus:border-transparent
            ${
              error
                ? "border-red-500 ring-1 ring-red-500"
                : "border-gray-300 hover:border-gray-400"
            }
            ${disabled ? "bg-gray-50 cursor-not-allowed text-gray-400" : "cursor-pointer"}
          `}
        >
          <span className={!selectedLabel ? "text-gray-400" : "text-gray-900"}>
            {selectedLabel || placeholder}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-3 text-left transition-colors text-sm
                  ${
                    value === option.value
                      ? "bg-brand-navy-dark text-white"
                      : "text-gray-900 hover:bg-gray-50"
                  }
                `}
              >
                {option.label}
              </button>
            ))}
            {options.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-500">No options available</div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default CampaignSelectField;