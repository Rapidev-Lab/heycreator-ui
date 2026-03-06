/**
 * Campaign Management System - TypeScript Type Definitions
 *
 * This file contains all type definitions for the Campaign Management microservice
 * including Campaign, Application, Deliverable, and related types.
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// ENUMS
// ============================================================================

export enum CampaignStatus {
  DRAFT = 'DRAFT',                     // Being created
  PUBLISHED = 'PUBLISHED',             // Live and accepting applications
  ACTIVE = 'ACTIVE',                   // Has accepted applications
  IN_PROGRESS = 'IN_PROGRESS',         // Work being done
  COMPLETED = 'COMPLETED',             // All deliverables done
  CLOSED = 'CLOSED',                   // Manually closed
  CANCELLED = 'CANCELLED',             // Cancelled by brand
  ARCHIVED = 'ARCHIVED'                // Old campaign
}

export enum ApplicationStatus {
  PENDING = 'pending',                 // Awaiting review
  UNDER_REVIEW = 'under_review',       // Being reviewed
  ACCEPTED = 'accepted',               // Approved
  REJECTED = 'rejected',               // Declined
  WITHDRAWN = 'withdrawn',             // Creator withdrew
  COMPLETED = 'completed'              // Work finished
}

export enum DeliverableStatus {
  PENDING = 'pending',                 // Not started
  IN_PROGRESS = 'in_progress',         // Being worked on
  SUBMITTED = 'submitted',             // Submitted for review
  APPROVED = 'approved',               // Accepted by brand
  REVISION_REQUESTED = 'revision_requested', // Needs changes
  REJECTED = 'rejected',               // Not accepted
  COMPLETED = 'completed'              // Finalized
}

export enum PaymentStatus {
  PENDING = 'pending',                 // Awaiting payment
  PROCESSING = 'processing',           // Being processed
  PAID = 'paid',                       // Completed
  FAILED = 'failed',                   // Failed
  REFUNDED = 'refunded'                // Refunded
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

/**
 * Statistic with trend comparison
 */
export interface StatWithTrend {
  current: number;
  previous: number;
  trend: string;
}

/**
 * Dashboard statistics response
 */
export interface DashboardStats {
  activeCampaigns: StatWithTrend;
  totalInfluencers: StatWithTrend;
  budgetSpent: StatWithTrend & { currency: string };
  totalReach: StatWithTrend;
}

/**
 * Pending action item for dashboard
 */
export interface PendingAction {
  id: string;
  type: 'content_approval' | 'application' | 'payment_due';
  title: string;
  description: string;
  timeLabel: string;
  actionLabel: string;
  actionUrl: string;
  createdAt: string;
}

// ============================================================================
// CORE MODELS
// ============================================================================

/**
 * File attachment with simple structure
 */
export interface FileAttachment {
  name: string;
  type: string;
  url: string;
}

/**
 * Product information for campaigns
 */
export interface CampaignProduct {
  productType: string;
  productName: string;
  productImagesUrls: string[];
  productValue: number;
  productLink: string;
  willReimburse_or_productShipped: boolean;
  keepsProduct: boolean;
  reimburseAmount: number;
  accessInstructions?: string;
  contentDetails?: string;
}

/**
 * Audience requirements for campaigns
 */
export interface CampaignAudience {
  ageMin: number;
  ageMax: number;
  gender: string;
  targetLocation: string;
  interests_and_affiliates: string;
  minFollowers: number;
  minEngagements: number;
}

/**
 * Budget configuration for campaigns
 */
export interface CampaignBudget {
  compensationModel: 'fixed' | 'range';
  currency: string;
  fixedAmount: number;
  minRangeAmount: number;
  maxRangeAmount: number;
  paymentTerms: string;
  allowBidsMarketPlace: boolean;
  applicationDeadline: Timestamp | Date | null;
  contentCreationDate: Timestamp | Date | null;
  bidsMarketPlace: {
    gender: string;
    minFollowers: number;
    maxPrice: number;
  };
}

/**
 * Tasks and deliverables for campaigns
 */
export interface CampaignTasks {
  requiredDeliverables: {
    platform: string;
    type: string;
    details: string;
    dueDate: string;
  }[];
  dos: string[];
  donts: string[];
  metaData: {
    requiredHashTags: string;
    mentions_or_tags: string;
  };
  questions: {
    question: string;
    answers: string[];
  }[];
}

/**
 * Campaign - Main campaign schema
 */
export interface Campaign {
  // Core Identity
  id: string;
  brandId: string;
  status: CampaignStatus;

  // Basic Info
  campaignTitle: string;
  campaignVisibility: string;
  campaignObjectives: string[];
  campaignCategories: string[];
  kpi: string;
  description: string;

