/**
 * Brand Campaign Applications Management API
 *
 * GET /api/brands/campaigns/[id]/applications
 * Fetch all applications for a campaign with filtering and sorting
 */

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/middleware/campaign-auth';

/**
 * GET /api/brands/campaigns/[id]/applications
 * Fetch all applications for a brand's campaign
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(async (decodedToken) => {
    try {
      const userId = decodedToken.uid;
      const campaignId = params.id;

      // Parse query parameters
      const searchParams = request.nextUrl.searchParams;
      const status = searchParams.get('status'); // 'pending', 'accepted', 'rejected', 'withdrawn', or null for all
      const sortBy = searchParams.get('sortBy') || 'latest'; // 'latest', 'oldest', 'qualification'
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');

      // Verify campaign belongs to this brand
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

      const campaignData = campaignDoc.data();

      if (campaignData?.brandId !== userId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Unauthorized - You do not own this campaign',
          },
          { status: 403 }
        );
      }

      // Use single-field query to avoid needing composite indexes
      // Filter and sort in JavaScript for manageable result sets
      const snapshot = await firestore
        .collection('campaign_applications')
        .where('campaignId', '==', campaignId)
        .get();

      // Process applications
      const applications = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();

          // If influencer data is not denormalized, fetch it
          let influencerData = data.influencerData;
          if (!influencerData) {
            try {
              const influencerDoc = await firestore.collection('users').doc(data.influencerId).get();
              if (influencerDoc.exists) {
                const infData = influencerDoc.data();
                influencerData = {
                  displayName: infData?.displayName || infData?.email || 'Unknown',
                  photoURL: infData?.photoURL || null,
                  totalFollowers: infData?.totalFollowers || 0,
                  engagementRate: infData?.engagementRate || 0,
                };
              }
            } catch (err) {
              console.error('Error fetching influencer data:', err);
              influencerData = {
                displayName: 'Unknown',
                photoURL: null,
                totalFollowers: 0,
                engagementRate: 0,
              };
            }
          }

          // Convert Firestore Timestamps to ISO strings
          const appliedAtDate = data.appliedAt?.toDate?.() || new Date(data.appliedAt);
          const reviewedAtDate = data.reviewedAt?.toDate?.() || (data.reviewedAt ? new Date(data.reviewedAt) : null);

          return {
            id: doc.id,
            status: data.status,
            appliedAt: appliedAtDate.toISOString(),
            reviewedAt: reviewedAtDate ? reviewedAtDate.toISOString() : null,
            reviewNotes: data.reviewNotes || null,
            rejectionReason: data.rejectionReason || null,
            qualificationMet: data.qualificationMet || false,
            pitchMessage: data.pitchMessage || '',
            proposedRate: data.proposedRate || null,
            questionAnswers: data.questionAnswers || [],
            campaign: {
              id: campaignId,
              title: campaignData.title,
              brandName: campaignData.brandName || 'Your Brand',
              brandLogo: campaignData.brandLogo || null,
              budget: campaignData.budget,
              timeline: {
                duration: campaignData.timeline?.duration || 'Not specified',
              },
              status: campaignData.status,
            },
            influencer: influencerData,
          };
        })
      );

      // Calculate stats (before filtering)
      const stats = {
        total: applications.length,
        pending: applications.filter(app => app.status === 'pending').length,
        accepted: applications.filter(app => app.status === 'accepted').length,
        rejected: applications.filter(app => app.status === 'rejected').length,
        withdrawn: applications.filter(app => app.status === 'withdrawn').length,
      };

      // Apply status filter in JavaScript
      let filteredApplications = applications;
      if (status && status !== 'all') {
        filteredApplications = applications.filter(app => app.status === status);
      }

      // Apply sorting in JavaScript
      filteredApplications.sort((a, b) => {
        switch (sortBy) {
          case 'oldest':
            return new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime();
          case 'latest':
          default:
            return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
        }
      });

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedApplications = filteredApplications.slice(startIndex, endIndex);

      return NextResponse.json({
        success: true,
        data: {
          applications: paginatedApplications,
          stats,
          pagination: {
            page,
            limit,
            total: filteredApplications.length,
            totalPages: Math.ceil(filteredApplications.length / limit),
          },
        },
      });
    } catch (error) {
      console.error('Error fetching campaign applications:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch applications',
        },
        { status: 500 }
      );
    }
  });
}
