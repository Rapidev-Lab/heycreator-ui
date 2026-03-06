
'use client';

import { useState } from 'react';
import { Instagram, Youtube, X, Check } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';

const platforms = [
  { id: 'instagram', name: 'Instagram', icon: <Instagram className="w-5 h-5" /> },
  { id: 'tiktok', name: 'TikTok', icon: <FaTiktok className="w-5 h-5" /> },
  { id: 'youtube', name: 'YouTube', icon: <Youtube className="w-5 h-5" /> },
  { id: 'twitter', name: 'X / Twitter', icon: <X className="w-5 h-5" /> },
];

interface PlatformSelectorProps {
  value: string[];
  onChange: (selected: string[]) => void;
}

export default function PlatformSelector({ value, onChange }: PlatformSelectorProps) {
  const handleToggle = (platformId: string) => {
    const newSelection = value.includes(platformId)
      ? value.filter((p) => p !== platformId)
      : [...value, platformId];
    onChange(newSelection);
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-2">Required Platforms *</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {platforms.map((platform) => {
          const isSelected = value.includes(platform.id);
          return (
            <button
              key={platform.id}
              type="button"
              onClick={() => handleToggle(platform.id)}
              className={`flex items-center justify-between w-full p-4 border rounded-lg transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-gray-600">{platform.icon}</div>
                <span className="font-medium text-gray-800">{platform.name}</span>
              </div>
              {isSelected && (
                <div className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