  // File Attachments
  campaignAssets: FileAttachment[];
  campaignMoodBoard: FileAttachment[];
  campaignBrief: FileAttachment[];
  campaignContract: FileAttachment[];

  // Timeline
  campaignStart: Timestamp | Date | null;
  campaignEnd: Timestamp | Date | null;

  // Product Info
  campaignProduct: CampaignProduct;

  // Audience
  audience: CampaignAudience;

  // Budget
  budget: CampaignBudget;

  // Tasks
  tasks: CampaignTasks;

  // Stats
  stats: CampaignStats;

  // Deliverable Submissions (array of deliverable IDs for quick lookup)
  deliverableSubmissions?: string[];

  // System Fields
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  publishedAt?: Timestamp | Date;
}

export interface Deliverable {
  type: string;                        // "Instagram Post", "TikTok Video", "YouTube Video"
  quantity: number;                    // How many
  platform?: string;                   // "Instagram", "TikTok", "YouTube"
  description?: string;                // Additional notes
  requirements?: string;               // Specific requirements for this deliverable
}

export interface TaskDeliverable {
  id: string;                          // Unique identifier
  platform: string;                    // "Instagram", "TikTok", "YouTube", etc.
  type: string;                        // "Reel", "Post", "Story", "Video", etc.
  details: string;                     // Additional details/requirements
  dueDate: string;                     // Due date for this task
}

export interface CampaignAttachment {
  id: string;
  fileName: string;
  fileType: string;                    // MIME type
  fileSize: number;                    // In bytes
  fileUrl: string;                     // Storage URL (Firebase Storage)
  uploadedAt: Timestamp | Date;
}

export interface UploadedFileInfo {
  name: string;                        // Original filename
  url: string;                         // Firebase Storage download URL
  path?: string;                       // Storage path for deletion
  size?: number;                       // File size in bytes
  type?: string;                       // MIME type
}

export interface CampaignStats {
  views: number;                       // How many creators viewed
  applications: number;                // Total applications
  acceptedApplications: number;        // Approved applications
  rejectedApplications: number;        // Rejected applications
  pendingApplications: number;         // Awaiting review
  completedDeliverables: number;       // Completed tasks
  totalDeliverables: number;           // Total deliverables expected
}

// ============================================================================
// APPLICATION MODEL
// ============================================================================

export interface Application {
  // Core Identity
  id: string;                          // UUID
  campaignId: string;                  // Reference to campaign
  creatorId: string;                   // Reference to creator/user

  // Application Details
  status: ApplicationStatus;
  pitchMessage: string;                // Creator's pitch (500-1000 chars)
  proposedPrice?: number;              // Optional if budget is negotiable (in cents)
  estimatedDeliveryDays?: number;      // How many days to complete
  portfolioItems: string[];            // Array of portfolio item IDs
  questionsForBrand?: string;          // Optional questions

  // Review
  reviewedBy?: string;                 // Brand user ID who reviewed
  reviewedAt?: Timestamp | Date;
  reviewNotes?: string;                // Internal notes from brand
  rejectionReason?: string;            // Reason for rejection

  // Contract (if accepted)
  contractTerms?: {
    agreedPrice: number;               // Negotiated price (cents)
    agreedDeliveryDate: Timestamp | Date;
    specialTerms?: string;             // Any special agreements
  };

  // Metadata
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  withdrawnAt?: Timestamp | Date;      // If creator withdrew
}

// ============================================================================
// DELIVERABLE SUBMISSION MODEL
// ============================================================================

export interface DeliverableSubmission {
  // Core Identity
  id: string;                          // UUID
  brandId: string;                     // Reference to brand (for easy brand-wide queries)
  campaignId: string;                  // Reference to campaign
  applicationId: string;               // Reference to application
  creatorId: string;                   // Reference to creator

  // Deliverable Details
  deliverableType: string;             // Which deliverable from campaign
  platform: string;                    // "Instagram", "TikTok", etc.
  contentUrl: string;                  // Link to published content
  contentScreenshots: string[];        // Screenshots/proof of posting
  liveUrl?: string;                    // Link to the live published post (submitted after approval)
  caption?: string;                    // Post caption
  hashtags?: string[];                 // Hashtags used

  // Status & Review
  status: DeliverableStatus;
  submittedAt?: Timestamp | Date;
  reviewedAt?: Timestamp | Date;
  approvedAt?: Timestamp | Date;
  rejectedAt?: Timestamp | Date;
  completedAt?: Timestamp | Date;

  // Feedback
  brandFeedback?: string;              // Feedback from brand
  revisionNotes?: string;              // What needs to be changed
  revisionCount: number;               // Number of revisions requested

