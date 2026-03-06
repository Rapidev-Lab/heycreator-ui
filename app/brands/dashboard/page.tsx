"use client";

import { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  TrendingUp,
  Users,
  Target,
  DollarSign,
  ArrowRight,
  CheckCircle,
  Megaphone,
  MessageSquare,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { Campaign, CampaignStatus } from "@/types/campaign";
import {
  StatsCard,
  CampaignListCard,
  PendingActionCard,
} from "@/components/campaigns";
import RecommendedCreatorCard from "@/components/brands/discover/RecommendedCreatorCard";
import { formatFollowerCount } from "@/lib/types/discovery-filters";
import CampaignSelectionModal from "@/components/campaigns/CampaignSelectionModal";
import ProfileCompletionGuard from "@/components/auth/ProfileCompletionGuard";
import EmailVerificationGuard from "@/components/auth/EmailVerificationGuard";
import { useAuth } from "@/lib/firebase/auth-context";
import { useAuthFetch } from "@/lib/hooks/useAuthFetch";
import {
  useDashboardData,
  type ActionableNotification,
} from "@/lib/hooks/useDashboardData";
import PageLoader from "@/components/ui/PageLoader";
import { StatsCardSkeleton, CreatorCardSkeleton } from "@/components/ui/skeletons";

// ─── Skeleton Components ────────────────────────────────────────────
function CampaignListCardSkeleton() {
  return (
    <div className="px-8 py-5 border-b border-gray-50 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 bg-gray-200 rounded w-48" />
        <div className="h-5 bg-gray-100 rounded-full w-16" />
      </div>
      <div className="flex gap-6 mb-3">
        <div className="h-3 bg-gray-100 rounded w-24" />
        <div className="h-3 bg-gray-100 rounded w-20" />
        <div className="h-3 bg-gray-100 rounded w-28" />
      </div>
      <div className="h-2 bg-gray-100 rounded-full w-full" />
    </div>
  );
}

function PendingActionCardSkeleton() {
  return (
    <div className="p-4 border border-gray-100 shadow-sm rounded-xl animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-full mb-1" />
      <div className="h-3 bg-gray-100 rounded w-2/3 mb-3" />
      <div className="flex items-center justify-between">
        <div className="h-3 bg-gray-100 rounded w-16" />
        <div className="h-7 bg-gray-200 rounded w-16" />
      </div>
    </div>
  );
}

// ─── Notification Helpers ────────────────────────────────────────────
function getActionIcon(type: string) {
  switch (type) {
    case "deliverable_submitted":
      return <CheckCircle className="w-4 h-4 text-white" />;
    case "application_received":
      return <Megaphone className="w-4 h-4 text-white" />;
    case "invitation_response":
      return <MessageSquare className="w-4 h-4 text-white" />;
    default:
      return <Bell className="w-4 h-4 text-white" />;
  }
}

function getActionIconBg(type: string) {
  switch (type) {
    case "deliverable_submitted":
      return "bg-blue-500";
    case "application_received":
      return "bg-red-500";
    case "invitation_response":
      return "bg-green-500";
    default:
      return "bg-brand-navy";
  }
}

function getActionLabel(type: string) {
  switch (type) {
    case "deliverable_submitted":
      return "Review Content";
    case "application_received":
      return "Review Application";
    case "invitation_response":
      return "View Response";
    default:
      return "View Details";
  }
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
  });
}

