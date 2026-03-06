"use client";

import React from "react";

interface CampaignInputFieldProps {
  label?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  error?: string;
  type?: string;
  isTextArea?: boolean;
  rows?: number;
  className?: string;
  required?: boolean;
}

const CampaignInputField: React.FC<CampaignInputFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
  isTextArea = false,
  rows = 4,
  className = "",
  required = false,
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {label}
        </label>
      )}

      {isTextArea ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy-dark focus:border-transparent transition-colors resize-none ${
            error
              ? "border-red-500 ring-1 ring-red-500"
              : "border-gray-300"
          }`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy-dark focus:border-transparent transition-colors ${
            error
              ? "border-red-500 ring-1 ring-red-500"
              : "border-gray-300"
          }`}
        />
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default CampaignInputField;