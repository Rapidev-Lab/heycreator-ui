'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { mapApiCampaignExtended } from '@/lib/hooks/useMarketplace';
import type { MarketplaceCampaignExtended } from '@/types/marketplace';

const CACHE_KEY = 'saved_campaigns_v1';
const CACHE_KEY_EXPANDED = 'saved_campaigns_expanded_v1';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedIds(): Set<string> | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return new Set(data as string[]);
  } catch {
    return null;
  }
}

function setCachedIds(ids: Set<string>) {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data: Array.from(ids), timestamp: Date.now() }),
    );
  } catch {
    // sessionStorage may be full or unavailable
  }
}

function getCachedExpanded(): MarketplaceCampaignExtended[] | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY_EXPANDED);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY_EXPANDED);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCachedExpanded(campaigns: MarketplaceCampaignExtended[]) {
  try {
    sessionStorage.setItem(
      CACHE_KEY_EXPANDED,
      JSON.stringify({ data: campaigns, timestamp: Date.now() }),
    );
  } catch {
    // sessionStorage may be full or unavailable
  }
}

/**
 * Fetch saved campaign IDs + optionally full campaign data.
 * Pass `expand: true` to get `savedCampaigns` (full data) — used by SavedCampaignsTab
 * to avoid loading all marketplace campaigns.
 */
export function useSavedCampaigns(options?: { expand?: boolean }) {
  const expand = options?.expand ?? false;
  const { firebaseUser } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<string>>(() => getCachedIds() || new Set());
  const [savedCampaigns, setSavedCampaigns] = useState<MarketplaceCampaignExtended[]>(
    () => (expand ? getCachedExpanded() || [] : [])
  );
  const [isLoading, setIsLoading] = useState(false);
  const fetchedRef = useRef(false);
  const togglingRef = useRef<Set<string>>(new Set());

  const fetchSavedIds = useCallback(async () => {
    if (!firebaseUser) return;

    // Show cached data immediately
    const cachedIds = getCachedIds();
    const cachedExpanded = expand ? getCachedExpanded() : null;
    if (cachedIds) {
      setSavedIds(cachedIds);
      if (cachedExpanded) setSavedCampaigns(cachedExpanded);
      if (fetchedRef.current) return; // Already fetched fresh data
    }

    if (!fetchedRef.current) {
      setIsLoading(true);
    }

    try {
      const token = await firebaseUser.getIdToken();
      const url = expand
        ? '/api/influencers/campaigns/saved?expand=true'
        : '/api/influencers/campaigns/saved';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.savedCampaignIds) {
          const ids = new Set(data.data.savedCampaignIds as string[]);
          setSavedIds(ids);
          setCachedIds(ids);

          if (expand && data.data.campaigns) {
            const mapped = data.data.campaigns.map(mapApiCampaignExtended);
            setSavedCampaigns(mapped);
            setCachedExpanded(mapped);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching saved campaigns:', err);
    } finally {
      setIsLoading(false);
      fetchedRef.current = true;
    }
  }, [firebaseUser, expand]);

  useEffect(() => {
    fetchSavedIds();
  }, [fetchSavedIds]);

  const toggleSave = useCallback(
    async (campaignId: string) => {
      if (!firebaseUser) return;
      if (togglingRef.current.has(campaignId)) return; // Prevent double-click
      togglingRef.current.add(campaignId);

      // Optimistic update
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (next.has(campaignId)) {
          next.delete(campaignId);
        } else {
          next.add(campaignId);
        }
        setCachedIds(next);
        return next;
      });

      try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch('/api/influencers/campaigns/saved', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ campaignId }),
        });

        if (!res.ok) {
          // Revert optimistic update on failure
          setSavedIds((prev) => {
            const reverted = new Set(prev);
            if (reverted.has(campaignId)) {
              reverted.delete(campaignId);
            } else {
              reverted.add(campaignId);
            }
            setCachedIds(reverted);
            return reverted;
          });
        }
      } catch (err) {
        console.error('Error toggling save:', err);
        // Revert optimistic update
        setSavedIds((prev) => {
          const reverted = new Set(prev);
          if (reverted.has(campaignId)) {
            reverted.delete(campaignId);
          } else {
            reverted.add(campaignId);
          }
          setCachedIds(reverted);
          return reverted;
        });
      } finally {
        togglingRef.current.delete(campaignId);
      }
    },
    [firebaseUser],
  );

  const isSaved = useCallback(
    (campaignId: string) => savedIds.has(campaignId),
    [savedIds],
  );

  return { savedIds, savedCampaigns, isLoading, isSaved, toggleSave };
}
