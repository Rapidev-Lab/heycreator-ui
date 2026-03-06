"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import {
  Clipboard,
  Clock,
  ArrowRight,
  Search,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import ProfileCompletionGuard from "@/components/auth/ProfileCompletionGuard";
import EmailVerificationGuard from "@/components/auth/EmailVerificationGuard";
import { InfluencerStatsCard } from "@/components/influencers/InfluencerStatsCard";
import { useApplications } from "@/lib/hooks/useApplications";
import PageLoader from "@/components/ui/PageLoader";
import { StatsCardSkeleton, CampaignCardSkeleton } from "@/components/ui/skeletons";

// ─── Skeleton Components ────────────────────────────────────────────
function RecommendedCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="flex gap-2 mb-2">
            <div className="h-5 bg-gray-100 rounded w-16" />
            <div className="h-3 bg-gray-100 rounded w-28" />
          </div>
          <div className="flex gap-2">
            <div className="h-5 bg-gray-100 rounded w-14" />
            <div className="h-5 bg-gray-100 rounded w-18" />
          </div>
        </div>
      </div>
      <div className="pt-3 border-t border-gray-100">
        <div className="h-4 bg-gray-200 rounded w-24" />
      </div>
    </div>
  );
}

// Types for marketplace campaigns (used for recommendations)
interface MarketplaceCampaign {
  id: string;
  title: string;
  brandInfo: {
    name: string;
    logo: string | null;
    verified: boolean;
  };
  productCategory: string;
  categories: string[];
  budget: {
    compensationModel?: string;
    fixedAmount?: number;
    minRangeAmount?: number;
    maxRangeAmount?: number;
    currency?: string;
  };
  budgetAmount: number;
  createdAt: string;
}

// Helper function to format currency
function formatCurrency(amount: number, currency: string = "ZAR"): string {
  const symbol = currency === "ZAR" ? "R" : "$";
  return `${symbol} ${amount.toLocaleString()}`;
}

