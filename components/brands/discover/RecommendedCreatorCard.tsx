'use client';

import { Instagram, Music2, Youtube, X, Facebook, Plus, Archive, Bookmark, MoreVertical, Loader2, MessageSquare } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import VerifiedIcon from './VerifiedIcon';
import { proxyImage } from '@/lib/utils';
import InviteToCampaignModal from './InviteToCampaignModal'; // Import the new modal
import SendMessageModal from './SendMessageModal'; // Import the new modal

type PlatformKey = 'instagram' | 'tiktok' | 'youtube' | 'x' | 'twitter' | 'facebook';

type PlatformIconMap = {
  [key in PlatformKey]: React.ElementType;
};

const platformIcons: PlatformIconMap = {
  instagram: Instagram,
  tiktok: Music2,
  youtube: Youtube,
  x: X,
  twitter: X,
  facebook: Facebook,
};


export interface CardMenuItem {
  label: string;
  icon?: React.ElementType;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface RecommendedCreatorCardProps {
  creator: {
    id?: string;
    avatarUrl: string;
    name: string;
    handle: string;
    isVerified: boolean;
    isBookmarked: boolean;
    stats: {
      followers: string; // Reverted type to string
      engagement: string;
      reach: string;
    };
    socials: PlatformKey[];
    specialty: string;
    tags: string[];
  };
  isSelected?: boolean;
  onSelect?: (e: React.MouseEvent) => void;
  menuItems?: CardMenuItem[];
  onAddToCampaign?: (creatorId: string) => void;
  isInviting?: boolean;
}

export default function RecommendedCreatorCard({ creator, isSelected, onSelect, menuItems, onAddToCampaign, isInviting }: RecommendedCreatorCardProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSendMessageModal, setShowSendMessageModal] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const initials = creator?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const bgColors = [
    'bg-brand-navy', 'bg-blue-500', 'bg-brand-navy-light',
    'bg-pink-500',   'bg-teal-500', 'bg-orange-500',
    'bg-emerald-500','bg-rose-500', 'bg-violet-500',
  ];
  const bgColor = bgColors[creator?.name?.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % bgColors.length];

  // Prepare creator info for modals
  const modalCreatorInfo = {
    name: creator?.name,
    handle: creator?.handle,
    avatarUrl: creator?.avatarUrl,
    // Add specific platform followers if available in dummy data
    instagramFollowers: creator?.socials?.includes('instagram') ? '154.0K' : undefined, // Example static data
    tiktokFollowers: creator?.socials?.includes('tiktok') ? '89.0K' : undefined, // Example static data
  };

