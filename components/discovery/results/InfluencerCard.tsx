'use client';

import {
  Instagram, Music2, Twitter, Youtube, Facebook, MapPin
} from 'lucide-react';
import { InfluencerProfile } from '@/types/discovery';
import Avatar from '../Avatar';

interface InfluencerCardProps {
  influencer: InfluencerProfile;
  onAdd?: (id: string) => void;
  onContact?: (id: string) => void;
  onTag?: (id: string) => void;
  onCardClick?: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

const platformIcons: Record<string, any> = {
  instagram: Instagram,
  tiktok: Music2,
  twitter: Twitter,
  youtube: Youtube,
  facebook: Facebook,
  snapchat: MessageCircle,
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

export default function InfluencerCard({
  influencer,
  onAdd,
  onContact,
  onTag,
  onCardClick,
  isSelected = false,
  onSelect
}: InfluencerCardProps) {
  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(influencer.id);
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(influencer.id);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="py-5 cursor-pointer group hover:bg-gray-100 hover:bg-opacity-50 transition-colors duration-150"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Avatar
          src={influencer.profile_image_url}
          name={influencer.display_name}
          size="lg"
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Name and Platform Icons */}
          <div className="flex items-start gap-2">
            <h3 className="text-base font-semibold text-gray-900 group-hover:text-brand-navy transition-colors">
              {influencer.display_name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              {influencer.platforms.map((platform) => {
                const Icon = platformIcons[platform];
                return Icon ? (
                  <Icon key={platform} className="w-3.5 h-3.5 text-gray-500" />
                ) : null;
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="font-medium">{formatNumber(influencer.follower_count)} Subscribers</span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {formatNumber(Math.round(influencer.follower_count * 0.7))} Other
            </span>
          </div>

          {/* Bio */}
          {influencer.bio && (
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {influencer.bio}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={(e) => handleActionClick(e, () => onAdd?.(influencer.id))}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 hover:border-brand-navy hover:bg-gray-50 transition-colors"
              title="Add to list"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>

            <button
              onClick={(e) => handleActionClick(e, () => onContact?.(influencer.id))}
              className="px-4 h-9 flex items-center justify-center gap-2 rounded-lg border border-gray-300 hover:border-brand-navy hover:bg-gray-50 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Contact</span>
            </button>

            <button
              onClick={(e) => handleActionClick(e, () => onTag?.(influencer.id))}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 hover:border-brand-navy hover:bg-gray-50 transition-colors"
              title="Add tag"
            >
              <Tag className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Brand Collaborations */}
          {influencer.brand_mentions && influencer.brand_mentions.length > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <div className="flex -space-x-2">
                {influencer.brand_mentions.slice(0, 3).map((brand, index) => {
                  const initials = brand.brand_name
                    .split(' ')
                    .map(word => word[0])
                    .join('')
                    .toUpperCase()
                    .substring(0, 2);

                  return (
                    <div
                      key={index}
                      className="relative w-7 h-7 rounded-full border-2 border-white bg-gray-800 overflow-hidden shadow-sm"
                      title={brand.brand_name}
                    >
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                        {initials}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Stats and Checkbox */}
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-3">
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {}}
              onClick={handleCheckboxClick}
              className="w-4 h-4 rounded border-gray-300 text-brand-navy focus:ring-brand-navy cursor-pointer"
            />
          </div>

          {/* Average Views */}
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {formatNumber(Math.round(influencer.follower_count * 0.05))} Average Views
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Divider */}
      <div className="border-b border-gray-200 mt-5" />
    </div>
  );
}

// Import missing icons
import { Plus, Tag, MessageCircle, Users } from 'lucide-react';