// ─── Main Page ──────────────────────────────────────────────────────
function BrandDashboardPageContent() {
  const router = useRouter();
  const { user, firebaseUser } = useAuth();
  const { patch } = useAuthFetch();

  // SWR-powered data (cached across navigations)
  const {
    campaigns,
    dashboardStats,
    pendingActionsCount,
    pendingApplications,
    actionableNotifications,
    mutateNotifications,
    creatorsRawData,
    coreLoading,
    creatorsLoading,
  } = useDashboardData();

  // Handle clicking an actionable notification — mark as read + navigate
  const handleNotificationAction = useCallback(
    async (notification: ActionableNotification) => {
      // Mark as read via API
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          await fetch(`/api/notifications/${notification.id}`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
          });
          mutateNotifications();
        } catch (err) {
          console.error("Failed to mark notification as read:", err);
        }
      }
      // Navigate to action URL
      if (notification.actionUrl) {
        router.push(notification.actionUrl);
      }
    },
    [firebaseUser, mutateNotifications, router],
  );

  // Map raw creator data into display format
  const recommendedCreators = useMemo(() => {
    console.log("dashboard data:", dashboardStats);
    if (!creatorsRawData?.results) return [];
    const mapped = creatorsRawData.results.map((result: any) => {
      const engagementRate = result.rawData?.engagementRate || 0;
      const trueReachPct = result.rawData?.trueReachPercentage || 0;

      return {
        id: result.id.toString(),
        // Top-level metadata for navigation
        platform: result.platform || "instagram",
        username: result.username || "",
        avatarUrl: result.avatar_url || "",
        followerCount: result.follower_count || 0,

        // THIS MATCHES YOUR INTERFACE 'creator' PROP
        creator: {
          avatarUrl: result.avatar_url || "",
          name: result.display_name || result.username || "Unknown",
          handle: result.username ? `@${result.username}` : "",
          isVerified: result.verified || false,
          isBookmarked: result.starred || false,
          stats: {
            followers: formatFollowerCount(
              result.follower_count || 0,
              result.platform || "instagram",
            ),
            engagement:
              engagementRate > 0 ? `${engagementRate.toFixed(1)}%` : "—",
            reach: trueReachPct > 0 ? `${trueReachPct.toFixed(1)}%` : "—",
          },
          socials: [result.platform || "instagram"],
          specialty: result.bio || "No bio available",
          tags: result.categories || result.rawData?.categories || [],
        },
      };
    });

    // Deduplicate by platform:username
    const seen = new Set<string>();
    const unique = mapped.filter((item: any) => {
      const key = `${item.platform}:${(item.username || "").toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return unique.sort((a: any, b: any) => b.followerCount - a.followerCount);
  }, [creatorsRawData]);

  // Local bookmark state for optimistic UI (initialized from SWR data)
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    const ids = new Set<string>(
      recommendedCreators
        .filter((c: any) => c.isBookmarked)
        .map((c: any) => c.id),
    );
    setBookmarkedIds(ids);
  }, [recommendedCreators]);

  // Add to Campaign modal state
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<any>(null);
  const [invitationLoading, setInvitationLoading] = useState(false);

  async function toggleBookmark(profileId: string) {
    // Optimistic update
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(profileId)) next.delete(profileId);
      else next.add(profileId);
      return next;
    });
    try {
      await patch(`/api/profiles/${profileId}/star`, {});
    } catch (err) {
      // Revert on error
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (next.has(profileId)) next.delete(profileId);
        else next.add(profileId);
        return next;
      });
      console.error("Error toggling bookmark:", err);
    }
  }

  function handleAddToCampaign(creator: any, e?: React.MouseEvent) {
    e?.stopPropagation(); // Prevent navigation to profile
    setSelectedCreator({
      id: creator.id,
      name: creator.name,
    });
    setShowCampaignModal(true);
  }

  async function handleSendInvitation(campaignId: string, message: string) {
    if (!selectedCreator || !firebaseUser) return;

    setInvitationLoading(true);
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/campaigns/${campaignId}/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          influencerIds: [selectedCreator.id],
          message: message || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowCampaignModal(false);
        setSelectedCreator(null);
      } else {
        console.error("Failed to send invitation:", data.error);
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
    } finally {
      setInvitationLoading(false);
    }
  }

  function calculateCampaignProgress(campaign: Campaign): number {
    if (campaign.status === CampaignStatus.DRAFT) return 0;
    if (campaign.status === CampaignStatus.COMPLETED) return 100;

    let progress = 0;

    if (campaign.status === CampaignStatus.PUBLISHED) progress += 10;
    else if (campaign.status === CampaignStatus.ACTIVE) progress += 20;
    else if (campaign.status === CampaignStatus.IN_PROGRESS) progress += 30;

    const applications = campaign.stats?.applications || 0;
    if (applications > 0) progress += Math.min(20, applications * 5);

    if (campaign.campaignStart && campaign.campaignEnd) {
      try {
        const now = new Date();
        const startDate =
          typeof campaign.campaignStart === "object" &&
          "toDate" in campaign.campaignStart
            ? (campaign.campaignStart as any).toDate()
            : new Date(campaign.campaignStart as any);
        const endDate =
          typeof campaign.campaignEnd === "object" &&
          "toDate" in campaign.campaignEnd
            ? (campaign.campaignEnd as any).toDate()
            : new Date(campaign.campaignEnd as any);

        if (now >= startDate && now <= endDate) {
          const totalDuration = endDate.getTime() - startDate.getTime();
          const elapsed = now.getTime() - startDate.getTime();
          progress += Math.floor((elapsed / totalDuration) * 50);
        } else if (now > endDate) {
          progress += 50;
        }
      } catch {
        progress += 25;
      }
    }

    return Math.min(99, Math.max(0, Math.floor(progress)));
  }

  function isTrendPositive(trend: string): boolean {
    return trend.startsWith("+");
  }

  return (
    <ProfileCompletionGuard showLoading={false}>
      <EmailVerificationGuard>
        {/* White header area */}
        <div className="bg-white px-4 sm:px-6 lg:px-8 pt-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-brand-navy">Overview</h1>
              <p className="text-sm text-gray-500 mt-1">
                Welcome back, here&apos;s what&apos;s happening with your
                campaigns.
              </p>
            </div>

            <button
              onClick={() => router.push("/brands/campaigns/create")}
              className="hidden sm:inline-flex items-center justify-center gap-3 px-6 py-3 bg-white text-[#555555] border-[#E0E0E0] border-2 rounded-[12px] hover:bg-gray-50 transition-all font-bold text-sm shadow-sm"
            >
              <div className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#666666]">
                <Plus size={10} strokeWidth={4} color="#666666" />
              </div>
              New Campaign
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="min-h-screen bg-[#F8F9FD] px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-[1440px] mx-auto">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {coreLoading ? (
                <>
                  <StatsCardSkeleton />
                  <StatsCardSkeleton />
                  <StatsCardSkeleton />
                  <StatsCardSkeleton />
                </>
              ) : (
                <>
                  <StatsCard
                    icon={<Users className="w-4 h-4 text-blue-700" />}
                    title="ACTIVE CAMPAIGNS"
                    value={dashboardStats?.activeCampaigns.current || "0"}
                    iconBgColor="bg-[#EBF5FF]"
                  />
                  <StatsCard
                    icon={<Users className="w-4 h-4 text-brand-navy" />}
                    title="TOTAL INFLUENCERS"
                    value={dashboardStats?.totalInfluencers.current || "0"}
                    iconBgColor="bg-[#F3E8FF]"
                  />
                  <StatsCard
                    icon={<DollarSign className="w-4 h-4 text-emerald-700" />}
                    title="BUDGET SPENT"
                    value={
                      dashboardStats
                        ? formatCurrency(dashboardStats.budgetSpent.current)
                        : "R0"
                    }
                    iconBgColor="bg-[#ECFDF5]"
                  />
                  <StatsCard
                    icon={<TrendingUp className="w-4 h-4 text-orange-600" />}
                    title="TOTAL REACH"
                    value={
                      dashboardStats
                        ? formatNumber(dashboardStats.totalReach.current)
                        : "0"
                    }
                    iconBgColor="bg-[#FFF7ED]"
                  />
                </>
              )}
            </div>

            {/* Two-Column Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
              {/* My Campaigns - Left Column */}
              <div className="lg:col-span-8 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-brand-navy">
                    My Campaigns
                  </h2>
                  <Link
                    href="/brands/campaigns"
                    className="text-sm font-bold text-brand-navy hover:underline flex items-center gap-1"
                  >
                    View All <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {coreLoading ? (
                    <>
                      <CampaignListCardSkeleton />
                      <CampaignListCardSkeleton />
                      <CampaignListCardSkeleton />
                    </>
                  ) : campaigns.length > 0 ? (
                    campaigns.slice(0, 4).map((campaign) => (
                      <CampaignListCard
                        key={campaign.id}
                        campaign={{
                          id: campaign.id,
                          title: campaign.campaignTitle,
                          status: campaign.status,
                          influencerCount: campaign.stats?.applications || 0,
                          budget: formatCurrency(
                            campaign.budget?.fixedAmount || 0,
                          ),
                          progress: calculateCampaignProgress(campaign),
                        }}
                        onView={() =>
                          router.push(
                            `/brands/campaigns/${campaign.id}/dashboard`,
                          )
                        }
                      />
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Target className="w-8 h-8 text-gray-200" />
                      </div>
                      <p className="text-gray-400 font-medium">
                        No active campaigns yet
                      </p>
                      <button
                        onClick={() => router.push("/brands/campaigns/create")}
                        className="mt-4 text-brand-navy font-bold text-sm hover:underline"
                      >
                        Create your first campaign
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Pending Actions - Right Column */}
              <div className="lg:col-span-4 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-brand-navy">
                    Pending Actions
                  </h2>
                  <Link
                    href="/brands/actions"
                    className="text-sm font-bold text-brand-navy hover:underline flex items-center gap-1"
                  >
                    View All <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="p-6 space-y-3">
                  {coreLoading ? (
                    <>
                      <PendingActionCardSkeleton />
                      <PendingActionCardSkeleton />
                    </>
                  ) : (
                    <>
                      {/* Actionable Notification Items */}
                      {actionableNotifications
                        .slice(0, 5)
                        .map((notification) => (
                          <div
                            key={notification.id}
                            className="p-4 border border-gray-100 rounded-2xl bg-white hover:border-gray-200 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActionIconBg(notification.type)}`}
                              >
                                {getActionIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="text-sm font-bold text-brand-navy leading-tight">
                                    {notification.title}
                                  </h4>
                                  <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                    {timeAgo(notification.createdAt)}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <button
                                  onClick={() =>
                                    handleNotificationAction(notification)
                                  }
                                  className="mt-2.5 w-full py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-brand-navy hover:bg-gray-50 transition-colors"
                                >
                                  {getActionLabel(notification.type)}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                      {/* Category Summary Cards (when counts > 0 but no matching notifications) */}
                      {actionableNotifications.length === 0 &&
                        pendingActionsCount.contentApprovals > 0 && (
                          <div className="p-4 border border-gray-100 rounded-2xl bg-white">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-500">
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-bold text-brand-navy">
                                  Content Approval
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  {pendingActionsCount.contentApprovals} content
                                  submission
                                  {pendingActionsCount.contentApprovals > 1
                                    ? "s"
                                    : ""}{" "}
                                  awaiting review
                                </p>
                                <button
                                  onClick={() =>
                                    router.push("/brands/content-approvals")
                                  }
                                  className="mt-2.5 w-full py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-brand-navy hover:bg-gray-50"
                                >
                                  Review
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                      {actionableNotifications.length === 0 &&
                        pendingActionsCount.newApplications > 0 && (
                          <div className="p-4 border border-gray-100 rounded-2xl bg-white">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-red-500">
                                <Megaphone className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-bold text-brand-navy">
                                  New Applications
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  {pendingActionsCount.newApplications} creator
                                  {pendingActionsCount.newApplications > 1
                                    ? "s"
                                    : ""}{" "}
                                  applied to your campaigns
                                </p>
                                <button
                                  onClick={() =>
                                    router.push("/brands/campaigns")
                                  }
                                  className="mt-2.5 w-full py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-brand-navy hover:bg-gray-50"
                                >
                                  Review
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                      {actionableNotifications.length === 0 &&
                        pendingActionsCount.paymentsDue > 0 && (
                          <div className="p-4 border border-gray-100 rounded-2xl bg-white">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-orange-500">
                                <DollarSign className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-bold text-brand-navy">
                                  Payment Due
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  {pendingActionsCount.paymentsDue} payment
                                  {pendingActionsCount.paymentsDue > 1
                                    ? "s"
                                    : ""}{" "}
                                  awaiting processing
                                </p>
                                <button
                                  onClick={() =>
                                    router.push("/brands/payments")
                                  }
                                  className="mt-2.5 w-full py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-brand-navy hover:bg-gray-50"
                                >
                                  View
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Empty State */}
                      {actionableNotifications.length === 0 &&
                        pendingActionsCount.contentApprovals === 0 &&
                        pendingActionsCount.newApplications === 0 &&
                        pendingActionsCount.paymentsDue === 0 && (
                          <div className="p-8 text-center">
                            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                              <svg
                                className="w-6 h-6 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-500 font-medium">
                              All caught up!
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              No pending actions
                            </p>
                          </div>
                        )}
                    </>
                  )}
                </div>
              </div>
            </div>
            {/* Recommended Creators Section */}
            <div className="mb-20">
              <div className="flex items-center justify-between mb-10">
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]"></span>
                    <h2 className="text-2xl font-black text-brand-blue tracking-tight">
                      Recommended Creators
                    </h2>
                  </div>
                  <p className="text-sm text-gray-400 font-medium pl-5.5">
                    Top influencers matched to your brand profile
                  </p>
                </div>

                <Link
                  href="/brands/discover"
                  className="flex items-center gap-1 text-sm font-normal text-brand-navy-dark leading-[21px]"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {creatorsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <CreatorCardSkeleton key={i} />
                  ))
                ) : recommendedCreators.length > 0 ? (
                  recommendedCreators.map((item: any) => (
                    <div
                      key={item.id}
                      className="cursor-pointer"
                      onClick={() => {
                        const tempId = `${item.platform}_${item.username}`;
                        router.push(
                          `/brands/influencers/${tempId}?platform=${item.platform}&username=${encodeURIComponent(item.username)}&name=${encodeURIComponent(item.creator.name)}&avatar=${encodeURIComponent(item.avatarUrl)}&followers=${item.followerCount}`,
                        );
                      }}
                    >
                      <RecommendedCreatorCard
                        creator={{
                          ...item.creator,
                          isBookmarked: bookmarkedIds.has(item.id),
                        }}
                        // If your component uses menuItems for actions:
                        menuItems={[
                          {
                            label: "Chat",
                            onClick: () => {
                              router.push(`/brands/messages/${item.id}`);
                            },
                          },
                          {
                            label: "Add to Campaign",
                            onClick: () => handleAddToCampaign(item),
                          },
                        ]}
                        // If the component has a specific bookmark prop not in menuItems:
                        onSelect={(e) => {
                          e.stopPropagation();
                          toggleBookmark(item.id);
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-400">
                      No recommended creators found matching your profile yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Campaign Selection Modal */}
        <CampaignSelectionModal
          isOpen={showCampaignModal}
          onClose={() => {
            setShowCampaignModal(false);
            setSelectedCreator(null);
          }}
          campaigns={campaigns}
          creatorName={selectedCreator?.name || ""}
          onSelect={handleSendInvitation}
          loading={invitationLoading}
        />
      </EmailVerificationGuard>
    </ProfileCompletionGuard>
  );
}

export default function BrandDashboardPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <BrandDashboardPageContent />
    </Suspense>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `R${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `R${(amount / 1000).toFixed(1)}k`;
  return `R${amount.toFixed(0)}`;
}
