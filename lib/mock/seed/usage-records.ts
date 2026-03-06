/**
 * Mock usage records seed data — 30 days of realistic consumption for all 3 workspaces.
 *
 * Canonical "today": 2026-03-06
 *
 * ws-nike-sa    (Growth, 50 searches/mo)  — ~32 searches used, moderate campaign activity
 * ws-adidas-za  (Discovery, 20 searches/mo) — ~18 searches used, near limit (triggers alert)
 * ws-agency-hub (Scale, unlimited)         — ~85 searches used, heavy multi-team activity
 *
 * The seed data is intentionally spread across individual days to simulate
 * realistic human usage patterns (e.g. no activity on weekends, spikes mid-week).
 */

import { UsageRecord, UsageSummary, UsageAlert } from '@/types/usage';

// ---------------------------------------------------------------------------
// Date helpers — all offsets relative to canonical "today": 2026-03-06
// ---------------------------------------------------------------------------

/** Return YYYY-MM-DD string offset from 2026-03-06 */
function D(offsetDays: number): string {
  const base = new Date('2026-03-06T12:00:00.000Z');
  base.setUTCDate(base.getUTCDate() + offsetDays);
  return base.toISOString().slice(0, 10); // YYYY-MM-DD
}

/** Return ISO 8601 string with a specific time on a given YYYY-MM-DD day */
function DT(date: string, hour = 9): string {
  return `${date}T${String(hour).padStart(2, '0')}:00:00.000Z`;
}

// ===== NIKE SA — Growth plan (50 searches/mo, 32 used) =====
// Spread across 22 working days, heavier toward month start, lighter recently

const nikeDailySearches: Array<{ date: string; count: number; userId: string }> = [
  { date: D(-30), count: 2, userId: 'mock-brand-user-1' },
  { date: D(-29), count: 1, userId: 'user-alice-001' },
  { date: D(-28), count: 3, userId: 'mock-brand-user-1' },
  { date: D(-27), count: 2, userId: 'user-alice-001' },
  { date: D(-26), count: 1, userId: 'mock-brand-user-1' },
  // Weekend skip D(-25), D(-24)
  { date: D(-23), count: 2, userId: 'mock-brand-user-1' },
  { date: D(-22), count: 1, userId: 'user-alice-001' },
  { date: D(-21), count: 2, userId: 'mock-brand-user-1' },
  { date: D(-20), count: 1, userId: 'user-alice-001' },
  // Weekend skip D(-18), D(-17)
  { date: D(-17), count: 2, userId: 'mock-brand-user-1' },
  { date: D(-16), count: 1, userId: 'user-alice-001' },
  { date: D(-15), count: 2, userId: 'mock-brand-user-1' },
  // Weekend skip D(-11), D(-10)
  { date: D(-13), count: 1, userId: 'mock-brand-user-1' },
  { date: D(-12), count: 2, userId: 'user-alice-001' },
  { date: D(-11), count: 1, userId: 'mock-brand-user-1' },
  { date: D(-10), count: 1, userId: 'user-alice-001' },
  // Weekend skip D(-7), D(-6) — but squeeze one day
  { date: D(-7),  count: 1, userId: 'mock-brand-user-1' },
  { date: D(-5),  count: 1, userId: 'mock-brand-user-1' },
  { date: D(-4),  count: 1, userId: 'user-alice-001' },
  { date: D(-3),  count: 1, userId: 'mock-brand-user-1' },
  { date: D(-2),  count: 1, userId: 'user-alice-001' },
  { date: D(-1),  count: 1, userId: 'mock-brand-user-1' },
];

// ===== ADIDAS ZA — Discovery plan (20 searches/mo, 18 used — near limit) =====
// One seat, all searches by the single owner; no weekend activity

const adidasDailySearches: Array<{ date: string; count: number; userId: string }> = [
  { date: D(-30), count: 1, userId: 'mock-brand-user-1' },
  { date: D(-29), count: 1, userId: 'mock-brand-user-1' },
  { date: D(-28), count: 1, userId: 'mock-brand-user-1' },
  { date: D(-26), count: 1, userId: 'mock-brand-user-1' },
  { date: D(-25), count: 1, userId: 'mock-brand-user-1' },
  { date: D(-23), count: 2, userId: 'mock-brand-user-1' },
  { date: D(-21), count: 1, userId: 'mock-brand-user-1' },
  { date: D(-19), count: 1, userId: 'mock-brand-user-1' },
  { date: D(-17), count: 1, userId: 'mock-brand-user-1' },
  { date: D(-16), count: 1, userId: 'mock-brand-user-1' },
  { date: D(-14), count: 1, userId: 'mock-brand-user-1' },
  { date: D(-12), count: 1, userId: 'mock-brand-user-1' },
  { date: D(-10), count: 1, userId: 'mock-brand-user-1' },
  { date: D(-7),  count: 1, userId: 'mock-brand-user-1' },
  { date: D(-5),  count: 1, userId: 'mock-brand-user-1' },
  { date: D(-3),  count: 1, userId: 'mock-brand-user-1' },
];

