import type { BiddingStatus } from '@/components/ui/MarketPlaceCampaignCard';

export interface DeliverableBadge {
  platform: string;
  contentType: string;
  quantity: number;
}

export interface MarketplaceCampaignExtended {
  id: string;
  brandName: string;
  brandLogo: string;
  title: string;
  description: string;
  category: string;
  categories: string[];
  platforms: string[];
  budgetMin: number;
  budgetMax: number;
  currency: string;
  daysRemaining: number;
  applicationDeadlineDate: string;
  status: BiddingStatus;
  productImageUrl?: string;
  deliverables: DeliverableBadge[];
  qualifies?: boolean;
  hasApplied?: boolean;
  audience?: {
    minFollowers?: number;
    minEngagements?: number;
    targetLocation?: string;
    gender?: string;
  };
  brandVerified?: boolean;
  // Searchable rich fields
  objectives?: string[];
  hashtags?: string[];
  mentions?: string[];
  location?: string;
  productName?: string;
  dos?: string[];
  donts?: string[];
  // ISO date string for client-side "latest" sorting
  createdAt?: string;
  // Relevance score (0-100) computed server-side against influencer profile
  relevanceScore?: number;
  // Pre-computed search blob for fast client-side matching
  _searchBlob?: string;
  // Invitation metadata (only present for invited campaigns)
  invitationId?: string;
  invitationStatus?: 'sent' | 'accepted' | 'declined';
  invitationMessage?: string;
}

export type MarketplaceTab = 'all' | 'invites' | 'recommended' | 'saved';
