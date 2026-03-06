'use client';

import { Demographics } from '@/types/profile';

interface DemographicsSectionProps {
  data: Demographics;
  onViewAll?: () => void;
}

export function DemographicsSection({ data, onViewAll }: DemographicsSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header — inside card */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-brand-navy">Audience Demographics</h2>
        <button
          onClick={onViewAll}
          className="text-sm text-brand-navy hover:text-brand-navy-light font-medium transition-colors"
        >
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Average Age + Gender */}
        <div>
          {/* Average Age */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-semibold text-gray-900">Average Age</span>
            <span className="text-2xl font-bold text-gray-900">{data.averageAge || 28}</span>
          </div>

          {/* Gender Split */}
          <div className="space-y-4">
            {/* Women */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-gray-700">Women</span>
                <span className="text-sm font-semibold text-gray-900">{data.genderSplit.female}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-brand-navy" style={{ width: `${data.genderSplit.female}%` }}
                />
              </div>
            </div>

            {/* Men */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-gray-700">Men</span>
                <span className="text-sm font-semibold text-gray-900">{data.genderSplit.male}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-brand-navy" style={{ width: `${data.genderSplit.male}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Top Countries */}
        {data.topCountries.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Countries</h3>
            <div className="space-y-4">
              {data.topCountries.map((country, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{country.flag}</span>
                    <span className="text-sm text-gray-700">{country.country}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{country.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Audience Interests */}
      {data.interests && data.interests.length > 0 && (
        <div className="border-t border-gray-100 mt-6 pt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Audience Interests</h3>
          <div className="flex flex-wrap gap-2">
            {data.interests.map((interest, i) => (
              <span
                key={i}
                className="px-3 py-1 text-xs font-medium text-brand-navy bg-brand-navy-50 rounded-full"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Brand Affinity */}
      {data.brandAffinity && data.brandAffinity.length > 0 && (
        <div className="border-t border-gray-100 mt-6 pt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Brand Affinity</h3>
          <div className="space-y-3">
            {data.brandAffinity.map((brand, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{brand.brand}</span>
                  <span className="text-sm font-semibold text-gray-900">{brand.percentage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-brand-navy" style={{ width: `${brand.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