// ===== AGENCY HUB — Scale plan (unlimited, ~85 searches used) =====
// Multi-team heavy usage, daily activity including exports

const agencyDailySearches: Array<{ date: string; count: number; userId: string }> = [
  { date: D(-30), count: 4, userId: 'mock-brand-user-1' },
  { date: D(-29), count: 3, userId: 'mock-brand-user-2' },
  { date: D(-28), count: 4, userId: 'mock-brand-user-3' },
  { date: D(-27), count: 3, userId: 'mock-brand-user-1' },
  { date: D(-26), count: 2, userId: 'mock-brand-user-2' },
  { date: D(-25), count: 3, userId: 'mock-brand-user-3' },
  { date: D(-24), count: 2, userId: 'mock-brand-user-1' },
  { date: D(-23), count: 4, userId: 'mock-brand-user-2' },
  { date: D(-22), count: 3, userId: 'mock-brand-user-3' },
  { date: D(-21), count: 3, userId: 'mock-brand-user-1' },
  { date: D(-20), count: 4, userId: 'mock-brand-user-2' },
  { date: D(-19), count: 2, userId: 'mock-brand-user-3' },
  { date: D(-18), count: 3, userId: 'mock-brand-user-1' },
  { date: D(-17), count: 3, userId: 'mock-brand-user-2' },
  { date: D(-16), count: 2, userId: 'mock-brand-user-3' },
  { date: D(-15), count: 4, userId: 'mock-brand-user-1' },
  { date: D(-14), count: 3, userId: 'mock-brand-user-2' },
  { date: D(-13), count: 3, userId: 'mock-brand-user-3' },
  { date: D(-12), count: 2, userId: 'mock-brand-user-1' },
  { date: D(-11), count: 3, userId: 'mock-brand-user-2' },
  { date: D(-10), count: 4, userId: 'mock-brand-user-3' },
  { date: D(-9),  count: 2, userId: 'mock-brand-user-1' },
  { date: D(-8),  count: 3, userId: 'mock-brand-user-2' },
  { date: D(-7),  count: 2, userId: 'mock-brand-user-3' },
  { date: D(-6),  count: 3, userId: 'mock-brand-user-1' },
  { date: D(-5),  count: 2, userId: 'mock-brand-user-2' },
  { date: D(-4),  count: 3, userId: 'mock-brand-user-3' },
  { date: D(-3),  count: 3, userId: 'mock-brand-user-1' },
  { date: D(-2),  count: 2, userId: 'mock-brand-user-2' },
  { date: D(-1),  count: 2, userId: 'mock-brand-user-3' },
];

// ---------------------------------------------------------------------------
// Build the flat record arrays
// ---------------------------------------------------------------------------

let _nikeIdx = 1;
let _adidasIdx = 1;
let _agencyIdx = 1;

const nikeSearchRecords: { id: string; data: UsageRecord }[] =
  nikeDailySearches.map(({ date, count, userId }) => ({
    id: `ur-nike-${_nikeIdx++}`,
    data: {
      id: `ur-nike-${_nikeIdx - 1}`,
      workspaceId: 'ws-nike-sa',
      userId,
      metricType: 'search',
      count,
      date,
      details: `Influencer search session`,
      createdAt: DT(date, 9 + (_nikeIdx % 8)),
    },
  }));

const adidasSearchRecords: { id: string; data: UsageRecord }[] =
  adidasDailySearches.map(({ date, count, userId }) => ({
    id: `ur-adidas-${_adidasIdx++}`,
    data: {
      id: `ur-adidas-${_adidasIdx - 1}`,
      workspaceId: 'ws-adidas-za',
      userId,
      metricType: 'search',
      count,
      date,
      details: `Creator discovery search`,
      createdAt: DT(date, 10 + (_adidasIdx % 6)),
    },
  }));

const agencySearchRecords: { id: string; data: UsageRecord }[] =
  agencyDailySearches.map(({ date, count, userId }) => ({
    id: `ur-agency-${_agencyIdx++}`,
    data: {
      id: `ur-agency-${_agencyIdx - 1}`,
      workspaceId: 'ws-agency-hub',
      userId,
      metricType: 'search',
      count,
      date,
      details: `Multi-brand influencer research`,
      createdAt: DT(date, 8 + (_agencyIdx % 10)),
    },
  }));

