/**
 * Firebase Firestore - Campaign Management Collections
 *
 * This file contains all Firestore collection references, helper functions,
 * and database operations for the Campaign Management system.
 *
 * Uses the Admin SDK (not the client SDK) so it works in API routes.
 */

import * as admin from 'firebase-admin';
import { getAdminDb } from './admin';
import {
  Campaign,
  Application,
  DeliverableSubmission,
  BrandWallet,
  CreatorEarnings,
  CampaignStatus,
  ApplicationStatus,
  DeliverableStatus,
  CampaignFilters,
  MarketplaceFilters,
  ApplicationFilters,
} from '@/types/campaign';

const Timestamp = admin.firestore.Timestamp;

// ============================================================================
// COLLECTION REFERENCES
// ============================================================================

export const COLLECTIONS = {
  CAMPAIGNS: 'campaigns',
  APPLICATIONS: 'campaign_applications',
  DELIVERABLES: 'deliverable_submissions',
  BRAND_WALLETS: 'brand_wallets',
  WALLET_TRANSACTIONS: 'wallet_transactions',
  CREATOR_EARNINGS: 'creator_earnings',
  CREATOR_WITHDRAWALS: 'creator_withdrawals',
  CAMPAIGN_NOTIFICATIONS: 'campaign_notifications',
} as const;

// ============================================================================
// CAMPAIGN OPERATIONS
// ============================================================================

/**
 * Create a new campaign
 */
