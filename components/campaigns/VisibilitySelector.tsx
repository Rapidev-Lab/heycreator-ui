'use client';

import { Lock, Globe } from 'lucide-react';
import { useState } from 'react';

type VisibilityOption = 'private' | 'public';

interface VisibilitySelectorProps {
  value: VisibilityOption;
  onChange: (value: VisibilityOption) => void;
}

export default function VisibilitySelector({ value, onChange }: VisibilitySelectorProps) {
  const handleKeyDown = (e: React.KeyboardEvent, option: VisibilityOption) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(option);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Campaign Visibility <span className="text-red-500">*</span>
      </label>
      <div
        role="radiogroup"
        aria-label="Campaign Visibility"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div
          role="radio"
          aria-checked={value === 'private'}
          tabIndex={0}
          onClick={() => onChange('private')}
          onKeyDown={(e) => handleKeyDown(e, 'private')}
          className={`p-6 border rounded-lg cursor-pointer transition-all ${
            value === 'private'
              ? 'border-brand-navy ring-2 ring-brand-navy bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center mb-2">
            <Lock className="w-5 h-5 text-brand-navy mr-3" />
            <h3 className="font-semibold text-gray-900">Private Campaign</h3>
          </div>
          <p className="text-sm text-gray-600">
            Invite-only. Only creators you specifically invite can see and apply to this campaign.
          </p>
        </div>
        <div
          role="radio"
          aria-checked={value === 'public'}
          tabIndex={0}
          onClick={() => onChange('public')}
          onKeyDown={(e) => handleKeyDown(e, 'public')}
          className={`p-6 border rounded-lg cursor-pointer transition-all ${
            value === 'public'
              ? 'border-brand-navy ring-2 ring-brand-navy bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center mb-2">
            <Globe className="w-5 h-5 text-brand-navy mr-3" />
            <h3 className="font-semibold text-gray-900">Public Campaign</h3>
          </div>
          <p className="text-sm text-gray-600">
            Open to marketplace. Any creator who meets your requirements can discover and apply.
          </p>
        </div>
      </div>
    </div>
  );
}
