"use client";

import React from "react";

export interface TabConfig {
  id: string;
  label: string;
  count?: number; // Optional badge count
  disabled?: boolean;
}

interface TabsNavigationProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export default function TabsNavigation({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}: TabsNavigationProps) {
  return (
    <div className={`border-b border-[#E5E7EB] ${className}`}>
      <nav className="-mb-px flex gap-12">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              disabled={tab.disabled}
              onClick={() => onTabChange(tab.id)}
              className={`relative border-b-[3px] py-4 text-[15px] font-semibold transition-colors capitalize flex items-center ${
                tab.disabled
                  ? "border-transparent text-[#D1D5DB] cursor-not-allowed"
                  : isActive
                    ? "border-brand-navy-dark text-brand-navy"
                    : "border-transparent text-[#666666] hover:text-[#444444]"
              }`}
            >
              {tab.label}
              {/* Badge for counts (e.g., the '7' in the design) */}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-brand-navy text-white text-[10px] font-bold rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}