import { IndustryType, CompanySize } from './firebase';

// ===== WORKSPACE ROLES =====

export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';

export const WORKSPACE_ROLE_LABELS: Record<WorkspaceRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
};

export const WORKSPACE_ROLE_HIERARCHY: WorkspaceRole[] = [
  'owner',
  'admin',
  'editor',
  'viewer',
];

// ===== PLAN TIERS =====

export type PlanTier = 'discovery' | 'growth' | 'scale';

export interface PlanTierConfig {
  id: PlanTier;
  name: string;
  price: number;         // Monthly price in ZAR
  currency: string;
  seats: number;
  monthlySearches: number;  // -1 = unlimited
  campaigns: number;        // -1 = unlimited
  features: string[];
  isPopular?: boolean;
}

export const PLAN_TIERS: Record<PlanTier, PlanTierConfig> = {
  discovery: {
    id: 'discovery',
    name: 'Discovery',
    price: 20000,
    currency: 'ZAR',
    seats: 1,
    monthlySearches: 20,
    campaigns: 5,
    features: [
      'Find the right creators',
      '1 team seat',
      '20 monthly searches',
      '5 active campaigns',
      'Basic analytics',
      'Email support',
    ],
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    price: 35000,
    currency: 'ZAR',
    seats: 3,
    monthlySearches: 50,
    campaigns: 25,
    isPopular: true,
    features: [
      'Run and scale creator campaigns',
      '3 team seats',
      '50 monthly searches',
      '25 active campaigns',
      'Advanced analytics',
      'Priority support',
      'Shared campaign links',
    ],
  },
  scale: {
    id: 'scale',
    name: 'Scale',
    price: 50000,
    currency: 'ZAR',
    seats: 10,
    monthlySearches: -1,
    campaigns: -1,
    features: [
      'Own your creator economy',
      '10 team seats',
      'Unlimited searches',
      'Unlimited campaigns',
      'Enterprise analytics',
      'Dedicated account manager',
      'Custom integrations',
      'Audit logs',
    ],
  },
};

// ===== WORKSPACE =====

export type WorkspaceStatus = 'active' | 'archived' | 'suspended' | 'trial' | 'trial_expired';
export type SupportedCurrency = 'ZAR' | 'USD' | 'EUR' | 'GBP';

export interface WorkspaceSettings {
  currency: SupportedCurrency;
  brandColor: string;       // Hex color, e.g., '#001F54'
  notificationsEnabled: boolean;
  weeklyDigest: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;             // URL-safe identifier
  logoUrl: string | null;
  ownerId: string;          // User UID of workspace owner

  // Brand details
  brandName: string;
  industry: IndustryType;
  website: string;
  companySize: CompanySize;

  // Subscription
  planTier: PlanTier;
  status: WorkspaceStatus;
  trialEndsAt: string | null;     // ISO date
  subscriptionId: string | null;

  // Usage (current billing cycle)
  usage: WorkspaceUsage;

  // Settings
  settings: WorkspaceSettings;

  // Agency
  agencyId: string | null;  // If workspace belongs to an agency

  // Timestamps
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface WorkspaceUsage {
  searchesUsed: number;
  searchesLimit: number;    // -1 = unlimited
  campaignsActive: number;
  campaignsLimit: number;   // -1 = unlimited
  seatsUsed: number;
  seatsLimit: number;
  billingCycleStart: string;  // ISO date
  billingCycleEnd: string;    // ISO date
}

// ===== WORKSPACE MEMBERS =====

export type MemberStatus = 'active' | 'pending' | 'deactivated';

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: WorkspaceRole;
  status: MemberStatus;
  invitedBy: string;        // User UID of inviter
  invitedAt: string;        // ISO date
  joinedAt: string | null;  // ISO date (null if pending)
  lastActiveAt: string;     // ISO date
  searchesUsed: number;     // Per-member usage tracking
}

// ===== AUDIT LOG =====

export type AuditAction =
  | 'workspace.created'
  | 'workspace.updated'
  | 'workspace.archived'
  | 'workspace.deleted'
  | 'member.invited'
  | 'member.joined'
  | 'member.role_changed'
  | 'member.deactivated'
  | 'member.reactivated'
  | 'campaign.created'
  | 'campaign.updated'
  | 'campaign.deleted'
  | 'search.performed'
  | 'data.exported'
  | 'subscription.upgraded'
  | 'subscription.downgraded'
  | 'subscription.cancelled'
  | 'payment.succeeded'
  | 'payment.failed'
  | 'settings.updated';

export interface AuditLogEntry {
  id: string;
  workspaceId: string;
  userId: string;
  userName: string;
  action: AuditAction;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  timestamp: string;  // ISO date
}

// ===== PERMISSIONS =====

export interface RolePermissions {
  manageSubscription: boolean;
  deleteWorkspace: boolean;
  transferOwnership: boolean;
  inviteMembers: boolean;
  changeRoles: boolean;
  createCampaigns: boolean;
  searchInfluencers: boolean;
  manageCreatorLists: boolean;
  viewCampaigns: boolean;
  viewCreatorProfiles: boolean;
  exportData: boolean;
  approveContent: boolean;
  addNotes: boolean;
}

export const ROLE_PERMISSIONS: Record<WorkspaceRole, RolePermissions> = {
  owner: {
    manageSubscription: true,
    deleteWorkspace: true,
    transferOwnership: true,
    inviteMembers: true,
    changeRoles: true,
    createCampaigns: true,
    searchInfluencers: true,
    manageCreatorLists: true,
    viewCampaigns: true,
    viewCreatorProfiles: true,
    exportData: true,
    approveContent: true,
    addNotes: true,
  },
  admin: {
    manageSubscription: false,
    deleteWorkspace: false,
    transferOwnership: false,
    inviteMembers: true,
    changeRoles: true,
    createCampaigns: true,
    searchInfluencers: true,
    manageCreatorLists: true,
    viewCampaigns: true,
    viewCreatorProfiles: true,
    exportData: true,
    approveContent: true,
    addNotes: true,
  },
  editor: {
    manageSubscription: false,
    deleteWorkspace: false,
    transferOwnership: false,
    inviteMembers: false,
    changeRoles: false,
    createCampaigns: true,
    searchInfluencers: true,
    manageCreatorLists: true,
    viewCampaigns: true,
    viewCreatorProfiles: true,
    exportData: false,
    approveContent: true,
    addNotes: true,
  },
  viewer: {
    manageSubscription: false,
    deleteWorkspace: false,
    transferOwnership: false,
    inviteMembers: false,
    changeRoles: false,
    createCampaigns: false,
    searchInfluencers: false,
    manageCreatorLists: false,
    viewCampaigns: true,
    viewCreatorProfiles: true,
    exportData: false,
    approveContent: false,
    addNotes: false,
  },
};

// ===== WORKSPACE CONTEXT (for React context) =====

export interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  members: WorkspaceMember[];
  switchWorkspace: (workspaceId: string) => void;
  isLoading: boolean;
  userRole: WorkspaceRole | null;
  permissions: RolePermissions | null;
}
