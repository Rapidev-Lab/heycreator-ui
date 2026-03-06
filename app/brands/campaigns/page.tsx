"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  Search,
  FolderOpen,
  ChevronDown,
  SlidersHorizontal,
  Plus,
} from "lucide-react";
import ProfileCompletionGuard from "@/components/auth/ProfileCompletionGuard";
import EmailVerificationGuard from "@/components/auth/EmailVerificationGuard";
import CampaignListTable from "@/components/campaigns/CampaignListTable";
import TertiaryCampaignButton from "@/components/ui/TertiaryCampaignButton";
import { useAuth } from "@/lib/firebase/auth-context";
import { Campaign, CampaignStatus } from "@/types/campaign";
import PageLoader from "@/components/ui/PageLoader";

type StatusFilter = "all" | CampaignStatus;
type DateFilter =
  | "all"
  | "this-week"
  | "this-month"
  | "last-month"
  | "this-year";

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: CampaignStatus.DRAFT, label: "Draft" },
  { value: CampaignStatus.PUBLISHED, label: "Published" },
  { value: CampaignStatus.ACTIVE, label: "Active" },
  { value: CampaignStatus.IN_PROGRESS, label: "Paused" },
  { value: CampaignStatus.COMPLETED, label: "Completed" },
];

const dateOptions: { value: DateFilter; label: string }[] = [
  { value: "all", label: "All Dates" },
  { value: "this-week", label: "This Week" },
  { value: "this-month", label: "This Month" },
  { value: "last-month", label: "Last Month" },
  { value: "this-year", label: "This Year" },
];

