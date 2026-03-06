/**
 * Agency types for the HeyCreator multi-brand/multi-workspace agency tier.
 *
 * An Agency is a top-level entity that owns multiple Workspaces (one per brand client).
 * Agency plans provide volume discounts, cross-workspace analytics, and a consolidated
 * billing view for managing all client brands from a single dashboard.
 */

// ---------------------------------------------------------------------------
// Agency entity — the parent container for multiple brand workspaces
// ---------------------------------------------------------------------------

export type AgencyPlan = 'agency_starter' | 'agency_pro' | 'agency_enterprise';

export interface Agency {
  id: string;
  name: string;
  logoUrl?: string;
  /** Firebase UID of the agency owner (super-admin across all workspaces) */
  ownerId: string;
  /** IDs of all workspaces managed by this agency */
  workspaceIds: string[];
  plan: AgencyPlan;
  /** Maximum number of brand workspaces allowed on this plan */
  maxWorkspaces: number;
  /** Volume discount percentage applied to the combined monthly invoice (0–100) */
  volumeDiscount: number;
  /** Total seat count pooled across all workspaces */
  totalSeats: number;
  /** Email address used for consolidated invoices */
  billingEmail: string;
  /** ISO 8601 datetime */
  createdAt: string;
  /** ISO 8601 datetime */
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// AgencyWorkspaceSummary — per-workspace row in the agency dashboard table
// ---------------------------------------------------------------------------

export interface AgencyWorkspaceSummary {
  workspaceId: string;
  workspaceName: string;
  /** Human-readable plan name, e.g. "Growth" */
  plan: string;
  searchesUsed: number;
  /** -1 = unlimited */
  searchesLimit: number;
  campaignsActive: number;
  /** -1 = unlimited */
  campaignsLimit: number;
  seatsUsed: number;
  seatsLimit: number;
  /** This workspace's gross monthly spend before discount (ZAR) */
  monthlySpendZAR: number;
  status: 'active' | 'suspended' | 'trial';
}

// ---------------------------------------------------------------------------
// AgencyDashboardData — full payload for the agency overview page
// ---------------------------------------------------------------------------

export interface AgencyDashboardData {
  agency: Agency;
  /** One summary row per workspace, ordered by monthly spend descending */
  workspaces: AgencyWorkspaceSummary[];
  /** Sum of all workspace spends after volume discount (ZAR) */
  totalMonthlySpend: number;
  /** Aggregate searches run across all workspaces this month */
  totalSearches: number;
  /** Aggregate active campaigns across all workspaces */
  totalCampaigns: number;
  /** Total active members across all workspaces */
  totalMembers: number;
  /** ZAR amount saved vs. paying for workspaces individually */
  savingsFromDiscount: number;
}

// ---------------------------------------------------------------------------
// CrossWorkspaceAnalytics — benchmarking / comparison data
// ---------------------------------------------------------------------------

export interface CrossWorkspaceAnalytics {
  period: 'week' | 'month' | 'quarter';
  workspaceComparisons: {
    workspaceId: string;
    workspaceName: string;
    searchesRun: number;
    campaignsCreated: number;
    creatorsFound: number;
    /** Weighted average engagement rate across all campaigns (0–100) */
    avgEngagementRate: number;
    /** Top content/influencer category for this workspace */
    topCategory: string;
  }[];
  /** AI-generated insight strings ready to display in the UI */
  insights: string[];
  /** ISO 8601 datetime when this analytics snapshot was generated */
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// BulkImport — CSV/spreadsheet client onboarding for agencies
// ---------------------------------------------------------------------------

export interface BulkImportRow {
  brandName: string;
  industry: string;
  website?: string;
  contactEmail: string;
  contactName: string;
  /** Plan slug, e.g. "discovery", "growth", "scale" */
  plan: string;
  status: 'pending' | 'created' | 'error';
  errorMessage?: string;
}

export interface BulkImportResult {
  totalRows: number;
  successful: number;
  failed: number;
  rows: BulkImportRow[];
  /** ISO 8601 datetime when the import job completed */
  importedAt: string;
}
