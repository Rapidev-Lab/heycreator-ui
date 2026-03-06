'use client';

import { useState } from 'react';
import {
  BarChart3,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Megaphone,
  Users,
  Award,
  Tag,
} from 'lucide-react';
import { CrossWorkspaceAnalytics } from '@/types/agency';

// ─── Inline Mock Data ─────────────────────────────────────────────────────────

type Period = 'week' | 'month' | 'quarter';

const MOCK_ANALYTICS: Record<Period, CrossWorkspaceAnalytics> = {
  week: {
    period: 'week',
    workspaceComparisons: [
      {
        workspaceId: 'ws-nike-sa',
        workspaceName: 'Nike SA',
        searchesRun: 8,
        campaignsCreated: 2,
        creatorsFound: 36,
        avgEngagementRate: 4.2,
        topCategory: 'Fashion',
      },
      {
        workspaceId: 'ws-adidas-za',
        workspaceName: 'Adidas ZA',
        searchesRun: 4,
        campaignsCreated: 0,
        creatorsFound: 17,
        avgEngagementRate: 3.8,
        topCategory: 'Sports',
      },
      {
        workspaceId: 'ws-agency-hub',
        workspaceName: 'Agency Hub',
        searchesRun: 21,
        campaignsCreated: 4,
        creatorsFound: 78,
        avgEngagementRate: 5.1,
        topCategory: 'Mixed',
      },
    ],
    insights: [
      'Agency Hub ran 2.6x more searches than Nike SA this week',
      'Nike SA created 2 new campaigns — the most active workspace this week',
      'Your agency discovered 131 creators in total across all workspaces this week',
      'Adidas ZA has been inactive on campaigns — consider reviewing their strategy',
    ],
    generatedAt: '2026-03-06T08:00:00Z',
  },
  month: {
    period: 'month',
    workspaceComparisons: [
      {
        workspaceId: 'ws-nike-sa',
        workspaceName: 'Nike SA',
        searchesRun: 32,
        campaignsCreated: 6,
        creatorsFound: 145,
        avgEngagementRate: 4.2,
        topCategory: 'Fashion',
      },
      {
        workspaceId: 'ws-adidas-za',
        workspaceName: 'Adidas ZA',
        searchesRun: 18,
        campaignsCreated: 2,
        creatorsFound: 67,
        avgEngagementRate: 3.8,
        topCategory: 'Sports',
      },
      {
        workspaceId: 'ws-agency-hub',
        workspaceName: 'Agency Hub',
        searchesRun: 85,
        campaignsCreated: 15,
        creatorsFound: 312,
        avgEngagementRate: 5.1,
        topCategory: 'Mixed',
      },
    ],
    insights: [
      "Nike SA runs 1.8x more searches than Adidas ZA, but Adidas ZA has comparable creator discovery efficiency",
      "Agency Hub's 5.1% avg engagement rate is 21% higher than the agency average of 4.2%",
      "Fashion campaigns across Nike SA have 35% higher engagement than Sports campaigns on Adidas ZA",
      "Your agency's total reach across all workspaces is estimated at 2.4M followers",
      "Consider moving Adidas ZA to Growth plan — they're using 90% of their Discovery search limit",
    ],
    generatedAt: '2026-03-06T08:00:00Z',
  },
  quarter: {
    period: 'quarter',
    workspaceComparisons: [
      {
        workspaceId: 'ws-nike-sa',
        workspaceName: 'Nike SA',
        searchesRun: 94,
        campaignsCreated: 18,
        creatorsFound: 432,
        avgEngagementRate: 4.0,
        topCategory: 'Fashion',
      },
      {
        workspaceId: 'ws-adidas-za',
        workspaceName: 'Adidas ZA',
        searchesRun: 51,
        campaignsCreated: 7,
        creatorsFound: 189,
        avgEngagementRate: 3.6,
        topCategory: 'Sports',
      },
      {
        workspaceId: 'ws-agency-hub',
        workspaceName: 'Agency Hub',
        searchesRun: 247,
        campaignsCreated: 44,
        creatorsFound: 921,
        avgEngagementRate: 4.9,
        topCategory: 'Mixed',
      },
    ],
    insights: [
      "Agency Hub has been your highest-performing workspace this quarter with 921 creators discovered",
      "Nike SA grew campaigns by 3x compared to Q4 2025 — strong momentum in the Fashion category",
      "Adidas ZA's engagement rate declined 0.4% vs last quarter — consider refreshing creator mix",
      "Your agency discovered 1,542 total creators this quarter across all workspaces",
      "Combined agency reach grew 18% quarter-over-quarter, now estimated at 7.1M followers",
    ],
    generatedAt: '2026-03-06T08:00:00Z',
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlanBadge({ plan }: { plan: string }) {
  const planMap: Record<string, string> = {
    'Nike SA': 'Growth',
    'Adidas ZA': 'Discovery',
    'Agency Hub': 'Scale',
  };
  const planLabel = planMap[plan] ?? 'Discovery';
  const normalized = planLabel.toLowerCase();
  let className = 'bg-gray-100 text-gray-600';
  if (normalized === 'growth') className = 'bg-blue-100 text-blue-700';
  if (normalized === 'scale') className = 'bg-brand-navy text-white';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${className}`}>
      {planLabel}
    </span>
  );
}

function EngagementTrend({ rate }: { rate: number }) {
  const agencyAvg = 4.2;
  const diff = rate - agencyAvg;
  if (Math.abs(diff) < 0.15) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500">
        <Minus className="w-3 h-3" />
        Avg
      </span>
    );
  }
  if (diff > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
        <TrendingUp className="w-3 h-3" />
        +{diff.toFixed(1)}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500">
      <TrendingDown className="w-3 h-3" />
      {diff.toFixed(1)}%
    </span>
  );
}

interface WorkspaceComparisonCardProps {
  workspace: CrossWorkspaceAnalytics['workspaceComparisons'][number];
  rank: number;
}

function WorkspaceComparisonCard({ workspace, rank }: WorkspaceComparisonCardProps) {
  const totalActivity =
    workspace.searchesRun + workspace.campaignsCreated + workspace.creatorsFound;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-black text-white">#{rank}</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-navy">{workspace.workspaceName}</h3>
              <PlanBadge plan={workspace.workspaceName} />
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-medium">Engagement</p>
            <div className="flex items-center gap-1.5 justify-end mt-0.5">
              <span className="text-lg font-black text-brand-navy">
                {workspace.avgEngagementRate}%
              </span>
              <EngagementTrend rate={workspace.avgEngagementRate} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 bg-gray-50/40">
        <div className="px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Search className="w-3.5 h-3.5 text-brand-navy/60" />
            <p className="text-xs text-gray-500 font-medium">Searches</p>
          </div>
          <p className="text-xl font-black text-brand-navy">{workspace.searchesRun}</p>
        </div>
        <div className="px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Megaphone className="w-3.5 h-3.5 text-purple-500/70" />
            <p className="text-xs text-gray-500 font-medium">Campaigns</p>
          </div>
          <p className="text-xl font-black text-brand-navy">{workspace.campaignsCreated}</p>
        </div>
        <div className="px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Users className="w-3.5 h-3.5 text-blue-500/70" />
            <p className="text-xs text-gray-500 font-medium">Creators</p>
          </div>
          <p className="text-xl font-black text-brand-navy">{workspace.creatorsFound}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-semibold text-gray-500">Top:</span>
          <span className="text-xs font-bold text-brand-navy">{workspace.topCategory}</span>
        </div>
        <span className="text-xs text-gray-400">
          {totalActivity.toLocaleString()} total actions
        </span>
      </div>
    </div>
  );
}

// ─── Performance Ranking ──────────────────────────────────────────────────────

function PerformanceRanking({
  workspaces,
}: {
  workspaces: CrossWorkspaceAnalytics['workspaceComparisons'];
}) {
  const ranked = [...workspaces].sort(
    (a, b) =>
      b.searchesRun +
      b.campaignsCreated +
      b.creatorsFound -
      (a.searchesRun + a.campaignsCreated + a.creatorsFound),
  );

  const maxActivity = ranked[0]
    ? ranked[0].searchesRun + ranked[0].campaignsCreated + ranked[0].creatorsFound
    : 1;

  const rankIcons = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];
  const medals = ['1st', '2nd', '3rd'];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <Award className="w-5 h-5 text-brand-navy" />
        <h2 className="text-lg font-bold text-brand-navy">Performance Ranking</h2>
        <span className="text-xs text-gray-400 font-medium">by total activity</span>
      </div>
      <div className="divide-y divide-gray-50">
        {ranked.map((ws, idx) => {
          const totalActivity =
            ws.searchesRun + ws.campaignsCreated + ws.creatorsFound;
          const pct = Math.round((totalActivity / maxActivity) * 100);

          return (
            <div key={ws.workspaceId} className="px-6 py-4 flex items-center gap-4">
              <div className="w-12 text-center flex-shrink-0">
                <span className={`text-sm font-black ${rankIcons[idx] ?? 'text-gray-300'}`}>
                  {medals[idx] ?? `${idx + 1}th`}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-brand-navy">{ws.workspaceName}</span>
                  <span className="text-sm font-bold text-gray-700">
                    {totalActivity.toLocaleString()} actions
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-navy transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── AI Insights Section ──────────────────────────────────────────────────────

function AIInsightsSection({ insights }: { insights: string[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h2 className="text-lg font-bold text-brand-navy">AI Insights</h2>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3.5"
          >
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <p className="text-sm text-gray-700 font-medium leading-relaxed">{insight}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/40">
        <p className="text-xs text-gray-400 font-medium text-center">
          Generated by AI · Based on cross-workspace data patterns · Updated{' '}
          {new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

const PERIOD_OPTIONS: { id: Period; label: string }[] = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'quarter', label: 'Quarter' },
];

export default function AgencyAnalyticsPage() {
  const [period, setPeriod] = useState<Period>('month');
  const analytics = MOCK_ANALYTICS[period];

  // Sort workspaces by total activity for display ranking
  const rankedWorkspaces = [...analytics.workspaceComparisons].sort(
    (a, b) =>
      b.searchesRun +
      b.campaignsCreated +
      b.creatorsFound -
      (a.searchesRun + a.campaignsCreated + a.creatorsFound),
  );

  return (
    <>
      {/* Page Header */}
      <div className="bg-white px-4 sm:px-6 lg:px-8 pt-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-navy flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-navy">
                Cross-Workspace Analytics
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Compare performance and discover insights across all brand workspaces
              </p>
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setPeriod(opt.id)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  period === opt.id
                    ? 'bg-white text-brand-navy shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-[1440px] mx-auto space-y-8">

          {/* Workspace Comparison Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-brand-navy">Workspace Comparison</h2>
              <span className="text-sm text-gray-400 font-medium capitalize">
                This {period}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {rankedWorkspaces.map((ws, idx) => (
                <WorkspaceComparisonCard
                  key={ws.workspaceId}
                  workspace={ws}
                  rank={idx + 1}
                />
              ))}
            </div>
          </div>

          {/* Two-column: AI Insights + Ranking */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <AIInsightsSection insights={analytics.insights} />
            </div>
            <div className="xl:col-span-1">
              <PerformanceRanking workspaces={analytics.workspaceComparisons} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
