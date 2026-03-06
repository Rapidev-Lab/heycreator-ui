"use client";

import { useState, useMemo, useCallback } from "react";
import { Bookmark } from "lucide-react";
import { Campaign } from "@/types/campaign";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import {
  AnalyticsCampaignCard,
  ViewToggle,
  SortDropdown,
  sortCampaigns,
  type ViewMode,
  type SortOption,
} from "./analytics-shared";

interface SavedReportsTabContentProps {
  campaigns: Campaign[];
  onRefresh: () => void;
  loading?: boolean;
}

export default function SavedReportsTabContent({
  campaigns,
  onRefresh,
  loading,
}: SavedReportsTabContentProps) {
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("latest");

  const savedReports = useMemo(
    () => campaigns.filter((c) => (c as any).bookmarked === "yes"),
    [campaigns]
  );

  const sortedReports = useMemo(
    () => sortCampaigns(savedReports, sortBy),
    [savedReports, sortBy]
  );

  const toggleBookmark = useCallback(
    async (id: string) => {
      if (!firebaseUser) return;
      try {
        const token = await firebaseUser.getIdToken();
        const campaign = savedReports.find((c) => c.id === id);
        const isCurrentlyBookmarked = (campaign as any)?.bookmarked === "yes";
        const newValue = isCurrentlyBookmarked ? "no" : "yes";

        const response = await fetch(`/api/brands/campaigns/${id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bookmarked: newValue }),
        });

        if (response.ok) onRefresh();
      } catch (error) {
        console.error("Failed to toggle bookmark:", error);
      }
    },
    [firebaseUser, savedReports, onRefresh]
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-2-[#E0E0E0]">
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-white rounded-lg border border-2-[#E0E0E0]">
      {/* Header with bottom divider */}
      <div className="w-full border border-t-0 border-x-0 border-b-[#E0E0E0]">
        <div className="flex items-center justify-between mb-4 px-6 pt-4">
          <div>
            <h2 className="text-lg font-semibold text-brand-navy">
              Saved Reports
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {sortedReports.length} saved campaign
              {sortedReports.length !== 1 ? "s" : ""}
            </p>
          </div>
          {sortedReports.length > 0 && (
            <div className="flex items-center gap-3">
              <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
              <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-5">
        {sortedReports.length === 0 ? (
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-200 p-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Bookmark className="w-8 h-8 text-gray-300" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              No saved reports yet
            </h4>
            <p className="text-gray-500 max-w-xs mx-auto text-sm">
              Click the bookmark icon on any campaign in the Analytics tab to
              save it here for quick access.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedReports.map((report) => (
              <AnalyticsCampaignCard
                key={report.id}
                campaign={report}
                viewMode="grid"
                isBookmarked
                onToggleBookmark={toggleBookmark}
                onView={() =>
                  router.push(
                    `/brands/campaigns/${report.id}/dashboard`
                  )
                }
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedReports.map((report) => (
              <AnalyticsCampaignCard
                key={report.id}
                campaign={report}
                viewMode="list"
                isBookmarked
                onToggleBookmark={toggleBookmark}
                onView={() =>
                  router.push(
                    `/brands/campaigns/${report.id}/dashboard`
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
