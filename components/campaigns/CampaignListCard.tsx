"use client";

import { CampaignStatus } from "@/types/campaign";

interface CampaignListCardProps {
  campaign: {
    id: string;
    title: string;
    status: CampaignStatus;
    influencerCount: number;
    budget: string;
    progress: number;
    deadline?: string;
  };
  onView?: () => void;
  className?: string;
}

export default function CampaignListCard({
  campaign,
  onView,
  className = "",
}: CampaignListCardProps) {
  const getStatusStyle = (status: CampaignStatus) => {
    console.log("status", status);  
    switch (status.toUpperCase()) {
      case CampaignStatus.ACTIVE:
        return "bg-[#ECFDF5] text-[#10B981]";
      case CampaignStatus.DRAFT:
        return "bg-gray-100 text-gray-500";
      case CampaignStatus.PUBLISHED:
        return "bg-[#FFFBEB] text-[#F59E0B]";
      case CampaignStatus.COMPLETED:
        return "bg-status-info-bg text-status-info";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };
  console.log("campaign", campaign);

  return (
    <div
      onClick={onView}
      className={`bg-white px-8 py-6 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer group ${className}`}
    >
      {/* Top Row: Title and Budget */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <h3 className="text-[16px] font-bold text-brand-navy truncate tracking-tight">
            {campaign.title}
          </h3>
        </div>
        <span className="text-[16px] font-bold text-brand-navy whitespace-nowrap">
          {campaign.budget}
        </span>
      </div>

      {/* Middle Row: Influencer Count */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(
            campaign.status,
          )}`}
        >
          {campaign.status.toUpperCase() === CampaignStatus.PUBLISHED
            ? "Reviewing"
            : campaign.status}
        </span>
        <span className="text-[13px] font-medium text-gray-400">
          {campaign.influencerCount} Influencers
        </span>
      </div>

      {/* Bottom Row: Progress Bar */}
      <div className="relative w-full bg-[#F3F4F6] rounded-full h-2 overflow-hidden">
        <div
          className="bg-brand-navy h-full transition-all duration-700 ease-in-out rounded-full"
          style={{ width: `${campaign.progress}%` }}
        />
      </div>
    </div>
  );
}
