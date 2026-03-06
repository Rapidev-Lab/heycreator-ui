/**
 * Campaign Detail API for Influencers
 *
 * GET /api/influencers/campaigns/[id]
 * Get full campaign details with qualification check and application status
 */

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/middleware/campaign-auth';

/**
 * Check detailed qualification requirements
 */
async function checkDetailedQualification(userId: string, requirements: any) {
  try {
    // Fetch influencer profile
    const userDoc = await firestore.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return {
        qualifies: false,
        checks: [],
        score: 0,
      };
    }

    const userData = userDoc.data();
    const checks: any[] = [];

    // TODO: Implement actual qualification checks based on influencer profile
    // For now, create mock checks for testing

    // Check 1: Followers
    const userFollowers = userData?.totalFollowers || 25000; // Mock data
    const minFollowers = requirements?.minFollowers || 10000;
    checks.push({
      requirement: `Minimum ${minFollowers.toLocaleString()} followers`,
      met: userFollowers >= minFollowers,
      userValue: userFollowers,
      requiredValue: minFollowers,
    });

    // Check 2: Engagement Rate
    const userEngagement = userData?.engagementRate || 4.5; // Mock data
    const minEngagement = requirements?.minEngagementRate || 3.0;
    checks.push({
      requirement: `Minimum ${minEngagement}% engagement rate`,
      met: userEngagement >= minEngagement,
      userValue: userEngagement,
      requiredValue: minEngagement,
    });

    // Check 3: Platforms
    if (requirements?.platforms && requirements.platforms.length > 0) {
      const userPlatforms = userData?.platforms || ['Instagram', 'TikTok']; // Mock data
      const hasPlatform = requirements.platforms.some((p: string) => userPlatforms.includes(p));
      checks.push({
        requirement: `Platform: ${requirements.platforms.join(' or ')}`,
        met: hasPlatform,
        userValue: userPlatforms.join(', '),
        requiredValue: requirements.platforms.join(', '),
      });
    }

    // Check 4: Languages
    if (requirements?.languages && requirements.languages.length > 0) {
      const userLanguages = userData?.languages || ['English']; // Mock data
      const hasLanguage = requirements.languages.some((l: string) => userLanguages.includes(l));
      checks.push({
        requirement: `Language: ${requirements.languages.join(' or ')}`,
        met: hasLanguage,
        userValue: userLanguages.join(', '),
        requiredValue: requirements.languages.join(', '),
      });
    }

    // Calculate score
    const metCount = checks.filter(c => c.met).length;
    const score = checks.length > 0 ? Math.round((metCount / checks.length) * 100) : 100;
    const qualifies = checks.every(c => c.met);

    return {
      qualifies,
      checks,
      score,
    };
  } catch (error) {
    console.error('Error checking qualification:', error);
    return {
      qualifies: false,
      checks: [],
      score: 0,
    };
  }
}

