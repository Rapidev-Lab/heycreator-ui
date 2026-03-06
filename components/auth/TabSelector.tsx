"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon; // <— lucide-react icon component
  width?: string; // <— Tailwind width class
}

interface TabSelectorProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export default function TabSelector({
  tabs,
  activeTab,
  onChange,
  className = "",
}: TabSelectorProps) {
  return (
    <div
      className={`flex bg-[#EDF7FD] gap-1.5 rounded-3xl overflow-hidden p-1  ${className}`}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`
              ${tab.width ?? "flex-1"} 
              flex items-center justify-center gap-2 px-1 py-2 
              rounded-3xl font-medium transition-all duration-200 whitespace-nowrap
              ${
                activeTab === tab.id
                  ? "bg-brand-navy-dark text-white shadow-sm"
                  : " text-gray-600 hover:bg-[#9ccae7]"
              }
            `}
          >
            {Icon && <Icon size={18} />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
