'use client';

import { useState } from 'react';
import {
  CalendarDays,
  Search,
  Megaphone,
  Users,
  Download,
  X,
  ShoppingBag,
  BarChart2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import UsageProgressBar from '@/components/usage/UsageProgressBar';
import UsageHistoryChart from '@/components/usage/UsageHistoryChart';
import PerMemberUsageTable from '@/components/usage/PerMemberUsageTable';
import { OVERAGE_PACKS } from '@/types/usage';
import type {
  UsageSummary,
  UsageAlert,
  UsagePrediction,
  UsageMetricType,
  OveragePack,
} from '@/types/usage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UsageDashboardProps {
  workspaceId: string;
}

type Period = 'this_month' | 'last_month' | 'last_3_months';

type HistoryMetric = 'searches' | 'campaigns' | 'exports';

// ---------------------------------------------------------------------------
// Mock data — realistic data for ws-nike-sa (Growth plan)
// ---------------------------------------------------------------------------

const MOCK_SUMMARY: UsageSummary = {
  workspaceId: 'ws-nike-sa',
  period: 'monthly',
  searches: { used: 32, limit: 50, percentUsed: 64 },
  campaigns: { active: 6, limit: 10, percentUsed: 60 },
  seats: { used: 2, limit: 3, percentUsed: 67 },
  exports: { used: 234, limit: 500, percentUsed: 47 },
  lastUpdated: new Date().toISOString(),
};

const MOCK_ALERTS: UsageAlert[] = [
  {
    id: 'alert-1',
    workspaceId: 'ws-nike-sa',
    metricType: 'search',
    threshold: 80,
    message: "You've used 64% of your monthly searches. At current pace you'll hit your limit by March 22.",
    severity: 'warning',
    dismissed: false,
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: 'alert-2',
    workspaceId: 'ws-nike-sa',
    metricType: 'seat',
    threshold: 90,
    message: '2 of 3 team seats are in use. Invite one more person before upgrading.',
    severity: 'info',
    dismissed: false,
    createdAt: new Date(Date.now() - 7200_000).toISOString(),
  },
];

const MOCK_PREDICTIONS: Record<UsageMetricType, UsagePrediction> = {
  search: {
    metricType: 'search',
    currentUsage: 32,
    limit: 50,
    predictedDate: '2026-03-22',
    daysUntilLimit: 16,
    trend: 'increasing',
    confidence: 0.82,
    recommendation: 'Consider upgrading to Scale for unlimited searches.',
  },
  campaign: {
    metricType: 'campaign',
    currentUsage: 6,
    limit: 10,
    predictedDate: '2026-03-28',
    daysUntilLimit: 22,
    trend: 'stable',
    confidence: 0.65,
    recommendation: 'Usage is stable — no action needed this month.',
  },
  seat: {
    metricType: 'seat',
    currentUsage: 2,
    limit: 3,
    predictedDate: '2026-04-01',
    daysUntilLimit: 26,
    trend: 'stable',
    confidence: 0.9,
    recommendation: 'You have 1 seat remaining.',
  },
  export: {
    metricType: 'export',
    currentUsage: 234,
    limit: 500,
    predictedDate: '2026-04-05',
    daysUntilLimit: 30,
    trend: 'increasing',
    confidence: 0.7,
    recommendation: 'Export usage is moderate — on track for the month.',
  },
};

/**
 * Generates 30 days of mock daily search data up to today.
 */
function generateDailyData(
  metric: HistoryMetric,
  days: number
): { date: string; count: number }[] {
  const BASE: Record<HistoryMetric, number> = {
    searches: 1,
    campaigns: 0,
    exports: 8,
  };
  const VARIANCE: Record<HistoryMetric, number> = {
    searches: 2,
    campaigns: 1,
    exports: 15,
  };

  const result: { date: string; count: number }[] = [];
  const base = BASE[metric];
  const variance = VARIANCE[metric];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    const dateStr = d.toISOString().slice(0, 10);
    // Deterministic pseudo-random from date string
    const seed = dateStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const count = Math.max(0, base + Math.floor(((seed * 7) % (variance * 2 + 1)) - variance));
    result.push({ date: dateStr, count });
  }
  return result;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PERIOD_LABELS: Record<Period, string> = {
  this_month: 'This Month',
  last_month: 'Last Month',
  last_3_months: 'Last 3 Months',
};

