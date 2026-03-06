"use client";

import { useState } from "react";
import {
  Grid3x3,
  List,
  ChevronDown,
  Clock,
  Bookmark,
} from "lucide-react";
import { Campaign } from "@/types/campaign";

/* ================ Types ================ */

export type ViewMode = "grid" | "list";
export type SortOption =
  | "relevance"
  | "latest"
  | "budget-high"
  | "budget-low"
  | "deadline";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "latest", label: "Latest" },
  { value: "budget-high", label: "Budget (High to Low)" },
  { value: "budget-low", label: "Budget (Low to High)" },
  { value: "deadline", label: "Ending Soon" },
];

/* ================ Sort helpers ================ */

export function getBudgetValue(campaign: Campaign): number {
  const b = campaign.budget;
  if (!b) return 0;
  if (b.fixedAmount) return b.fixedAmount;
  if (b.maxRangeAmount) return b.maxRangeAmount;
  return 0;
}

export function getDeadlineTime(campaign: Campaign): number {
  const deadline = campaign.budget?.applicationDeadline;
  if (!deadline) return Infinity;
  const d = deadline instanceof Date ? deadline : new Date(deadline as any);
  return d.getTime();
}

export function sortCampaigns(campaigns: Campaign[], sortBy: SortOption): Campaign[] {
  const sorted = [...campaigns];
  switch (sortBy) {
    case "latest":
      sorted.sort((a, b) => {
        const da = a.updatedAt
          ? new Date(a.updatedAt as any).getTime()
          : new Date(a.createdAt as any).getTime();
        const db = b.updatedAt
          ? new Date(b.updatedAt as any).getTime()
          : new Date(b.createdAt as any).getTime();
        return db - da;
      });
      break;
    case "budget-high":
      sorted.sort((a, b) => getBudgetValue(b) - getBudgetValue(a));
      break;
    case "budget-low":
      sorted.sort((a, b) => getBudgetValue(a) - getBudgetValue(b));
      break;
    case "deadline":
      sorted.sort((a, b) => getDeadlineTime(a) - getDeadlineTime(b));
      break;
    default:
      break;
  }
  return sorted;
}

/* ================ Formatting helpers ================ */

function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatCurrencySymbol(currency: string): string {
  if (currency === "ZAR") return "R";
  if (currency === "USD") return "$";
  return currency;
}

function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDeliverableLabel(d: { platform: string; type: string }): string {
  const platform = d.platform.charAt(0).toUpperCase() + d.platform.slice(1);
  const type = d.type.replace(/_/g, " ");
  return `${platform} ${type}`;
}

function getStatusBadge(campaign: Campaign, daysRemaining: number) {
  const upper = campaign.status?.toUpperCase();
  if (
    upper === "COMPLETED" ||
    upper === "CANCELLED" ||
    upper === "CLOSED" ||
    upper === "ARCHIVED"
  ) {
    return { label: "Closed", textColor: "text-gray-600", bgColor: "bg-gray-100" };
  }
  if (daysRemaining > 0 && daysRemaining <= 3) {
    return { label: "Ending Soon", textColor: "text-amber-700", bgColor: "bg-amber-50" };
  }
  if (upper === "PUBLISHED" || upper === "ACTIVE") {
    return { label: "Published", textColor: "text-[#00A63E]", bgColor: "bg-[#E8F8EE]" };
  }
  if (upper === "IN_PROGRESS") {
    return { label: "In Progress", textColor: "text-blue-700", bgColor: "bg-blue-50" };
  }
  if (upper === "DRAFT") {
    return { label: "Draft", textColor: "text-amber-700", bgColor: "bg-amber-50" };
  }
  return {
    label: capitalizeFirst(campaign.status || "Unknown"),
    textColor: "text-gray-600",
    bgColor: "bg-gray-100",
  };
}

/* ================ Campaign Card (mirrors MarketplaceCampaignCard) ================ */

