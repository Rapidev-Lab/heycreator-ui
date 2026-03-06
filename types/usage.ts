/**
 * Usage tracking types for the HeyCreator workspace billing and quota system.
 *
 * UsageRecord    — individual event (search run, campaign created, export, seat added)
 * UsageSummary   — aggregated period totals with plan limits for a workspace
 * UsageAlert     — threshold-triggered notification (e.g. 80% searches used)
 * UsagePrediction— forward-looking projection based on daily consumption rate
 * OveragePack    — purchasable add-on packs for workspaces that hit limits
 */

export type UsageMetricType = 'search' | 'campaign' | 'seat' | 'export';

// ---------------------------------------------------------------------------
// UsageRecord — one discrete usage event persisted to the database
// ---------------------------------------------------------------------------

export interface UsageRecord {
  id: string;
  workspaceId: string;
  userId: string;
  metricType: UsageMetricType;
  /** Number of units consumed in this event (usually 1, but can be batch) */
  count: number;
  /** Calendar date of the event in YYYY-MM-DD format (local to workspace timezone) */
  date: string;
  /** Optional human-readable context, e.g. search query or campaign title */
  details?: string;
  /** ISO 8601 datetime when this record was written */
  createdAt: string;
}

// ---------------------------------------------------------------------------
// UsageSummary — aggregated snapshot for a workspace + time period
// ---------------------------------------------------------------------------

export interface UsageSummary {
  workspaceId: string;
  period: 'daily' | 'weekly' | 'monthly';
  searches: {
    used: number;
    /** -1 = unlimited (Scale plan) */
    limit: number;
    /** 0–100; capped at 100 even when over limit */
    percentUsed: number;
  };
  campaigns: {
    active: number;
    /** -1 = unlimited */
    limit: number;
    percentUsed: number;
  };
  seats: {
    used: number;
    limit: number;
    percentUsed: number;
  };
  exports: {
    used: number;
    limit: number;
    percentUsed: number;
  };
  /** ISO 8601 datetime of the last recalculation */
  lastUpdated: string;
}

// ---------------------------------------------------------------------------
// UsageAlert — generated when a metric crosses a threshold
// ---------------------------------------------------------------------------

export interface UsageAlert {
  id: string;
  workspaceId: string;
  metricType: UsageMetricType;
  /** Percentage threshold that triggered this alert (e.g. 80, 90, 100) */
  threshold: number;
  message: string;
  severity: 'warning' | 'critical' | 'info';
  /** True once the user has acknowledged / dismissed the alert */
  dismissed: boolean;
  /** ISO 8601 datetime when the alert was generated */
  createdAt: string;
}

// ---------------------------------------------------------------------------
// UsagePrediction — ML/heuristic forward projection
// ---------------------------------------------------------------------------

export interface UsagePrediction {
  metricType: UsageMetricType;
  currentUsage: number;
  /** -1 = unlimited */
  limit: number;
  /** ISO date (YYYY-MM-DD) when the limit is projected to be reached */
  predictedDate: string;
  /** Negative means already over limit; 0 means today */
  daysUntilLimit: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  /** 0–1 confidence score for the prediction */
  confidence: number;
  /** Human-readable recommendation string shown in the UI */
  recommendation: string;
}

// ---------------------------------------------------------------------------
// OveragePack — purchasable add-on units
// ---------------------------------------------------------------------------

export interface OveragePack {
  id: string;
  name: string;
  metricType: UsageMetricType;
  /** Number of additional units included */
  quantity: number;
  /** Price in ZAR (whole rands, not cents) */
  priceZAR: number;
  description: string;
}

// ---------------------------------------------------------------------------
// Predefined catalogue of overage packs (displayed in the upgrade/billing UI)
// ---------------------------------------------------------------------------

export const OVERAGE_PACKS: OveragePack[] = [
  {
    id: 'pack-search-10',
    name: '10 Extra Searches',
    metricType: 'search',
    quantity: 10,
    priceZAR: 2500,
    description: '10 additional influencer searches',
  },
  {
    id: 'pack-search-25',
    name: '25 Extra Searches',
    metricType: 'search',
    quantity: 25,
    priceZAR: 5000,
    description: '25 additional influencer searches (save 20%)',
  },
  {
    id: 'pack-campaign-5',
    name: '5 Extra Campaigns',
    metricType: 'campaign',
    quantity: 5,
    priceZAR: 3500,
    description: '5 additional active campaigns',
  },
  {
    id: 'pack-export-50',
    name: '50 Extra Exports',
    metricType: 'export',
    quantity: 50,
    priceZAR: 1500,
    description: '50 additional data exports',
  },
];
