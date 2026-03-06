'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Minus, Instagram, Youtube } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';
import { RiTwitterXFill } from 'react-icons/ri';

export interface PlatformContentRequirement {
  type: string;
  count: number;
  enabled: boolean;
}

export interface ContentRequirements {
  [platform: string]: PlatformContentRequirement[];
}

interface ContentRequirementsSelectorProps {
  selectedPlatforms: string[];
  value: ContentRequirements;
  onChange: (requirements: ContentRequirements) => void;
}

const platformContentTypes: { [key: string]: string[] } = {
  instagram: ['Reels', 'Stories', 'Feed Posts', 'Carousel Posts'],
  tiktok: ['Videos', 'Stories', 'Live Sessions'],
  youtube: ['Long-form Videos', 'YouTube Shorts', 'Community Posts'],
  twitter: ['Tweets', 'Threads', 'Spaces'],
};

const platformIcons: { [key: string]: React.ReactNode } = {
  instagram: <Instagram className="w-4 h-4" />,
  tiktok: <FaTiktok className="w-4 h-4" />,
  youtube: <Youtube className="w-4 h-4" />,
  twitter: <RiTwitterXFill className="w-4 h-4" />,
};

const platformLabels: { [key: string]: string } = {
  instagram: 'Instagram Content',
  tiktok: 'TikTok Content',
  youtube: 'YouTube Content',
  twitter: 'X / Twitter Content',
};

export default function ContentRequirementsSelector({
  selectedPlatforms,
  value,
  onChange,
}: ContentRequirementsSelectorProps) {
  const [expandedPlatforms, setExpandedPlatforms] = useState<{ [key: string]: boolean }>({});

  const togglePlatform = (platform: string) => {
    setExpandedPlatforms((prev) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  const handleToggleContent = (platform: string, contentType: string) => {
    const platformRequirements = value[platform] || [];
    const existingIndex = platformRequirements.findIndex((r) => r.type === contentType);

    let updatedRequirements;
    if (existingIndex >= 0) {
      updatedRequirements = [...platformRequirements];
      updatedRequirements[existingIndex] = {
        ...updatedRequirements[existingIndex],
        enabled: !updatedRequirements[existingIndex].enabled,
      };
    } else {
      updatedRequirements = [
        ...platformRequirements,
        { type: contentType, count: 0, enabled: true },
      ];
    }

    onChange({
      ...value,
      [platform]: updatedRequirements,
    });
  };

  const handleChangeCount = (platform: string, contentType: string, delta: number) => {
    const platformRequirements = value[platform] || [];
    const existingIndex = platformRequirements.findIndex((r) => r.type === contentType);

    if (existingIndex >= 0) {
      const updatedRequirements = [...platformRequirements];
      const newCount = Math.max(0, updatedRequirements[existingIndex].count + delta);
      updatedRequirements[existingIndex] = {
        ...updatedRequirements[existingIndex],
        count: newCount,
      };

      onChange({
        ...value,
        [platform]: updatedRequirements,
      });
    }
  };

  const getContentRequirement = (platform: string, contentType: string) => {
    const platformRequirements = value[platform] || [];
    return platformRequirements.find((r) => r.type === contentType) || {
      type: contentType,
      count: 0,
      enabled: false,
    };
  };

  return (
    <div className="space-y-3">
      {selectedPlatforms.map((platform) => {
        const contentTypes = platformContentTypes[platform] || [];
        const isExpanded = expandedPlatforms[platform] ?? false;

        return (
          <div
            key={platform}
            className="border border-gray-200 rounded-lg overflow-hidden bg-white"
          >
            {/* Platform Header */}
            <button
              onClick={() => togglePlatform(platform)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {platformIcons[platform]}
                <span className="text-sm font-medium text-gray-900">
                  {platformLabels[platform]}
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {/* Content Types */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-3">
                {contentTypes.map((contentType) => {
                  const requirement = getContentRequirement(platform, contentType);

                  return (
                    <div
                      key={contentType}
                      className="flex items-center justify-between"
                    >
                      {/* Content Type Name with Checkbox */}
                      <label className="flex items-center gap-3 flex-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={requirement.enabled}
                          onChange={() => handleToggleContent(platform, contentType)}
                          className="w-4 h-4 text-brand-navy border-gray-300 rounded focus:ring-brand-navy"
                        />
                        <span className="text-sm text-gray-700">{contentType}</span>
                      </label>

                      {/* Counter Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleChangeCount(platform, contentType, -1)}
                          disabled={!requirement.enabled || requirement.count === 0}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>

                        <span className="text-sm font-medium text-gray-900 w-8 text-center">
                          {requirement.count}
                        </span>

                        <button
                          onClick={() => handleChangeCount(platform, contentType, 1)}
                          disabled={!requirement.enabled}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