// Helper function to get status badge color
function getStatusBadgeClasses(status: string): string {
  const statusUpper = status?.toUpperCase() || "";
  switch (statusUpper) {
    case "ACTIVE":
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700";
    case "COMPLETED":
      return "bg-green-100 text-green-700";
    case "PUBLISHED":
      return "bg-brand-navy-50 text-brand-navy";
    case "DRAFT":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

// Helper to format status text
function formatStatusText(status: string): string {
  if (!status) return "Active";
  return status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

// Category background colors
const categoryColors: Record<string, string> = {
  Beauty: "bg-pink-100 text-pink-700",
  Fashion: "bg-brand-navy-50 text-brand-navy",
  Fitness: "bg-blue-100 text-blue-700",
  Technology: "bg-brand-navy-50 text-brand-navy",
  "Food & Beverage": "bg-orange-100 text-orange-700",
  Travel: "bg-teal-100 text-teal-700",
  Gaming: "bg-red-100 text-red-700",
  "Health & Wellness": "bg-green-100 text-green-700",
  default: "bg-gray-100 text-gray-700",
};

function getCategoryClasses(category: string): string {
  return categoryColors[category] || categoryColors.default;
}

function InfluencerDashboardContent() {
  const { firebaseUser, userProfile } = useAuth();

  // Use the applications hook for campaigns data
  const {
    applications,
    stats,
    successRate,
    isLoading: applicationsLoading,
    error: applicationsError,
    refetch: refetchApplications,
  } = useApplications();

  // State for recommended campaigns (from marketplace)
  const [recommendedCampaigns, setRecommendedCampaigns] = useState<
    MarketplaceCampaign[]
  >([]);
  const [recommendedLoading, setRecommendedLoading] = useState(true);
  const [recommendedError, setRecommendedError] = useState<string | null>(null);

  // Fetch recommended campaigns from marketplace endpoint
  const fetchRecommendedCampaigns = useCallback(async () => {
    if (!firebaseUser) return;

    setRecommendedLoading(true);
    setRecommendedError(null);

    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch("/api/influencers/campaigns/marketplace?limit=4&sortBy=latest", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch recommended campaigns");
      }

      const data = await res.json();
      if (data.success && data.data) {
        setRecommendedCampaigns(data.data.campaigns || []);
      }
    } catch (err) {
      console.error("Error fetching recommended campaigns:", err);
      setRecommendedError("Failed to load recommendations");
    } finally {
      setRecommendedLoading(false);
    }
  }, [firebaseUser]);

  useEffect(() => {
    fetchRecommendedCampaigns();
  }, [fetchRecommendedCampaigns]);

  // Filter applications
  const activeCampaigns = applications.filter((app) => app.status === "accepted").slice(0, 3);
  const pendingApplications = applications.filter((app) => app.status === "pending").slice(0, 3);

  return (
    <ProfileCompletionGuard>
      <EmailVerificationGuard>
        {/* White header area */}
        <div className="bg-white px-4 sm:px-6 lg:px-8 pt-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center space-x-4">
              {/* Profile Image */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {userProfile?.displayName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-brand-navy">
                  Welcome back, {userProfile?.displayName || "Creator"}!
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Here&apos;s what&apos;s happening with your campaigns.
                </p>
              </div>
            </div>

            {/* CTA Button — outline style matching brand dashboard */}
            <Link
              href="/influencers/marketplace"
              className="hidden sm:inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#555555] border-2 border-[#E0E0E0] rounded-[12px] hover:bg-gray-50 transition-all font-bold text-sm shadow-sm"
            >
              <Search className="w-4 h-4" />
              Browse Campaigns
            </Link>
          </div>
        </div>

        {/* Content area */}
        <div className="min-h-screen bg-[#F8F9FD] px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-[1440px] mx-auto">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {applicationsLoading ? (
                <>
                  <StatsCardSkeleton />
                  <StatsCardSkeleton />
                  <StatsCardSkeleton />
                  <StatsCardSkeleton />
                </>
              ) : (
                <>
                  <InfluencerStatsCard
                    title="Active Campaigns"
                    value={stats.accepted}
                  />
                  <InfluencerStatsCard
                    title="Pending Bids"
                    value={stats.pending}
                  />
                  <InfluencerStatsCard
                    title="Total Earnings"
                    value="R 0"
                    className="opacity-60"
                  />
                  <InfluencerStatsCard
                    title="Success Rate"
                    value={`${successRate}%`}
                    className={successRate === 0 ? "opacity-60" : ""}
                  />
                </>
              )}
            </div>

            {/* Error State */}
            {applicationsError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-8">
                <p className="text-red-600 mb-3">{applicationsError}</p>
                <button
                  onClick={refetchApplications}
                  className="px-6 py-2 bg-brand-navy text-white rounded-[12px] hover:bg-brand-navy-light transition-colors font-medium"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Two Column Layout — always visible, content swaps between skeleton and data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              {/* Active Campaigns Section */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-brand-navy">
                    Active Campaigns
                  </h2>
                  <Link
                    href="/influencers/campaigns"
                    className="text-sm font-bold text-brand-navy hover:underline flex items-center gap-1"
                  >
                    View All <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="p-5 space-y-4">
                  {applicationsLoading ? (
                    <>
                      <CampaignCardSkeleton />
                      <CampaignCardSkeleton />
                      <CampaignCardSkeleton />
                    </>
                  ) : activeCampaigns.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                        <Clipboard className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-gray-400 font-medium mb-2">No active campaigns yet</p>
                      <Link
                        href="/influencers/marketplace"
                        className="text-brand-navy text-sm font-bold hover:underline"
                      >
                        Browse campaigns
                      </Link>
                    </div>
                  ) : (
                    activeCampaigns.map((campaign) => (
                      <Link
                        key={campaign.id}
                        href={`/influencers/campaigns/${campaign.campaignId}`}
                        className="block"
                      >
                        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start space-x-3">
                              {campaign.brandLogo ? (
                                <img
                                  src={campaign.brandLogo}
                                  alt={campaign.brandName}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-brand-navy flex items-center justify-center text-white font-bold">
                                  {campaign.brandName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="flex-1">
                                <h3 className="font-semibold text-brand-navy mb-1">
                                  {campaign.title}
                                </h3>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryClasses(
                                      campaign.category
                                    )}`}
                                  >
                                    {campaign.category}
                                  </span>
                                  <span>{campaign.brandName}</span>
                                  <span>•</span>
                                  <span>
                                    {campaign.startDate} - {campaign.endDate}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeClasses(
                                campaign.campaignStatus || ""
                              )}`}
                            >
                              {formatStatusText(campaign.campaignStatus || "Active")}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            Your rate: <span className="font-semibold text-brand-navy">{formatCurrency(campaign.yourBid)}</span>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Pending Applications Section */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-brand-navy">
                    Pending Applications
                  </h2>
                  <Link
                    href="/influencers/campaigns?tab=applications"
                    className="text-sm font-bold text-brand-navy hover:underline flex items-center gap-1"
                  >
                    View All <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="p-5 space-y-4">
                  {applicationsLoading ? (
                    <>
                      <CampaignCardSkeleton />
                      <CampaignCardSkeleton />
                      <CampaignCardSkeleton />
                    </>
                  ) : pendingApplications.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                        <Clock className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-gray-400 font-medium mb-2">No pending applications</p>
                      <Link
                        href="/influencers/marketplace"
                        className="text-brand-navy text-sm font-bold hover:underline"
                      >
                        Discover campaigns
                      </Link>
                    </div>
                  ) : (
                    pendingApplications.map((application) => (
                      <Link
                        key={application.id}
                        href={`/influencers/marketplace/${application.campaignId}`}
                        className="block"
                      >
                        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start space-x-3">
                              {application.brandLogo ? (
                                <img
                                  src={application.brandLogo}
                                  alt={application.brandName}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-brand-navy flex items-center justify-center text-white font-bold">
                                  {application.brandName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="flex-1">
                                <h3 className="font-semibold text-brand-navy mb-1">
                                  {application.title}
                                </h3>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryClasses(
                                      application.category
                                    )}`}
                                  >
                                    {application.category}
                                  </span>
                                  <span>{application.brandName}</span>
                                  <span>•</span>
                                  <span>
                                    {application.daysRemaining > 0
                                      ? `Closes in ${application.daysRemaining} day${
                                          application.daysRemaining !== 1 ? "s" : ""
                                        }`
                                      : "Closed"}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                  Your bid:{" "}
                                  <span className="font-semibold text-brand-navy">
                                    {formatCurrency(application.yourBid)}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                              Pending
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Recommended For You Section */}
            <div className="mb-20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                    <h2 className="text-xl font-bold text-brand-navy">
                      Recommended For You
                    </h2>
                  </div>
                  <p className="text-sm text-gray-400 font-medium pl-5.5">
                    Campaigns matched to your profile
                  </p>
                </div>
                <Link
                  href="/influencers/marketplace?tab=recommended"
                  className="text-sm font-bold text-brand-navy hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight size={14} />
                </Link>
              </div>

              {recommendedLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RecommendedCardSkeleton />
                  <RecommendedCardSkeleton />
                </div>
              ) : recommendedError ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="text-red-600 text-sm mb-2">{recommendedError}</p>
                  <button
                    onClick={fetchRecommendedCampaigns}
                    className="text-brand-navy text-sm font-bold hover:underline"
                  >
                    Try again
                  </button>
                </div>
              ) : recommendedCampaigns.length === 0 ? (
                <div className="bg-white rounded-xl p-12 border border-dashed border-gray-200 text-center">
                  <p className="text-gray-400">
                    No recommended campaigns available right now
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendedCampaigns.slice(0, 2).map((campaign) => {
                    const budget = campaign.budget || {};
                    const currency = budget.currency || "ZAR";
                    const budgetMin = budget.compensationModel === "range"
                      ? budget.minRangeAmount || 0
                      : budget.fixedAmount || 0;
                    const budgetMax = budget.compensationModel === "range"
                      ? budget.maxRangeAmount || 0
                      : budget.fixedAmount || 0;
                    const category = campaign.productCategory || campaign.categories?.[0] || "Campaign";

                    return (
                      <Link
                        key={campaign.id}
                        href={`/influencers/campaign-marketplace/${campaign.id}`}
                        className="block"
                      >
                        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex items-start space-x-3 mb-4">
                            {campaign.brandInfo?.logo ? (
                              <img
                                src={campaign.brandInfo.logo}
                                alt={campaign.brandInfo.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-brand-navy flex items-center justify-center text-white font-bold">
                                {campaign.brandInfo?.name?.charAt(0).toUpperCase() || "B"}
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold text-brand-navy mb-1">
                                {campaign.title}
                              </h3>
                              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryClasses(
                                    category
                                  )}`}
                                >
                                  {category}
                                </span>
                                <span>{campaign.brandInfo?.name || "Unknown Brand"}</span>
                              </div>
                              {campaign.categories && campaign.categories.length > 1 && (
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  {campaign.categories.slice(1, 3).map((cat) => (
                                    <span
                                      key={cat}
                                      className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                                    >
                                      {cat}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <span className="text-brand-navy font-semibold">
                              {budgetMin === budgetMax
                                ? formatCurrency(budgetMin, currency)
                                : `${formatCurrency(budgetMin, currency)} - ${formatCurrency(budgetMax, currency)}`}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </EmailVerificationGuard>
    </ProfileCompletionGuard>
  );
}

export default function InfluencerDashboard() {
  return (
    <Suspense fallback={<PageLoader />}>
      <InfluencerDashboardContent />
    </Suspense>
  );
}