function MyCampaignsPageContent() {
  const router = useRouter();
  const { user, firebaseUser } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [brandFilter, setBrandFilter] = useState("all");

  // Dropdown open state
  const [showFilters, setShowFilters] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Close dropdowns on outside click
  useEffect(() => {
    if (!openDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      const refs = [statusRef, dateRef, brandRef];
      if (
        refs.every(
          (ref) => ref.current && !ref.current.contains(e.target as Node),
        )
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  const fetchCampaigns = useCallback(async () => {
    if (!firebaseUser) return;

    setLoading(true);
    try {
      const headers: HeadersInit = {};

      try {
        const token = await firebaseUser.getIdToken();
        headers["Authorization"] = `Bearer ${token}`;
      } catch (error) {
        console.warn("Failed to get ID token, using fallback auth:", error);
        if (user) {
          headers["x-user-id"] = user.uid;
        }
      }

      const response = await fetch("/api/campaigns", {
        method: "GET",
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.data.campaigns || []);
      } else {
        console.error("Failed to fetch campaigns");
        setCampaigns([]);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser, user]);

  useEffect(() => {
    if (firebaseUser) {
      fetchCampaigns();
    } else {
      setLoading(false);
    }
  }, [firebaseUser, fetchCampaigns]);

  // Derive unique brand names from campaigns for the Brand filter
  const uniqueBrands = Array.from(
    new Set(campaigns.map((c) => c.brandId).filter(Boolean)),
  );

  // Date filtering helper
  const matchesDateFilter = (campaign: Campaign): boolean => {
    if (dateFilter === "all") return true;
    const created = campaign.createdAt;
    if (!created) return true;
    let dateObj: Date;
    if (typeof created === "object" && "toDate" in created) {
      dateObj = created.toDate();
    } else if (typeof created === "string") {
      dateObj = new Date(created);
    } else {
      dateObj = created as Date;
    }
    const now = new Date();
    switch (dateFilter) {
      case "this-week": {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return dateObj >= weekAgo;
      }
      case "this-month":
        return (
          dateObj.getMonth() === now.getMonth() &&
          dateObj.getFullYear() === now.getFullYear()
        );
      case "last-month": {
        const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lmEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        return dateObj >= lm && dateObj <= lmEnd;
      }
      case "this-year":
        return dateObj.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  };

  // Filter campaigns based on search, status, date, brand
  const filteredCampaigns = campaigns.filter((campaign) => {
    const title = campaign.campaignTitle || "";
    const matchesSearch = title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || campaign.status === statusFilter;
    const matchesBrand =
      brandFilter === "all" || campaign.brandId === brandFilter;
    return (
      matchesSearch &&
      matchesStatus &&
      matchesBrand &&
      matchesDateFilter(campaign)
    );
  });

  // Calculate Pagination values
  const totalItems = filteredCampaigns.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateFilter, brandFilter]);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  // Get the display label for the active filter
  const getStatusLabel = () =>
    statusOptions.find((o) => o.value === statusFilter)?.label || "Statuses";
  const getDateLabel = () =>
    dateOptions.find((o) => o.value === dateFilter)?.label || "Date";

  return (
    <ProfileCompletionGuard showLoading={false}>
      <EmailVerificationGuard>
        <div className="bg-[#F8F9FD] min-h-screen">
          {/* Page Header */}
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-10">
            <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4 py-6">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-brand-navy">
                  My Campaigns
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage and track all your influencer marketing campaigns
                </p>
              </div>
              <button
                onClick={() => router.push("/brands/campaigns/create")}
                className="hidden sm:inline-flex items-center justify-center gap-2.5 px-4 py-2 text-[#666666] rounded-xl transition-all duration-200 font-bold text-md active:scale-[0.98] border-[#E0E0E0] border-2"
              >
                <div className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#666666]">
                  <Plus size={10} strokeWidth={4} color="#666666"/>
                </div>
                New Campaign
              </button>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-10 py-10 max-w-[1440px] mx-auto">

            {/* Search and Filters Container */}
            <div className="rounded-2xl border border-[#E0E0E0] bg-white p-3 py-3 sm:p-5 sm:py-5 mb-8">
              {/* Search Row */}
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search campaigns"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F8F9FD] border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent placeholder-gray-400"
                  />
                </div>
                <button
                  onClick={() => {
                    /* search is live */
                  }}
                  className="px-6 py-2.5 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-brand-navy-light transition-colors whitespace-nowrap"
                >
                  Search
                </button>
              </div>

              {/* Filters Row */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {showFilters && (<>
                  {/* Statuses Dropdown */}
                  <div className="relative" ref={statusRef}>
                    <button
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === "status" ? null : "status",
                        )
                      }
                      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        statusFilter !== "all"
                          ? "text-brand-navy bg-blue-50"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {getStatusLabel()}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${openDropdown === "status" ? "rotate-180" : ""}`}
                      />
                    </button>
                    {openDropdown === "status" && (
                      <div className="absolute left-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-30">
                        {statusOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setStatusFilter(opt.value);
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              statusFilter === opt.value
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

                  {/* Brand Dropdown */}
                  <div className="relative" ref={brandRef}>
                    <button
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === "brand" ? null : "brand",
                        )
                      }
                      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        brandFilter !== "all"
                          ? "text-brand-navy bg-blue-50"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {brandFilter === "all" ? "Brand" : brandFilter}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${openDropdown === "brand" ? "rotate-180" : ""}`}
                      />
                    </button>
                    {openDropdown === "brand" && (
                      <div className="absolute left-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-30">
                        <button
                          onClick={() => {
                            setBrandFilter("all");
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            brandFilter === "all"
                              ? "bg-brand-navy text-white"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          All Brands
                        </button>
                        {uniqueBrands.map((brand) => (
                          <button
                            key={brand}
                            onClick={() => {
                              setBrandFilter(brand);
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              brandFilter === brand
                                ? "bg-brand-navy text-white"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {brand}
                          </button>
                        ))}
                        {uniqueBrands.length === 0 && (
                          <div className="px-4 py-2 text-sm text-gray-400">
                            No brands
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>)}
                </div>

                {/* Toggle Filters */}
                <button
                  onClick={() => {
                    setShowFilters((prev) => !prev);
                    setOpenDropdown(null);
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    showFilters
                      ? "text-brand-navy bg-blue-50"
                      : "text-gray-500 hover:text-brand-navy hover:bg-gray-50"
                  }`}
                  title={showFilters ? "Hide filters" : "Show filters"}
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy"></div>
              </div>
            ) : filteredCampaigns.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-lg border border-gray-200 p-8 sm:p-12 text-center">
                <div className="inline-block bg-gray-50 p-6 rounded-full mb-6">
                  <FolderOpen className="w-16 h-16 text-gray-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  {searchQuery
                    ? "No campaigns found"
                    : statusFilter === "all"
                      ? "No campaigns yet"
                      : `No ${statusFilter.toLowerCase()} campaigns`}
                </h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm">
                  {searchQuery
                    ? "Try adjusting your search terms or filters"
                    : "Get started by creating your first influencer marketing campaign"}
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <button
                    onClick={() => router.push("/brands/campaigns/create")}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-brand-navy text-brand-navy text-sm font-medium hover:bg-brand-navy hover:text-white transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Create Your First Campaign
                  </button>
                )}
              </div>
            ) : (
              /* Campaign Table */
              <div>
                <CampaignListTable
                  campaigns={paginatedCampaigns}
                  onView={(id) => {
                    const campaign = campaigns.find((c) => c.id === id);
                    if (campaign?.status === CampaignStatus.DRAFT) {
                      router.push(`/brands/campaigns/create?id=${id}`);
                    } else {
                      router.push(`/brands/campaigns/${id}/dashboard`);
                    }
                  }}
                />

                {/* Pagination Footer */}
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-semibold text-gray-900">
                      {totalItems}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-900">
                      {campaigns.length}
                    </span>{" "}
                    campaigns
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

export default function MyCampaignsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <MyCampaignsPageContent />
    </Suspense>
  );
}
