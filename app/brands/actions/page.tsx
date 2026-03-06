"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import ProfileCompletionGuard from "@/components/auth/ProfileCompletionGuard";
import EmailVerificationGuard from "@/components/auth/EmailVerificationGuard";
import ActionsTable from "@/components/campaigns/ActionsTable";
import TertiaryCampaignButton from "@/components/ui/TertiaryCampaignButton";
import PageLoader from "@/components/ui/PageLoader";
import { useAuth } from "@/lib/firebase/auth-context";

type TypeFilter = "all" | "content" | "applications" | "payments";
type DateFilter = "all" | "today" | "this-week" | "this-month";

interface PendingAction {
  id: string;
  type: "content" | "applications" | "payments";
  title: string;
  description: string;
  campaignId: string;
  campaignTitle: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  createdAt: string;
  amount?: number;
  deliverableId?: string;
  applicationId?: string;
}

interface ActionCounts {
  content: number;
  applications: number;
  payments: number;
  total: number;
}

const typeOptions: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "content", label: "Content Approvals" },
  { value: "applications", label: "Applications" },
  { value: "payments", label: "Payments Due" },
];

const dateOptions: { value: DateFilter; label: string }[] = [
  { value: "all", label: "All Dates" },
  { value: "today", label: "Today" },
  { value: "this-week", label: "This Week" },
  { value: "this-month", label: "This Month" },
];