const HISTORY_METRIC_LABELS: Record<HistoryMetric, string> = {
  searches: 'Searches',
  campaigns: 'Campaigns',
  exports: 'Exports',
};

function getDaysForPeriod(period: Period): number {
  switch (period) {
    case 'this_month': return 30;
    case 'last_month': return 30;
    case 'last_3_months': return 90;
  }
}

function getAlertBgClass(severity: UsageAlert['severity']): string {
  switch (severity) {
    case 'critical': return 'bg-red-50 border-red-200';
    case 'warning': return 'bg-amber-50 border-amber-200';
    case 'info': return 'bg-blue-50 border-blue-200';
  }
}

function getAlertIconClass(severity: UsageAlert['severity']): string {
  switch (severity) {
    case 'critical': return 'text-[#FF3B30]';
    case 'warning': return 'text-amber-500';
    case 'info': return 'text-blue-500';
  }
}

function AlertIcon({ severity }: { severity: UsageAlert['severity'] }) {
  const cls = `w-4 h-4 flex-shrink-0 ${getAlertIconClass(severity)}`;
  if (severity === 'critical') return <AlertTriangle className={cls} />;
  if (severity === 'warning') return <AlertTriangle className={cls} />;
  return <Info className={cls} />;
}

// ---------------------------------------------------------------------------
// Sub-component: OveragePack promo card
// ---------------------------------------------------------------------------

