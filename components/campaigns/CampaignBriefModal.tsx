"use client";

import { X, Edit } from "lucide-react";
import { Campaign, CampaignStatus } from "@/types/campaign";
import { useRouter } from "next/navigation";
import CampaignBriefTab from "@/components/influencers/campaigns/CampaignBriefTab";

interface CampaignBriefModalProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
}

function getStatusStyle(status: CampaignStatus) {
  switch (status) {
    case CampaignStatus.PUBLISHED:
    case CampaignStatus.ACTIVE:
    case CampaignStatus.IN_PROGRESS:
      return { label: "Active Campaign", bg: "bg-green-100", text: "text-green-700" };
    case CampaignStatus.COMPLETED:
      return { label: "Completed", bg: "bg-blue-100", text: "text-blue-700" };
    case CampaignStatus.DRAFT:
      return { label: "Draft", bg: "bg-yellow-100", text: "text-yellow-700" };
    case CampaignStatus.CLOSED:
    case CampaignStatus.CANCELLED:
    case CampaignStatus.ARCHIVED:
      return { label: "Closed", bg: "bg-gray-100", text: "text-gray-600" };
    default:
      return { label: "Active Campaign", bg: "bg-green-100", text: "text-green-700" };
  }
}

/**
 * Adapts the brand-side Campaign type to the shape CampaignBriefTab expects.
 * CampaignBriefTab was built for the influencer-side API response which uses
 * slightly different field names (product vs campaignProduct, etc.).
 */
function adaptCampaignForBriefTab(campaign: Campaign) {
  return {
    ...campaign,
    product: campaign.campaignProduct || null,
    objectives: campaign.campaignObjectives || [],
    categories: campaign.campaignCategories || [],
    timeline: {
      applicationDeadline: campaign.budget?.applicationDeadline || null,
      campaignStart: campaign.campaignStart || null,
      campaignEnd: campaign.campaignEnd || null,
    },
  };
}

export default function CampaignBriefModal({
  campaign,
  isOpen,
  onClose,
}: CampaignBriefModalProps) {
  const router = useRouter();
  if (!isOpen) return null;

  const adapted = adaptCampaignForBriefTab(campaign);
  const statusStyle = getStatusStyle(campaign.status);
  const categories = campaign.campaignCategories || [];

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-gray-50 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-lg font-bold text-brand-navy">Campaign Brief</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/brands/campaigns/create?id=${campaign.id}`)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Campaign
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Campaign Info Card */}
          <div className="mb-6 bg-white rounded-2xl border border-gray-200 p-6">
            {/* Category pills + Status */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {categories.map((cat: string) => (
                <span
                  key={cat}
                  className="px-3 py-1 bg-[#F0F0F0] text-[#666666] text-xs font-medium rounded-full"
                >
                  {cat}
                </span>
              ))}
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${statusStyle.bg} ${statusStyle.text}`}
              >
                {statusStyle.label}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-brand-navy mb-1">
              {campaign.campaignTitle}
            </h2>

            {/* Description */}
            {campaign.description && (
              <p className="text-sm text-gray-600 leading-relaxed mt-2 max-w-3xl">
                {campaign.description}
              </p>
            )}
          </div>

          {/* Brief content — same CampaignBriefTab used on /influencers/campaigns/[id] */}
          <CampaignBriefTab campaign={adapted} />
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-white px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-brand-navy text-white rounded-lg text-sm font-semibold hover:bg-brand-navy-light transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
