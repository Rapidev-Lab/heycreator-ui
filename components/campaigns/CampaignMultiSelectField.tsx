"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface CampaignMultiSelectFieldProps {
  label?: string;
  selectedValues: string[];
  onToggle: (value: string) => void;
  options: Option[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

const CampaignMultiSelectField: React.FC<CampaignMultiSelectFieldProps> = ({
  label,
  selectedValues,
  onToggle,
  options,
  placeholder = "Select categories",
  error,
  required = false,
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className={`w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-4 py-3 border rounded-lg text-left bg-white
            flex items-center justify-between transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-brand-navy-dark
            ${error ? "border-red-500" : "border-gray-300 hover:border-gray-400"}
            ${disabled ? "bg-gray-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <span className="text-gray-400">{placeholder}</span>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="max-h-60 overflow-y-auto py-1">
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onToggle(option.value)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-sm text-gray-900"
                  >
                    <div
                      className={`
                      w-5 h-5 rounded border flex items-center justify-center transition-colors
                      ${isSelected ? "bg-brand-navy-dark border-brand-navy-dark" : "border-gray-300"}
                    `}
                    >
                      {isSelected && (
                        <Check
                          className="w-3.5 h-3.5 text-white"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default CampaignMultiSelectField;