export async function createCampaign(
  brandId: string,
  campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'stats'>
): Promise<string> {
  const db = getAdminDb();
  const now = Timestamp.now();

  const campaign = {
    ...campaignData,
    brandId,
    status: CampaignStatus.DRAFT,
    stats: {
      views: 0,
      applications: 0,
      acceptedApplications: 0,
      rejectedApplications: 0,
      pendingApplications: 0,
      completedDeliverables: 0,
      totalDeliverables: 0,
    },
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await db.collection(COLLECTIONS.CAMPAIGNS).add(campaign);
  return docRef.id;
}

/**
 * Get campaign by ID
 */
export async function getCampaignById(campaignId: string): Promise<Campaign | null> {
  const db = getAdminDb();
  const docSnap = await db.collection(COLLECTIONS.CAMPAIGNS).doc(campaignId).get();

  if (!docSnap.exists) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Campaign;
}

/**
 * Get all campaigns for a brand
 */
export async function getBrandCampaigns(
  brandId: string,
  filters?: CampaignFilters
): Promise<Campaign[]> {
  const db = getAdminDb();
  let q: admin.firestore.Query = db.collection(COLLECTIONS.CAMPAIGNS)
    .where('brandId', '==', brandId)
    .where('deletedAt', '==', null);

  // Apply filters
  if (filters?.status && filters.status.length > 0) {
    q = q.where('status', 'in', filters.status);
  }

  if (filters?.category && filters.category.length > 0) {
    q = q.where('productCategory', 'in', filters.category);
  }

  // Apply sorting
  const sortField = filters?.sortBy === 'budget' ? 'budget.amount' :
                    filters?.sortBy === 'applications' ? 'stats.applications' :
                    filters?.sortBy === 'deadline' ? 'timeline.applicationDeadline' :
                    'createdAt';

  const sortDirection = filters?.sortOrder || 'desc';
  q = q.orderBy(sortField, sortDirection as admin.firestore.OrderByDirection);

  const querySnapshot = await q.get();

  const campaigns: Campaign[] = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Campaign[];

  // Apply client-side filters (for complex queries not supported by Firestore)
  let filteredCampaigns = campaigns;

  if (filters?.budgetMin !== undefined) {
    filteredCampaigns = filteredCampaigns.filter((c) => {
      const budgetAmount = c.budget?.fixedAmount || c.budget?.maxRangeAmount || 0;
      return budgetAmount >= filters.budgetMin!;
    });
  }

  if (filters?.budgetMax !== undefined) {
    filteredCampaigns = filteredCampaigns.filter((c) => {
      const budgetAmount = c.budget?.fixedAmount || c.budget?.maxRangeAmount || 0;
      return budgetAmount <= filters.budgetMax!;
    });
  }

  if (filters?.searchQuery) {
    const searchLower = filters.searchQuery.toLowerCase();
    filteredCampaigns = filteredCampaigns.filter(
      (c) =>
        c.campaignTitle?.toLowerCase().includes(searchLower) ||
        c.description?.toLowerCase().includes(searchLower)
    );
  }

  return filteredCampaigns;
}

/**
 * Get campaigns for marketplace (creator view)
 */
export async function getMarketplaceCampaigns(
  filters?: MarketplaceFilters
): Promise<Campaign[]> {
  const db = getAdminDb();
  let q: admin.firestore.Query = db.collection(COLLECTIONS.CAMPAIGNS)
    .where('status', 'in', [CampaignStatus.PUBLISHED, CampaignStatus.ACTIVE])
    .where('deletedAt', '==', null);

  // Category filter
  if (filters?.category) {
    q = q.where('productCategory', '==', filters.category);
  }

  // Platform filter
  if (filters?.platform) {
    q = q.where('requirements.platforms', 'array-contains', filters.platform);
  }

  // Sorting
  const sortField = filters?.sortBy === 'budget' ? 'budget.amount' :
                    filters?.sortBy === 'deadline' ? 'timeline.applicationDeadline' :
                    'publishedAt';

  q = q.orderBy(sortField, 'desc');

  const querySnapshot = await q.get();

  const campaigns: Campaign[] = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Campaign[];

  // Apply budget range filter
  let filteredCampaigns = campaigns;

  if (filters?.budgetRange) {
    filteredCampaigns = filteredCampaigns.filter((c) => {
      const budgetAmount = c.budget?.fixedAmount || c.budget?.maxRangeAmount || 0;
      return budgetAmount >= filters.budgetRange!.min &&
             budgetAmount <= filters.budgetRange!.max;
    });
  }

  return filteredCampaigns;
}

/**
 * Update campaign
 */
export async function updateCampaign(
  campaignId: string,
  updates: Record<string, any>
): Promise<void> {
  const db = getAdminDb();
  await db.collection(COLLECTIONS.CAMPAIGNS).doc(campaignId).update({
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Publish campaign (change status from draft to published)
 */
export async function publishCampaign(campaignId: string): Promise<void> {
  await updateCampaign(campaignId, {
    status: CampaignStatus.PUBLISHED,
    publishedAt: Timestamp.now(),
  });
}

/**
 * Soft delete campaign
 */
export async function deleteCampaign(campaignId: string): Promise<void> {
  await updateCampaign(campaignId, {
    status: CampaignStatus.ARCHIVED,
  });
}

/**
 * Increment campaign view count
 */
export async function incrementCampaignViews(campaignId: string): Promise<void> {
  const campaign = await getCampaignById(campaignId);
  if (!campaign) return;

  await updateCampaign(campaignId, {
    stats: {
      ...campaign.stats,
      views: campaign.stats.views + 1,
    },
  });
}

// ============================================================================
// APPLICATION OPERATIONS
// ============================================================================

/**
 * Create a new application
 */
export async function createApplication(
  applicationData: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const db = getAdminDb();
  const now = Timestamp.now();

  const application = {
    ...applicationData,
    status: ApplicationStatus.PENDING,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await db.collection(COLLECTIONS.APPLICATIONS).add(application);

  // Update campaign stats
  const campaign = await getCampaignById(applicationData.campaignId);
  if (campaign) {
    await updateCampaign(applicationData.campaignId, {
      stats: {
        ...campaign.stats,
        applications: campaign.stats.applications + 1,
        pendingApplications: campaign.stats.pendingApplications + 1,
      },
    });
  }

  return docRef.id;
}

/**
 * Get application by ID
 */
export async function getApplicationById(applicationId: string): Promise<Application | null> {
  const db = getAdminDb();
  const docSnap = await db.collection(COLLECTIONS.APPLICATIONS).doc(applicationId).get();

  if (!docSnap.exists) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Application;
}

/**
 * Get applications for a campaign
 */
export async function getCampaignApplications(
  campaignId: string,
  filters?: ApplicationFilters
): Promise<Application[]> {
  const db = getAdminDb();
  let q: admin.firestore.Query = db.collection(COLLECTIONS.APPLICATIONS)
    .where('campaignId', '==', campaignId);

  if (filters?.status && filters.status.length > 0) {
    q = q.where('status', 'in', filters.status);
  }

  const sortField = filters?.sortBy === 'budget' ? 'proposedPrice' : 'createdAt';
  q = q.orderBy(sortField, 'desc');

  const querySnapshot = await q.get();

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Application[];
}

/**
 * Get all applications for a brand's campaigns in a single batched query.
 * Avoids N+1 by querying applications with `in` on campaignIds (batched by 30).
 */
export async function getBrandApplications(
  brandId: string,
  filters?: ApplicationFilters
): Promise<Application[]> {
  const db = getAdminDb();

  // Step 1: Get all campaign IDs for this brand (single query)
  const campaignSnapshot = await db
    .collection(COLLECTIONS.CAMPAIGNS)
    .where('brandId', '==', brandId)
    .where('deletedAt', '==', null)
    .select() // only fetch doc IDs, no field data
    .get();

  if (campaignSnapshot.empty) return [];

  const campaignIds = campaignSnapshot.docs.map((doc) => doc.id);

  // Step 2: Batch query applications (Firestore `in` supports max 30 values)
  const BATCH_SIZE = 30;
  const batches: Promise<Application[]>[] = [];

  for (let i = 0; i < campaignIds.length; i += BATCH_SIZE) {
    const batchIds = campaignIds.slice(i, i + BATCH_SIZE);

    const batchPromise = (async () => {
      let q: admin.firestore.Query = db
        .collection(COLLECTIONS.APPLICATIONS)
        .where('campaignId', 'in', batchIds);

      if (filters?.status && filters.status.length > 0) {
        q = q.where('status', 'in', filters.status);
      }

      q = q.orderBy('createdAt', 'desc');

      const snapshot = await q.get();
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Application[];
    })();

    batches.push(batchPromise);
  }

  const results = await Promise.all(batches);
  // Flatten and re-sort since batches may interleave
  return results
    .flat()
    .sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() :
        (a.createdAt as any)?.toDate?.() ? (a.createdAt as any).toDate().getTime() :
        new Date(a.createdAt as any).getTime();
      const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() :
        (b.createdAt as any)?.toDate?.() ? (b.createdAt as any).toDate().getTime() :
        new Date(b.createdAt as any).getTime();
      return dateB - dateA;
    });
}

/**
 * Get applications by creator
 */
export async function getCreatorApplications(
  creatorId: string,
  filters?: ApplicationFilters
): Promise<Application[]> {
  const db = getAdminDb();
  let q: admin.firestore.Query = db.collection(COLLECTIONS.APPLICATIONS)
    .where('creatorId', '==', creatorId);

  if (filters?.status && filters.status.length > 0) {
    q = q.where('status', 'in', filters.status);
  }

  if (filters?.campaignId) {
    q = q.where('campaignId', '==', filters.campaignId);
  }

  q = q.orderBy('createdAt', 'desc');

  const querySnapshot = await q.get();

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Application[];
}

/**
 * Update application
 */
export async function updateApplication(
  applicationId: string,
  updates: Record<string, any>
): Promise<void> {
  const db = getAdminDb();
  await db.collection(COLLECTIONS.APPLICATIONS).doc(applicationId).update({
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Review application (accept or reject)
 */
export async function reviewApplication(
  applicationId: string,
  reviewerId: string,
  status: ApplicationStatus.ACCEPTED | ApplicationStatus.REJECTED,
  reviewData: {
    reviewNotes?: string;
    rejectionReason?: string;
    contractTerms?: Application['contractTerms'];
  }
): Promise<void> {
  const application = await getApplicationById(applicationId);
  if (!application) throw new Error('Application not found');

  const campaign = await getCampaignById(application.campaignId);
  if (!campaign) throw new Error('Campaign not found');

  // Update application
  await updateApplication(applicationId, {
    status,
    reviewedBy: reviewerId,
    reviewedAt: Timestamp.now(),
    ...reviewData,
  });

  // Update campaign stats
  const newStats = { ...campaign.stats };

  if (status === ApplicationStatus.ACCEPTED) {
    newStats.acceptedApplications += 1;
    newStats.pendingApplications -= 1;
  } else if (status === ApplicationStatus.REJECTED) {
    newStats.rejectedApplications += 1;
    newStats.pendingApplications -= 1;
  }

  await updateCampaign(application.campaignId, { stats: newStats });
}

/**
 * Withdraw application
 */
export async function withdrawApplication(applicationId: string): Promise<void> {
  const application = await getApplicationById(applicationId);
  if (!application) throw new Error('Application not found');

  if (application.status !== ApplicationStatus.PENDING) {
    throw new Error('Can only withdraw pending applications');
  }

  const campaign = await getCampaignById(application.campaignId);
  if (!campaign) throw new Error('Campaign not found');

  await updateApplication(applicationId, {
    status: ApplicationStatus.WITHDRAWN,
    withdrawnAt: Timestamp.now(),
  });

  // Update campaign stats
  await updateCampaign(application.campaignId, {
    stats: {
      ...campaign.stats,
      pendingApplications: campaign.stats.pendingApplications - 1,
    },
  });
}

// ============================================================================
// DELIVERABLE OPERATIONS
// ============================================================================

/**
 * Submit a deliverable
 */
export async function submitDeliverable(
  deliverableData: Omit<DeliverableSubmission, 'id' | 'createdAt' | 'updatedAt' | 'revisionCount'>
): Promise<string> {
  const db = getAdminDb();
  const now = Timestamp.now();

  const deliverable = {
    ...deliverableData,
    status: DeliverableStatus.SUBMITTED,
    submittedAt: now,
    revisionCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await db.collection(COLLECTIONS.DELIVERABLES).add(deliverable);
  return docRef.id;
}

/**
 * Add deliverable ID to campaign's deliverableSubmissions array
 * Uses arrayUnion for atomic operation
 */
export async function addDeliverableSubmissionToCampaign(
  campaignId: string,
  deliverableId: string
): Promise<void> {
  const db = getAdminDb();
  await db.collection(COLLECTIONS.CAMPAIGNS).doc(campaignId).update({
    deliverableSubmissions: admin.firestore.FieldValue.arrayUnion(deliverableId),
    updatedAt: Timestamp.now(),
  });
}

/**
 * Get deliverable by ID
 */
export async function getDeliverableById(deliverableId: string): Promise<DeliverableSubmission | null> {
  const db = getAdminDb();
  const docSnap = await db.collection(COLLECTIONS.DELIVERABLES).doc(deliverableId).get();

  if (!docSnap.exists) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as DeliverableSubmission;
}

/**
 * Get deliverables for an application
 */
export async function getApplicationDeliverables(applicationId: string): Promise<DeliverableSubmission[]> {
  const db = getAdminDb();
  const querySnapshot = await db.collection(COLLECTIONS.DELIVERABLES)
    .where('applicationId', '==', applicationId)
    .get();

  const deliverables = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as DeliverableSubmission[];

  // Sort in memory to avoid needing a composite index
  return deliverables.sort((a, b) => {
    const aTime = (a.createdAt as any)?.toMillis?.() || 0;
    const bTime = (b.createdAt as any)?.toMillis?.() || 0;
    return bTime - aTime;
  });
}

/**
 * Get deliverables for a campaign
 */
export async function getCampaignDeliverables(campaignId: string): Promise<DeliverableSubmission[]> {
  const db = getAdminDb();
  const querySnapshot = await db.collection(COLLECTIONS.DELIVERABLES)
    .where('campaignId', '==', campaignId)
    .get();

  const deliverables = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as DeliverableSubmission[];

  // Sort in memory to avoid needing a composite index
  return deliverables.sort((a, b) => {
    const aTime = (a.submittedAt as any)?.toMillis?.() || 0;
    const bTime = (b.submittedAt as any)?.toMillis?.() || 0;
    return bTime - aTime;
  });
}

/**
 * Update deliverable
 */
export async function updateDeliverable(
  deliverableId: string,
  updates: Record<string, any>
): Promise<void> {
  const db = getAdminDb();
  await db.collection(COLLECTIONS.DELIVERABLES).doc(deliverableId).update({
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Approve deliverable
 */
export async function approveDeliverable(deliverableId: string): Promise<void> {
  await updateDeliverable(deliverableId, {
    status: DeliverableStatus.APPROVED,
    approvedAt: Timestamp.now(),
  });

  // Update campaign stats
  const deliverable = await getDeliverableById(deliverableId);
  if (deliverable) {
    const campaign = await getCampaignById(deliverable.campaignId);
    if (campaign) {
      await updateCampaign(deliverable.campaignId, {
        stats: {
          ...campaign.stats,
          completedDeliverables: campaign.stats.completedDeliverables + 1,
        },
      });
    }
  }
}

/**
 * Request revision for deliverable
 */
export async function requestDeliverableRevision(
  deliverableId: string,
  revisionNotes: string
): Promise<void> {
  const deliverable = await getDeliverableById(deliverableId);
  if (!deliverable) throw new Error('Deliverable not found');

  await updateDeliverable(deliverableId, {
    status: DeliverableStatus.REVISION_REQUESTED,
    revisionNotes,
    revisionCount: deliverable.revisionCount + 1,
  });
}

// ============================================================================
// WALLET OPERATIONS
// ============================================================================

/**
 * Get brand wallet
 */
export async function getBrandWallet(brandId: string): Promise<BrandWallet | null> {
  const db = getAdminDb();
  const querySnapshot = await db.collection(COLLECTIONS.BRAND_WALLETS)
    .where('brandId', '==', brandId)
    .limit(1)
    .get();

  if (querySnapshot.empty) {
    return null;
  }

  return {
    id: querySnapshot.docs[0].id,
    ...querySnapshot.docs[0].data(),
  } as BrandWallet;
}

/**
 * Create brand wallet
 */
export async function createBrandWallet(brandId: string): Promise<string> {
  const db = getAdminDb();
  const wallet = {
    brandId,
    balance: 0,
    currency: 'ZAR',
    totalDeposited: 0,
    totalSpent: 0,
    totalRefunded: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const docRef = await db.collection(COLLECTIONS.BRAND_WALLETS).add(wallet);
  return docRef.id;
}

/**
 * Get creator earnings
 */
export async function getCreatorEarnings(creatorId: string): Promise<CreatorEarnings | null> {
  const db = getAdminDb();
  const querySnapshot = await db.collection(COLLECTIONS.CREATOR_EARNINGS)
    .where('creatorId', '==', creatorId)
    .limit(1)
    .get();

  if (querySnapshot.empty) {
    return null;
  }

  return {
    id: querySnapshot.docs[0].id,
    ...querySnapshot.docs[0].data(),
  } as CreatorEarnings;
}

/**
 * Initialize creator earnings
 */
export async function initializeCreatorEarnings(creatorId: string): Promise<string> {
  const db = getAdminDb();
  const earnings = {
    creatorId,
    totalEarned: 0,
    availableBalance: 0,
    pendingBalance: 0,
    withdrawnBalance: 0,
    totalCampaigns: 0,
    totalDeliverables: 0,
    averageEarningPerCampaign: 0,
    currency: 'ZAR',
    updatedAt: Timestamp.now(),
  };

  const docRef = await db.collection(COLLECTIONS.CREATOR_EARNINGS).add(earnings);
  return docRef.id;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert Firestore Timestamp to Date for API responses
 */
export function convertTimestamps<T extends Record<string, any>>(data: T): T {
  const converted: any = { ...data };

  for (const key in converted) {
    const val = converted[key];
    // Handle both Admin SDK Timestamp and client SDK Timestamp
    if (val && typeof val === 'object' && typeof val.toDate === 'function') {
      converted[key] = val.toDate();
    } else if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      converted[key] = convertTimestamps(val);
    }
  }

  return converted;
}

/**
 * Calculate campaign budget utilization
 * TODO: Implement actual spending tracking
 */
export function calculateBudgetUtilization(campaign: Campaign): number {
  const totalBudget = campaign.budget?.fixedAmount || campaign.budget?.maxRangeAmount || 0;
  if (totalBudget === 0) return 0;
  // For now, return 0 as we don't track allocated/spent budget yet
  return 0;
}

/**
 * Check if campaign is accepting applications
 */
export function isAcceptingApplications(campaign: Campaign): boolean {
  if (campaign.status !== CampaignStatus.PUBLISHED && campaign.status !== CampaignStatus.ACTIVE) {
    return false;
  }

  if (campaign.budget?.applicationDeadline) {
    const deadline = campaign.budget.applicationDeadline instanceof Timestamp
      ? campaign.budget.applicationDeadline.toDate()
      : new Date(campaign.budget.applicationDeadline as any);

    if (deadline < new Date()) {
      return false;
    }
  }

  // Campaign is accepting applications if it's active/published and deadline hasn't passed
  return true;
}

/**
 * Format currency amount (cents to rands)
 */
export function formatCurrency(cents: number): string {
  const rands = cents / 100;
  return `R${rands.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
