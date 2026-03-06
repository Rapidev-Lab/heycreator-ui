"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileCheck,
  UserPlus,
  CreditCard,
  ChevronRight,
  Clock,
} from "lucide-react";

type ActionType = "content" | "applications" | "payments";

interface PendingAction {
  id: string;
  type: ActionType;
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

interface ActionsTableProps {
  actions: PendingAction[];
  onActionClick?: (action: PendingAction) => void;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function formatCurrency(amount: number): string {
  return `R${amount.toLocaleString()}`;
}

function getTypeIcon(type: ActionType) {
  switch (type) {
    case "content":
      return <FileCheck className="w-4 h-4" />;
    case "applications":
      return <UserPlus className="w-4 h-4" />;
    case "payments":
      return <CreditCard className="w-4 h-4" />;
  }
}

function getTypeBadgeStyles(type: ActionType) {
  switch (type) {
    case "content":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "applications":
      return "bg-brand-navy-50 text-brand-navy border-brand-navy-200";
    case "payments":
      return "bg-orange-50 text-orange-700 border-orange-200";
  }
}

function getTypeLabel(type: ActionType) {
  switch (type) {
    case "content":
      return "Content";
    case "applications":
      return "Application";
    case "payments":
      return "Payment";
  }
}

function getActionButtonLabel(type: ActionType) {
  switch (type) {
    case "content":
      return "Review";
    case "applications":
      return "Review";
    case "payments":
      return "Pay";
  }
}

export default function ActionsTable({ actions, onActionClick }: ActionsTableProps) {
  const router = useRouter();
  const [avatarErrors, setAvatarErrors] = useState<Set<string>>(new Set());

  const handleActionClick = (action: PendingAction) => {
    if (onActionClick) {
      onActionClick(action);
      return;
    }

    // Default navigation behavior
    switch (action.type) {
      case "content":
        router.push(
          `/brands/campaigns/${action.campaignId}/dashboard?tab=content&deliverableId=${action.deliverableId}`
        );
        break;
      case "applications":
        router.push(
          `/brands/campaigns/${action.campaignId}/dashboard?tab=creators&subtab=applications`
        );
        break;
      case "payments":
        router.push(
          `/brands/campaigns/${action.campaignId}/dashboard?tab=payments`
        );
        break;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="hidden md:grid grid-cols-12 items-center bg-gray-50 border-b border-gray-200 px-6 py-3">
        <div className="col-span-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          Type
        </div>
        <div className="col-span-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          Description
        </div>
        <div className="col-span-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          Campaign
        </div>
        <div className="col-span-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          Creator
        </div>
        <div className="col-span-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          Date
        </div>
        <div className="col-span-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">
          Action
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-100">
        {actions.map((action) => (
          <div
            key={`${action.type}-${action.id}`}
            className="grid grid-cols-1 md:grid-cols-12 items-center px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            {/* Type Badge */}
            <div className="col-span-2 mb-2 md:mb-0">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getTypeBadgeStyles(action.type)}`}
              >
                {getTypeIcon(action.type)}
                {getTypeLabel(action.type)}
              </span>
            </div>

            {/* Description */}
            <div className="col-span-3 mb-2 md:mb-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {action.title}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-[200px]">
                {action.description}
              </p>
              {action.amount && action.type === "payments" && (
                <p className="text-xs font-semibold text-orange-600 mt-0.5">
                  {formatCurrency(action.amount)}
                </p>
              )}
            </div>

            {/* Campaign */}
            <div className="col-span-2 mb-2 md:mb-0">
              <p className="text-sm text-gray-700 truncate">
                {action.campaignTitle}
              </p>
            </div>

            {/* Creator */}
            <div className="col-span-2 mb-2 md:mb-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {action.creatorAvatar && !avatarErrors.has(action.creatorId) ? (
                    <img
                      src={action.creatorAvatar}
                      alt={action.creatorName}
                      className="w-full h-full object-cover"
                      onError={() =>
                        setAvatarErrors((prev) => new Set(prev).add(action.creatorId))
                      }
                    />
                  ) : (
                    <div className="w-full h-full bg-brand-navy flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {getInitials(action.creatorName)}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-sm text-gray-700 truncate">
                  {action.creatorName}
                </span>
              </div>
            </div>

            {/* Date */}
            <div className="col-span-2 mb-2 md:mb-0">
              <div className="flex items-center gap-1.5 text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-sm">{formatTimeAgo(action.createdAt)}</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="col-span-1 flex justify-end">
              <button
                onClick={() => handleActionClick(action)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-brand-navy bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {getActionButtonLabel(action.type)}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
