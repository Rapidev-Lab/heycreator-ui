"use client";

import { useState } from "react";
import {
  TrendingUp,
  MousePointer,
  Eye,
  Heart,
  ArrowUp,
  ArrowDown,
  Play,
  X,
} from "lucide-react";
import { mockCampaignReport } from "@/data/mockCampaignReport";
import { mockInfluencers } from "@/data/mockInfluencers"; // Adjust path as needed
import { TimeFilter } from "@/types/campaign-report";
import PerformanceSummary from "./PerformanceSummary";
import RecommendedCreatorCard from "@/components/brands/discover/RecommendedCreatorCard";
import SecondaryFilterBar from "@/components/brands/discover/SecondaryFilterBar";
import AverageMetricsTable, { NetworkMetric } from "./AverageMetricsTable";
import TopContentCard from "./TopContentCard";
import AudienceDemographics from "./AudienceDemographics";

const mockAverageMetrics: NetworkMetric[] = [
  {
    network: "Instagram",
    followers: "156.0K",
    engagements: "9048",
    engagementRate: "5.80%",
  },
  {
    network: "TikTok",
    followers: "89.0K",
    engagements: "7298",
    engagementRate: "8.20%",
  },
  {
    network: "YouTube",
    followers: "45.0K",
    engagements: "2025",
    engagementRate: "4.50%",
  },
];

const mockAudienceData = {
  averageAge: 28,
  gender: [
    { label: "Women", percentage: 65 },
    { label: "Men", percentage: 35 },
  ],
  countries: [
    { code: "ZA", name: "South Africa", percentage: 52.6, flag: "🇿🇦" },
    { code: "UK", name: "UK", percentage: 25.8, flag: "🇬🇧" },
    { code: "US", name: "USA", percentage: 10.2, flag: "🇺🇸" },
  ],
  interests: ["Beauty", "Skincare", "Wellness"],
  brandAffinity: [
    { brand: "Nike", percentage: 90 },
    { brand: "Adidas", percentage: 80 },
    { brand: "Zara", percentage: 70 },
  ],
};

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num?.toString();
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function MetricCard({
  icon: Icon,
  label,
  value,
  change,
  changeLabel,
}: {
  icon: any;
  label: string;
  value: string;
  change: number;
  changeLabel: string;
}) {
  const isPositive = change > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 text-gray-500">
          <Icon className="w-5 h-5" />
          <span className="text-sm font-medium">{label}</span>
        </div>
      </div>
      <div className="mb-2">
        <div className="text-3xl font-bold text-brand-navy">{value}</div>
      </div>
      <div className="flex items-center gap-1 text-xs">
        {isPositive ? (
          <ArrowUp className="w-3 h-3 text-green-500" />
        ) : (
          <ArrowDown className="w-3 h-3 text-red-500" />
        )}
        <span className={isPositive ? "text-green-500" : "text-red-500"}>
          {Math.abs(change)}%
        </span>
        <span className="text-gray-500">{changeLabel}</span>
      </div>
    </div>
  );
}

export default function ReportTabContent() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("7days");
  const [showAllContent, setShowAllContent] = useState(false);
  const report = mockCampaignReport;

  // Filter or slice the influencers you want to show as "Top Performing"
  const topInfluencers = mockInfluencers.slice(0, 3);

  return (
    <div className="space-y-6">
      <PerformanceSummary />
      {/* Average Metrics Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h3 className="text-lg font-bold text-brand-navy mb-6">
          Average Metrics
        </h3>

        {/* Your existing social media filter bar */}
        {/* The new table component */}
        <AverageMetricsTable data={mockAverageMetrics} />
      </div>
      <AudienceDemographics data={mockAudienceData} />
      {/* TOP PERFORMING CONTENT SECTION */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-brand-navy">
              Top Performing Content
            </h3>
            {showAllContent && (
              <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
                {report.topContent.length} Total
              </span>
            )}
          </div>
          {/* Only show button if there are more than 3 items to show */}
          {report.topContent.length > 3 && (
            <button
              onClick={() => setShowAllContent(!showAllContent)}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              {showAllContent ? "Show Less" : "View All"}
            </button>
          )}
        </div>

        <div>
          {showAllContent ? (
            /* Multi-row Grid View - Shows EVERYTHING */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {report.topContent.map((content, index) => (
                <TopContentCard
                  key={content.id}
                  content={{
                    ...content,
                    avatarUrl: report.influencerPerformance.find(
                      (i) => i.name === content.influencerName,
                    )?.avatar,
                  }}
                  index={index}
                />
              ))}
            </div>
          ) : (
            /* Initial View - Shows ONLY first 3 items in a single row */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {report.topContent.slice(0, 3).map((content, index) => (
                <TopContentCard
                  key={content.id}
                  content={{
                    ...content,
                    avatarUrl: report.influencerPerformance.find(
                      (i) => i.name === content.influencerName,
                    )?.avatar,
                  }}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TOP PERFORMING CREATORS SECTION */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-brand-navy">
          Top Performing Creators
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topInfluencers.map((influencer) => (
            <RecommendedCreatorCard
              key={influencer.id}
              creator={{
                avatarUrl: influencer.contentPosts?.[0]?.thumbnail || "",
                name: influencer.displayName,
                handle: `@${influencer.name.toLowerCase().replace(/\s+/g, "")}`,
                isVerified: influencer.influenceScore > 80,
                isBookmarked: false,
                stats: {
                  followers: formatNumber(influencer.totalFollowers || 0),
                  engagement: `${influencer.engagementRate || 0}%`,
                  reach: formatNumber(influencer.trueReach || 0),
                },
                socials: (influencer.platforms as any) || [],
                specialty: influencer.bio || "Top Performing Content Creator",
                tags: influencer.categories || [],
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