function ActionsPageContent() {
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const [actions, setActions] = useState<PendingAction[]>([]);
  const [counts, setCounts] = useState<ActionCounts>({
    content: 0,
    applications: 0,
    payments: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [campaignFilter, setCampaignFilter] = useState("all");

  // Campaigns for filter dropdown
  const [campaigns, setCampaigns] = useState<{ id: string; title: string }[]>([]);

  // Dropdown open state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const typeRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const campaignRef = useRef<HTMLDivElement>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Close dropdowns on outside click
  useEffect(() => {
    if (!openDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      const refs = [typeRef, dateRef, campaignRef];
      if (
        refs.every(
          (ref) => ref.current && !ref.current.contains(e.target as Node)
        )
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  // Fetch campaigns for filter
  const fetchCampaigns = useCallback(async () => {
    if (!firebaseUser) return;
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch("/api/campaigns", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const campaignList = (data.data?.campaigns || []).map((c: any) => ({
          id: c.id,
          title: c.campaignTitle || "Untitled",
        }));
        setCampaigns(campaignList);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  }, [firebaseUser]);

  // Fetch pending actions
  const fetchActions = useCallback(async () => {
    if (!firebaseUser) return;
    setLoading(true);
    try {
      const token = await firebaseUser.getIdToken();
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (campaignFilter !== "all") params.set("campaignId", campaignFilter);

      const response = await fetch(`/api/brands/actions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setActions(data.data?.actions || []);
        setCounts(data.data?.counts || { content: 0, applications: 0, payments: 0, total: 0 });
      } else {
        console.error("Failed to fetch actions");
        setActions([]);
      }
    } catch (error) {
      console.error("Error fetching actions:", error);
      setActions([]);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser, typeFilter, campaignFilter]);

  useEffect(() => {
    if (firebaseUser) {
      fetchCampaigns();
      fetchActions();
    } else {
      setLoading(false);
    }
  }, [firebaseUser, fetchCampaigns, fetchActions]);

  // Date filtering helper
  const matchesDateFilter = (action: PendingAction): boolean => {
    if (dateFilter === "all") return true;
    const actionDate = new Date(action.createdAt);
    const now = new Date();

    switch (dateFilter) {
      case "today": {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return actionDate >= today;
      }
      case "this-week": {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return actionDate >= weekAgo;
      }
      case "this-month":
        return (
          actionDate.getMonth() === now.getMonth() &&
          actionDate.getFullYear() === now.getFullYear()
        );
      default:
        return true;
    }
  };

  // Filter actions based on search and date
  const filteredActions = actions.filter((action) => {
    const matchesSearch =
      searchQuery === "" ||
      action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.creatorName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch && matchesDateFilter(action);
  });

  // Calculate Pagination values
  const totalItems = filteredActions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedActions = filteredActions.slice(startIndex, endIndex);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, dateFilter, campaignFilter]);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  // Get the display label for the active filter
  const getTypeLabel = () =>
    typeOptions.find((o) => o.value === typeFilter)?.label || "Type";
  const getDateLabel = () =>
    dateOptions.find((o) => o.value === dateFilter)?.label || "Date";
  const getCampaignLabel = () => {
    if (campaignFilter === "all") return "Campaign";
    const campaign = campaigns.find((c) => c.id === campaignFilter);
    return campaign?.title || "Campaign";
  };

  return (
    <ProfileCompletionGuard showLoading={false}>
      <EmailVerificationGuard>
        <div className="min-h-screen bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
              <div>
                <span className="text-[20px] sm:text-[24px] font-bold text-brand-navy leading-tight">
                  Pending Actions
                </span>
                <p className="text-sm text-gray-500 mt-1">
                  Review and manage all items requiring your attention
                </p>
              </div>

              {/* Counts Summary */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-blue-600">
                  <span className="font-semibold">{counts.content}</span>
                  <span className="text-gray-500">Content</span>
                </div>
                <div className="w-px h-4 bg-gray-200" />
                <div className="flex items-center gap-1.5 text-brand-navy">
                  <span className="font-semibold">{counts.applications}</span>
                  <span className="text-gray-500">Applications</span>
                </div>
                <div className="w-px h-4 bg-gray-200" />
                <div className="flex items-center gap-1.5 text-orange-600">
                  <span className="font-semibold">{counts.payments}</span>
                  <span className="text-gray-500">Payments</span>
                </div>
              </div>
            </div>

            {/* Search and Filters Container */}
            <div className="rounded-2xl border border-[#E0E0E0] bg-white p-3 py-3 sm:p-5 sm:py-5 mb-8">
              {/* Search Row */}
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search actions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent placeholder-gray-400"
                  />
                </div>
                <button
                  onClick={() => {}}
                  className="px-6 py-2.5 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-brand-navy-light transition-colors whitespace-nowrap"
                >
                  Search
                </button>
              </div>

              {/* Filters Row */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  {/* Type Dropdown */}
                  <div className="relative" ref={typeRef}>
                    <button
                      onClick={() =>
                        setOpenDropdown(openDropdown === "type" ? null : "type")
                      }
                      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        typeFilter !== "all"
                          ? "text-brand-navy bg-blue-50"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {getTypeLabel()}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${openDropdown === "type" ? "rotate-180" : ""}`}
                      />
                    </button>
                    {openDropdown === "type" && (
                      <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-30">
                        {typeOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setTypeFilter(opt.value);
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              typeFilter === opt.value
                                ? "bg-brand-navy text-white"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Date Dropdown */}
                  <div className="relative" ref={dateRef}>
                    <button
                      onClick={() =>
                        setOpenDropdown(openDropdown === "date" ? null : "date")
                      }
                      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        dateFilter !== "all"
                          ? "text-brand-navy bg-blue-50"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {getDateLabel()}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${openDropdown === "date" ? "rotate-180" : ""}`}
                      />
                    </button>
                    {openDropdown === "date" && (
                      <div className="absolute left-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-30">
                        {dateOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setDateFilter(opt.value);
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              dateFilter === opt.value
                                ? "bg-brand-navy text-white"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Campaign Dropdown */}
                  <div className="relative" ref={campaignRef}>
                    <button
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === "campaign" ? null : "campaign"
                        )
                      }
                      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        campaignFilter !== "all"
                          ? "text-brand-navy bg-blue-50"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {getCampaignLabel()}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${openDropdown === "campaign" ? "rotate-180" : ""}`}
                      />
                    </button>
                    {openDropdown === "campaign" && (
                      <div className="absolute left-0 top-full mt-1 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-30 max-h-64 overflow-y-auto">
                        <button
                          onClick={() => {
                            setCampaignFilter("all");
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            campaignFilter === "all"
                              ? "bg-brand-navy text-white"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          All Campaigns
                        </button>
                        {campaigns.map((campaign) => (
                          <button
                            key={campaign.id}
                            onClick={() => {
                              setCampaignFilter(campaign.id);
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors truncate ${
                              campaignFilter === campaign.id
                                ? "bg-brand-navy text-white"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {campaign.title}
                          </button>
                        ))}
                        {campaigns.length === 0 && (
                          <div className="px-4 py-2 text-sm text-gray-400">
                            No campaigns
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Settings / More Filters Icon */}
                <button className="p-2 text-gray-500 hover:text-brand-navy hover:bg-gray-50 rounded-lg transition-colors">
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-brand-navy animate-spin" />
              </div>
            ) : filteredActions.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  All caught up!
                </h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm">
                  {searchQuery || typeFilter !== "all" || campaignFilter !== "all"
                    ? "No actions found matching your filters. Try adjusting your search."
                    : "You have no pending actions at the moment. Great job!"}
                </p>
                {(searchQuery || typeFilter !== "all" || campaignFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setTypeFilter("all");
                      setDateFilter("all");
                      setCampaignFilter("all");
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-brand-navy text-brand-navy text-sm font-medium hover:bg-brand-navy hover:text-white transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              /* Actions Table */
              <div>
                <ActionsTable actions={paginatedActions} />

                {/* Pagination Footer */}
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-semibold text-gray-900">
                      {Math.min(startIndex + 1, totalItems)}-{Math.min(endIndex, totalItems)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-900">
                      {totalItems}
                    </span>{" "}
                    actions
                  </p>
                  <div className="flex gap-2">
                    <TertiaryCampaignButton
                      label="Previous"
                      active={currentPage > 1}
                      onClick={handlePreviousPage}
                    />
                    <TertiaryCampaignButton
                      label="Next"
                      active={currentPage < totalPages}
                      onClick={handleNextPage}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </EmailVerificationGuard>
    </ProfileCompletionGuard>
  );
}

export default function ActionsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ActionsPageContent />
    </Suspense>
  );
}
