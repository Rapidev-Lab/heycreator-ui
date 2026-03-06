"use client";

import React from "react";

// Types for easy API integration
interface AudienceData {
  averageAge: number;
  gender: { label: string; percentage: number }[];
  countries: { code: string; name: string; percentage: number; flag: string }[];
  interests: string[];
  brandAffinity: { brand: string; percentage: number }[];
}

const ProgressBar = ({ percentage }: { percentage: number }) => (
  <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
    <div 
      className="bg-brand-navy h-2 rounded-full transition-all duration-500" 
      style={{ width: `${percentage}%` }}
    />
  </div>
);

export default function AudienceDemographics({ data }: { data: AudienceData }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <h3 className="text-xl font-bold text-brand-navy mb-8">Audience Demographics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
        
        {/* Left Column: Average Age & Gender */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h4 className="text-sm font-bold text-brand-navy">Average Age</h4>
            <span className="text-2xl font-bold text-brand-navy">{data.averageAge}</span>
          </div>
          <div className="space-y-6">
            {data.gender.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="text-brand-navy font-bold">{item.percentage}%</span>
                </div>
                <ProgressBar percentage={item.percentage} />
              </div>
            ))}
          </div>
        </section>

        {/* Right Column: Top Countries */}
        <section>
          <h4 className="text-sm font-bold text-brand-navy mb-6">Top Countries</h4>
          <div className="space-y-5">
            {data.countries.map((country) => (
              <div key={country.code} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{country.flag}</span>
                  <span className="text-gray-500 font-medium">{country.name}</span>
                </div>
                <span className="text-brand-navy font-bold">{country.percentage}%</span>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Left: Audience Interests */}
        <section>
          <h4 className="text-sm font-bold text-brand-navy mb-6">Audience Interests</h4>
          <div className="flex flex-wrap gap-3">
            {data.interests.map((interest) => (
              <span 
                key={interest}
                className="px-6 py-2 rounded-full border border-gray-100 text-sm font-medium text-brand-navy bg-white shadow-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        </section>

        {/* Bottom Right: Brand Affinity */}
        <section>
          <h4 className="text-sm font-bold text-brand-navy mb-6">Brand Affinity</h4>
          <div className="space-y-4">
            {data.brandAffinity.map((item) => (
              <div key={item.brand} className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-medium">{item.brand}</span>
                <span className="text-brand-navy font-bold">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}