  const hasStats = creator?.stats?.followers !== '—' || creator?.stats?.engagement !== '—' || creator?.stats?.reach !== '—';
  const displayTags = creator?.tags?.slice(0, 3) || [];
  const extraTagCount = (creator?.tags?.length || 0) - 3;

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 ${isSelected ? 'border-blue-500' : 'border-[#E0E0E0]'} p-4 flex flex-col h-full`}>
      {/* Top Row: Avatar + Name/Handle + Bookmark/Menu */}
      <div className="flex items-start gap-3">
        {/* Avatar with select */}
        <div className="relative w-14 h-14 flex-shrink-0">
          <div className={`w-full h-full rounded-full overflow-hidden border-2 ${isSelected ? 'border-blue-500' : 'border-purple-500'}`}>
            {avatarError || !creator?.avatarUrl ? (
              <div className={`w-full h-full rounded-full ${bgColor} flex items-center justify-center`}>
                <span className="text-white font-semibold text-base">{initials}</span>
              </div>
            ) : (
              <img src={proxyImage(creator?.avatarUrl)} alt={creator?.name} className="w-full h-full object-cover" onError={() => setAvatarError(true)} />
            )}
          </div>
          {onSelect && (
            <button
              onClick={onSelect}
              className={`absolute -bottom-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-white shadow-md border-2 transition-all z-10 ${isSelected ? 'border-blue-600' : 'border-gray-300 hover:border-blue-400'}`}
            >
              {isSelected ? (
                <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
              ) : (
                <div className="w-3 h-3 rounded border-2 border-gray-300 bg-white" />
              )}
            </button>
          )}
        </div>

        {/* Name, Handle, Socials */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h3 className="text-base font-bold text-gray-900 truncate">{creator?.name}</h3>
            <VerifiedIcon isVerified={creator?.isVerified} className="w-4 h-4 flex-shrink-0" />
          </div>
          <p className="text-sm text-gray-500 truncate">{creator?.handle}</p>
          {/* Inline social icons */}
          <div className="flex gap-1.5 mt-1.5">
            {creator?.socials?.length > 0 ? (
              creator.socials.map((platform) => {
                const Icon = platformIcons[platform];
                return Icon ? (
                  <div key={platform} className="p-1 rounded-full bg-brand-navy-dark text-white">
                    <Icon className="w-3 h-3" />
                  </div>
                ) : null;
              })
            ) : (
              <span className="text-xs text-gray-400">No platforms</span>
            )}
          </div>
        </div>

        {/* Bookmark + Menu */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <div onClick={(e) => e.stopPropagation()} className={`p-1 rounded-md cursor-pointer transition-colors ${creator?.isBookmarked ? 'bg-[rgba(99,102,241,0.1)]' : 'hover:bg-gray-100'}`}>
            <Bookmark className={`w-4 h-4 transition-colors ${creator?.isBookmarked ? 'text-brand-navy-dark fill-brand-navy-dark' : 'text-gray-400'}`} />
          </div>

          {menuItems && menuItems.length > 0 && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-30">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(false);
                          item.onClick();
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                          item.variant === 'danger'
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {Icon && <Icon className="w-4 h-4" />}
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className={`grid grid-cols-3 gap-2 text-center rounded-lg py-2.5 px-2 mt-3 ${hasStats ? 'bg-gray-50' : 'bg-gray-50/50'}`}>
        <div>
          <span className="text-sm font-bold text-brand-navy block">{creator?.stats?.followers || '—'}</span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wide">Followers</span>
        </div>
        <div className="border-x border-gray-200">
          <span className="text-sm font-bold text-brand-navy block">{creator?.stats?.engagement || '—'}</span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wide">Engagement</span>
        </div>
        <div>
          <span className="text-sm font-bold text-brand-navy block">{creator?.stats?.reach || '—'}</span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wide">True Reach</span>
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm text-gray-600 line-clamp-2 mt-3 min-h-[2.5rem]">
        {creator?.specialty || 'No bio available'}
      </p>

      {/* Tags — limited to 3 */}
      <div className="flex flex-wrap gap-1.5 mt-2 min-h-[1.5rem]">
        {displayTags.length > 0 ? (
          <>
            {displayTags.map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-0.5 rounded-full bg-[#F8F9FD] text-[#FF385C] font-medium">
                {tag}
              </span>
            ))}
            {extraTagCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                +{extraTagCount}
              </span>
            )}
          </>
        ) : (
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-50 text-gray-400 font-medium">
            No topics
          </span>
        )}
      </div>

      {/* Actions — pushed to bottom */}
      <div className="flex w-full gap-2 mt-auto pt-3 overflow-hidden">
        <button
          disabled
          onClick={(e) => { e.stopPropagation(); }}
          className="flex-none flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-[#E0E0E0] rounded-lg text-xs text-gray-400 bg-gray-50 cursor-not-allowed opacity-60"
          title="Chat coming soon"
        >
          <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">Chat</span>
        </button>
        <button
          disabled={!onAddToCampaign || isInviting}
          onClick={(e) => {
            e.stopPropagation();
            if (onAddToCampaign && creator?.id) {
              onAddToCampaign(creator.id);
            }
          }}
          className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 px-2 py-2 border-2 rounded-lg text-xs transition-colors ${
            onAddToCampaign
              ? 'border-brand-navy-dark bg-brand-navy-dark text-white hover:bg-brand-navy'
              : 'border-[#E0E0E0] text-gray-400 bg-gray-50 cursor-not-allowed opacity-60'
          }`}
          title={onAddToCampaign ? "Add to Campaign" : "Add to Campaign coming soon"}
        >
          {isInviting ? (
            <Loader2 className="w-3.5 h-3.5 flex-shrink-0 animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5 flex-shrink-0" />
          )}
          <span className="truncate">{isInviting ? "Inviting..." : "Add to Campaign"}</span>
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