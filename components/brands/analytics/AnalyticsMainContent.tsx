"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Loader2, FileText, Clipboard } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { Campaign } from "@/types/campaign";
import { useRouter } from "next/navigation";
import AnalyticsSkeleton from "./AnalyticsSkeleton";
import SummaryCard from "./SummaryCard";
import TopContentCard from "@/components/campaigns/TopContentCard";
import {
  AnalyticsCampaignCard,
  ViewToggle,
  SortDropdown,
  sortCampaigns,
  type ViewMode,
  type SortOption,
} from "./analytics-shared";

interface TopContentItem {
  id: string;
  influencerName: string;
  avatarUrl: string | null;
  platform: string;
  contentType: string;
  caption: string;
  thumbnailUrl: string | null;
  contentUrl: string | null;
  campaignTitle: string;
  reach: number;
  likes: number;
  comments: number;
  engagementRate: number;
  submittedAt: string;
}

export default function AnalyticsMainContent() {
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllContent, setShowAllContent] = useState(false);
  const [topContentData, setTopContentData] = useState<TopContentItem[]>([]);
  const [topContentLoading, setTopContentLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("latest");

  const fetchRecentCampaigns = useCallback(async () => {
    if (!firebaseUser) return;
    setLoading(true);
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch("/api/campaigns", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const all: Campaign[] = data.data.campaigns || [];

        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const recent = all.filter((c) => {
          const date = c.updatedAt
            ? new Date(c.updatedAt as any)
            : new Date(c.createdAt as any);
          return date >= threeMonthsAgo;
        });
        setCampaigns(recent);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser]);

  useEffect(() => {
    fetchRecentCampaigns();
  }, [fetchRecentCampaigns]);

  const fetchTopContent = useCallback(async () => {
    if (!firebaseUser) return;
    setTopContentLoading(true);
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(
        "/api/brands/analytics/top-content?limit=10",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();

      if (response.ok && data.success && data.data?.content) {
        setTopContentData(data.data.content);
      }
    } catch (error) {
      console.error("Error fetching top content:", error);
    } finally {
      setTopContentLoading(false);
    }
  }, [firebaseUser]);

  useEffect(() => {
    fetchTopContent();
  }, [fetchTopContent]);

  const sortedCampaigns = useMemo(
    () => sortCampaigns(campaigns, sortBy),
    [campaigns, sortBy]
  );

  return (
    <div className="space-y-12 pb-12">
      {/* 1. METRICS SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard value={87} label="Creators" />
        <SummaryCard
          value={campaigns.length}
          label="Campaigns"
          isLoading={loading}
        />
        <SummaryCard value={13} label="Saved Lists" />
      </div>

      {/* 2. RECENT CAMPAIGNS — marketplace "Latest Campaigns" wrapper */}
      <section className="bg-white rounded-lg border border-2-[#E0E0E0]">
        <div className="w-full border border-t-0 border-x-0 border-b-[#E0E0E0]">
          <div className="flex items-center justify-between mb-4 px-6 pt-4">
            <div>
              <h2 className="text-lg font-semibold text-brand-navy">
                My Recent Campaigns
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Your latest campaign activity
              </p>
            </div>
            <div className="flex items-center gap-3">
              <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
              <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          {loading ? (
            <AnalyticsSkeleton />
          ) : sortedCampaigns.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Clipboard className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Campaigns Found
              </h3>
              <p className="text-gray-600">
                You have no recent campaigns in the last 3 months.
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCampaigns.slice(0, 6).map((campaign) => (
                <AnalyticsCampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  viewMode="grid"
                  onView={() =>
                    router.push(
                      `/brands/campaigns/${campaign.id}/dashboard`
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedCampaigns.slice(0, 6).map((campaign) => (
                <AnalyticsCampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  viewMode="list"
                  onView={() =>
                    router.push(
                      `/brands/campaigns/${campaign.id}/dashboard`
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. TOP PERFORMING CONTENT SECTION */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-brand-navy-dark">
              Top Performing Content
            </h3>
            {!topContentLoading &&
              topContentData.length > 0 &&
              showAllContent && (
                <span className="bg-brand-navy-50 text-brand-navy text-xs font-bold px-2 py-1 rounded-full">
                  {topContentData.length} Total
                </span>
              )}
          </div>
          {topContentData.length > 3 && (
            <button
              onClick={() => setShowAllContent(!showAllContent)}
              className="text-sm font-bold text-brand-navy hover:underline"
            >
              {showAllContent ? "Show Less" : "View All"}
            </button>
          )}
        </div>

        {topContentLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-brand-navy animate-spin mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                Loading approved content...
              </p>
            </div>
          </div>
        ) : topContentData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm font-medium">
              No approved content yet
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Approved deliverables from your campaigns will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(showAllContent
              ? topContentData
              : topContentData.slice(0, 3)
            ).map((content, index) => (
              <TopContentCard
                key={content.id || index}
                content={{
                  ...content,
                  avatarUrl: content.avatarUrl,
                }}
                index={index}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
