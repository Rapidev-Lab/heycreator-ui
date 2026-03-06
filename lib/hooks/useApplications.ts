'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import type { ApplicationStatus, CampaignApplicationData } from '@/components/ui/CampaignApplicationCard';

export type FilterStatus = 'all' | 'pending' | 'accepted' | 'declined';

interface ApplicationStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
}

// ── sessionStorage cache (stale-while-revalidate) ──
const CACHE_KEY = 'influencer_applications_v1';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedApplications {
  data: CampaignApplicationData[];
  stats: ApplicationStats;
  timestamp: number;
}

function getCachedApplications(): CachedApplications | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const parsed: CachedApplications = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function setCachedApplications(data: CampaignApplicationData[], stats: ApplicationStats) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, stats, timestamp: Date.now() }));
  } catch {
    // sessionStorage may be full or unavailable
  }
}

function mapApiApplication(app: any): CampaignApplicationData {
  const campaign = app.campaign || {};
  const budget = campaign.budget || {};
  const budgetMin = budget.compensationModel === 'range' ? budget.minRangeAmount : budget.fixedAmount;
  const budgetMax = budget.compensationModel === 'range' ? budget.maxRangeAmount : budget.fixedAmount;

  let cardStatus: ApplicationStatus = 'pending';
  if (app.status === 'accepted') cardStatus = 'accepted';
  else if (app.status === 'rejected') cardStatus = 'declined';
  else if (app.status === 'withdrawn') cardStatus = 'expired';

  const startDate = campaign.timeline?.campaignStart
    ? new Date(campaign.timeline.campaignStart).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'TBD';
  const endDate = campaign.timeline?.campaignEnd
    ? new Date(campaign.timeline.campaignEnd).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'TBD';

  const deadlineStr = budget.applicationDeadline;
  let daysRemaining = 0;
  if (deadlineStr) {
    const diff = Math.ceil((new Date(deadlineStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    daysRemaining = Math.max(0, diff);
  }

  const deadlineDateFormatted = deadlineStr
    ? new Date(deadlineStr).toLocaleDateString('en-ZA', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : 'TBD';

  return {
    id: app.id,
    campaignId: campaign.id || app.campaignId || '',
    title: campaign.title || 'Unknown Campaign',
    brandName: campaign.brandName || 'Unknown Brand',
    brandLogo: campaign.brandLogo || '',
    category: (campaign.categories || [])[0] || 'Campaign',
    categories: campaign.categories || [],
    tags: (campaign.categories || []).slice(1, 3),
    yourBid: app.proposedRate || 0,
    budgetMin: budgetMin || 0,
    budgetMax: budgetMax || 0,
    currency: budget.currency || 'ZAR',
    status: cardStatus,
    daysRemaining,
    startDate,
    endDate,
    pitchMessage: app.pitchMessage || '',
    productImageUrl: campaign.productImageUrl || '',
    appliedAt: app.appliedAt || '',
    reviewedAt: app.reviewedAt || '',
    applicationDeadlineDate: deadlineDateFormatted,
    campaignEndDate: campaign.timeline?.campaignEnd || '',
    platforms: campaign.platforms || [],
    description: campaign.description || '',
    campaignObjectives: campaign.campaignObjectives || [],
    deliverables: campaign.deliverables || [],
    campaignStatus: campaign.status || 'ACTIVE',
  };
}

export function useApplications() {
  const { firebaseUser } = useAuth();
  const searchParams = useSearchParams();

  // Initialize from cache synchronously — no loading flash on revisit
  const initialCache = useRef(getCachedApplications());
  const [applications, setApplications] = useState<CampaignApplicationData[]>(initialCache.current?.data || []);
  const [stats, setStats] = useState<ApplicationStats>(initialCache.current?.stats || { total: 0, pending: 0, accepted: 0, rejected: 0 });
  const [isLoading, setIsLoading] = useState(!initialCache.current);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<string>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const fetchInFlightRef = useRef(false);

  const fetchApplications = useCallback(async (skipCache = false) => {
    if (!firebaseUser) return;
    if (fetchInFlightRef.current) return;

    // Stale-while-revalidate: show cached data, refresh in background
    if (!skipCache) {
      const cached = getCachedApplications();
      if (cached) {
        setApplications(cached.data);
        setStats(cached.stats);
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }
    } else {
      setIsLoading(true);
    }

    setError(null);
    fetchInFlightRef.current = true;

    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch('/api/influencers/applications?limit=50', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await res.json();
      if (data.success && data.data) {
        const mapped = data.data.applications.map(mapApiApplication);
        const apiStats = data.data.stats || { total: 0, pending: 0, accepted: 0, rejected: 0 };
        setApplications(mapped);
        setStats(apiStats);
        setCachedApplications(mapped, apiStats);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      // Only show error if we had no cached data
      if (!getCachedApplications()) {
        setError('Failed to load applications. Please try again.');
      }
    } finally {
      setIsLoading(false);
      fetchInFlightRef.current = false;
    }
  }, [firebaseUser]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (statusFilter !== 'all') {
        if (statusFilter === 'declined') {
          if (app.status !== 'declined' && app.status !== 'expired') return false;
        } else if (app.status !== statusFilter) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return app.title.toLowerCase().includes(q) || app.brandName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [applications, statusFilter, searchQuery]);

  const sortedApplications = useMemo(() => {
    return [...filteredApplications].sort((a, b) => {
      const dateA = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
      const dateB = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
      if (sortBy === 'oldest') return dateA - dateB;
      return dateB - dateA;
    });
  }, [filteredApplications, sortBy]);

  const successRate = stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0;

  return {
    applications,
    filteredApplications: sortedApplications,
    stats,
    successRate,
    isLoading,
    error,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    showSuccess,
    setShowSuccess,
    refetch: () => fetchApplications(true),
  };
}

/** Clear the applications cache (call after applying to a new campaign) */
export function clearApplicationsCache() {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {}
}