/**
 * GET /api/influencers/campaigns/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(async (decodedToken) => {
    try {
      const userId = decodedToken.uid;
      const campaignId = params.id;

      // Fetch campaign from Firestore
      const campaignDoc = await firestore.collection('campaigns').doc(campaignId).get();

      if (!campaignDoc.exists) {
        return NextResponse.json(
          {
            success: false,
            error: 'Campaign not found',
          },
          { status: 404 }
        );
      }

      const campaignData = campaignDoc.data()!;
      const status = campaignData.status;

      // Check if user has an accepted application (allows access to ACTIVE/IN_PROGRESS campaigns)
      let applicationStatus: any = null;
      try {
        const applicationSnapshot = await firestore
          .collection('campaign_applications')
          .where('campaignId', '==', campaignId)
          .where('influencerId', '==', userId)
          .limit(1)
          .get();

        if (!applicationSnapshot.empty) {
          const appDoc = applicationSnapshot.docs[0];
          const appData = appDoc.data();

          const appliedAtDate = appData.appliedAt?.toDate?.() || new Date(appData.appliedAt);
          const reviewedAtDate = appData.reviewedAt?.toDate?.() || (appData.reviewedAt ? new Date(appData.reviewedAt) : null);

          applicationStatus = {
            id: appDoc.id,
            status: appData.status,
            appliedAt: appliedAtDate.toISOString(),
            reviewedAt: reviewedAtDate ? reviewedAtDate.toISOString() : null,
          };
        }
      } catch (err) {
        console.error('Error checking application status:', err);
      }

      const hasAcceptedApplication = applicationStatus?.status === 'accepted';

      // Allow access if:
      // 1. Campaign status is PUBLISHED (shared link or marketplace)
      // 2. Campaign is public and published (marketplace listing)
      // 3. Creator has accepted application (active campaigns)
      const isPublishedCampaign = status === 'PUBLISHED';
      const isPublicMarketplace = campaignData?.campaignVisibility === 'public' && isPublishedCampaign;
      const isActiveForAcceptedCreator = hasAcceptedApplication &&
        ['ACTIVE', 'IN_PROGRESS', 'PUBLISHED', 'COMPLETED'].includes(status);

      // Check if creator has been invited to this campaign
      let hasInvitation = false;
      let invitationStatus: any = null;
      try {
        const invitationSnapshot = await firestore
          .collection('campaign_invitations')
          .where('campaignId', '==', campaignId)
          .where('influencerId', '==', userId)
          .limit(1)
          .get();
        hasInvitation = !invitationSnapshot.empty;
        if (!invitationSnapshot.empty) {
          const invDoc = invitationSnapshot.docs[0];
          const invData = invDoc.data();
          invitationStatus = {
            id: invDoc.id,
            status: invData.status,
            message: invData.message || null,
            invitedAt: invData.invitedAt?.toDate?.()
              ? invData.invitedAt.toDate().toISOString()
              : invData.invitedAt || null,
          };
        }
      } catch (err) {
        console.error('Error checking invitation:', err);
      }

      // Allow access if campaign is published, creator has accepted application, or creator was invited
      if (!isPublishedCampaign && !isActiveForAcceptedCreator && !hasInvitation) {
        return NextResponse.json(
          {
            success: false,
            error: 'Campaign is not available',
          },
          { status: 403 }
        );
      }

      // Fetch brand info
      let brandInfo = { id: campaignData.brandId, name: 'Unknown Brand', logo: null, verified: false };
      try {
        const brandDoc = await firestore.collection('users').doc(campaignData.brandId).get();
        if (brandDoc.exists) {
          const brandData = brandDoc.data();
          brandInfo = {
            id: campaignData.brandId,
            name: brandData?.displayName || brandData?.email || 'Unknown Brand',
            logo: brandData?.photoURL || null,
            verified: brandData?.verified || false,
          };
        }
      } catch (err) {
        console.error('Error fetching brand info:', err);
      }

      // Check qualification
      const userQualification = await checkDetailedQualification(
        userId,
        campaignData.requirements || {}
      );

      // Increment view count
      try {
        await firestore.collection('campaigns').doc(campaignId).update({
          'stats.views': (campaignData.stats?.views || 0) + 1,
        });
      } catch (err) {
        console.error('Error updating view count:', err);
      }

      // Helper to convert Firestore Timestamps to ISO strings
      const toISO = (val: any) => {
        if (!val) return null;
        if (val.toDate) return val.toDate().toISOString();
        if (val instanceof Date) return val.toISOString();
        return val;
      };

      const budget = campaignData.budget || {};

      return NextResponse.json({
        success: true,
        data: {
          campaign: {
            id: campaignDoc.id,
            status: campaignData.status || 'PUBLISHED',
            title: campaignData.campaignTitle || '',
            description: campaignData.description || '',
            objectives: campaignData.campaignObjectives || [],
            kpi: campaignData.kpi || '',
            categories: campaignData.campaignCategories || [],
            budget: {
              compensationModel: budget.compensationModel || 'fixed',
              currency: budget.currency || 'ZAR',
              fixedAmount: budget.fixedAmount || 0,
              minRangeAmount: budget.minRangeAmount || 0,
              maxRangeAmount: budget.maxRangeAmount || 0,
              paymentTerms: budget.paymentTerms || '',
              applicationDeadline: toISO(budget.applicationDeadline),
              contentCreationStart: toISO(budget.contentCreationStart),
              contentCreationEnd: toISO(budget.contentCreationEnd),
            },
            timeline: {
              campaignStart: toISO(campaignData.campaignStart),
              campaignEnd: toISO(campaignData.campaignEnd),
              applicationDeadline: toISO(budget.applicationDeadline),
            },
            product: campaignData.campaignProduct || {},
            audience: campaignData.audience || {},
            tasks: campaignData.tasks || {},
            attachments: {
              campaignAssets: campaignData.campaignAssets || [],
              moodBoard: campaignData.campaignMoodBoard || [],
              brief: campaignData.campaignBrief || [],
              contract: campaignData.campaignContract || [],
            },
            brandInfo,
            stats: campaignData.stats || { views: 0, applications: 0 },
          },
          userQualification,
          applicationStatus,
          invitationStatus,
        },
      });
    } catch (error) {
      console.error('Error fetching campaign details:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch campaign details',
        },
        { status: 500 }
      );
    }
  });
}
