'use client';

import React, { useState, useRef } from 'react';
import { Globe, Sparkles, Loader2, ChevronDown } from 'lucide-react';
import { detectIndustry } from '@/lib/mock/ai-suggestions';
import { IndustryType } from '@/types/firebase';
import {
  StepProps,
  INDUSTRY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  CURRENCY_OPTIONS,
} from './types';

export default function StepBrandDetails({
  formData,
  setFormData,
  errors,
  setErrors,
}: StepProps) {
  const [isDetectingIndustry, setIsDetectingIndustry] = useState(false);
  const [aiDetectedIndustry, setAiDetectedIndustry] =
    useState<IndustryType | null>(null);
  const [isIndustryOpen, setIsIndustryOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const industryRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);

  // Trigger AI industry detection on website blur
  const handleWebsiteBlur = async () => {
    const url = formData.website.trim();
    if (!url) return;

    setIsDetectingIndustry(true);
    try {
      const result = await detectIndustry(url);
      if (result && result.confidence > 0.4) {
        setAiDetectedIndustry(result.industry);
        setFormData((prev) => ({ ...prev, industry: result.industry }));
        if (errors.industry) setErrors((prev) => ({ ...prev, industry: '' }));
      }
    } catch {
      // Silently ignore detection errors — user can select manually
    } finally {
      setIsDetectingIndustry(false);
    }
  };

  const handleWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, website: value }));
    // Clear AI badge if user modifies the URL after detection
    setAiDetectedIndustry(null);
    if (errors.website) setErrors((prev) => ({ ...prev, website: '' }));
  };

  const handleIndustrySelect = (value: IndustryType) => {
    setFormData((prev) => ({ ...prev, industry: value }));
    setAiDetectedIndustry(null);
    setIsIndustryOpen(false);
    if (errors.industry) setErrors((prev) => ({ ...prev, industry: '' }));
  };

  const selectedIndustryLabel =
    INDUSTRY_OPTIONS.find((o) => o.value === formData.industry)?.label ?? '';

  const selectedCurrencyOption = CURRENCY_OPTIONS.find(
    (o) => o.value === formData.currency
  );

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-b border-gray-200 mx-[-1.5rem] md:mx-[-2rem] lg:mx-[-2.5rem] lg:mt-[-2.5rem] px-6 md:px-8 lg:px-10 py-4 md:py-5 lg:py-6">
        <h2 className="text-xl font-bold text-[#001F54]">Brand Details</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Tell us about your brand so we can personalise your workspace.
        </p>
      </div>

      <div className="space-y-6">
        {/* Brand Name */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[#001F54]">
            Brand Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.brandName}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, brandName: e.target.value }));
              if (errors.brandName)
                setErrors((prev) => ({ ...prev, brandName: '' }));
            }}
            placeholder="e.g. Acme Corp"
            maxLength={80}
            className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001F54] focus:border-transparent transition-colors ${
              errors.brandName
                ? 'border-red-400 ring-1 ring-red-400'
                : 'border-gray-300'
            }`}
          />
          {errors.brandName && (
            <p className="text-xs text-red-500">{errors.brandName}</p>
          )}
        </div>

        {/* Website */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[#001F54]">
            Website{' '}
            <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Globe className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="url"
              value={formData.website}
              onChange={handleWebsiteChange}
              onBlur={handleWebsiteBlur}
              placeholder="https://yourcompany.com"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001F54] focus:border-transparent transition-colors ${
                errors.website
                  ? 'border-red-400 ring-1 ring-red-400'
                  : 'border-gray-300'
              }`}
            />
            {isDetectingIndustry && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Loader2 className="w-4 h-4 text-[#00A8CC] animate-spin" />
              </div>
            )}
          </div>
          {errors.website && (
            <p className="text-xs text-red-500">{errors.website}</p>
          )}
          {isDetectingIndustry && (
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#00A8CC]" />
              Detecting industry from your website...
            </p>
          )}
        </div>

        {/* Industry Dropdown */}
        <div className="space-y-2" ref={industryRef}>
          <div className="flex items-center gap-2">
            <label className="block text-sm font-semibold text-[#001F54]">
              Industry <span className="text-red-500">*</span>
            </label>
            {aiDetectedIndustry && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-xs text-[#00A8CC] font-medium">
                <Sparkles className="w-3 h-3" />
                Detected by AI
              </span>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsIndustryOpen((prev) => !prev);
                setIsCurrencyOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#001F54] ${
                errors.industry
                  ? 'border-red-400 ring-1 ring-red-400'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <span
                className={
                  formData.industry ? 'text-gray-900' : 'text-gray-400'
                }
              >
                {selectedIndustryLabel || 'Select your industry'}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isIndustryOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isIndustryOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                <div className="max-h-56 overflow-y-auto py-1">
                  {INDUSTRY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleIndustrySelect(option.value)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${
                        formData.industry === option.value
                          ? 'bg-blue-50 text-[#001F54] font-semibold'
                          : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {errors.industry && (
            <p className="text-xs text-red-500">{errors.industry}</p>
          )}
        </div>

        {/* Company Size */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-[#001F54]">
            Company Size <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {COMPANY_SIZE_OPTIONS.map((option) => {
              const isSelected = formData.companySize === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      companySize: option.value,
                    }));
                    if (errors.companySize)
                      setErrors((prev) => ({ ...prev, companySize: '' }));
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all text-center ${
                    isSelected
                      ? 'border-[#001F54] bg-[#001F54] text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <span className="text-sm font-bold">{option.label}</span>
                  <span
                    className={`text-xs mt-0.5 leading-tight ${
                      isSelected ? 'text-blue-200' : 'text-gray-400'
                    }`}
                  >
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.companySize && (
            <p className="text-xs text-red-500">{errors.companySize}</p>
          )}
        </div>

        {/* Currency Selector */}
        <div className="space-y-2" ref={currencyRef}>
          <label className="block text-sm font-semibold text-[#001F54]">
            Billing Currency
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsCurrencyOpen((prev) => !prev);
                setIsIndustryOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#001F54] transition-colors"
            >
              <span className="flex items-center gap-2 text-gray-900">
                <span className="text-base">{selectedCurrencyOption?.flag}</span>
                {selectedCurrencyOption?.label}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isCurrencyOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isCurrencyOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                <div className="py-1">
                  {CURRENCY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          currency: option.value,
                        }));
                        setIsCurrencyOpen(false);
                      }}
                      className={`w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${
                        formData.currency === option.value
                          ? 'bg-blue-50 text-[#001F54] font-semibold'
                          : 'text-gray-700'
                      }`}
                    >
                      <span className="text-base">{option.flag}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