function OveragePackPromoCard({ pack }: { pack: OveragePack }) {
  const METRIC_ICON: Record<UsageMetricType, React.ReactNode> = {
    search: <Search className="w-4 h-4" />,
    campaign: <Megaphone className="w-4 h-4" />,
    seat: <Users className="w-4 h-4" />,
    export: <Download className="w-4 h-4" />,
  };

  return (
    <div className="flex flex-col p-4 rounded-xl border border-gray-200 bg-white hover:border-brand-navy/30 hover:shadow-brand-sm transition-all">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-brand-navy/10 text-brand-navy flex items-center justify-center flex-shrink-0">
          {METRIC_ICON[pack.metricType]}
        </div>
        <h4 className="text-sm font-semibold text-gray-900">{pack.name}</h4>
      </div>
      <p className="text-xs text-gray-500 mb-3 flex-1">{pack.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-base font-extrabold text-gray-900 tabular-nums">
          R{pack.priceZAR.toLocaleString('en-ZA')}
        </span>
        <button className="px-3 py-1.5 bg-brand-navy text-white text-xs font-semibold rounded-lg hover:bg-brand-navy/90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-1">
          Buy Pack
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main dashboard component
// ---------------------------------------------------------------------------

/**
 * UsageDashboard — full usage analytics page for a workspace.
 *
 * Sections:
 * 1. Alert banners (dismissable)
 * 2. Period selector tabs
 * 3. 2×2 grid of UsageProgressBar metric cards
 * 4. Usage History chart with metric toggle
 * 5. Per-member usage table
 * 6. "Need More?" overage pack cards
 */
export default function UsageDashboard({ workspaceId }: UsageDashboardProps) {
  const [period, setPeriod] = useState<Period>('this_month');
  const [historyMetric, setHistoryMetric] = useState<HistoryMetric>('searches');
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const activeAlerts = MOCK_ALERTS.filter((a) => !dismissedAlerts.has(a.id));
  const historyData = generateDailyData(historyMetric, getDaysForPeriod(period));
  const summary = MOCK_SUMMARY;

  function dismissAlert(id: string) {
    setDismissedAlerts((prev) => new Set([...prev, id]));
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-navy rounded-xl flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Usage &amp; Limits</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Monitor your plan consumption and team activity
            </p>
          </div>
        </div>

        {/* Period tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                period === p
                  ? 'bg-white text-brand-navy shadow-brand-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Alert banners ───────────────────────────────────────────────── */}
      {activeAlerts.length > 0 && (
        <div className="space-y-2">
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${getAlertBgClass(alert.severity)}`}
              role="alert"
            >
              <AlertIcon severity={alert.severity} />
              <p className="flex-1 text-gray-700">{alert.message}</p>
              <button
                onClick={() => dismissAlert(alert.id)}
                className="flex-shrink-0 p-0.5 text-gray-400 hover:text-gray-600 transition-colors rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                aria-label="Dismiss alert"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Usage metric cards 2×2 grid ─────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Plan Limits
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Searches */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-brand-sm hover:shadow-brand-md transition-shadow">
            <UsageProgressBar
              label="Searches"
              used={summary.searches.used}
              limit={summary.searches.limit}
              icon={<Search className="w-4 h-4" />}
              showPrediction
              prediction={MOCK_PREDICTIONS.search}
            />
          </div>

          {/* Campaigns */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-brand-sm hover:shadow-brand-md transition-shadow">
            <UsageProgressBar
              label="Campaigns"
              used={summary.campaigns.active}
              limit={summary.campaigns.limit}
              icon={<Megaphone className="w-4 h-4" />}
              showPrediction
              prediction={MOCK_PREDICTIONS.campaign}
            />
          </div>

          {/* Team Seats */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-brand-sm hover:shadow-brand-md transition-shadow">
            <UsageProgressBar
              label="Team Seats"
              used={summary.seats.used}
              limit={summary.seats.limit}
              icon={<Users className="w-4 h-4" />}
              showPrediction
              prediction={MOCK_PREDICTIONS.seat}
            />
          </div>

          {/* Data Exports */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-brand-sm hover:shadow-brand-md transition-shadow">
            <UsageProgressBar
              label="Data Exports"
              used={summary.exports.used}
              limit={summary.exports.limit}
              icon={<Download className="w-4 h-4" />}
              showPrediction
              prediction={MOCK_PREDICTIONS.export}
            />
          </div>
        </div>
      </div>

      {/* ── Usage History chart ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-brand-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-brand-navy" />
            <h2 className="text-sm font-semibold text-gray-800">Usage History</h2>
          </div>

          {/* Metric toggle */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            {(Object.keys(HISTORY_METRIC_LABELS) as HistoryMetric[]).map((m) => (
              <button
                key={m}
                onClick={() => setHistoryMetric(m)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  historyMetric === m
                    ? 'bg-white text-brand-navy shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {HISTORY_METRIC_LABELS[m]}
              </button>
            ))}
          </div>
        </div>

        <UsageHistoryChart
          data={historyData}
          limit={
            historyMetric === 'searches'
              ? summary.searches.limit
              : historyMetric === 'campaigns'
              ? summary.campaigns.limit
              : summary.exports.limit
          }
          color="#001F54"
        />
      </div>

      {/* ── Team Usage table ────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-brand-navy" />
          <h2 className="text-sm font-semibold text-gray-800">Team Usage</h2>
        </div>
        <PerMemberUsageTable workspaceId={workspaceId} />
      </div>

      {/* ── Need More? overage packs ────────────────────────────────────── */}
      <div className="bg-brand-navy/[0.03] rounded-2xl border border-brand-navy/10 p-5">
        <div className="flex items-center gap-2 mb-1">
          <ShoppingBag className="w-4 h-4 text-brand-navy" />
          <h2 className="text-sm font-semibold text-gray-800">Need More?</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Buy add-on packs to extend your limits without changing your plan.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {OVERAGE_PACKS.map((pack) => (
            <OveragePackPromoCard key={pack.id} pack={pack} />
          ))}
        </div>

        <p className="mt-4 text-xs text-gray-400 text-center">
          Need unlimited access?{' '}
          <a
            href="/brands/settings?tab=plans"
            className="text-brand-navy font-semibold hover:underline"
          >
            Upgrade to Scale
          </a>
          .
        </p>
      </div>
    </div>
  );
}
