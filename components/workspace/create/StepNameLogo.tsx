'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Upload, X, Sparkles, Loader2, Building2 } from 'lucide-react';
import {
  suggestWorkspaceNames,
  WorkspaceNameSuggestion,
} from '@/lib/mock/ai-suggestions';
import { StepProps, nameToSlug } from './types';

export default function StepNameLogo({
  formData,
  setFormData,
  errors,
  setErrors,
}: StepProps) {
  const [suggestions, setSuggestions] = useState<WorkspaceNameSuggestion[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const suggestionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced AI suggestion fetch — triggered once name reaches 3+ chars
  useEffect(() => {
    if (formData.name.trim().length < 3) {
      setShowSuggestions(false);
      setSuggestions([]);
      return;
    }

    if (suggestionTimerRef.current) {
      clearTimeout(suggestionTimerRef.current);
    }

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
      }));
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
    if (formData.logoPreviewUrl) {
      URL.revokeObjectURL(formData.logoPreviewUrl);
    }
    setFormData((prev) => ({ ...prev, logoFile: null, logoPreviewUrl: null }));
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
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[#001F54]">
            Workspace Name <span className="text-red-500">*</span>
          </label>
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

        {/* Logo Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[#001F54]">
            Workspace Logo{' '}
            <span className="text-gray-400 font-normal">(Optional)</span>
          </label>

          {formData.logoPreviewUrl ? (
            /* Preview state */
            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-white flex items-center justify-center flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.logoPreviewUrl}
                  alt="Workspace logo preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {formData.logoFile?.name ?? 'Logo uploaded'}
                </p>
                {formData.logoFile && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {(formData.logoFile.size / 1024).toFixed(0)} KB
                  </p>
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
          ) : (
            /* Drop zone */
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
