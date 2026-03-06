"use client";

import React, {
  forwardRef,
  useState,
  useEffect,
} from "react";
import { Phone, ChevronDown } from "lucide-react";
import { countries } from "@/data/countries";

interface PhoneNumberInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
  countryCode?: string;
  onCountryCodeChange?: (code: string) => void;
}

const DEFAULT_COUNTRY_CODE = "+27"; // South Africa

const PhoneNumberInput = forwardRef<
  HTMLInputElement,
  PhoneNumberInputProps
>(
  (
    {
      label,
      error,
      required,
      countryCode = DEFAULT_COUNTRY_CODE,
      onCountryCodeChange,
      className = "",
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [isDropdownOpen, setIsDropdownOpen] =
      useState(false);

    const selectedCountry =
      countries.find(
        (c) => c.dialCode === countryCode
      ) ||
      countries.find((c) => c.code === "ZA");

    /**
     * Inject dial code into input value
     */
    const updateValueWithDialCode = (
      dialCode: string
    ) => {
      const currentValue =
        (value as string) || "";

      // Strip existing dial code
      const stripped = currentValue.replace(
        /^\+\d+\s*/,
        ""
      );

      const newValue = `${dialCode} ${stripped}`.trim();

      onChange?.({
        target: { value: newValue },
      } as React.ChangeEvent<HTMLInputElement>);
    };

    /**
     * Ensure default country code (+27) is shown on mount
     */
    useEffect(() => {
      if (
        !value &&
        selectedCountry?.dialCode
      ) {
        updateValueWithDialCode(
          selectedCountry.dialCode
        );
        onCountryCodeChange?.(
          selectedCountry.dialCode
        );
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Prevent deleting or editing dial code
     */
    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const inputValue = e.target.value;

      if (!inputValue.startsWith(countryCode)) {
        return;
      }

      onChange?.(e);
    };

    return (
      <div className="w-full mb-1">
        {label && (
          <label className="flex gap-1 items-center text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4" />
            {label}
            {required && (
              <span className="text-red-500 ml-1">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {/* Country selector */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <button
              type="button"
              onClick={() =>
                setIsDropdownOpen(
                  (prev) => !prev
                )
              }
              className="flex items-center gap-1 bg-[#EDF7FD] px-2.5 py-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <span className="text-xl leading-none rounded-full">
                {selectedCountry?.emoji}
              </span>
              <ChevronDown className="w-4 h-4 text-[#929292]" />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto w-[calc(100vw-3rem)] max-w-xs">
                {countries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => {
                      updateValueWithDialCode(
                        country.dialCode
                      );
                      onCountryCodeChange?.(
                        country.dialCode
                      );
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <span className="text-2xl">
                      {country.emoji}
                    </span>
                    <span className="flex-1 text-sm text-gray-800 truncate">
                      {country.name}
                    </span>
                    <span className="font-medium text-gray-600 text-sm">
                      {country.dialCode}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Phone input */}
          <input
            ref={ref}
            type="tel"
            value={value}
            onChange={handleInputChange}
            className={`
              w-full px-4 py-3 pl-20 rounded-3xl border border-gray-300
              focus:outline-none focus:ring-2 focus:ring-[#00A8CC] focus:border-transparent
              transition-all duration-200
              ${error ? "border-red-500" : ""}
              ${className}
            `}
            {...props}
          />
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

PhoneNumberInput.displayName =
  "PhoneNumberInput";

export default PhoneNumberInput;