  // Performance Metrics (captured after posting)
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    engagementRate?: number;
    capturedAt: Timestamp | Date;      // When metrics were captured
  };

  // Payment
  paymentStatus: PaymentStatus;
  paymentAmount?: number;              // Amount paid (cents)
  paidAt?: Timestamp | Date;

  // Metadata
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// ============================================================================
// BRAND WALLET MODEL
// ============================================================================

export interface BrandWallet {
  id: string;                          // Wallet ID
  brandId: string;                     // Reference to brand
  balance: number;                     // Available balance (cents)
  currency: 'ZAR';

  // Wallet Stats
  totalDeposited: number;              // Total ever deposited (cents)
  totalSpent: number;                  // Total spent on campaigns (cents)
  totalRefunded: number;               // Total refunded (cents)

  // Metadata
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface WalletTransaction {
  id: string;                          // Transaction ID
  walletId: string;                    // Reference to wallet
  type: 'deposit' | 'withdrawal' | 'spend' | 'refund' | 'allocation' | 'release';
  amount: number;                      // Amount (cents, positive or negative)
  balanceAfter: number;                // Balance after transaction (cents)

  // Related entities
  campaignId?: string;                 // If related to campaign
  applicationId?: string;              // If related to application
  deliverableId?: string;              // If related to deliverable

  // Payment details
  paymentMethod?: string;              // "card", "bank_transfer", "paypal"
  paymentReference?: string;           // External payment ID

  description: string;                 // Human-readable description
  metadata?: Record<string, any>;      // Additional data

  // Metadata
  createdAt: Timestamp | Date;
}

// ============================================================================
// CREATOR EARNINGS MODEL
// ============================================================================

export interface CreatorEarnings {
  id: string;                          // Earnings record ID
  creatorId: string;                   // Reference to creator

  // Earnings summary
  totalEarned: number;                 // Total earned all time (cents)
  availableBalance: number;            // Available for withdrawal (cents)
  pendingBalance: number;              // Pending approval (cents)
  withdrawnBalance: number;            // Already withdrawn (cents)

  // Statistics
  totalCampaigns: number;              // Total campaigns completed
  totalDeliverables: number;           // Total deliverables submitted
  averageEarningPerCampaign: number;   // Average (cents)

  // Metadata
  currency: 'ZAR';
  updatedAt: Timestamp | Date;
}

export interface CreatorWithdrawal {
  id: string;                          // Withdrawal ID
  creatorId: string;                   // Reference to creator
  amount: number;                      // Amount to withdraw (cents)

  // Withdrawal method
  method: 'bank_transfer' | 'paypal' | 'mobile_money';
  accountDetails: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    branchCode?: string;
    paypalEmail?: string;
    mobileNumber?: string;
  };

  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  processedAt?: Timestamp | Date;
  completedAt?: Timestamp | Date;
  failureReason?: string;

  // Reference
  transactionReference?: string;       // External transaction ID

