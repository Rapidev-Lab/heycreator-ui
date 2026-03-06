'use client';

import { useState } from 'react';
import { ListPlus, Eye, Bookmark } from 'lucide-react';
import { Instagram, Music2, Youtube, X, Facebook, MessageCircle, Plus } from 'lucide-react';
import InviteToCampaignModal from '@/components/brands/discover/InviteToCampaignModal';
import SendMessageModal from '@/components/brands/discover/SendMessageModal';
import VerifiedIcon from '@/components/brands/discover/VerifiedIcon';
import { proxyImage } from '@/lib/utils';
import type { UserCollectionWithProfile } from '@/types/user-collection';

type PlatformKey = 'instagram' | 'tiktok' | 'youtube' | 'x' | 'twitter' | 'facebook';

const platformIcons: Record<PlatformKey, React.ElementType> = {
  instagram: Instagram,
  tiktok: Music2,
  youtube: Youtube,
  x: X,
  twitter: X,
  facebook: Facebook,
};

interface CreatorCardProps {
  creator: UserCollectionWithProfile;
  onAddToList: (creatorId: string, currentLists: string[]) => void;
  onViewEdit: (creatorId: string) => void;
  onStarToggle: (profileId: string) => void;
}

function formatFollowers(count: number): string {
  if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
  if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
  return count.toString();
}

export default function CreatorCard({
  creator,
  onAddToList,
  onViewEdit,
  onStarToggle,
}: CreatorCardProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSendMessageModal, setShowSendMessageModal] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const profile = creator.globalProfile;
  const displayName = creator.customDisplayName || profile.displayName;
  const handle = '@' + profile.primaryUsername;
  const avatarUrl = proxyImage(profile.avatarUrl);

  const initials = displayName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const bgColors = [
    'bg-brand-navy', 'bg-blue-500', 'bg-brand-navy-light',
    'bg-pink-500', 'bg-teal-500', 'bg-orange-500',
    'bg-emerald-500', 'bg-rose-500', 'bg-violet-500',
  ];
  const bgColor = bgColors[displayName.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % bgColors.length];

  const socials = profile.platforms.map(p => p.platform as PlatformKey);
  const engagement = profile.averageEngagementRate > 0
    ? profile.averageEngagementRate.toFixed(1) + '%'
    : '--';
  const categories = profile.categories || [];

  const modalCreatorInfo = {
    name: displayName,
    handle,
    avatarUrl: profile.avatarUrl || '',
  };

  return (
    <div
      className="relative bg-white rounded-xl shadow-sm border-2 border-[#E0E0E0] p-6 flex flex-col space-y-4 cursor-pointer transition-shadow hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewEdit(creator.globalInfluencerId)}
    >
      {/* Hover overlay actions */}
      {isHovered && (
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onAddToList(creator.globalInfluencerId, creator.lists || []); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
          >
            <ListPlus className="w-3.5 h-3.5" />
            Add to List
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onViewEdit(creator.globalInfluencerId); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            View / Edit Creator
          </button>
        </div>
      )}

      {/* Top Row: Avatar, Metrics, Bookmark */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="relative w-16 h-16 flex-shrink-0">
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-purple-500">
              {avatarError || !avatarUrl ? (
                <div className={`w-full h-full rounded-full ${bgColor} flex items-center justify-center`}>
                  <span className="text-white font-semibold text-lg">{initials}</span>
                </div>
              ) : (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              )}
            </div>
          </div>

          {/* Metrics Block */}
          <div className="flex gap-3 text-center">
            <div className="flex flex-col items-center">
              <span className="text-base font-bold text-brand-navy">
                {formatFollowers(profile.totalFollowers)}
              </span>
              <span className="text-xs text-gray-500">Followers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-base font-bold text-brand-navy">{engagement}</span>
              <span className="text-xs text-gray-500">Engagement</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-base font-bold text-brand-navy">--</span>
              <span className="text-xs text-gray-500">True Reach</span>
            </div>
          </div>
        </div>

        {/* Bookmark */}
        <button
          onClick={(e) => { e.stopPropagation(); onStarToggle(creator.globalInfluencerId); }}
          className={`p-1.5 rounded-full transition-colors ${
            creator.starred ? 'bg-brand-navy-50' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <Bookmark className={`w-5 h-5 transition-colors ${
            creator.starred ? 'text-brand-navy-dark fill-brand-navy-dark' : 'text-gray-400'
          }`} />
        </button>
      </div>

      {/* Name and Handle */}
      <div>
        <div className="flex items-center space-x-1">
          <h3 className="text-lg font-bold text-gray-900">{displayName}</h3>
          <VerifiedIcon isVerified={profile.verified} className="w-5 h-5" />
        </div>
        <p className="text-sm text-gray-500">{handle}</p>
      </div>

      {/* Social Icons */}
      <div className="flex flex-wrap gap-2">
        {socials.map((platform) => {
          const Icon = platformIcons[platform];
          return Icon ? (
            <div key={platform} className="p-2 rounded-full bg-brand-navy-dark text-white">
              <Icon className="w-4 h-4" />
            </div>
          ) : null;
        })}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 pt-4" />

      {/* Bio */}
      <p className="text-sm text-gray-700 line-clamp-2">{profile.bio || 'No bio available'}</p>

      {/* Tags */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.slice(0, 4).map((tag) => (
            <span key={tag} className="text-xs px-3 py-1 rounded-full bg-[#F8F9FD] text-[#FF385C] font-medium">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex w-full space-x-2 pt-2">
        <button
          onClick={(e) => { e.stopPropagation(); setShowSendMessageModal(true); }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-[#E0E0E0] rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Chat
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setShowInviteModal(true); }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-[#E0E0E0] rounded-lg text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add to Campaign
        </button>
      </div>

      {/* Modals */}
      <InviteToCampaignModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        creator={modalCreatorInfo}
      />
      <SendMessageModal
        isOpen={showSendMessageModal}
        onClose={() => setShowSendMessageModal(false)}
        creator={modalCreatorInfo}
      />
    </div>
  );
}
