"use client";

import Link from "next/link";
import { 
  ChevronLeft, HelpCircle, Edit, Check, FileText
} from "lucide-react";
import { Campaign } from "@/types/campaign";
import { formatDate, getCurrencySymbol } from "@/lib/utils/campaign";
import PerformanceSummary from "./PerformanceSummary";

interface OverviewTabContentProps {
  campaign: Campaign;
  onViewBrief: () => void;
}

// Helper functions extracted for the component scope
function getCampaignTitle(campaign: Campaign): string {
  return campaign.campaignTitle || "";
}

function getCampaignVisibility(campaign: Campaign): string {
  return campaign.campaignVisibility || "public";
}

function getTimelineData(campaign: Campaign) {
  return {
    applicationDeadline: campaign.budget?.applicationDeadline,
    startDate: campaign.campaignStart,
    endDate: campaign.campaignEnd,
  };
}

function getBudgetData(campaign: Campaign) {
  const amount = campaign.budget?.compensationModel === 'fixed'
    ? campaign.budget.fixedAmount
    : campaign.budget?.maxRangeAmount || campaign.budget?.fixedAmount || 0;
  return {
    amount,
    currency: campaign.budget?.currency || 'ZAR',
    allocated: 0,
    perCreator: campaign.budget?.compensationModel === 'range' ? {
      min: campaign.budget.minRangeAmount,
      max: campaign.budget.maxRangeAmount,
    } : campaign.budget?.fixedAmount ? {
      min: campaign.budget.fixedAmount,
      max: campaign.budget.fixedAmount,
    } : undefined,
  };
}

function getDeliverables(campaign: Campaign) {
  return {
    taskDeliverables: campaign.tasks?.requiredDeliverables?.map(d => ({
      platform: d.platform,
      type: d.type,
      details: d.details,
      dueDate: d.dueDate,
    })) || [],
    deliverables: [],
  };
}

function getFiles(campaign: Campaign) {
  return {
    campaignAssets: campaign.campaignAssets || [],
    moodBoard: campaign.campaignMoodBoard || [],
    productImages: (campaign.campaignProduct?.productImagesUrls || []).map((url: string) => ({
      name: url.split('/').pop() || 'image',
      type: 'image/jpeg',
      url,
    })),
    campaignBrief: campaign.campaignBrief || [],
    contractNDA: campaign.campaignContract || [],
  };
}

export default function OverviewTabContent({ campaign, onViewBrief }: OverviewTabContentProps) {

  const timeline = getTimelineData(campaign);
  const timelineEvents = [
    {
      label: "Application Deadline",
      date: timeline?.applicationDeadline,
      desc: "Last day for influencers to apply",
      status: "completed",
    },
    {
      label: "Campaign Start",
      date: timeline?.startDate,
      desc: "Content creation and approval begins",
      status: "completed",
    },
    {
      label: "Campaign End",
      date: timeline?.endDate,
      desc: "Final content submissions and approvals due",
      status: "upcoming",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Campaign Brief Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-brand-navy-dark mb-3">Campaign Brief</h3>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
              {campaign.description || "No campaign description provided."}
            </p>
            <div className="flex flex-wrap gap-2">
              {(() => {
                const deliverableData = getDeliverables(campaign);
                return Object.entries(
                  deliverableData.taskDeliverables.reduce((acc: Record<string, number>, task: any) => {
                    const key = `${task.platform} ${task.type}`;
                    acc[key] = (acc[key] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([key, count]) => (
                  <span key={key} className="px-3 py-1.5 bg-[#F0F4F8] text-brand-navy-dark rounded-xl text-xs font-medium">
                    {count} {key}{count > 1 ? 's' : ''}
                  </span>
                ));
              })()}
            </div>
          </div>
          <button
            onClick={onViewBrief}
            className="ml-6 flex items-center justify-center gap-2 w-[143px] h-[40px] rounded-[10px] border-2 border-[#E0E0E0] bg-white text-[#666666] text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            View full brief
          </button>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-brand-navy-dark mb-6">Timeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {timelineEvents.map((event, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0">
                {event.status === "completed" ? (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-[#D1FAE5] bg-[#00A63E]">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-[#DBEAFE] bg-brand-navy-dark">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0F1419] mb-1">{event.label}</h4>
                <p className="text-xs text-gray-500 mb-1">{formatDate(event.date)}</p>
                <p className="text-xs text-gray-400">{event.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Section */}
      {(() => {
        const budgetData = getBudgetData(campaign);
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-brand-navy-dark mb-6">Budget</h3>
            <div className="flex items-end justify-between mb-3">
              <div>
                <div className="text-xs text-gray-500 uppercase font-medium mb-1">Total Budget</div>
                <div className="text-3xl font-semibold text-[#0F1419]">
                  {getCurrencySymbol(budgetData.currency)} {(budgetData.amount || 0).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase font-medium mb-1">Spent</div>
                <div className="text-3xl font-bold text-[#4CAF50]">
                  {getCurrencySymbol(budgetData.currency)} {(budgetData.allocated || 0).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4CAF50] rounded-full transition-all"
                style={{ width: `${budgetData.amount ? ((budgetData.allocated || 0) / budgetData.amount) * 100 : 0}%` }}
              />
            </div>
          </div>
        );
      })()}

      {/* Performance Summary */}
      <PerformanceSummary />

      {/* Files & Assets */}
      {(() => {
        const files = getFiles(campaign);
        const hasNoFiles = !Object.values(files).some(arr => arr.length > 0);

        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-brand-navy-dark mb-6">Files & Assets</h3>
            <div className="space-y-4">
              {files.campaignAssets.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Campaign Assets</p>
                  <div className="space-y-2">
                    {files.campaignAssets.map((file: any, index: number) => (
                      <a key={index} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-[#F9FAFB] rounded-lg hover:bg-gray-100">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold truncate">{file.name}</h4>
                          <p className="text-xs text-gray-500">{file.type?.split('/')[1]?.toUpperCase()}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {files.moodBoard.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Mood Board</p>
                  <div className="grid grid-cols-4 gap-2">
                    {files.moodBoard.map((file: any, index: number) => (
                      <a key={index} href={file.url} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-80">
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {files.productImages.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Product Images</p>
                  <div className="grid grid-cols-4 gap-2">
                    {files.productImages.map((file: any, index: number) => (
                      <a key={index} href={file.url} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-80">
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {files.campaignBrief.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Campaign Brief</p>
                  <div className="space-y-2">
                    {files.campaignBrief.map((file: any, index: number) => (
                      <a key={index} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-[#F9FAFB] rounded-lg hover:bg-gray-100">
                        <FileText className="w-5 h-5 text-red-500" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold truncate">{file.name}</h4>
                          <p className="text-xs text-gray-500">{file.type?.split('/')[1]?.toUpperCase() || 'PDF'}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {files.contractNDA.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Contract / NDA</p>
                  <div className="space-y-2">
                    {files.contractNDA.map((file: any, index: number) => (
                      <a key={index} href={file.url} target="_blank" className="flex items-center gap-4 p-4 bg-[#F9FAFB] rounded-lg hover:bg-gray-100">
                        <FileText className="w-5 h-5 text-purple-500" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold truncate">{file.name}</h4>
                          <p className="text-xs text-gray-500">{file.type?.split('/')[1]?.toUpperCase() || 'PDF'}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {hasNoFiles && (
                <div className="text-center py-8 text-gray-500">
                  <p>No files uploaded for this campaign</p>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