export function AnalyticsCampaignCard({
  campaign,
  viewMode,
  onView,
  isBookmarked,
  onToggleBookmark,
}: {
  campaign: Campaign;
  viewMode: ViewMode;
  onView: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
}) {
  const b = campaign.budget;
  const budgetMin =
    b?.compensationModel === "range"
      ? b.minRangeAmount || 0
      : b?.fixedAmount || 0;
  const budgetMax =
    b?.compensationModel === "range"
      ? b.maxRangeAmount || 0
      : b?.fixedAmount || 0;

  const currencySymbol = formatCurrencySymbol(b?.currency || "ZAR");
  const budgetAmount =
    budgetMin === budgetMax
      ? formatNumber(budgetMin)
      : `${formatNumber(budgetMin)} - ${formatNumber(budgetMax)}`;

  let daysRemaining = 0;
  let applicationDeadlineDate = "TBD";
  const deadline = b?.applicationDeadline;
  if (deadline) {
    const d = deadline instanceof Date ? deadline : new Date(deadline as any);
    if (!isNaN(d.getTime())) {
      daysRemaining = Math.max(
        0,
        Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      );
      applicationDeadlineDate = d.toLocaleDateString("en-ZA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  }

  const endDateDisplay =
    daysRemaining > 0
      ? `Ends in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}`
      : "Closed";
  const endDateSuffix =
    applicationDeadlineDate !== "TBD" ? `: ${applicationDeadlineDate}` : "";

  const statusBadge = getStatusBadge(campaign, daysRemaining);

  const MAX_CATEGORIES = 3;
  const rawCategories =
    campaign.campaignCategories && campaign.campaignCategories.length > 0
      ? campaign.campaignCategories
      : [];
  const allCategories = rawCategories.flatMap((cat) =>
    cat.split(/\s*[&,]\s*/).filter(Boolean)
  );
  const displayCategories = allCategories.slice(0, MAX_CATEGORIES);
  const overflowCategoryCount = allCategories.length - MAX_CATEGORIES;

  const deliverables = campaign.tasks?.requiredDeliverables || [];
  const MAX_DELIVERABLES = 2;

  const productImage = campaign.campaignProduct?.productImagesUrls?.[0];
  const initials =
    campaign.campaignTitle?.substring(0, 2).toUpperCase() || "CP";

  const renderImage = (size: "sm" | "md") => {
    const sizeClasses =
      size === "sm" ? "w-12 h-12 rounded-lg" : "w-24 h-24 rounded-lg";
    const textSize = size === "sm" ? "text-lg" : "text-2xl";

    return (
      <div className={`${sizeClasses} bg-gray-100 flex-shrink-0 overflow-hidden`}>
        {productImage ? (
          <img
            src={productImage}
            alt={campaign.campaignTitle}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={`w-full h-full bg-brand-navy flex items-center justify-center text-white font-bold ${textSize}`}
          >
            {initials}
          </div>
        )}
      </div>
    );
  };

  const renderStatusBadge = () => (
    <span
      className={`w-max inline-flex items-center px-2.5 py-1 ${statusBadge.bgColor} ${statusBadge.textColor} text-xs font-medium rounded-full`}
    >
      {statusBadge.label}
    </span>
  );

  const renderBookmark = () => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggleBookmark?.(campaign.id);
      }}
      className={`p-1.5 transition-colors rounded-lg hover:bg-gray-50 ${
        isBookmarked ? "text-brand-navy" : "text-gray-400 hover:text-brand-navy"
      }`}
    >
      <Bookmark
        className="w-5 h-5"
        fill={isBookmarked ? "currentColor" : "none"}
      />
    </button>
  );

  const renderCategoryPills = () => {
    if (displayCategories.length === 0) return null;
    return (
      <div className="flex gap-1.5 flex-wrap">
        {displayCategories.map((cat) => (
          <span
            key={cat}
            className="px-2.5 py-1 bg-[#F8F9FD] text-[#FF385C] text-xs font-medium rounded-full"
          >
            {cat}
          </span>
        ))}
        {overflowCategoryCount > 0 && (
          <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
            +{overflowCategoryCount}
          </span>
        )}
      </div>
    );
  };

  const renderDeliverables = () => {
    if (deliverables.length === 0) return null;
    const visible = deliverables.slice(0, MAX_DELIVERABLES);
    const overflowCount = deliverables.length - MAX_DELIVERABLES;
    return (
      <div className="flex items-start gap-2">
        <List className="w-4 h-4 text-brand-navy-dark mt-0.5 flex-shrink-0" />
        <div className="flex gap-1.5 flex-wrap">
          {visible.map((d, i) => (
            <span
              key={i}
              className="px-2.5 py-1 bg-gray-100 text-brand-navy-dark text-xs font-medium rounded-lg"
            >
              {formatDeliverableLabel(d)}
            </span>
          ))}
          {overflowCount > 0 && (
            <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
              +{overflowCount}
            </span>
          )}
        </div>
      </div>
    );
  };

  // ---------- LIST VIEW ----------
  if (viewMode === "list") {
    return (
      <div
        onClick={onView}
        className="flex items-stretch gap-5 p-5 rounded-2xl border border-gray-200 bg-white hover:shadow-md transition-shadow cursor-pointer"
      >
        {renderImage("md")}

        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex justify-between">
            {renderStatusBadge()}
            {renderBookmark()}
          </div>
          <h3 className="text-base font-bold text-brand-navy truncate">
            {campaign.campaignTitle}
          </h3>
          {campaign.description && (
            <p className="text-sm text-gray-500 line-clamp-1">
              {capitalizeFirst(campaign.description)}
            </p>
          )}
          {renderCategoryPills()}
        </div>

        <div className="hidden md:flex flex-col gap-2 w-60 flex-shrink-0 border-l border-gray-100 pl-5 justify-center">
          <p className="text-base font-bold text-brand-navy">
            <span className="text-brand-navy-dark">{currencySymbol}</span>{" "}
            {budgetAmount}
          </p>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>
              {endDateDisplay}
              {endDateSuffix}
            </span>
          </div>
          {renderDeliverables()}
        </div>

        <div className="flex flex-col justify-center items-center flex-shrink-0">
          <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium hover:text-white transition-colors whitespace-nowrap text-[#666666] border border-[#E0E0E0] rounded-lg hover:bg-brand-navy">
            View More
          </button>
        </div>
      </div>
    );
  }

  // ---------- GRID VIEW ----------
  return (
    <div
      onClick={onView}
      className="flex flex-col px-5 py-4 rounded-lg border border-2-[#E0E0E0] bg-white hover:shadow-md transition-shadow cursor-pointer h-full"
    >
      <div className="flex items-start gap-3 mb-3">
        {renderImage("sm")}
        <div className="flex-1 pt-0.5">{renderStatusBadge()}</div>
        {renderBookmark()}
      </div>

      <h3 className="text-base font-bold text-brand-navy-dark line-clamp-2 min-h-[3rem] mb-0.5">
        {campaign.campaignTitle}
      </h3>

      <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem] mb-2">
        {campaign.description
          ? capitalizeFirst(campaign.description)
          : "\u00A0"}
      </p>

      <div className="min-h-[1.75rem] mb-3">{renderCategoryPills()}</div>

      <hr className="border-[#E0E0E0] mb-3" />

      <p className="text-lg font-bold text-[#666666] mb-2">
        <span className="text-brand-navy-dark">{currencySymbol}</span> {budgetAmount}
      </p>

      <div className="flex items-center gap-1.5 text-sm text-[#666666] mb-2">
        <Clock className="w-4 h-4 text-brand-navy-dark" />
        <span>
          {daysRemaining > 0 ? (
            <>
              Ends in{" "}
              <strong>
                {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}
              </strong>
              {endDateSuffix}
            </>
          ) : (
            "Closed"
          )}
        </span>
      </div>

      <div className="min-h-[1.75rem] mb-4">{renderDeliverables()}</div>

      <button className="w-full mt-auto py-2.5 px-6 text-sm font-bold text-[#666666] border border-[#E0E0E0] rounded-lg hover:bg-brand-navy hover:text-white transition-colors">
        View more
      </button>
    </div>
  );
}

/* ================ ViewToggle (matches marketplace exactly) ================ */

export function ViewToggle({
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

/* ================ SortDropdown (matches marketplace exactly) ================ */

export function SortDropdown({
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
