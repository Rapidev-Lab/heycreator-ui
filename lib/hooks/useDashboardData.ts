'use client';

import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/lib/firebase/auth-context';
import type { Campaign, DashboardStats } from '@/types/campaign';

export interface ActionableNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  campaignId?: string | null;
  applicationId?: string | null;
  actionUrl?: string | null;
  read: boolean;
  createdAt: string;
}

/** Notification types that require brand action */
const ACTIONABLE_TYPES = [
  'deliverable_submitted',
  'application_received',
  'invitation_response',
];

interface CampaignsResponse {
  success: boolean;
  data: { campaigns: Campaign[] };
}

interface StatsResponse {
  success: boolean;
  stats: DashboardStats;
  pendingActions: { contentApprovals: number; newApplications: number; paymentsDue: number };
}

interface ApplicationsResponse {
  success: boolean;
  applications: any[];
}

interface NotificationsResponse {
  success: boolean;
  data: { notifications: ActionableNotification[]; unreadCount: number };
}

interface RecommendedResponse {
  success: boolean;
  results: any[];
}

const SWR_CONFIG = {
  revalidateOnFocus: false,
  dedupingInterval: 60_000, // 60s
  errorRetryCount: 2,
};

const CREATORS_SWR_CONFIG = {
  ...SWR_CONFIG,
  dedupingInterval: 120_000, // 2min
};

export function useDashboardData() {
  const { firebaseUser } = useAuth();

  const fetcher = useCallback(
    async (url: string) => {
      if (!firebaseUser) throw new Error('Not authenticated');
      const token = await firebaseUser.getIdToken();
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      return res.json();
    },
    [firebaseUser]
  );

  // Only fetch when firebaseUser exists
  const key = firebaseUser ? true : null;

  const {
    data: campaignsData,
    isLoading: campaignsLoading,
    isValidating: campaignsValidating,
  } = useSWR<CampaignsResponse>(
    key ? '/api/campaigns' : null,
    fetcher,
    SWR_CONFIG
  );

  const {
    data: statsData,
    isLoading: statsLoading,
    isValidating: statsValidating,
  } = useSWR<StatsResponse>(
    key ? '/api/dashboard/stats' : null,
    fetcher,
    SWR_CONFIG
  );

  const {
    data: applicationsData,
    isLoading: applicationsLoading,
    isValidating: applicationsValidating,
  } = useSWR<ApplicationsResponse>(
    key ? '/api/applications?status=PENDING' : null,
    fetcher,
    SWR_CONFIG
  );

  const {
    data: creatorsRawData,
    isLoading: creatorsLoading,
    mutate: mutateCreators,
  } = useSWR<RecommendedResponse>(
    key ? '/api/dashboard/recommended?limit=3' : null,
    fetcher,
    CREATORS_SWR_CONFIG
  );

  const {
    data: notificationsData,
    mutate: mutateNotifications,
  } = useSWR<NotificationsResponse>(
    key ? '/api/notifications?limit=20' : null,
    fetcher,
    SWR_CONFIG
  );

  // Derived data
  const campaigns = campaignsData?.data?.campaigns ?? [];
  const dashboardStats = statsData?.stats ?? null;
  const pendingActionsCount = statsData?.pendingActions ?? {
    contentApprovals: 0,
    newApplications: 0,
    paymentsDue: 0,
  };
  const pendingApplications = applicationsData?.applications ?? [];

  // Filter to unread actionable notifications only
  const actionableNotifications = useMemo(() => {
    const all = notificationsData?.data?.notifications ?? [];
    return all.filter(
      (n) => !n.read && ACTIONABLE_TYPES.includes(n.type)
    );
  }, [notificationsData]);

  // coreLoading = true only on first mount with no cached data
  const coreLoading = campaignsLoading || statsLoading || applicationsLoading;
  const coreValidating = campaignsValidating || statsValidating || applicationsValidating;

  return {
    campaigns,
    dashboardStats,
    pendingActionsCount,
    pendingApplications,
    actionableNotifications,
    mutateNotifications,
    creatorsRawData,
    coreLoading,
    coreValidating,
    creatorsLoading,
    mutateCreators,
  };
}
