'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Upload,
  X,
  Sparkles,
  Loader2,
  Building2,
  Globe,
  Check,
  ExternalLink,
  Palette,
  Type,
} from 'lucide-react';
import {
  suggestWorkspaceNames,
  WorkspaceNameSuggestion,
} from '@/lib/mock/ai-suggestions';
import { StepProps, nameToSlug } from './types';
import type { IndustryType } from '@/types/firebase';
import type {
  BrandfetchSearchResult,
  BrandfetchBrandData,
} from '@/types/brandfetch';
import { pickBestLogoUrl } from '@/types/brandfetch';
import { proxyImage } from '@/lib/utils';

export default function StepNameLogo({
  formData,
  setFormData,
  errors,
  setErrors,
}: StepProps) {
  // === AI Name Suggestions ===
  const [suggestions, setSuggestions] = useState<WorkspaceNameSuggestion[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // === Brandfetch Search ===
  const [brandSearchResults, setBrandSearchResults] = useState<BrandfetchSearchResult[]>([]);
  const [isBrandSearching, setIsBrandSearching] = useState(false);
  const [showBrandResults, setShowBrandResults] = useState(false);
  const [isFetchingBrand, setIsFetchingBrand] = useState(false);
  const [selectedBrandData, setSelectedBrandData] = useState<BrandfetchBrandData | null>(null);

  // === File Upload ===
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // === Refs for debounce ===
  const suggestionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const brandSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const brandResultsRef = useRef<HTMLDivElement>(null);

  // ─── Close dropdown on click outside ───
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        brandResultsRef.current &&
        !brandResultsRef.current.contains(e.target as Node)
      ) {
        setShowBrandResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Debounced AI suggestion fetch ───
  useEffect(() => {
    if (formData.name.trim().length < 3) {
      setShowSuggestions(false);
      setSuggestions([]);
      return;
    }

    if (suggestionTimerRef.current) clearTimeout(suggestionTimerRef.current);

    suggestionTimerRef.current = setTimeout(async () => {
      setIsFetchingSuggestions(true);
      setShowSuggestions(true);
      try {
        const results = await suggestWorkspaceNames(formData.name.trim());
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setIsFetchingSuggestions(false);
      }
    }, 600);

    return () => {
      if (suggestionTimerRef.current) clearTimeout(suggestionTimerRef.current);
    };
  }, [formData.name]);

  // ─── Debounced Brandfetch search ───
  useEffect(() => {
    const trimmed = formData.name.trim();
    if (trimmed.length < 2) {
      setBrandSearchResults([]);
      setShowBrandResults(false);
      return;
    }

    if (brandSearchTimerRef.current) clearTimeout(brandSearchTimerRef.current);

    brandSearchTimerRef.current = setTimeout(async () => {
      setIsBrandSearching(true);
      try {
        const res = await fetch(
          `/api/brandfetch/search?q=${encodeURIComponent(trimmed)}`
        );
        const json = await res.json();
        if (json.success && json.data?.length > 0) {
          setBrandSearchResults(json.data);
          setShowBrandResults(true);
        } else {
          setBrandSearchResults([]);
          setShowBrandResults(false);
        }
      } catch {
        setBrandSearchResults([]);
        setShowBrandResults(false);
      } finally {
        setIsBrandSearching(false);
      }
    }, 500);

    return () => {
      if (brandSearchTimerRef.current) clearTimeout(brandSearchTimerRef.current);
    };
  }, [formData.name]);

  // ─── Handle brand selection ───
  const handleBrandSelect = useCallback(
    async (brand: BrandfetchSearchResult) => {
      setShowBrandResults(false);
      setIsFetchingBrand(true);

      try {
        const res = await fetch(
          `/api/brandfetch/brand?domain=${encodeURIComponent(brand.domain)}`
        );
        const json = await res.json();

        if (json.success && json.data) {
          const brandData: BrandfetchBrandData = json.data;
          setSelectedBrandData(brandData);

          // Extract best logo URL
          const logoUrl = pickBestLogoUrl(brandData.logos);
          const proxiedLogo = logoUrl ? proxyImage(logoUrl) : null;

          // Extract colors (filter out pure black/white)
          const meaningfulColors = brandData.colors.filter(
            (c) =>
              c.hex !== '#000000' &&
              c.hex !== '#FFFFFF' &&
              c.hex !== '#ffffff'
          ) as { hex: string; type: string; brightness: number }[];

          // Extract industry from Brandfetch company data
          const industries = brandData.company?.industries?.map((i) => i.name) ?? [];

          // Update form data
          setFormData((prev) => ({
            ...prev,
            logoPreviewUrl: proxiedLogo,
            logoFile: null,
            logoSource: 'brandfetch',
            brandName: brandData.name || prev.brandName,
            brandDomain: brandData.domain,
            brandColors: meaningfulColors.map((c) => ({
              hex: c.hex,
              type: c.type,
            })),
            brandFonts: brandData.fonts.map((f) => ({
              name: f.name,
              type: f.type,
            })),
            website: `https://${brandData.domain}`,
            // Map first Brandfetch industry to our industry enum
            industry: (mapBrandfetchIndustry(industries) as IndustryType) || prev.industry,
          }));
        }
      } catch {
        // Silently fail — user can still upload manually
      } finally {
        setIsFetchingBrand(false);
      }
    },
    [setFormData]
  );

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: nameToSlug(value),
    }));
    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
  };

  const applySuggestion = (suggestion: WorkspaceNameSuggestion) => {
    setFormData((prev) => ({
      ...prev,
      name: suggestion.name,
      slug: suggestion.slug,
    }));
    setShowSuggestions(false);
    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
  };

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        logoFile: file,
        logoPreviewUrl: previewUrl,
        logoSource: 'upload',
      }));
      setSelectedBrandData(null);
    },
    [setFormData]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const removeLogo = () => {
    if (formData.logoPreviewUrl && formData.logoSource === 'upload') {
      URL.revokeObjectURL(formData.logoPreviewUrl);
    }
    setFormData((prev) => ({
      ...prev,
      logoFile: null,
      logoPreviewUrl: null,
      logoSource: null,
      brandColors: [],
      brandFonts: [],
      brandDomain: '',
    }));
    setSelectedBrandData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-b border-gray-200 mx-[-1.5rem] md:mx-[-2rem] lg:mx-[-2.5rem] lg:mt-[-2.5rem] px-6 md:px-8 lg:px-10 py-4 md:py-5 lg:py-6">
        <h2 className="text-xl font-bold text-[#001F54]">Workspace Name & Logo</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Give your workspace a name and optional logo.
        </p>
      </div>

      <div className="space-y-6">
        {/* Workspace Name */}
        <div className="space-y-2 relative" ref={brandResultsRef}>
          <label className="block text-sm font-semibold text-[#001F54]">
            Workspace Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="e.g. Acme Corp Marketing"
              maxLength={80}
              className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001F54] focus:border-transparent transition-colors ${
                errors.name
                  ? 'border-red-400 ring-1 ring-red-400'
                  : 'border-gray-300'
              }`}
            />
            {isBrandSearching && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Loader2 className="w-4 h-4 text-[#00A8CC] animate-spin" />
              </div>
            )}
          </div>

          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}

          {/* Auto-generated slug */}
          {formData.slug && (
            <p className="text-xs text-gray-400 mt-1">
              Workspace URL:&nbsp;
              <span className="font-mono text-gray-500">
                heycreator.com/w/{formData.slug}
              </span>
            </p>
          )}

          {/* ── Brandfetch Search Results Dropdown ── */}
          {showBrandResults && brandSearchResults.length > 0 && (
            <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#00A8CC]" />
                <span className="text-xs font-medium text-gray-500">
                  Brand match found
                </span>
              </div>
              <div className="max-h-56 overflow-y-auto">
                {brandSearchResults.map((brand) => (
                  <button
                    key={brand.brandId}
                    type="button"
                    onClick={() => handleBrandSelect(brand)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                  >
                    {/* Brand icon */}
                    <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {brand.icon ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={proxyImage(brand.icon)}
                          alt=""
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Building2 className="w-4 h-4 text-gray-400" />
                      )}
                    </div>

                    {/* Brand name & domain */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#001F54] truncate">
                        {brand.name || brand.domain}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {brand.domain}
                      </p>
                    </div>

                    {/* Claimed badge */}
                    {brand.claimed && (
                      <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-green-50 border border-green-200 rounded-full flex-shrink-0">
                        <Check className="w-3 h-3 text-green-600" />
                        <span className="text-[10px] text-green-700 font-medium">
                          Verified
                        </span>
                      </div>
                    )}

                    <ExternalLink className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                  </button>
                ))}
              </div>
              <div className="px-3 py-1.5 border-t border-gray-100 bg-gray-50">
                <p className="text-[10px] text-gray-400 text-center">
                  Powered by Brandfetch
                </p>
              </div>
            </div>
          )}
        </div>

        {/* AI Suggestions Panel */}
        {showSuggestions && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#00A8CC]" />
              <span className="text-xs font-semibold text-[#001F54] uppercase tracking-wide">
                AI Suggestions
              </span>
            </div>

            {isFetchingSuggestions ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                <span className="text-sm text-gray-400">
                  Generating suggestions...
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.map((s, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => applySuggestion(s)}
                    className="flex flex-col items-start px-3 py-2.5 rounded-lg border border-gray-200 bg-white hover:border-[#00A8CC] hover:bg-cyan-50 transition-all text-left group"
                  >
                    <span className="text-sm font-medium text-[#001F54] group-hover:text-[#00A8CC] transition-colors">
                      {s.name}
                    </span>
                    <span className="text-xs text-gray-400 mt-0.5">
                      {s.reason}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Logo Upload / Brandfetch Preview */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[#001F54]">
            Workspace Logo{' '}
            <span className="text-gray-400 font-normal">(Optional)</span>
          </label>

          {/* Loading state — fetching brand details */}
          {isFetchingBrand ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 rounded-xl border-2 border-dashed border-[#00A8CC] bg-cyan-50/30">
              <Loader2 className="w-8 h-8 text-[#00A8CC] animate-spin" />
              <div className="text-center">
                <p className="text-sm font-medium text-[#001F54]">
                  Fetching brand assets...
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Loading logo, colors, and fonts
                </p>
              </div>
            </div>
          ) : formData.logoPreviewUrl ? (
            /* Preview state — logo loaded (from Brandfetch or file upload) */
            <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-white flex items-center justify-center flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.logoPreviewUrl}
                    alt="Workspace logo preview"
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {formData.logoSource === 'brandfetch'
                      ? selectedBrandData?.name ?? 'Brand logo'
                      : formData.logoFile?.name ?? 'Logo uploaded'}
                  </p>
                  {formData.logoSource === 'brandfetch' ? (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-[10px] text-[#00A8CC] font-medium">
                        <Globe className="w-3 h-3" />
                        from Brandfetch
                      </span>
                      {formData.brandDomain && (
                        <span className="text-xs text-gray-400">
                          {formData.brandDomain}
                        </span>
                      )}
                    </div>
                  ) : (
                    formData.logoFile && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {(formData.logoFile.size / 1024).toFixed(0)} KB
                      </p>
                    )
                  )}
                </div>
                <button
                  type="button"
                  onClick={removeLogo}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>

              {/* Brand CI: Colors & Fonts */}
              {formData.logoSource === 'brandfetch' &&
                (formData.brandColors.length > 0 || formData.brandFonts.length > 0) && (
                  <div className="border-t border-gray-200 px-4 py-3 space-y-3">
                    {/* Brand Colors */}
                    {formData.brandColors.length > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 min-w-[80px]">
                          <Palette className="w-3.5 h-3.5" />
                          <span>Colors</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {formData.brandColors.map((color, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-gray-200"
                            >
                              <div
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: color.hex }}
                              />
                              <span className="text-xs font-mono text-gray-600">
                                {color.hex}
                              </span>
                              <span className="text-[10px] text-gray-400 capitalize">
                                {color.type}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Brand Fonts */}
                    {formData.brandFonts.length > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 min-w-[80px]">
                          <Type className="w-3.5 h-3.5" />
                          <span>Fonts</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {formData.brandFonts.map((font, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 text-xs text-gray-600"
                            >
                              {font.name}
                              <span className="text-[10px] text-gray-400 capitalize">
                                ({font.type})
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </div>
          ) : (
            /* Drop zone — no logo yet */
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 px-6 py-10 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                isDragging
                  ? 'border-[#00A8CC] bg-cyan-50'
                  : 'border-gray-300 hover:border-[#001F54] hover:bg-gray-50'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isDragging ? 'bg-cyan-100' : 'bg-gray-100'
                }`}
              >
                {isDragging ? (
                  <Upload className="w-5 h-5 text-[#00A8CC]" />
                ) : (
                  <Building2 className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[#001F54]">
                  {isDragging
                    ? 'Drop your logo here'
                    : 'Click or drag to upload logo'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  PNG, JPG, SVG up to 5MB
                </p>
                {formData.name.trim().length >= 2 && !isBrandSearching && (
                  <p className="text-xs text-[#00A8CC] mt-2">
                    Or type a brand name above to auto-fetch the logo
                  </p>
                )}
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInputChange}
          />
        </div>
      </div>
    </div>
  );
}

// ===== HELPER: Map Brandfetch industries to our IndustryType enum =====

function mapBrandfetchIndustry(
  industries: string[]
): string {
  if (!industries.length) return '';

  const mapping: Record<string, string> = {
    'apparel & fashion': 'Fashion',
    fashion: 'Fashion',
    clothing: 'Fashion',
    luxury: 'Fashion',
    beauty: 'Beauty',
    cosmetics: 'Beauty',
    'food & beverage': 'Food & Beverage',
    'food & beverages': 'Food & Beverage',
    food: 'Food & Beverage',
    beverages: 'Food & Beverage',
    restaurant: 'Food & Beverage',
    technology: 'Technology',
    'information technology': 'Technology',
    software: 'Technology',
    'computer software': 'Technology',
    internet: 'Technology',
    'consumer electronics': 'Technology',
    travel: 'Travel',
    hospitality: 'Travel',
    'hotels & tourism': 'Travel',
    fitness: 'Fitness',
    health: 'Fitness',
    wellness: 'Fitness',
    'sporting goods': 'Fitness',
    gaming: 'Gaming',
    'video games': 'Gaming',
    entertainment: 'Gaming',
    education: 'Education',
    'e-learning': 'Education',
    'e-commerce': 'E-commerce',
    ecommerce: 'E-commerce',
    retail: 'E-commerce',
    'online retail': 'E-commerce',
    music: 'Other',
    automotive: 'Other',
    finance: 'Other',
    banking: 'Other',
  };

  for (const industry of industries) {
    const lower = industry.toLowerCase();
    if (mapping[lower]) return mapping[lower];
    // Partial match
    for (const [key, value] of Object.entries(mapping)) {
      if (lower.includes(key) || key.includes(lower)) return value;
    }
  }

  return '';
}