// ---------------------------------------------------------------------------
// Campaign records — one per workspace at campaign creation events
// ---------------------------------------------------------------------------

const campaignRecords: { id: string; data: UsageRecord }[] = [
  // Nike SA — 3 campaigns launched this month
  {
    id: 'ur-nike-camp-1',
    data: {
      id: 'ur-nike-camp-1',
      workspaceId: 'ws-nike-sa',
      userId: 'mock-brand-user-1',
      metricType: 'campaign',
      count: 1,
      date: D(-28),
      details: 'Summer Running Collection campaign created',
      createdAt: DT(D(-28), 11),
    },
  },
  {
    id: 'ur-nike-camp-2',
    data: {
      id: 'ur-nike-camp-2',
      workspaceId: 'ws-nike-sa',
      userId: 'mock-brand-user-1',
      metricType: 'campaign',
      count: 1,
      date: D(-18),
      details: 'Air Max Day influencer push campaign created',
      createdAt: DT(D(-18), 14),
    },
  },
  {
    id: 'ur-nike-camp-3',
    data: {
      id: 'ur-nike-camp-3',
      workspaceId: 'ws-nike-sa',
      userId: 'user-alice-001',
      metricType: 'campaign',
      count: 1,
      date: D(-9),
      details: 'Women in Sport SA awareness campaign created',
      createdAt: DT(D(-9), 10),
    },
  },
  // Adidas ZA — 2 campaigns
  {
    id: 'ur-adidas-camp-1',
    data: {
      id: 'ur-adidas-camp-1',
      workspaceId: 'ws-adidas-za',
      userId: 'mock-brand-user-1',
      metricType: 'campaign',
      count: 1,
      date: D(-25),
      details: 'Adidas Originals street style campaign created',
      createdAt: DT(D(-25), 9),
    },
  },
  {
    id: 'ur-adidas-camp-2',
    data: {
      id: 'ur-adidas-camp-2',
      workspaceId: 'ws-adidas-za',
      userId: 'mock-brand-user-1',
      metricType: 'campaign',
      count: 1,
      date: D(-11),
      details: 'Back to school Adidas campaign created',
      createdAt: DT(D(-11), 11),
    },
  },
  // Agency Hub — 5 campaigns across multiple team members
  {
    id: 'ur-agency-camp-1',
    data: {
      id: 'ur-agency-camp-1',
      workspaceId: 'ws-agency-hub',
      userId: 'mock-brand-user-1',
      metricType: 'campaign',
      count: 1,
      date: D(-29),
      details: 'Client A — Q1 awareness campaign created',
      createdAt: DT(D(-29), 9),
    },
  },
  {
    id: 'ur-agency-camp-2',
    data: {
      id: 'ur-agency-camp-2',
      workspaceId: 'ws-agency-hub',
      userId: 'mock-brand-user-2',
      metricType: 'campaign',
      count: 1,
      date: D(-22),
      details: 'Client B — beauty launch campaign created',
      createdAt: DT(D(-22), 13),
    },
  },
  {
    id: 'ur-agency-camp-3',
    data: {
      id: 'ur-agency-camp-3',
      workspaceId: 'ws-agency-hub',
      userId: 'mock-brand-user-3',
      metricType: 'campaign',
      count: 1,
      date: D(-19),
      details: 'Client C — fitness challenge campaign created',
      createdAt: DT(D(-19), 15),
    },
  },
  {
    id: 'ur-agency-camp-4',
    data: {
      id: 'ur-agency-camp-4',
      workspaceId: 'ws-agency-hub',
      userId: 'mock-brand-user-1',
      metricType: 'campaign',
      count: 1,
      date: D(-13),
      details: 'Client D — food & beverage sampling campaign created',
      createdAt: DT(D(-13), 10),
    },
  },
  {
    id: 'ur-agency-camp-5',
    data: {
      id: 'ur-agency-camp-5',
      workspaceId: 'ws-agency-hub',
      userId: 'mock-brand-user-2',
      metricType: 'campaign',
      count: 1,
      date: D(-6),
      details: 'Client E — tech product unboxing campaign created',
      createdAt: DT(D(-6), 11),
    },
  },
];

// ---------------------------------------------------------------------------
// Export records — data exports performed by workspace members
// ---------------------------------------------------------------------------

