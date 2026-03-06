/**
 * Mock agency seed data for Rapidev Digital Agency.
 *
 * Covers:
 * - Agency entity with agency_pro plan and 15% volume discount
 * - Dashboard totals aggregated across all 3 managed workspaces
 * - Cross-workspace analytics with AI-generated insights
 *
 * Workspaces managed:
 *   ws-nike-sa      — Growth plan, R35,000/mo, 32 searches, 8 campaigns, 2 seats
 *   ws-adidas-za    — Discovery plan, R20,000/mo, 18 searches, 4 campaigns, 1 seat
 *   ws-agency-hub   — Scale plan, R50,000/mo, 85 searches, 14 campaigns, 5 seats
 */

import {
  Agency,
  AgencyDashboardData,
  AgencyWorkspaceSummary,
  CrossWorkspaceAnalytics,
} from '@/types/agency';

// ---------------------------------------------------------------------------
// Date helpers — canonical "today": 2026-03-06
// ---------------------------------------------------------------------------

function D(offsetDays: number): string {
  const base = new Date('2026-03-06T12:00:00.000Z');
  base.setUTCDate(base.getUTCDate() + offsetDays);
  return base.toISOString();
}

const NOW = D(0);
const CREATED_AT = D(-90); // Agency has been on the platform for 3 months

// ---------------------------------------------------------------------------
// Agency entity
// ---------------------------------------------------------------------------

const agency: Agency = {
  id: 'agency-demo-1',
  name: 'Rapidev Digital Agency',
  logoUrl: undefined,
  ownerId: 'mock-brand-user-1',
  workspaceIds: ['ws-nike-sa', 'ws-adidas-za', 'ws-agency-hub'],
  plan: 'agency_pro',
  maxWorkspaces: 10,
  volumeDiscount: 15, // 15% off combined invoice
  totalSeats: 16,     // 3 (Nike) + 1 (Adidas) + 10 (Agency Hub) = 14 allocated; 16 total pooled
  billingEmail: 'billing@rapidev.co.za',
  createdAt: CREATED_AT,
  updatedAt: NOW,
};

// ---------------------------------------------------------------------------
// Per-workspace summary rows for the agency dashboard table
// ---------------------------------------------------------------------------

const workspaceSummaries: AgencyWorkspaceSummary[] = [
  // Scale plan — highest spend, heaviest usage
  {
    workspaceId: 'ws-agency-hub',
    workspaceName: 'Rapidev Agency Hub',
    plan: 'Scale',
    searchesUsed: 85,
    searchesLimit: -1,
    campaignsActive: 14,
    campaignsLimit: -1,
    seatsUsed: 5,
    seatsLimit: 10,
    monthlySpendZAR: 50000,
    status: 'active',
  },
  // Growth plan — mid-tier, healthy utilisation
  {
    workspaceId: 'ws-nike-sa',
    workspaceName: 'Nike South Africa',
    plan: 'Growth',
    searchesUsed: 32,
    searchesLimit: 50,
    campaignsActive: 8,
    campaignsLimit: 25,
    seatsUsed: 2,
    seatsLimit: 3,
    monthlySpendZAR: 35000,
    status: 'active',
  },
  // Discovery plan — lowest tier, near search limit (flagged in alerts)
  {
    workspaceId: 'ws-adidas-za',
    workspaceName: 'Adidas ZA',
    plan: 'Discovery',
    searchesUsed: 18,
    searchesLimit: 20,
    campaignsActive: 4,
    campaignsLimit: 5,
    seatsUsed: 1,
    seatsLimit: 1,
    monthlySpendZAR: 20000,
    status: 'active',
  },
];

// ---------------------------------------------------------------------------
// Financial calculations
// ---------------------------------------------------------------------------

// Gross combined monthly spend before discount
const grossMonthlySpend = workspaceSummaries.reduce(
  (sum, ws) => sum + ws.monthlySpendZAR,
  0
); // 50000 + 35000 + 20000 = 105000

// 15% volume discount applied
const discountAmount = Math.round(grossMonthlySpend * (agency.volumeDiscount / 100)); // 15750
const netMonthlySpend = grossMonthlySpend - discountAmount; // 89250

// ---------------------------------------------------------------------------
// Aggregate totals for dashboard header cards
// ---------------------------------------------------------------------------

const totalSearches = workspaceSummaries.reduce((sum, ws) => sum + ws.searchesUsed, 0); // 135
const totalCampaigns = workspaceSummaries.reduce((sum, ws) => sum + ws.campaignsActive, 0); // 26
const totalMembers = workspaceSummaries.reduce((sum, ws) => sum + ws.seatsUsed, 0); // 8

// ---------------------------------------------------------------------------
// Exported dashboard data object
// ---------------------------------------------------------------------------

export const mockAgencyDashboardData: AgencyDashboardData = {
  agency,
  workspaces: workspaceSummaries,
  totalMonthlySpend: netMonthlySpend,
  totalSearches,
  totalCampaigns,
  totalMembers,
  savingsFromDiscount: discountAmount,
};

/** Also export the agency alone for contexts that only need the entity */
export const mockAgencyData = agency;

// ---------------------------------------------------------------------------
// Cross-workspace analytics — monthly comparison with AI insights
// ---------------------------------------------------------------------------

export const mockCrossWorkspaceAnalytics: CrossWorkspaceAnalytics = {
  period: 'month',
  workspaceComparisons: [
    {
      workspaceId: 'ws-agency-hub',
      workspaceName: 'Rapidev Agency Hub',
      searchesRun: 85,
      campaignsCreated: 5,
      creatorsFound: 312,
      avgEngagementRate: 4.8,
      topCategory: 'Technology',
    },
    {
      workspaceId: 'ws-nike-sa',
      workspaceName: 'Nike South Africa',
      searchesRun: 32,
      campaignsCreated: 3,
      creatorsFound: 118,
      avgEngagementRate: 6.2,
      topCategory: 'Fashion & Sport',
    },
    {
      workspaceId: 'ws-adidas-za',
      workspaceName: 'Adidas ZA',
      searchesRun: 18,
      campaignsCreated: 2,
      creatorsFound: 64,
      avgEngagementRate: 5.1,
      topCategory: 'Fashion & Lifestyle',
    },
  ],
  insights: [
    'Nike SA achieves a 6.2% average engagement rate — 29% higher than Adidas ZA (5.1%) despite running fewer searches. Nike\'s more targeted creator selection strategy appears to be paying off.',
    'The Agency Hub runs 2.7x more searches than Nike SA and 4.7x more than Adidas ZA. Consider whether saved creator lists could reduce search volume across all workspaces and lower quota pressure.',
    'Adidas ZA is at 90% of their monthly search limit with 24 days still to go in the billing period. At current pace they will exceed the Discovery plan limit by approximately 4 searches. Upgrading to Growth would add 30 additional searches and remove the bottleneck.',
    'Across all three workspaces, your agency is running 26 active campaigns this month — well above the industry benchmark of 8–10 concurrent campaigns for an agency of this size. This is a strong indicator of platform adoption.',
    'Nike SA and Adidas ZA both focus on Fashion/Sport. Consolidating creator lists and sharing vetted profiles between these two workspaces could reduce duplicated search effort by an estimated 20–30%.',
  ],
  generatedAt: NOW,
};
