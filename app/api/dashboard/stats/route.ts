/**
 * Dashboard Stats API
 * 
 * GET /api/dashboard/stats
 * 
 * Aggregates key metrics for brand dashboard:
 * - Active Campaigns (with trend)
 * - Total Influencers (with trend)
 * - Budget Spent (with trend)
 * - Total Reach (with trend)
 * 
 * Created: February 10, 2026
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/middleware/campaign-auth';
import { CampaignStatus, ApplicationStatus, DeliverableStatus, PaymentStatus } from '@/types/campaign';

export const dynamic = 'force-dynamic';

interface StatWithTrend {
  current: number;
  previous: number;
  trend: string;
}

interface DashboardStatsResponse {
  success: boolean;
  stats: {
    activeCampaigns: StatWithTrend;
    totalInfluencers: StatWithTrend;
    budgetSpent: StatWithTrend & { currency: string };
    totalReach: StatWithTrend;
  };
  pendingActions: {
    contentApprovals: number;
    newApplications: number;
    paymentsDue: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);

    if (auth instanceof Response) return auth;



    // Get role from Firestore if not in token
    let userRole = auth.role;
    if (!userRole) {
      const db = getAdminDb();
      const userDoc = await db.collection('users').doc(auth.userId).get();
      userRole = userDoc.data()?.role;

    }

    // Only brands can access dashboard stats
    if (userRole !== 'brand') {

      return NextResponse.json(
        { success: false, error: 'Only brands can access dashboard stats' },
        { status: 403 }
      );
    }

    const brandId = auth.userId;

    const db = getAdminDb();

    // Calculate date ranges for trend comparison
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Fetch all brand campaigns
    const campaignsSnapshot = await db
      .collection('campaigns')
      .where('brandId', '==', brandId)
      .get();

    const allCampaigns = campaignsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Array<{ id: string; status?: string; createdAt?: any; [key: string]: any }>;

    // 1. ACTIVE CAMPAIGNS
    const currentActiveCampaigns = allCampaigns.filter(c =>
      c.status === CampaignStatus.ACTIVE || c.status === CampaignStatus.PUBLISHED
    ).length;

    const previousActiveCampaigns = allCampaigns.filter(c => {
      const createdAt = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
      return (
        (c.status === CampaignStatus.ACTIVE || c.status === CampaignStatus.PUBLISHED) &&
        createdAt < thirtyDaysAgo
      );
    }).length;

    const activeCampaignsDiff = currentActiveCampaigns - previousActiveCampaigns;
    const activeCampaignsTrend = activeCampaignsDiff >= 0
      ? `+${activeCampaignsDiff}`
      : `${activeCampaignsDiff}`;

    // 2. TOTAL INFLUENCERS (accepted applications)
    const campaignIds = allCampaigns.map(c => c.id);
    const batchSize = 10; // Firestore 'in' query limit

    let currentInfluencers = 0;
    let previousInfluencers = 0;

    if (campaignIds.length > 0) {
      // Batch queries to handle Firestore 'in' limit of 10
      for (let i = 0; i < campaignIds.length; i += batchSize) {
        const batch = campaignIds.slice(i, i + batchSize);

        const applicationsSnapshot = await db
          .collection('applications')
          .where('campaignId', 'in', batch)
          .where('status', '==', ApplicationStatus.ACCEPTED)
          .get();

        currentInfluencers += applicationsSnapshot.size;

        // Count previous period influencers
        const previousAppsSnapshot = await db
          .collection('applications')
          .where('campaignId', 'in', batch)
          .where('status', '==', ApplicationStatus.ACCEPTED)
          .get();

        previousAppsSnapshot.docs.forEach(doc => {
          const createdAt = doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt);
          if (createdAt < thirtyDaysAgo) {
            previousInfluencers++;
          }
        });
      }
    }

    const influencersPercentChange = previousInfluencers > 0
      ? Math.round(((currentInfluencers - previousInfluencers) / previousInfluencers) * 100)
      : 100;
    const influencersTrend = influencersPercentChange >= 0
      ? `+${influencersPercentChange}%`
      : `${influencersPercentChange}%`;

    // 3. BUDGET SPENT (actual payments made)
    let currentBudgetSpent = 0;
    let previousBudgetSpent = 0;

    if (campaignIds.length > 0) {
      for (let i = 0; i < campaignIds.length; i += batchSize) {
        const batch = campaignIds.slice(i, i + batchSize);

        const deliverablesSnapshot = await db
          .collection('deliverables')
          .where('campaignId', 'in', batch)
          .where('paymentStatus', '==', PaymentStatus.PAID)
          .get();

        deliverablesSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const paymentAmount = data.paymentAmount || 0;
          const paidAt = data.paidAt?.toDate ? data.paidAt.toDate() : new Date(data.paidAt);

          currentBudgetSpent += paymentAmount;

          if (paidAt < thirtyDaysAgo) {
            previousBudgetSpent += paymentAmount;
          }
        });
      }
    }

    // Convert from cents to rands
    const currentBudgetSpentRands = currentBudgetSpent / 100;
    const previousBudgetSpentRands = previousBudgetSpent / 100;

    const budgetPercentChange = previousBudgetSpentRands > 0
      ? Math.round(((currentBudgetSpentRands - previousBudgetSpentRands) / previousBudgetSpentRands) * 100)
      : currentBudgetSpentRands > 0 ? 100 : 0;
    const budgetTrend = budgetPercentChange >= 0
      ? `+${budgetPercentChange}%`
      : `${budgetPercentChange}%`;

    // 4. TOTAL REACH (sum of views from deliverables)
    let currentTotalReach = 0;
    let previousTotalReach = 0;

    if (campaignIds.length > 0) {
      for (let i = 0; i < campaignIds.length; i += batchSize) {
        const batch = campaignIds.slice(i, i + batchSize);

        const deliverablesSnapshot = await db
          .collection('deliverables')
          .where('campaignId', 'in', batch)
          .where('status', '==', DeliverableStatus.APPROVED)
          .get();

        deliverablesSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const views = data.metrics?.views || 0;
          const submittedAt = data.submittedAt?.toDate ? data.submittedAt.toDate() : new Date(data.submittedAt);

          currentTotalReach += views;

          if (submittedAt < thirtyDaysAgo) {
            previousTotalReach += views;
          }
        });
      }
    }

    const reachPercentChange = previousTotalReach > 0
      ? Math.round(((currentTotalReach - previousTotalReach) / previousTotalReach) * 100)
      : currentTotalReach > 0 ? 100 : 0;
    const reachTrend = reachPercentChange >= 0
      ? `+${reachPercentChange}%`
      : `${reachPercentChange}%`;

    // 5. PENDING ACTIONS
    let contentApprovals = 0;
    let newApplications = 0;
    let paymentsDue = 0;

    if (campaignIds.length > 0) {
      for (let i = 0; i < campaignIds.length; i += batchSize) {
        const batch = campaignIds.slice(i, i + batchSize);

        // Content approvals (deliverables submitted but not reviewed)
        const submittedDeliverablesSnapshot = await db
          .collection('deliverables')
          .where('campaignId', 'in', batch)
          .where('status', '==', DeliverableStatus.SUBMITTED)
          .get();
        contentApprovals += submittedDeliverablesSnapshot.size;

        // New applications (pending review)
        const pendingApplicationsSnapshot = await db
          .collection('campaign_applications')
          .where('campaignId', 'in', batch)
          .where('status', '==', ApplicationStatus.PENDING)
          .get();
        newApplications += pendingApplicationsSnapshot.size;

        // Payments due (approved deliverables not yet paid)
        const unpaidDeliverablesSnapshot = await db
          .collection('deliverables')
          .where('campaignId', 'in', batch)
          .where('status', '==', DeliverableStatus.APPROVED)
          .where('paymentStatus', '==', PaymentStatus.PENDING)
          .get();
        paymentsDue += unpaidDeliverablesSnapshot.size;
      }
    }

    const response: DashboardStatsResponse = {
      success: true,
      stats: {
        activeCampaigns: {
          current: currentActiveCampaigns,
          previous: previousActiveCampaigns,
          trend: activeCampaignsTrend
        },
        totalInfluencers: {
          current: currentInfluencers,
          previous: previousInfluencers,
          trend: influencersTrend
        },
        budgetSpent: {
          current: currentBudgetSpentRands,
          previous: previousBudgetSpentRands,
          trend: budgetTrend,
          currency: 'ZAR'
        },
        totalReach: {
          current: currentTotalReach,
          previous: previousTotalReach,
          trend: reachTrend
        }
      },
      pendingActions: {
        contentApprovals,
        newApplications,
        paymentsDue
      }
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('[DASHBOARD-STATS] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard stats',
        details: error.message
      },
      { status: 500 }
    );
  }
}