const exportRecords: { id: string; data: UsageRecord }[] = [
  // Nike SA — 4 exports
  {
    id: 'ur-nike-exp-1',
    data: {
      id: 'ur-nike-exp-1',
      workspaceId: 'ws-nike-sa',
      userId: 'mock-brand-user-1',
      metricType: 'export',
      count: 1,
      date: D(-27),
      details: 'Exported creator shortlist CSV (12 profiles)',
      createdAt: DT(D(-27), 16),
    },
  },
  {
    id: 'ur-nike-exp-2',
    data: {
      id: 'ur-nike-exp-2',
      workspaceId: 'ws-nike-sa',
      userId: 'user-alice-001',
      metricType: 'export',
      count: 1,
      date: D(-20),
      details: 'Exported campaign performance report PDF',
      createdAt: DT(D(-20), 17),
    },
  },
  {
    id: 'ur-nike-exp-3',
    data: {
      id: 'ur-nike-exp-3',
      workspaceId: 'ws-nike-sa',
      userId: 'mock-brand-user-1',
      metricType: 'export',
      count: 1,
      date: D(-10),
      details: 'Exported audience demographics analysis',
      createdAt: DT(D(-10), 15),
    },
  },
  {
    id: 'ur-nike-exp-4',
    data: {
      id: 'ur-nike-exp-4',
      workspaceId: 'ws-nike-sa',
      userId: 'user-alice-001',
      metricType: 'export',
      count: 1,
      date: D(-3),
      details: 'Exported weekly engagement summary',
      createdAt: DT(D(-3), 11),
    },
  },
  // Adidas ZA — 2 exports
  {
    id: 'ur-adidas-exp-1',
    data: {
      id: 'ur-adidas-exp-1',
      workspaceId: 'ws-adidas-za',
      userId: 'mock-brand-user-1',
      metricType: 'export',
      count: 1,
      date: D(-22),
      details: 'Exported influencer prospect list',
      createdAt: DT(D(-22), 16),
    },
  },
  {
    id: 'ur-adidas-exp-2',
    data: {
      id: 'ur-adidas-exp-2',
      workspaceId: 'ws-adidas-za',
      userId: 'mock-brand-user-1',
      metricType: 'export',
      count: 1,
      date: D(-8),
      details: 'Exported campaign ROI report',
      createdAt: DT(D(-8), 14),
    },
  },
  // Agency Hub — 8 exports (heavy usage)
  {
    id: 'ur-agency-exp-1',
    data: {
      id: 'ur-agency-exp-1',
      workspaceId: 'ws-agency-hub',
      userId: 'mock-brand-user-1',
      metricType: 'export',
      count: 5,
      date: D(-28),
      details: 'Bulk export: 5 client creator reports',
      createdAt: DT(D(-28), 16),
    },
  },
  {
    id: 'ur-agency-exp-2',
    data: {
      id: 'ur-agency-exp-2',
      workspaceId: 'ws-agency-hub',
      userId: 'mock-brand-user-2',
      metricType: 'export',
      count: 3,
      date: D(-21),
      details: 'Monthly performance reports for 3 clients',
      createdAt: DT(D(-21), 17),
    },
  },
  {
    id: 'ur-agency-exp-3',
    data: {
      id: 'ur-agency-exp-3',
      workspaceId: 'ws-agency-hub',
      userId: 'mock-brand-user-3',
      metricType: 'export',
      count: 4,
      date: D(-14),
      details: 'Competitor analysis exports for pitch decks',
      createdAt: DT(D(-14), 15),
    },
  },
  {
    id: 'ur-agency-exp-4',
    data: {
      id: 'ur-agency-exp-4',
      workspaceId: 'ws-agency-hub',
      userId: 'mock-brand-user-1',
      metricType: 'export',
      count: 6,
      date: D(-7),
      details: 'End-of-week client status exports',
      createdAt: DT(D(-7), 17),
    },
  },
];

// ---------------------------------------------------------------------------
// Merge all records into the exported array
// ---------------------------------------------------------------------------

export const mockUsageRecords: { id: string; data: UsageRecord }[] = [
  ...nikeSearchRecords,
  ...adidasSearchRecords,
  ...agencySearchRecords,
  ...campaignRecords,
  ...exportRecords,
];

// ---------------------------------------------------------------------------
// Usage Summaries — one per workspace for the current monthly period
// ---------------------------------------------------------------------------

const now = new Date().toISOString();

