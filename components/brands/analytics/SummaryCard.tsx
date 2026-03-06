"use client";

import React from "react";

interface SummaryCardProps {
  /** The numeric value to display (e.g., 87) */
  value: number | string;
  /** The descriptive label (e.g., "Creators") */
  label: string;
  /** Optional: adds a loading state pulse */
  isLoading?: boolean;
}

/**
 * SummaryCard Component
 * Displays high-level metrics with large typography as seen in the Analytics dashboard.
 */
export default function SummaryCard({ value, label, isLoading }: SummaryCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 animate-pulse">
        <div className="h-12 w-20 bg-gray-100 rounded-lg mb-3" />
        <div className="h-4 w-24 bg-gray-50 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 hover:shadow-md transition-shadow">
      {/* Large Value Display */}
      <div className="text-2xl font-bold text-brand-navy leading-none mb-2">
        {value}
      </div>
      
      {/* Uppercase Tracking Label */}
      <div className="text-sm font-semibold text-gray-400 uppercase tracking-[0.05em]">
        {label}
      </div>
    </div>
  );
}