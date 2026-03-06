'use client';

import React, { forwardRef, useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

const PasswordInputField = forwardRef<HTMLInputElement, PasswordInputFieldProps>(
  ({ label, error, required, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="w-full">
        
        {/* Label + Lock Icon on same row */}
        {label && (
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-black" />
            <label className="text-sm font-medium text-black">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
        )}

        <div className="relative">
          <input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            placeholder="Your password"
            className={`
              w-full px-5 py-3 rounded-3xl
              focus:outline-none focus:ring-2 focus:ring-[#00A8CC]
              transition-all duration-200 placeholder-[#929292]
              border-[1px] border-[#929292]
              ${error ? 'ring-red-500' : ''}
              ${className}
            `}
            {...props}
          />

          {/* Show/Hide Button */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-black"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <Eye className="w-5 h-5 text-brand-navy-dark" />
            ) : (
              <EyeOff className="w-5 h-5 text-brand-navy-dark" />
            )}
          </button>
        </div>

        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

PasswordInputField.displayName = 'PasswordInputField';

export default PasswordInputField;