export const mockUsageSummaries: { id: string; data: UsageSummary }[] = [
  // -----------------------------------------------------------------------
  // Nike SA — Growth plan: 50 searches/mo, 32 used (64%)
  // -----------------------------------------------------------------------
  {
    id: 'us-nike-sa',
    data: {
      workspaceId: 'ws-nike-sa',
      period: 'monthly',
      searches: {
        used: 32,
        limit: 50,
        percentUsed: 64,
      },
      campaigns: {
        active: 8,
        limit: 25,
        percentUsed: 32,
      },
      seats: {
        used: 2,
        limit: 3,
        percentUsed: 67,
      },
      exports: {
        used: 4,
        limit: 20,
        percentUsed: 20,
      },
      lastUpdated: now,
    },
  },
  // -----------------------------------------------------------------------
  // Adidas ZA — Discovery plan: 20 searches/mo, 18 used (90%) — near limit
  // -----------------------------------------------------------------------
  {
    id: 'us-adidas-za',
    data: {
      workspaceId: 'ws-adidas-za',
      period: 'monthly',
      searches: {
        used: 18,
        limit: 20,
        percentUsed: 90,
      },
      campaigns: {
        active: 4,
        limit: 5,
        percentUsed: 80,
      },
      seats: {
        used: 1,
        limit: 1,
        percentUsed: 100,
      },
      exports: {
        used: 2,
        limit: 10,
        percentUsed: 20,
      },
      lastUpdated: now,
    },
  },
  // -----------------------------------------------------------------------
  // Agency Hub — Scale plan: unlimited searches, 85 used this month
  // -----------------------------------------------------------------------
  {
    id: 'us-agency-hub',
    data: {
      workspaceId: 'ws-agency-hub',
      period: 'monthly',
      searches: {
        used: 85,
        limit: -1,
        percentUsed: 0, // -1 limit → always 0%
      },
      campaigns: {
        active: 14,
        limit: -1,
        percentUsed: 0,
      },
      seats: {
        used: 5,
        limit: 10,
        percentUsed: 50,
      },
      exports: {
        used: 18,
        limit: -1,
        percentUsed: 0,
      },
      lastUpdated: now,
    },
  },
];

// ---------------------------------------------------------------------------
// Usage Alerts — triggered thresholds requiring user attention
// ---------------------------------------------------------------------------

export const mockUsageAlerts: { id: string; data: UsageAlert }[] = [
  // -----------------------------------------------------------------------
  // CRITICAL: Adidas at 90% search capacity — 2 searches left this month
  // -----------------------------------------------------------------------
  {
    id: 'ua-adidas-search-critical',
    data: {
      id: 'ua-adidas-search-critical',
      workspaceId: 'ws-adidas-za',
      metricType: 'search',
      threshold: 90,
      message:
        'You have used 18 of 20 searches (90%) this month. Only 2 searches remaining before your monthly limit is reached.',
      severity: 'critical',
      dismissed: false,
      createdAt: DT(D(-3), 10),
    },
  },
  // -----------------------------------------------------------------------
  // WARNING: Adidas at 80% campaign capacity — 1 campaign slot left
  // -----------------------------------------------------------------------
  {
    id: 'ua-adidas-campaign-warning',
    data: {
      id: 'ua-adidas-campaign-warning',
      workspaceId: 'ws-adidas-za',
      metricType: 'campaign',
      threshold: 80,
      message:
        'You have 4 active campaigns out of 5 allowed on your Discovery plan. Only 1 campaign slot remaining.',
      severity: 'warning',
      dismissed: false,
      createdAt: DT(D(-11), 14),
    },
  },
  // -----------------------------------------------------------------------
  // INFO: Nike SA at 64% search capacity — general awareness
  // -----------------------------------------------------------------------
  {
    id: 'ua-nike-search-info',
    data: {
      id: 'ua-nike-search-info',
      workspaceId: 'ws-nike-sa',
      metricType: 'search',
      threshold: 60,
      message:
        'Your team has used 32 of 50 searches this month. At the current pace, you have about 8 days of searches remaining. Consider upgrading to Scale for unlimited searches.',
      severity: 'info',
      dismissed: false,
      createdAt: DT(D(-1), 9),
    },
  },
  // -----------------------------------------------------------------------
  // INFO: Nike SA seats at 67% — approaching seat limit reminder
  // -----------------------------------------------------------------------
  {
    id: 'ua-nike-seats-info',
    data: {
      id: 'ua-nike-seats-info',
      workspaceId: 'ws-nike-sa',
      metricType: 'seat',
      threshold: 60,
      message:
        'You are using 2 of 3 seats on the Growth plan. Invite one more team member before your seat limit is reached.',
      severity: 'info',
      dismissed: true, // User has already seen and dismissed this one
      createdAt: DT(D(-10), 11),
    },
  },
];
