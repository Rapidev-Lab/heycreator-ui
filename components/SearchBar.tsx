"use client";

import {
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  Users,
  Loader2,
} from "lucide-react";
import { useState, useMemo } from "react";
import { SocialPlatform } from "@/types/influencer";
import { Platform } from "@/types/api";

interface SearchBarProps {
  onSearch?: (query: string, platforms: Platform[]) => void;
  isLoading?: boolean;
}

export const TikTokIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className,
  ...props
}) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export const TwitterXIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className,
  ...props
}) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function SearchBar({
  onSearch,
  isLoading = false,
}: SearchBarProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    "instagram",
  ]);
  const [searchQuery, setSearchQuery] = useState("");

  const platforms: {
    id: Platform;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    ringColor: string;
    label: string;
  }[] = [
    {
      id: "instagram",
      icon: Instagram,
      color: "text-pink-500",
      bgColor: "bg-pink-50",
      ringColor: "ring-pink-500",
      label: "Instagram",
    },
    {
      id: "tiktok",
      icon: TikTokIcon,
      color: "text-black",
      bgColor: "bg-gray-50",
      ringColor: "ring-gray-900",
      label: "TikTok",
    },
    {
      id: "twitter",
      icon: TwitterXIcon,
      color: "text-blue-400",
      bgColor: "bg-blue-50",
      ringColor: "ring-blue-400",
      label: "X",
    },
    {
      id: "youtube",
      icon: Youtube,
      color: "text-red-500",
      bgColor: "bg-red-50",
      ringColor: "ring-red-500",
      label: "YouTube",
    },
    {
      id: "facebook",
      icon: Facebook,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      ringColor: "ring-blue-600",
      label: "Facebook",
    },
  ];

  const togglePlatform = (platformId: Platform) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(platformId)) {
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== platformId);
      } else {
        return [...prev, platformId];
      }
    });
  };

  const placeholder = useMemo(() => {
    if (selectedPlatforms.length === 1) {
      const platform = platforms.find((p) => p.id === selectedPlatforms[0]);
      return `Enter any ${platform?.label} handle`;
    } else {
      return "Enter platform user or screen names";
    }
  }, [selectedPlatforms, platforms]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && !isLoading) {
      onSearch(searchQuery, selectedPlatforms);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-4 sm:py-5">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Social Platform Tabs - horizontal scroll on mobile */}
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 py-2 sm:mx-1 sm:px-1 sm:py-1 ">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              const isSelected = selectedPlatforms.includes(platform.id);

              return (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => togglePlatform(platform.id)}
                  className={`
                    flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg transition-all
                    ${
                      isSelected
                        ? `${platform.bgColor} ${platform.color} ring-2 ${platform.ringColor}`
                        : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                    }
                  `}
                  title={platform.label}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>

          {/* Search Input and Button */}
          <div className="flex gap-2 sm:gap-3 flex-1 items-center">
            {/* Search Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 sm:px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-3xl focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent text-sm"
                disabled={isLoading}
              />
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="px-4 sm:px-6 py-2.5 bg-brand-navy hover:bg-brand-navy-light text-white rounded-3xl font-medium text-sm transition-colors whitespace-nowrap flex items-center justify-center min-w-[80px] sm:min-w-[112px]"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="hidden sm:inline">Search</span>
              )}
              {!isLoading && <Users className="w-5 h-5 sm:hidden" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
