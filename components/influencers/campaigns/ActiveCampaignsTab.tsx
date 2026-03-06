"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Grid3x3,
  List,
  Loader2,
  Clipboard,
  ArrowRight,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { useApplications } from "@/lib/hooks/useApplications";
import { useAuth } from "@/lib/firebase/auth-context";
import { useSavedCampaigns } from "@/lib/hooks/useSavedCampaigns";
import { useDeliverableProgress } from "@/lib/hooks/useDeliverableProgress";
import ActiveCampaignCard from "@/components/influencers/campaigns/ActiveCampaignCard";
import TasksDeliverablesModal from "@/components/influencers/campaigns/TasksDeliverablesModal";
import { applyFilters, type FilterValues } from "@/components/influencers/campaigns/CampaignSearchFilters";
import PaginationBar from "@/components/ui/PaginationBar";
import type { CampaignApplicationData } from "@/components/ui/CampaignApplicationCard";
import type { ActiveCampaignCardData, ActiveDeliverable, DeliverableProgress } from "@/types/active-campaign";
import type { DeliverableSubmission } from "@/types/campaign";

type ViewMode = "grid" | "list";
type SortOption =
  | "relevance"
  | "latest"
  | "budget-high"
  | "budget-low"
  | "deadline";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "latest", label: "Latest" },
  { value: "budget-high", label: "Budget (High to Low)" },
  { value: "budget-low", label: "Budget (Low to High)" },
  { value: "deadline", label: "Ending Soon" },
];

function mapToActiveCampaignCard(
  app: CampaignApplicationData,
  progressEntry: { completedTypes: Set<string> } | null,
  saved: boolean,
): ActiveCampaignCardData {
  const rawDeliverables = app.deliverables || [];

  // Build deliverables with completion status
  const deliverables: ActiveDeliverable[] = rawDeliverables.map((d) => {
    const key = `${d.platform.toLowerCase()}:${d.contentType.toLowerCase()}`;
    const completed = progressEntry ? progressEntry.completedTypes.has(key) : false;
    return {
      platform: d.platform,
      contentType: d.contentType,
      quantity: d.quantity,
      completed,
    };
  });

  // Compute progress
  let progress: DeliverableProgress | null = null;
  if (progressEntry && deliverables.length > 0) {
    const total = deliverables.length;
    const completed = deliverables.filter((d) => d.completed).length;
    const percentage = Math.round((completed / total) * 100);
    progress = { total, completed, percentage };
  }

  return {
    id: app.campaignId,
    applicationId: app.id,
    title: app.title,
    brandName: app.brandName,
    brandLogo: app.brandLogo,
    description: app.description || "",
    category: app.category,
    categories: app.categories || [app.category],
    campaignObjectives: app.campaignObjectives || [],
    productImageUrl: app.productImageUrl,
    budgetAmount: app.yourBid || app.budgetMax || 0,
    currency: app.currency || "ZAR",
    tasksDueDays: app.daysRemaining,
    tasksDueDate: app.endDate || "TBD",
    progress,
    deliverables,
    isSaved: saved,
  };
}

function sortActiveCampaigns(
  campaigns: ActiveCampaignCardData[],
  sortBy: SortOption,
): ActiveCampaignCardData[] {
  if (sortBy === "relevance" || sortBy === "latest") return campaigns;
  return [...campaigns].sort((a, b) => {
    switch (sortBy) {
      case "budget-high":
        return b.budgetAmount - a.budgetAmount;
      case "budget-low":
        return a.budgetAmount - b.budgetAmount;
      case "deadline":
        return a.tasksDueDays - b.tasksDueDays;
      default:
        return 0;
    }
  });
}

interface ActiveCampaignsTabProps {
  searchQuery: string;
  dropdownFilters: FilterValues;
  onSwitchTab?: (tab: string) => void;
}

