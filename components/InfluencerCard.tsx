"use client";

import { useState, useEffect } from "react";
import { Influencer } from "@/types/influencer";
import SocialIcons from "./SocialIcons";
import { Heart } from "lucide-react";
import Link from "next/link";

interface InfluencerCardProps {
  influencer: Influencer;
  bulkSelectMode: boolean;
  isSelected: boolean; // New prop: true if this card is selected
  onToggleSelect: (id: string) => void; // New prop: function to toggle selection
  basePath?: string; // Optional base path for profile links (defaults to /influencers/profiles)
  onClickOverride?: (influencer: Influencer) => void; // If provided, replaces default Link navigation
}

export default function InfluencerCard({ influencer, bulkSelectMode, isSelected, onToggleSelect, basePath = '/influencers/profiles', onClickOverride }: InfluencerCardProps) {
  const [imageStatus, setImageStatus] = useState<
    "loading" | "loaded" | "error"
  >("loading");

  useEffect(() => {
    // Reset state when the influencer prop changes
    setImageStatus("loading");

    if (!influencer.avatar) {
      setImageStatus("error");
      return;
    }

    // Preload the image to check its status
    const img = new Image();
    img.src = influencer.avatar;
    img.onload = () => setImageStatus("loaded");
    img.onerror = () => setImageStatus("error");
  }, [influencer.avatar]);

  const showPlaceholder = imageStatus === "loading" || imageStatus === "error";

  const handleCardClick = (e: React.MouseEvent) => {
    if (bulkSelectMode && influencer.id) {
      e.preventDefault();
      onToggleSelect(influencer.id);
    } else if (onClickOverride) {
      e.preventDefault();
      onClickOverride(influencer);
    }
  };

  return (
    <Link href={`${basePath}/${influencer.id}`} onClick={handleCardClick}>
      <div className={`bg-white rounded-lg border p-4 hover:shadow-lg transition-all cursor-pointer relative
        ${isSelected && bulkSelectMode ? 'border-primary bg-blue-50 shadow-md' : 'border-gray-200'}
      `}>
        {bulkSelectMode && influencer.id && (
          <input
            type="checkbox"
            className="absolute top-2 left-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded z-10"
            checked={isSelected}
            onChange={() => onToggleSelect(influencer.id!)}
            onClick={(e) => e.stopPropagation()} // Prevent card click from firing on checkbox click
          />
        )}
        <div className="flex items-start space-x-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {showPlaceholder ? (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-lg">
                {(influencer.displayName || "?").charAt(0).toUpperCase()}
              </div>
            ) : (
              <img
                src={influencer.avatar}
                alt={influencer.displayName}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {influencer.displayName}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4 text-primary fill-primary" />
                    <span className="text-sm font-medium text-primary">
                      {influencer.influenceScore}
                    </span>
                  </div>
                  <SocialIcons platforms={influencer.platforms} />
                </div>
                {influencer.flag && (
                  <span className="text-xs text-gray-500 mt-1 block">
                    {influencer.flag}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