  // Metadata
  requestedAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// ============================================================================
// HELPER TYPES FOR API REQUESTS/RESPONSES
// ============================================================================

export interface CreateCampaignRequest {
  campaignTitle: string;
  description: string;
  campaignObjectives: string[];
  campaignCategories: string[];
  campaignProduct?: Partial<CampaignProduct>;
  budget: Partial<CampaignBudget>;
  campaignStart?: string;              // ISO date string
  campaignEnd?: string;                // ISO date string
  tasks?: Partial<CampaignTasks>;
  audience?: Partial<CampaignAudience>;
  attachments?: File[];                // For file uploads
}

export interface UpdateCampaignRequest {
  campaignTitle?: string;
  description?: string;
  campaignObjectives?: string[];
  status?: CampaignStatus;
  campaignStart?: string;
  campaignEnd?: string;
  audience?: Partial<CampaignAudience>;
}

export interface SubmitApplicationRequest {
  campaignId: string;
  pitchMessage: string;
  proposedPrice?: number;
  estimatedDeliveryDays?: number;
  portfolioItems: string[];
  questionsForBrand?: string;
}

export interface ReviewApplicationRequest {
  status: ApplicationStatus.ACCEPTED | ApplicationStatus.REJECTED;
  reviewNotes?: string;
  rejectionReason?: string;
  contractTerms?: {
    agreedPrice: number;
    agreedDeliveryDate: string;        // ISO date string
    specialTerms?: string;
  };
}

export interface SubmitDeliverableRequest {
  applicationId: string;
  deliverableType: string;
  platform: string;
  contentUrl: string;
  contentScreenshots: File[];
  caption?: string;
  hashtags?: string[];
}

// ============================================================================
// FILTER & SEARCH TYPES
// ============================================================================

export interface CampaignFilters {
  status?: CampaignStatus[];
  category?: string[];
  budgetMin?: number;
  budgetMax?: number;
  searchQuery?: string;
  sortBy?: 'latest' | 'oldest' | 'budget' | 'applications' | 'deadline';
  sortOrder?: 'asc' | 'desc';
}

export interface MarketplaceFilters {
  category?: string;
  budgetRange?: {
    min: number;
    max: number;
  };
  timeline?: string;
  platform?: string;
  requirementsMatch?: boolean;         // Only show campaigns creator qualifies for
  sortBy?: 'latest' | 'budget' | 'deadline' | 'match';
}

export interface ApplicationFilters {
  status?: ApplicationStatus[];
  campaignId?: string;
  sortBy?: 'latest' | 'oldest' | 'budget';
}

// ============================================================================
// UI COMPONENT PROP TYPES
// ============================================================================

export interface CampaignCardProps {
  campaign: Campaign;
  viewMode?: 'brand' | 'creator';
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onApply?: (id: string) => void;
}

export interface ApplicationCardProps {
  application: Application;
  campaign?: Campaign;
  creator?: any;                       // Creator profile type
  viewMode?: 'brand' | 'creator';
  onView?: (id: string) => void;
  onReview?: (id: string, status: ApplicationStatus) => void;
  onWithdraw?: (id: string) => void;
}

export interface DeliverableCardProps {
  deliverable: DeliverableSubmission;
  campaign?: Campaign;
  onView?: (id: string) => void;
  onApprove?: (id: string) => void;
  onRequestRevision?: (id: string, notes: string) => void;
  onReject?: (id: string, reason: string) => void;
}

// ============================================================================
// ELIGIBILITY CALCULATION TYPES
// ============================================================================

export interface EligibilityRequirement {
  label: string;
  required: boolean;                   // Hard requirement vs soft requirement
  met: boolean;                        // Does creator meet this requirement?
  creatorValue?: any;                  // Creator's actual value
  requiredValue?: any;                 // Required value
  note?: string;
}

export interface EligibilityResult {
  isEligible: boolean;                 // Can creator apply?
  requirements: EligibilityRequirement[];
  eligibilityScore: number;            // 0-100 score
  matchScore?: number;                 // 0-1 match score for recommendations
  message: string;                     // User-friendly message
  unmetRequirements?: string[];        // List of unmet requirement labels
}

// ============================================================================
// ANALYTICS & REPORTING TYPES
// ============================================================================

export interface CampaignAnalytics {
  campaignId: string;

  // Application metrics
  totalApplications: number;
  acceptanceRate: number;              // Percentage
  averageTimeToReview: number;         // In hours

  // Deliverable metrics
  totalDeliverables: number;
  completedDeliverables: number;
  averageDeliveryTime: number;         // In days
  revisionRate: number;                // Percentage

  // Performance metrics (aggregated from all deliverables)
  totalReach: number;                  // Sum of all views
  totalEngagement: number;             // Sum of likes + comments + shares
  averageEngagementRate: number;       // Percentage

  // Budget metrics
  budgetUtilization: number;           // Percentage of budget used
  averageCostPerDeliverable: number;   // In cents
  ROI?: number;                        // Return on investment (if calculable)

  // Timeline
  campaignDuration: number;            // In days
  onTimeDeliveryRate: number;          // Percentage
}

export interface CreatorPerformanceMetrics {
  creatorId: string;

  // Campaign participation
  totalApplications: number;
  acceptedApplications: number;
  acceptanceRate: number;              // Percentage

  // Deliverable performance
  totalDeliverables: number;
  onTimeDeliveries: number;
  onTimeRate: number;                  // Percentage
  averageRevisions: number;

  // Quality metrics
  averageApprovalTime: number;         // In days
  rejectionRate: number;               // Percentage

  // Financial
  totalEarnings: number;               // In cents
  averageEarningPerCampaign: number;   // In cents

  // Rating (if implemented)
  overallRating?: number;              // 1-5 stars
  totalReviews?: number;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface CampaignNotification {
  id: string;
  userId: string;                      // Recipient
  type: 'campaign_published' | 'application_received' | 'application_reviewed' |
  'deliverable_submitted' | 'deliverable_reviewed' | 'payment_processed' |
  'campaign_deadline' | 'message_received';

  title: string;
  message: string;

  // Related entities
  campaignId?: string;
  applicationId?: string;
  deliverableId?: string;

  // Status
  read: boolean;
  readAt?: Timestamp | Date;

  // Action
  actionUrl?: string;                  // Where to navigate when clicked

  // Metadata
  createdAt: Timestamp | Date;
}