export default function ActiveCampaignsTab({
  searchQuery,
  dropdownFilters,
  onSwitchTab,
}: ActiveCampaignsTabProps) {
  const router = useRouter();
  const { firebaseUser, userProfile } = useAuth();
  const { applications, isLoading, error } = useApplications();
  const { isSaved, toggleSave } = useSavedCampaigns();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [sortOpen, setSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // Tasks modal state
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [tasksCampaign, setTasksCampaign] = useState<any>(null);
  const [tasksDeliverables, setTasksDeliverables] = useState<DeliverableSubmission[]>([]);
  const [tasksApplicationId, setTasksApplicationId] = useState<string>("");
  const [tasksLoading, setTasksLoading] = useState(false);

  // Reset page when filters/search/sort/viewMode change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, sortBy, viewMode, dropdownFilters]);

  // Get accepted application IDs for deliverable progress fetching
  const acceptedApps = useMemo(
    () => applications.filter((app) => app.status === "accepted"),
    [applications],
  );

  const applicationIds = useMemo(
    () => acceptedApps.map((app) => app.id),
    [acceptedApps],
  );

  const { progressMap, updateProgressFromDeliverables, invalidateAndRefetch } = useDeliverableProgress(applicationIds);

  // Build active campaign cards with progress data
  const activeCampaigns = useMemo(() => {
    // Apply dropdown filters before mapping
    const filtered = applyFilters(acceptedApps, dropdownFilters);

    let mapped = filtered.map((app) =>
      mapToActiveCampaignCard(
        app,
        progressMap[app.id] || null,
        isSaved(app.campaignId),
      ),
    );

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      mapped = mapped.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.brandName.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q),
      );
    }

    return sortActiveCampaigns(mapped, sortBy);
  }, [acceptedApps, progressMap, isSaved, searchQuery, sortBy, dropdownFilters]);

  // Compute completed count from all applications
  const completedCount = useMemo(() => {
    return applications.filter(
      (app) =>
        app.status === "accepted" &&
        (app.campaignStatus === "COMPLETED" ||
          app.campaignStatus === "completed"),
    ).length;
  }, [applications]);

  // Compute total earnings from completed campaigns only
  const totalEarnings = useMemo(() => {
    return applications
      .filter(
        (app) =>
          app.status === "accepted" &&
          (app.campaignStatus === "COMPLETED" ||
            app.campaignStatus === "completed"),
      )
      .reduce((sum, app) => sum + (app.yourBid || app.budgetMax || 0), 0);
  }, [applications]);

  const handleCardClick = (campaignId: string) => {
    router.push(`/influencers/campaigns/${campaignId}`);
  };

  const handleViewTasks = useCallback(async (campaignId: string, applicationId: string) => {
    if (!firebaseUser) return;

    // Open modal immediately for instant feedback
    setTasksCampaign(null);
    setTasksDeliverables([]);
    setTasksApplicationId(applicationId);
    setTasksLoading(true);
    setShowTasksModal(true);

    try {
      const token = await firebaseUser.getIdToken();

      const [campaignRes, deliverablesRes] = await Promise.all([
        fetch(`/api/influencers/campaigns/${campaignId}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        }),
        fetch(`/api/deliverables?applicationId=${applicationId}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        }),
      ]);

      if (campaignRes.ok) {
        const campaignData = await campaignRes.json();
        if (campaignData.success && campaignData.data?.campaign) {
          setTasksCampaign(campaignData.data.campaign);
        }
      }

      if (deliverablesRes.ok) {
        const delData = await deliverablesRes.json();
        const fetchedDeliverables = delData.data?.deliverables || [];
        setTasksDeliverables(fetchedDeliverables);

        // Sync freshest deliverable data back to the card's progress bar
        updateProgressFromDeliverables(applicationId, fetchedDeliverables);
      }

      // Also invalidate the hook's cached state so future renders use fresh data
      invalidateAndRefetch(applicationId);
    } catch (err) {
      console.error("Error fetching tasks data:", err);
    } finally {
      setTasksLoading(false);
    }
  }, [firebaseUser, updateProgressFromDeliverables, invalidateAndRefetch]);

  const handleTaskSubmitUrl = useCallback(async (
    platform: string,
    deliverableType: string,
    contentUrl: string,
  ) => {
    if (!firebaseUser || !tasksApplicationId) throw new Error("Not authenticated");
    const token = await firebaseUser.getIdToken();

    const res = await fetch("/api/deliverables", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        applicationId: tasksApplicationId,
        platform,
        deliverableType,
        contentUrl,
        caption: "",
        contentScreenshots: [],
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to submit URL");
    }

    // Refresh deliverables and sync card progress
    const refreshRes = await fetch(`/api/deliverables?applicationId=${tasksApplicationId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (refreshRes.ok) {
      const data = await refreshRes.json();
      const refreshed = data.data?.deliverables || [];
      setTasksDeliverables(refreshed);
      updateProgressFromDeliverables(tasksApplicationId, refreshed);
    }
  }, [firebaseUser, tasksApplicationId, updateProgressFromDeliverables]);

  const handleTaskEditUrl = useCallback(async (deliverableId: string, contentUrl: string) => {
    if (!firebaseUser) throw new Error("Not authenticated");
    const token = await firebaseUser.getIdToken();

    const targetDeliverable = tasksDeliverables.find((d) => d.id === deliverableId);
    const isApproved = targetDeliverable?.status === "approved";

    const requestBody = isApproved
      ? { action: "submit_live_link", liveUrl: contentUrl }
      : { contentUrl };

    const res = await fetch(`/api/deliverables/${deliverableId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to update URL");
    }

    // Refresh deliverables and sync card progress
    const refreshRes = await fetch(`/api/deliverables?applicationId=${tasksApplicationId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (refreshRes.ok) {
      const data = await refreshRes.json();
      const refreshed = data.data?.deliverables || [];
      setTasksDeliverables(refreshed);
      updateProgressFromDeliverables(tasksApplicationId, refreshed);
    }
  }, [firebaseUser, tasksDeliverables, tasksApplicationId, updateProgressFromDeliverables]);

  // Refresh handler for polling inside the modal
  const handleRefreshDeliverables = useCallback(async () => {
    if (!firebaseUser || !tasksApplicationId) return;
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`/api/deliverables?applicationId=${tasksApplicationId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        const refreshed = data.data?.deliverables || [];
        setTasksDeliverables(refreshed);
        updateProgressFromDeliverables(tasksApplicationId, refreshed);
      }
    } catch (err) {
      console.error("Error refreshing deliverables:", err);
    }
  }, [firebaseUser, tasksApplicationId, updateProgressFromDeliverables]);

  const handleChat = (campaignId: string) => {
    // TODO: Open Chat modal
    console.log("Chat for campaign:", campaignId);
  };

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label || "Relevance";

  return (
    <>
      {/* Campaigns Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-brand-navy mb-4">
          Campaigns Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-xl p-4 bg-[#F8F9FD]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-3 h-3 rounded-full border-2 border-blue-500" />
                Active Campaigns
              </div>
            </div>
            <p className="text-3xl font-bold text-brand-navy">
              {activeCampaigns.length}
            </p>
          </div>

          <div className="border border-gray-200 rounded-xl p-4 bg-[#F8F9FD]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <TrendingUp className="w-3.5 h-3.5" />
                Completed Campaigns
              </div>
              <button
                onClick={() => onSwitchTab?.("completed")}
                className="text-xs font-medium text-[#FF385C] hover:underline"
              >
                View all
              </button>
            </div>

            <p className="text-3xl font-bold text-brand-navy">
              {completedCount}
            </p>
          </div>

          <div className="border border-gray-200 rounded-xl p-4 bg-[#F8F9FD]">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <DollarSign className="w-3.5 h-3.5" />
              Earned
            </div>
            <p className="text-3xl font-bold text-brand-navy">
              R{" "}
              {totalEarnings.toLocaleString("en-ZA", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-brand-navy">
                Active Campaigns
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Get what&apos;s new in the campaign space
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:border-gray-400 transition-all"
                >
                  <span>{currentSortLabel}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform ${sortOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {sortOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setSortOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2 px-2">
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setSortOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 text-sm transition-colors rounded-md ${
                            sortBy === option.value
                              ? "bg-brand-navy text-white font-semibold"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1 bg-white">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-all ${
                    viewMode === "grid"
                      ? "bg-brand-navy text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  title="Grid view"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-all ${
                    viewMode === "list"
                      ? "bg-brand-navy text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          {/* Loading State — skeleton cards for perceived performance */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-5/6 mb-4" />
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 bg-gray-100 rounded-full w-16" />
                    <div className="h-6 bg-gray-100 rounded-full w-20" />
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="h-5 bg-gray-200 rounded w-24" />
                    <div className="h-8 bg-gray-100 rounded-lg w-20" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600 mb-3">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && activeCampaigns.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Clipboard className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Active Campaigns
              </h3>
              <p className="text-gray-600 mb-4">
                You don&apos;t have any active campaigns yet. Browse the
                marketplace to find campaigns.
              </p>
              <button
                onClick={() => router.push("/influencers/marketplace")}
                className="inline-flex items-center px-6 py-2 bg-brand-navy text-white rounded-full hover:bg-brand-navy-light transition-colors"
              >
                Browse Campaigns
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          )}

          {/* Campaign Grid/List */}
          {!isLoading &&
            !error &&
            activeCampaigns.length > 0 && (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeCampaigns.slice(currentPage * 6, (currentPage + 1) * 6).map((campaign) => (
                      <ActiveCampaignCard
                        key={campaign.id}
                        campaign={campaign}
                        viewMode="grid"
                        onToggleSave={toggleSave}
                        onChat={handleChat}
                        onViewTasks={handleViewTasks}
                        onCardClick={handleCardClick}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeCampaigns.slice(currentPage * 6, (currentPage + 1) * 6).map((campaign) => (
                      <ActiveCampaignCard
                        key={campaign.id}
                        campaign={campaign}
                        viewMode="list"
                        onToggleSave={toggleSave}
                        onChat={handleChat}
                        onViewTasks={handleViewTasks}
                        onCardClick={handleCardClick}
                      />
                    ))}
                  </div>
                )}
                <PaginationBar
                  currentPage={currentPage}
                  totalCount={activeCampaigns.length}
                  pageSize={6}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
        </div>
      </div>

      {/* Tasks & Deliverables Modal */}
      <TasksDeliverablesModal
        isOpen={showTasksModal}
        onClose={() => {
          setShowTasksModal(false);
          setTasksCampaign(null);
          setTasksDeliverables([]);
          setTasksApplicationId("");
        }}
        campaign={tasksCampaign}
        deliverables={tasksDeliverables}
        loading={tasksLoading}
        creatorName={userProfile?.displayName || firebaseUser?.displayName || "Creator"}
        creatorUsername={userProfile?.email?.split("@")[0] || undefined}
        creatorAvatar={userProfile?.photoURL || firebaseUser?.photoURL || null}
        applicationId={tasksApplicationId}
        onSubmitUrl={handleTaskSubmitUrl}
        onEditUrl={handleTaskEditUrl}
        onRefresh={handleRefreshDeliverables}
      />
    </>
  );
}
