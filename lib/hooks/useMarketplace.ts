'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import type { BiddingStatus } from '@/components/ui/MarketPlaceCampaignCard';
import type { MarketplaceCampaignExtended, MarketplaceTab } from '@/types/marketplace';

const CACHE_KEY = 'marketplace_campaigns_v3';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCachedCampaigns(): MarketplaceCampaignExtended[] | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCachedCampaigns(data: MarketplaceCampaignExtended[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // sessionStorage may be full or unavailable
  }
}

function formatDeadlineDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'TBD';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'TBD';
  return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function mapApiCampaignExtended(c: any): MarketplaceCampaignExtended {
  const budget = c.budget || {};
  let budgetMin = 0;
  let budgetMax = 0;

  if (budget.compensationModel === 'range') {
    budgetMin = budget.minRangeAmount || 0;
    budgetMax = budget.maxRangeAmount || 0;
  } else {
    budgetMin = budget.fixedAmount || 0;
    budgetMax = budget.fixedAmount || 0;
  }

  // Calculate days remaining from application deadline
  let daysRemaining = 0;
  const deadline = c.timeline?.applicationDeadline || budget.applicationDeadline;
  if (deadline) {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diff = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    daysRemaining = isNaN(diff) ? 0 : Math.max(0, diff);
  }

  // Determine bidding status
  let status: BiddingStatus = 'open';
  if (daysRemaining <= 0) status = 'closed';
  else if (daysRemaining <= 3) status = 'ending-soon';

  // Extract platforms and deliverables from tasks
  const platforms: string[] = [];
  const deliverables: MarketplaceCampaignExtended['deliverables'] = [];
  const rawDeliverables = c.tasks?.requiredDeliverables || [];
  for (const d of rawDeliverables) {
    if (d.platform && !platforms.includes(d.platform)) {
      platforms.push(d.platform.charAt(0).toUpperCase() + d.platform.slice(1));
    }
    deliverables.push({
      platform: d.platform || 'instagram',
      contentType: d.contentType || 'post',
      quantity: d.quantity || 1,
    });
  }
  if (platforms.length === 0) platforms.push('Instagram');

  const brandName = c.brandInfo?.name || 'Unknown Brand';
  const categories = c.categories || c.campaignCategories || [];
  const productImageUrl = c.product?.productImagesUrls?.[0] || undefined;

  // Extract searchable rich fields from API response
  const objectives: string[] = c.objectives || [];
  const hashtags: string[] = c.tasks?.metaData?.requiredHashTags || [];
  const mentions: string[] = c.tasks?.metaData?.mentions_or_tags || [];
  const location: string = c.audience?.targetLocation || '';
  const productName: string = c.product?.productName || '';
  const dos: string[] = c.tasks?.dos || [];
  const donts: string[] = c.tasks?.donts || [];

  // Build a pre-computed lowercase search blob for fast client-side matching
  const _searchBlob = [
    c.title || '',
    c.description || '',
    brandName,
    ...categories,
    ...platforms,
    ...objectives,
    ...hashtags,
    ...mentions,
    location,
    productName,
    ...dos,
    ...donts,
    ...(c.tasks?.requiredDeliverables || []).flatMap((d: any) => [
      d.platform || '', d.contentType || '', d.description || '',
    ]),
  ].join(' ').toLowerCase();

  return {
    id: c.id,
    brandName,
    brandLogo: c.brandInfo?.logo || '',
    title: c.title || '',
    description: c.description || '',
    category: c.productCategory || categories[0] || '',
    categories,
    platforms,
    budgetMin,
    budgetMax,
    currency: budget.currency || 'ZAR',
    daysRemaining,
    applicationDeadlineDate: formatDeadlineDate(deadline),
    status,
    productImageUrl,
    deliverables,
    qualifies: c.qualifies,
    hasApplied: c.hasApplied,
    audience: c.audience || undefined,
    brandVerified: c.brandInfo?.verified || false,
    objectives,
    hashtags,
    mentions,
    location,
    productName,
    dos,
    donts,
    createdAt: c.createdAt || undefined,
    relevanceScore: c.relevanceScore ?? undefined,
    _searchBlob,
  };
}

export function useMarketplace() {
  const { firebaseUser } = useAuth();
  // Initialize from cache synchronously — no loading flash on revisit
  const [campaigns, setCampaigns] = useState<MarketplaceCampaignExtended[]>(() => getCachedCampaigns() || []);
  const [isLoading, setIsLoading] = useState(() => getCachedCampaigns() === null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<MarketplaceTab>('all');
  const fetchInFlightRef = useRef(false);

  const fetchCampaigns = useCallback(async (skipCache = false) => {
    if (!firebaseUser) return;
    if (fetchInFlightRef.current) return;

    // Stale-while-revalidate: show cached data immediately, then refresh silently
    const cached = !skipCache && !searchQuery.trim() ? getCachedCampaigns() : null;
    if (cached) {
      setCampaigns(cached);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    setError(null);
    fetchInFlightRef.current = true;

    try {
      const token = await firebaseUser.getIdToken();
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      params.set('sortBy', 'latest');
      params.set('limit', '50');

      const res = await fetch(`/api/influencers/campaigns/marketplace?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch campaigns');
      }

      const data = await res.json();
      if (data.success && data.data?.campaigns) {
        const mapped = data.data.campaigns.map(mapApiCampaignExtended);
        setCampaigns(mapped);
        if (!searchQuery.trim()) {
          setCachedCampaigns(mapped);
        }
      } else {
        if (!cached) setCampaigns([]);
      }
    } catch (err) {
      console.error('Error fetching marketplace campaigns:', err);
      // Only show error if we had no cached data to fall back on
      if (!cached) {
        setError('Failed to load campaigns. Please try again.');
        setCampaigns([]);
      }
    } finally {
      setIsLoading(false);
      fetchInFlightRef.current = false;
    }
  }, [firebaseUser, searchQuery]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Client-side search filter — uses pre-computed _searchBlob for fast multi-word matching
  const filteredCampaigns = useMemo(() => {
    if (!searchQuery.trim()) return campaigns;
    const words = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    return campaigns.filter(campaign => {
      const blob = campaign._searchBlob || '';
      return words.every(word => blob.includes(word));
    });
  }, [campaigns, searchQuery]);

  // Recommended campaigns — only campaigns with a meaningful relevance score (>= 30),
  // sorted by relevanceScore descending. This ensures "Recommended for me" is a
  // distinct, profile-matched subset — not just the same list re-sorted.
  const recommendedCampaigns = useMemo(() => {
    const MIN_RELEVANCE = 30;
    return [...filteredCampaigns]
      .filter((c) => (c.relevanceScore ?? 0) >= MIN_RELEVANCE)
      .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));
  }, [filteredCampaigns]);

  return {
    campaigns,
    filteredCampaigns,
    recommendedCampaigns,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    refetch: () => fetchCampaigns(true),
  };
}
