export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'negotiating' | 'invited' | 'published';

export type SocialPlatform = 'instagram' | 'youtube' | 'tiktok' | 'twitter';

export interface SocialStats {
  platform: SocialPlatform;
  followers: number;
}

export interface InfluencerBid {
  id: string;
  influencerId: string;
  influencerName: string;
  avatar: string;
  socialStats: SocialStats[];
  bidAmount: number;
  status: BidStatus;
  comments: string[];
  submittedAt: string;
  completedDeliverables?: number;
  totalDeliverables?: number;
  performance?: {
    reach?: string;
    engagement?: string;
    trueReach?: string;
  };
}

export type BidTab = 'bids' | 'invites' | 'approved' | 'published' | 'transfers';