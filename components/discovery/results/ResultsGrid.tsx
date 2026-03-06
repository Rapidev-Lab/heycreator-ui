'use client';

import { useState } from 'react';
import { InfluencerProfile } from '@/types/discovery';
import RecommendedCreatorCard, { type CardMenuItem } from '@/components/brands/discover/RecommendedCreatorCard';
import { formatFollowerCount } from '@/lib/types/discovery-filters';
import { CreatorCardSkeleton } from '@/components/ui/skeletons';

type ViewMode = 'grid' | 'list';

interface ResultsGridProps {
  influencers: InfluencerProfile[];
  onAdd?: (id: string) => void;
  onContact?: (id: string) => void;
  onTag?: (id: string) => void;
  onCardClick?: (id: string) => void;
  isLoading?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  viewMode?: ViewMode;
  getMenuItems?: (influencer: InfluencerProfile) => CardMenuItem[];
}

// Helper function to map InfluencerProfile to RecommendedCreatorCard format
const mapToCreatorCard = (influencer: InfluencerProfile) => {
  // Pass raw URL — RecommendedCreatorCard calls proxyImage() internally
  const avatarUrl = influencer.profile_image_url || '';

  // trueReach is a percentage set by the discover API (present at runtime via ResultsProfile cast)
  const trueReachPct = (influencer as any).trueReach as number | undefined;
  const engagementRate = influencer.engagement_rate || 0;



  return {
    avatarUrl,
    name: influencer.name,
    handle: '@' + influencer.username,
    isVerified: influencer.verification_badges?.some(b => b.verified) || false,
    isBookmarked: false,
    stats: {
      followers: influencer.follower_count > 0 ? formatFollowerCount(influencer.follower_count, influencer.platforms?.[0]) : '—',
      engagement: engagementRate > 0 ? engagementRate.toFixed(1) + '%' : '—',
      reach: trueReachPct && trueReachPct > 0 ? trueReachPct.toFixed(1) + '%' : '—',
    },
    socials: (influencer.platforms as any) || ['instagram'],
    specialty: influencer.bio || '',
    tags: influencer.topics || []
  };
};

export default function ResultsGrid({
  influencers,
  onAdd,
  onContact,
  onTag,
  onCardClick,
  isLoading = false,
  selectedIds = [],
  onSelectionChange,
  viewMode = 'grid',
  getMenuItems
}: ResultsGridProps) {
  if (isLoading) {
    return (
      <div className={viewMode === 'grid'
        ? "grid grid-cols-1 md:grid-cols-2 gap-6"
        : "flex flex-col gap-4"
      }>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both`
            }}
          >
            <CreatorCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (influencers.length === 0) {
    return (
      <div className="text-center py-12 px-4 animate-fadeIn">
        <p className="text-gray-500 text-base sm:text-lg">No influencers found</p>
        <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div className={viewMode === 'grid'
      ? "grid grid-cols-1 md:grid-cols-2 gap-6"
      : "flex flex-col gap-4"
    }>
      {influencers.map((influencer, index) => {
        const isSelected = selectedIds.includes(influencer.id);
        return (
          <div
            key={influencer.id}
            style={{
              animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
            }}
            onClick={() => onCardClick?.(influencer.id)}
            className="cursor-pointer transition-transform hover:scale-[1.02]"
          >
            <RecommendedCreatorCard
              creator={mapToCreatorCard(influencer)}
              isSelected={isSelected}
              onSelect={onSelectionChange ? (e: React.MouseEvent) => {
                e.stopPropagation();
                const newIds = isSelected
                  ? selectedIds.filter(id => id !== influencer.id)
                  : [...selectedIds, influencer.id];
                onSelectionChange(newIds);
              } : undefined}
              menuItems={getMenuItems?.(influencer)}
            />
          </div>
        );
      })}
    </div>
  );
}
