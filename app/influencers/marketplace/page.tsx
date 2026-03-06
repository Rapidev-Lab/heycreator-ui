"use client";

import { Suspense, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  Clipboard,
  Search,
  ChevronDown,
  Grid3x3,
  List,
  SlidersHorizontal,
  X,
  Instagram,
  Music2,
  Youtube,
  X as TwitterX,
  Facebook,
  Bookmark,
  CheckCircle,
  Check,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import ProfileCompletionGuard from "@/components/auth/ProfileCompletionGuard";
import EmailVerificationGuard from "@/components/auth/EmailVerificationGuard";
import ApplicationModal from "@/components/influencers/ApplicationModal";
import MarketplaceCampaignCard from "@/components/influencers/marketplace/MarketplaceCampaignCard";
import CampaignFilterSidebar, {
  getEmptyFilters,
} from "@/components/influencers/marketplace/CampaignFilterSidebar";
import TopTopicsSection from "@/components/discovery/topics/TopTopicsSection";
import PageLoader from "@/components/ui/PageLoader";
import PaginationBar from "@/components/ui/PaginationBar";
import { useMarketplace } from "@/lib/hooks/useMarketplace";
import { useSavedCampaigns } from "@/lib/hooks/useSavedCampaigns";
import { useAuth } from "@/lib/firebase/auth-context";
import type {
  MarketplaceTab,
  MarketplaceCampaignExtended,
} from "@/types/marketplace";

type ViewMode = "grid" | "list";
type SortOption =
  | "relevance"
  | "latest"
  | "budget-high"
  | "budget-low"
  | "deadline";
type PlatformFilter = "instagram" | "tiktok" | "youtube" | "x" | "facebook";

interface InvitationRow {
  id: string;
  campaignId: string;
  status: string;
  message: string;
  invitedAt: string;
  seenAt: string | null;
  campaign: {
    id: string;
    title: string;
    description: string;
    budget: any;
    brandName: string;
    brandLogo: string;
    productImageUrl: string;
    dueDate: string | null;
    categories: string[];
    platforms: string[];
    deliverables: { platform: string; contentType: string; quantity: number; description: string }[];
  } | null;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatOffer(budget: any): string {
  if (!budget) return "—";
  const amount =
    budget.compensationModel === "range"
      ? budget.maxRangeAmount || budget.minRangeAmount || 0
      : budget.fixedAmount || 0;
  if (!amount) return "—";
  return `R ${Number(amount).toLocaleString("en-ZA")}`;
}

const platformButtons: {
  id: PlatformFilter;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "tiktok", label: "TikTok", icon: Music2 },
  { id: "youtube", label: "YouTube", icon: Youtube },
  { id: "x", label: "X", icon: TwitterX },
  { id: "facebook", label: "Facebook", icon: Facebook },
];

const TABS: { key: MarketplaceTab; label: string }[] = [
  { key: "all", label: "All campaigns" },
  { key: "invites", label: "Invites" },
  { key: "recommended", label: "Recommended" },
  { key: "saved", label: "Saved" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "latest", label: "Latest" },
  { value: "budget-high", label: "Budget (High to Low)" },
  { value: "budget-low", label: "Budget (Low to High)" },
  { value: "deadline", label: "Ending Soon" },
];

const INVITATIONS_CACHE_KEY = "marketplace_invitations_v1";
const INVITATIONS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedInvitations(): MarketplaceCampaignExtended[] | null {
  try {
    const cached = sessionStorage.getItem(INVITATIONS_CACHE_KEY);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > INVITATIONS_CACHE_TTL) {
      sessionStorage.removeItem(INVITATIONS_CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function mapInvitation(inv: any): MarketplaceCampaignExtended {
  const campaign = inv.campaign || {};
  const budget = campaign.budget || {};
  const budgetMin =
    budget.compensationModel === "range"
      ? budget.minRangeAmount || 0
      : budget.fixedAmount || 0;
  const budgetMax =
    budget.compensationModel === "range"
      ? budget.maxRangeAmount || 0
      : budget.fixedAmount || 0;

  // Compute daysRemaining and deadline display from dueDate
  const dueDate = campaign.dueDate;
  let daysRemaining = 0;
  let applicationDeadlineDate = "TBD";
  let derivedStatus: "open" | "ending-soon" | "closed" = "open";

  if (dueDate) {
    const due = new Date(dueDate);
    if (!isNaN(due.getTime())) {
      daysRemaining = Math.max(
        0,
        Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      );
      applicationDeadlineDate = due.toLocaleDateString("en-ZA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      if (daysRemaining === 0) derivedStatus = "closed";
      else if (daysRemaining <= 3) derivedStatus = "ending-soon";
    }
  }

  return {
    id: campaign.id || inv.campaignId || inv.id,
    brandName: campaign.brandName || inv.brandName || "Unknown Brand",
    brandLogo: campaign.brandLogo || "",
    title: campaign.title || "Invited Campaign",
    description: campaign.description || "",
    category: (campaign.categories || [])[0] || "",
    categories: campaign.categories || [],
    platforms: campaign.platforms || [],
    budgetMin,
    budgetMax,
    currency: budget.currency || "ZAR",
    daysRemaining,
    applicationDeadlineDate,
    status: derivedStatus,
    productImageUrl: campaign.productImageUrl || "",
    deliverables: (campaign.deliverables || []).map((d: any) => ({
      platform: d.platform || "",
      contentType: d.contentType || "",
      quantity: d.quantity || 1,
    })),
    invitationId: inv.id,
    invitationStatus: inv.status || "sent",
    invitationMessage: inv.message || undefined,
  };
}

function sortCampaigns(
  campaigns: MarketplaceCampaignExtended[],
  sortBy: SortOption
): MarketplaceCampaignExtended[] {
  if (sortBy === "latest") {
    return [...campaigns].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }
  return [...campaigns].sort((a, b) => {
    switch (sortBy) {
      case "relevance":
        return (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0);
      case "budget-high":
        return b.budgetMax - a.budgetMax;
      case "budget-low":
        return a.budgetMin - b.budgetMin;
      case "deadline":
        return a.daysRemaining - b.daysRemaining;
      default:
        return 0;
    }
  });
}

const VALID_TABS = new Set<MarketplaceTab>(["all", "invites", "recommended", "saved"]);

function MarketplacePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { firebaseUser } = useAuth();
  const {
    filteredCampaigns,
    recommendedCampaigns: hookRecommendedCampaigns,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    refetch,
  } = useMarketplace();
  const { savedIds, isSaved, toggleSave } = useSavedCampaigns();

  // Sync active tab from URL ?tab= param on mount
  useEffect(() => {
    const tabParam = searchParams.get("tab") as MarketplaceTab | null;
    if (tabParam && VALID_TABS.has(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams, setActiveTab]);

  const [latestViewMode, setLatestViewMode] = useState<ViewMode>("grid");
  const [latestSortBy, setLatestSortBy] = useState<SortOption>("latest");
  const [recommendedViewMode, setRecommendedViewMode] = useState<ViewMode>("grid");
  const [recommendedSortBy, setRecommendedSortBy] = useState<SortOption>("relevance");
  // Shared viewMode/sortBy for sidebar-layout tabs (Recommended tab, Saved tab) and Invites
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [localSearch, setLocalSearch] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformFilter[]>(
    []
  );
  const [latestPage, setLatestPage] = useState(0);
  const [recommendedPage, setRecommendedPage] = useState(0);
  const [invitesPage, setInvitesPage] = useState(0);
  const [invitations, setInvitations] = useState<
    MarketplaceCampaignExtended[]
  >([]);
  const [rawInvitations, setRawInvitations] = useState<InvitationRow[]>([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const invitationsFetchedRef = useRef(false);

  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  // Accept → ApplicationModal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedInvitationForApply, setSelectedInvitationForApply] = useState<{
    invitationId: string;
    campaignId: string;
  } | null>(null);
  const [campaignDetailForModal, setCampaignDetailForModal] = useState<any>(null);
  const [campaignDetailLoading, setCampaignDetailLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  // Filter sidebar state (for Recommended and Saved tabs)
  const [filters, setFilters] = useState(() => getEmptyFilters());
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const togglePlatform = (platform: PlatformFilter) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
    if (activeTab === "invites") setInvitesPage(0);
  };

  // Eagerly prefetch invitations on mount (parallel with campaigns), with cache
  const fetchInvitations = useCallback(async () => {
    if (!firebaseUser) return;

    const cached = getCachedInvitations();
    if (cached) {
      setInvitations(cached);
      setInvitationsLoading(false);
      invitationsFetchedRef.current = true;
    } else if (!invitationsFetchedRef.current) {
      setInvitationsLoading(true);
    }

    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch("/api/influencers/invitations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.invitations) {
          const rawInvs: InvitationRow[] = data.data.invitations;
          setRawInvitations(rawInvs);
          const mapped = rawInvs.map(mapInvitation);
          setInvitations(mapped);
          try {
            sessionStorage.setItem(
              INVITATIONS_CACHE_KEY,
              JSON.stringify({ data: mapped, timestamp: Date.now() })
            );
          } catch {}
        }
      }
    } catch (err) {
      console.error("Error fetching invitations:", err);
    } finally {
      setInvitationsLoading(false);
      invitationsFetchedRef.current = true;
    }
  }, [firebaseUser]);

  // Accept: fetch full campaign → open ApplicationModal
  const handleAcceptInvitation = useCallback(
    async (invitationId: string, campaignId: string) => {
      if (!firebaseUser) return;
      setCampaignDetailLoading(true);
      setSelectedInvitationForApply({ invitationId, campaignId });
      try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch(`/api/influencers/campaigns/${campaignId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.campaign) {
            setCampaignDetailForModal(data.data.campaign);
            setApplyModalOpen(true);
          }
        }
      } catch (err) {
        console.error("Error fetching campaign for accept:", err);
      } finally {
        setCampaignDetailLoading(false);
      }
    },
    [firebaseUser]
  );

  // Submit application via modal, then patch invitation to accepted
  const handleInvitationApplySubmit = useCallback(
    async (data: {
      pitchMessage: string;
      proposedRate?: number;
      questionAnswers?: { question: string; answer: string }[];
    }) => {
      if (!firebaseUser || !selectedInvitationForApply) throw new Error("Not authenticated");
      const { invitationId, campaignId } = selectedInvitationForApply;
      const token = await firebaseUser.getIdToken();

      // 1. Create application
      const res = await fetch(`/api/influencers/campaigns/${campaignId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to submit application");
      }

      // 2. Patch invitation to accepted
      await fetch(`/api/influencers/invitations/${invitationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "accepted" }),
      });

      // 3. Optimistic update
      setRawInvitations((prev) =>
        prev.map((inv) =>
          inv.id === invitationId ? { ...inv, status: "accepted" } : inv
        )
      );
      setInvitations((prev) =>
        prev.map((c) =>
          c.invitationId === invitationId
            ? { ...c, invitationStatus: "accepted" }
            : c
        )
      );
      try { sessionStorage.removeItem(INVITATIONS_CACHE_KEY); } catch {}
      setApplySuccess(true);
    },
    [firebaseUser, selectedInvitationForApply]
  );

  // Decline: optimistic state update, then API call
  const handleDeclineInvitation = useCallback(
    async (invitationId: string) => {
      if (!firebaseUser) return;
      setRespondingTo(invitationId);

      // Save previous state for rollback
      const prevRaw = rawInvitations;
      const prevMapped = invitations;

      // Optimistic update
      setRawInvitations((prev) =>
        prev.map((inv) =>
          inv.id === invitationId ? { ...inv, status: "declined" } : inv
        )
      );
      setInvitations((prev) =>
        prev.map((c) =>
          c.invitationId === invitationId
            ? { ...c, invitationStatus: "declined" }
            : c
        )
      );

      try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch(`/api/influencers/invitations/${invitationId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "declined" }),
        });
        if (!res.ok) {
          // Revert on failure
          setRawInvitations(prevRaw);
          setInvitations(prevMapped);
        } else {
          try { sessionStorage.removeItem(INVITATIONS_CACHE_KEY); } catch {}
        }
      } catch (err) {
        console.error("Error declining invitation:", err);
        setRawInvitations(prevRaw);
        setInvitations(prevMapped);
      } finally {
        setRespondingTo(null);
      }
    },
    [firebaseUser, rawInvitations, invitations]
  );

  useEffect(() => {
    if (firebaseUser) {
      fetchInvitations();
    }
  }, [firebaseUser, fetchInvitations]);

  useEffect(() => {
    setLatestPage(0);
    setRecommendedPage(0);
    setInvitesPage(0);
    setFilters(getEmptyFilters());
    setLocalSearch("");
    setSelectedTopics([]);
    setSelectedPlatforms([]);
  }, [activeTab]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // On invites tab, filtering happens client-side via filteredInvitations memo
    if (activeTab === "invites") {
      setInvitesPage(0);
      return;
    }
    const params = new URLSearchParams();
    if (localSearch.trim()) params.set("query", localSearch.trim());
    if (selectedPlatforms.length > 0)
      params.set("platforms", selectedPlatforms.join(","));
    if (selectedTopics.length > 0)
      params.set("topics", selectedTopics.join(","));
    const qs = params.toString();
    if (qs) {
      router.push(`/influencers/marketplace/search?${qs}`);
    }
  };

  const handleTopicSelect = (topics: string[]) => {
    setSelectedTopics(topics);
  };

  const removeTopic = (topic: string) => {
    setSelectedTopics((prev) => prev.filter((t) => t !== topic));
  };

  // Sorted campaigns for Latest section — no local filtering, pure discovery
  const displayCampaigns = useMemo(
    () => sortCampaigns(filteredCampaigns, latestSortBy),
    [filteredCampaigns, latestSortBy]
  );

  // Recommended for me — sorted by server-computed relevanceScore, then user sort
  const recommendedCampaigns = useMemo(
    () => sortCampaigns(hookRecommendedCampaigns, recommendedSortBy),
    [hookRecommendedCampaigns, recommendedSortBy]
  );

  // Saved campaigns
  const savedCampaigns = useMemo(
    () =>
      sortCampaigns(
        filteredCampaigns.filter((c) => savedIds.has(c.id)),
        sortBy
      ),
    [filteredCampaigns, savedIds, sortBy]
  );

  // Apply sidebar filters (for Recommended / Saved tabs)
  const applyFilters = useCallback(
    (campaigns: MarketplaceCampaignExtended[]) => {
      let result = campaigns;

      if (filters.categories.length > 0) {
        result = result.filter((c) =>
          filters.categories.some(
            (cat) =>
              c.category.toLowerCase() === cat.toLowerCase() ||
              c.categories.some(
                (cc) => cc.toLowerCase() === cat.toLowerCase()
              )
          )
        );
      }

      if (filters.platforms.length > 0) {
        result = result.filter((c) =>
          filters.platforms.some((p) =>
            c.platforms.some((cp) => cp.toLowerCase() === p.toLowerCase())
          )
        );
      }

      if (filters.budgetMin) {
        const min = parseFloat(filters.budgetMin);
        if (!isNaN(min)) result = result.filter((c) => c.budgetMax >= min);
      }
      if (filters.budgetMax) {
        const max = parseFloat(filters.budgetMax);
        if (!isNaN(max)) result = result.filter((c) => c.budgetMin <= max);
      }

      return result;
    },
    [filters]
  );

  // Filtered data for Recommended tab — uses relevance-sorted list
  const filteredRecommendedTab = useMemo(
    () => sortCampaigns(applyFilters(hookRecommendedCampaigns), sortBy),
    [hookRecommendedCampaigns, applyFilters, sortBy]
  );

  // Filtered data for Saved tab
  const filteredSavedTab = useMemo(
    () => applyFilters(savedCampaigns),
    [savedCampaigns, applyFilters]
  );

  const isTabLoading = activeTab === "invites" ? invitationsLoading : isLoading;

  // Count unseen invitations for the badge
  const unseenInviteCount = useMemo(
    () => rawInvitations.filter((inv) => !inv.seenAt).length,
    [rawInvitations]
  );

  // Filter invitations by search text and platform pills
  const filteredInvitations = useMemo(() => {
    let result = rawInvitations;

    const query = localSearch.trim().toLowerCase();
    if (query) {
      result = result.filter((inv) => {
        const title = (inv.campaign?.title || "").toLowerCase();
        const brand = (inv.campaign?.brandName || "").toLowerCase();
        const msg = (inv.message || "").toLowerCase();
        const cats = (inv.campaign?.categories || []).join(" ").toLowerCase();
        return (
          title.includes(query) ||
          brand.includes(query) ||
          msg.includes(query) ||
          cats.includes(query)
        );
      });
    }

    if (selectedPlatforms.length > 0) {
      result = result.filter((inv) => {
        const platforms = (inv.campaign?.platforms || []).map((p) =>
          p.toLowerCase()
        );
        return selectedPlatforms.some((sp) => platforms.includes(sp));
      });
    }

    return result;
  }, [rawInvitations, localSearch, selectedPlatforms]);

  // Determine if this tab uses the sidebar layout (Recommended / Saved)
  const usesSidebarLayout =
    activeTab === "recommended" || activeTab === "saved";

  const sidebarTabCampaigns =
    activeTab === "recommended"
      ? filteredRecommendedTab
      : activeTab === "saved"
        ? filteredSavedTab
        : [];

  return (
    <ProfileCompletionGuard>
      <EmailVerificationGuard>
        {/* White header area */}
        <div className="bg-white px-4 sm:px-6 lg:px-8 pt-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-brand-navy">
                Marketplace
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Explore campaigns open for bidding
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.key
                    ? "text-brand-navy"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                {tab.key === "invites" && unseenInviteCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full">
                    {unseenInviteCount}
                  </span>
                )}
                {tab.key === "saved" && savedIds.size > 0 && (
                  <span className="ml-1 text-xs text-gray-400">
                    ({savedIds.size})
                  </span>
                )}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-navy" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Gray content area */}
        <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Search Bar + Platform Pills (shown on all/invites tabs) */}
            {!usesSidebarLayout && (
              <>
                <div className="bg-white px-4 sm:px-6 lg:px-8 py-4 lg:py-6 mb-8 rounded-lg border border-gray-200">
                  <form
                    onSubmit={handleSearchSubmit}
                    className="flex items-center gap-3 mb-4"
                  >
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        placeholder="eg. Food, Lifestyle, #newborn"
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                      />
                      {localSearch && (
                        <button
                          type="button"
                          onClick={() => setLocalSearch("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
                    >
                      Search
                    </button>
                  </form>

                  {/* Selected topic pills */}
                  {selectedTopics.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="text-xs text-gray-400 font-medium">
                        Topics:
                      </span>
                      {selectedTopics.map((topic) => (
                        <span
                          key={topic}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200"
                        >
                          {topic}
                          <button
                            type="button"
                            onClick={() => removeTopic(topic)}
                            className="ml-0.5 text-blue-400 hover:text-blue-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                      <button
                        type="button"
                        onClick={() => setSelectedTopics([])}
                        className="text-xs text-gray-400 hover:text-gray-600 underline"
                      >
                        Clear all
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    {platformButtons.map(({ id, label, icon: Icon }) => {
                      const isActive = selectedPlatforms.includes(id);
                      return (
                        <button
                          key={id}
                          onClick={() => togglePlatform(id)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-[#FF385C] text-white"
                              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Top Topics */}
                {activeTab === "all" && (
                  <div className="mb-8">
                    <TopTopicsSection
                      selectedTopics={selectedTopics}
                      onTopicSelect={handleTopicSelect}
                    />
                  </div>
                )}
              </>
            )}

            {/* Search Bar for sidebar-layout tabs */}
            {usesSidebarLayout && (
              <div className="bg-white px-4 sm:px-6 lg:px-8 py-4 lg:py-6 mb-8 rounded-lg border border-gray-200">
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center gap-3"
                >
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={localSearch}
                      onChange={(e) => setLocalSearch(e.target.value)}
                      placeholder="eg. Food, Lifestyle, #newborn"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
                  >
                    Search
                  </button>
                </form>
              </div>
            )}

            {/* Loading State — skeleton cards for perceived performance */}
            {isTabLoading && (
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
            {!isTabLoading && error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600 mb-3">{error}</p>
                <button
                  onClick={refetch}
                  className="px-6 py-2 bg-brand-navy text-white rounded-full hover:bg-brand-navy-light transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* ===== ALL CAMPAIGNS TAB ===== */}
            {!isTabLoading && !error && activeTab === "all" && (
              <>
                {/* Latest Campaigns Section */}
                <div className="mb-10 bg-white rounded-lg border border-2-[#E0E0E0]">
                  <div className="w-full border border-t-0 border-x-0 border-b-[#E0E0E0]">
                    <div className="flex items-center justify-between mb-4 px-6 pt-4">
                      <div>
                        <h2 className="text-lg font-semibold text-brand-navy">
                          Latest Campaigns
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                          See what{"\u2019"}s new in the campaign space
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <SortDropdown
                          sortBy={latestSortBy}
                          onSortChange={(s) => { setLatestSortBy(s); setLatestPage(0); }}
                        />
                        <ViewToggle
                          viewMode={latestViewMode}
                          onViewModeChange={(v) => { setLatestViewMode(v); setLatestPage(0); }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-5">
                    {displayCampaigns.length === 0 ? (
                      <EmptyState message="There are no active campaigns at the moment. Check back soon!" />
                    ) : (
                      <>
                        <CampaignGrid
                          campaigns={displayCampaigns.slice(latestPage * 6, (latestPage + 1) * 6)}
                          viewMode={latestViewMode}
                          isSaved={isSaved}
                          onToggleSave={toggleSave}
                        />
                        <PaginationBar
                          currentPage={latestPage}
                          totalCount={displayCampaigns.length}
                          pageSize={6}
                          onPageChange={setLatestPage}
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Recommended for Me Section */}
                <div className="mb-10 bg-white rounded-lg border border-2-[#E0E0E0]">
                  <div className="w-full border border-t-0 border-x-0 border-b-[#E0E0E0]">
                    <div className="flex items-center justify-between mb-4 px-6 pt-4">
                      <div>
                        <h2 className="text-lg font-semibold text-brand-navy">
                          Recommended for me
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Campaigns that match your profile
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <SortDropdown
                          sortBy={recommendedSortBy}
                          onSortChange={(s) => { setRecommendedSortBy(s); setRecommendedPage(0); }}
                        />
                        <ViewToggle
                          viewMode={recommendedViewMode}
                          onViewModeChange={(v) => { setRecommendedViewMode(v); setRecommendedPage(0); }}
                        />
                        <button
                          onClick={() => setActiveTab("recommended")}
                          className="text-sm text-brand-navy font-medium hover:underline whitespace-nowrap"
                        >
                          See All
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-5">
                    {recommendedCampaigns.length === 0 ? (
                      <EmptyState message="No recommended campaigns at the moment" />
                    ) : (
                      <>
                        <CampaignGrid
                          campaigns={recommendedCampaigns.slice(recommendedPage * 6, (recommendedPage + 1) * 6)}
                          viewMode={recommendedViewMode}
                          isSaved={isSaved}
                          onToggleSave={toggleSave}
                        />
                        <PaginationBar
                          currentPage={recommendedPage}
                          totalCount={recommendedCampaigns.length}
                          pageSize={6}
                          onPageChange={setRecommendedPage}
                        />
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ===== INVITES TAB ===== */}
            {!isTabLoading && !error && activeTab === "invites" && (
              <div>
                {/* Count badge */}
                {(() => {
                  const pendingCount = filteredInvitations.filter((inv) => inv.status === "sent").length;
                  const hasFilter = localSearch.trim() || selectedPlatforms.length > 0;
                  return (
                    <div className="flex items-center gap-2 mb-5">
                      <span className={`w-2 h-2 rounded-full ${pendingCount > 0 ? "bg-blue-500" : "bg-gray-400"}`} />
                      <span className="text-sm font-bold text-brand-navy">
                        {pendingCount} pending invite{pendingCount !== 1 ? "s" : ""}
                        <span className="font-normal text-gray-500">
                          {" "}of {filteredInvitations.length}{hasFilter ? ` matching` : ""} total
                        </span>
                      </span>
                    </div>
                  );
                })()}
                {filteredInvitations.length === 0 ? (
                  <EmptyState message={
                    rawInvitations.length > 0
                      ? "No invitations match your search or filters"
                      : "You don't have any campaign invitations yet"
                  } />
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">
                              Profile
                            </th>
                            <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">
                              Campaign Name
                            </th>
                            <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">
                              Offer
                            </th>
                            <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">
                              Date Sent
                            </th>
                            <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">
                              Due Date
                            </th>
                            <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">
                              Message
                            </th>
                            <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredInvitations.slice(invitesPage * 6, (invitesPage + 1) * 6).map((inv) => {
                            const imgSrc =
                              inv.campaign?.productImageUrl ||
                              inv.campaign?.brandLogo ||
                              "";
                            const initials = (
                              inv.campaign?.brandName || "?"
                            )
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase();
                            const isUnseen = !inv.seenAt;

                            return (
                              <tr
                                key={inv.id}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                {/* Profile */}
                                <td className="px-5 py-4">
                                  <div className="relative inline-block">
                                  {isUnseen && (
                                    <span className="absolute -top-0.5 -left-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full z-10 ring-2 ring-white" />
                                  )}
                                  {imgSrc ? (
                                    <img
                                      src={`/api/image-proxy?url=${encodeURIComponent(imgSrc)}`}
                                      alt=""
                                      className="w-11 h-11 rounded-full object-cover"
                                      onError={(e) => {
                                        (
                                          e.target as HTMLImageElement
                                        ).style.display = "none";
                                        (
                                          e.target as HTMLImageElement
                                        ).nextElementSibling?.classList.remove(
                                          "hidden"
                                        );
                                      }}
                                    />
                                  ) : null}
                                  <div
                                    className={`w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-500 ${imgSrc ? "hidden" : ""}`}
                                  >
                                    {initials}
                                  </div>
                                  </div>
                                </td>
                                {/* Campaign Name */}
                                <td className="px-5 py-4">
                                  <p className="text-sm font-semibold text-brand-navy leading-tight">
                                    {inv.campaign?.title || "Invited Campaign"}
                                  </p>
                                  {inv.campaign?.brandName && inv.campaign.brandName !== "Unknown Brand" && (
                                    <p className="text-xs text-[#FF385C] mt-0.5">
                                      {inv.campaign.brandName}
                                    </p>
                                  )}
                                </td>
                                {/* Offer */}
                                <td className="px-5 py-4 whitespace-nowrap">
                                  <span className="text-sm font-semibold text-green-600">
                                    {formatOffer(inv.campaign?.budget)}
                                  </span>
                                </td>
                                {/* Date Sent */}
                                <td className="px-5 py-4">
                                  <span className="text-sm text-gray-600">
                                    {formatDate(inv.invitedAt)}
                                  </span>
                                </td>
                                {/* Due Date */}
                                <td className="px-5 py-4">
                                  <span className="text-sm text-gray-600">
                                    {formatDate(inv.campaign?.dueDate || null)}
                                  </span>
                                </td>
                                {/* Message */}
                                <td className="px-5 py-4 max-w-[200px]">
                                  <p className="text-sm text-gray-500 line-clamp-2">
                                    {inv.message || "—"}
                                  </p>
                                </td>
                                {/* Actions */}
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-2">
                                    {inv.status === "sent" ? (
                                      <>
                                        <button
                                          onClick={() =>
                                            handleDeclineInvitation(inv.id)
                                          }
                                          title="Decline"
                                          className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 transition-colors"
                                        >
                                          <X className="w-4 h-4 text-red-600" />
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleAcceptInvitation(
                                              inv.id,
                                              inv.campaignId
                                            )
                                          }
                                          title="Accept"
                                          className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center hover:bg-green-200 transition-colors"
                                        >
                                          <Check className="w-4 h-4 text-green-600" />
                                        </button>
                                      </>
                                    ) : (
                                      <span
                                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                                          inv.status === "accepted"
                                            ? "bg-green-50 text-green-700"
                                            : "bg-gray-100 text-gray-500"
                                        }`}
                                      >
                                        {inv.status === "accepted"
                                          ? "Accepted"
                                          : "Declined"}
                                      </span>
                                    )}
                                    <button
                                      title="Chat"
                                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                    >
                                      <MessageCircle className="w-4 h-4 text-gray-500" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        router.push(
                                          `/influencers/marketplace/${inv.campaignId}`
                                        )
                                      }
                                      title="View Campaign"
                                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                    >
                                      <ArrowRight className="w-4 h-4 text-gray-500" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-5 pb-4">
                      <PaginationBar
                        currentPage={invitesPage}
                        totalCount={filteredInvitations.length}
                        pageSize={6}
                        onPageChange={setInvitesPage}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===== RECOMMENDED TAB (sidebar layout) ===== */}
            {!isTabLoading && !error && activeTab === "recommended" && (
              <SidebarTabLayout
                campaigns={filteredRecommendedTab}
                viewMode={viewMode}
                setViewMode={setViewMode}
                sortBy={sortBy}
                setSortBy={setSortBy}
                filters={filters}
                setFilters={setFilters}
                showMobileFilters={showMobileFilters}
                setShowMobileFilters={setShowMobileFilters}
                isSaved={isSaved}
                onToggleSave={toggleSave}
                emptyMessage="No recommended campaigns at the moment. Try adjusting your filters."
                title="Recommended"
              />
            )}

            {/* ===== SAVED TAB (sidebar layout) ===== */}
            {!isTabLoading && !error && activeTab === "saved" && (
              <SidebarTabLayout
                campaigns={filteredSavedTab}
                viewMode={viewMode}
                setViewMode={setViewMode}
                sortBy={sortBy}
                setSortBy={setSortBy}
                filters={filters}
                setFilters={setFilters}
                showMobileFilters={showMobileFilters}
                setShowMobileFilters={setShowMobileFilters}
                isSaved={isSaved}
                onToggleSave={toggleSave}
                emptyMessage="No saved campaigns yet. Save campaigns you're interested in to find them here later."
                emptyIcon={<Bookmark className="w-8 h-8 text-gray-400" />}
                title="Saved"
              />
            )}
          </div>
        </div>
        {/* Loading overlay while fetching campaign detail */}
        {campaignDetailLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-3 shadow-xl">
              <Loader2 className="w-8 h-8 text-brand-navy animate-spin" />
              <p className="text-sm text-gray-600">Loading campaign details...</p>
            </div>
          </div>
        )}

        {/* Application Modal for invitation accept */}
        {campaignDetailForModal && (
          <ApplicationModal
            isOpen={applyModalOpen}
            onClose={() => {
              setApplyModalOpen(false);
              setCampaignDetailForModal(null);
              setSelectedInvitationForApply(null);
            }}
            onSubmit={handleInvitationApplySubmit}
            campaignTitle={campaignDetailForModal.title || ""}
            campaignDescription={campaignDetailForModal.description}
            brandName={campaignDetailForModal.brandInfo?.name}
            productImageUrl={campaignDetailForModal.product?.productImagesUrls?.[0]}
            location={campaignDetailForModal.audience?.targetLocation}
            campaignBudget={{
              compensationModel: campaignDetailForModal.budget?.compensationModel || "fixed",
              fixedAmount: campaignDetailForModal.budget?.fixedAmount || 0,
              minRangeAmount: campaignDetailForModal.budget?.minRangeAmount || 0,
              maxRangeAmount: campaignDetailForModal.budget?.maxRangeAmount || 0,
              currency: campaignDetailForModal.budget?.currency || "ZAR",
            }}
            deliverables={(campaignDetailForModal.tasks?.requiredDeliverables || []).map(
              (d: any) => ({
                platform: d.platform,
                contentType: d.type || d.contentType || "",
                quantity: d.quantity,
                description: d.description,
              })
            )}
            screeningQuestions={(campaignDetailForModal.tasks?.questions || []).map(
              (q: any) => ({
                question: q.question,
                answers: (q.answers || [])
                  .map((a: any) => (typeof a === "string" ? a : a.text || ""))
                  .filter((a: string) => a.trim() !== ""),
              })
            )}
          />
        )}

        {/* Success modal after accepting invitation */}
        {applySuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
              <div className="w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-9 h-9 text-green-500" />
              </div>
              <p className="text-sm font-medium text-gray-800 mb-2">
                Thank you for applying to be part of this campaign.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                You&apos;ll be notified of the outcome soon.
              </p>
              <button
                onClick={() => {
                  setApplySuccess(false);
                  setApplyModalOpen(false);
                  setCampaignDetailForModal(null);
                  setSelectedInvitationForApply(null);
                }}
                className="px-8 py-2.5 bg-brand-navy text-white text-sm font-semibold rounded-lg hover:bg-brand-navy-light transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </EmailVerificationGuard>
    </ProfileCompletionGuard>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <MarketplacePageContent />
    </Suspense>
  );
}

/* ================ Sub-components ================ */

function SidebarTabLayout({
  campaigns,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  filters,
  setFilters,
  showMobileFilters,
  setShowMobileFilters,
  isSaved,
  onToggleSave,
  emptyMessage,
  emptyIcon,
  title,
}: {
  campaigns: MarketplaceCampaignExtended[];
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  sortBy: SortOption;
  setSortBy: (s: SortOption) => void;
  filters: ReturnType<typeof getEmptyFilters>;
  setFilters: (f: ReturnType<typeof getEmptyFilters>) => void;
  showMobileFilters: boolean;
  setShowMobileFilters: (v: boolean) => void;
  isSaved: (id: string) => boolean;
  onToggleSave: (id: string) => void;
  emptyMessage: string;
  emptyIcon?: React.ReactNode;
  title: string;
}) {
  const [currentPage, setCurrentPage] = useState(0);

  // Reset page when data, sort, or view mode changes
  useEffect(() => {
    setCurrentPage(0);
  }, [campaigns.length, sortBy, viewMode]);

  return (
    <div className="flex gap-6">
      {/* Filter Sidebar - Desktop */}
      <div className="hidden lg:block w-[280px] flex-shrink-0">
        <CampaignFilterSidebar filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Mobile filter toggle */}
      <button
        onClick={() => setShowMobileFilters(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 bg-brand-navy text-white rounded-full shadow-lg hover:bg-brand-navy-light transition-colors"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters
      </button>

      {/* Mobile filter drawer */}
      {showMobileFilters && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-[300px] bg-white overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-brand-navy">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <CampaignFilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
              className="border-0 rounded-none"
            />
          </div>
        </>
      )}

      {/* Results */}
      <div className="flex-1 min-w-0">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {campaigns.length} {title.toLowerCase()} campaign
            {campaigns.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-3">
            <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </div>

        {/* Results */}
        {campaigns.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              {emptyIcon || <Clipboard className="w-8 h-8 text-gray-400" />}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Campaigns Found
            </h3>
            <p className="text-gray-600 mb-4">{emptyMessage}</p>
            <button
              onClick={() => setFilters(getEmptyFilters())}
              className="px-6 py-2 bg-brand-navy text-white rounded-full hover:bg-brand-navy-light transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <CampaignGrid
              campaigns={campaigns.slice(currentPage * 6, (currentPage + 1) * 6)}
              viewMode={viewMode}
              isSaved={isSaved}
              onToggleSave={onToggleSave}
            />
            <PaginationBar
              currentPage={currentPage}
              totalCount={campaigns.length}
              pageSize={6}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}

function CampaignGrid({
  campaigns,
  viewMode,
  isSaved,
  onToggleSave,
}: {
  campaigns: MarketplaceCampaignExtended[];
  viewMode: ViewMode;
  isSaved: (id: string) => boolean;
  onToggleSave: (id: string) => void;
}) {
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <MarketplaceCampaignCard
            key={campaign.id}
            campaign={campaign}
            viewMode="grid"
            isSaved={isSaved(campaign.id)}
            onToggleSave={onToggleSave}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <MarketplaceCampaignCard
          key={campaign.id}
          campaign={campaign}
          viewMode="list"
          isSaved={isSaved(campaign.id)}
          onToggleSave={onToggleSave}
        />
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <Clipboard className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No Campaigns Found
      </h3>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

function ViewToggle({
  viewMode,
  onViewModeChange,
}: {
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
}) {
  return (
    <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1 bg-white">
      <button
        onClick={() => onViewModeChange("grid")}
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
        onClick={() => onViewModeChange("list")}
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
  );
}

function SortDropdown({
  sortBy,
  onSortChange,
}: {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const currentLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label || "Relevance";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:border-gray-400 transition-all"
      >
        <span>{currentLabel}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2 px-2">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onSortChange(option.value);
                  setIsOpen(false);
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
  );
}
