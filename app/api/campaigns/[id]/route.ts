import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/middleware/campaign-auth';
import { validateCampaign } from '@/lib/validators/campaign-validators';

// Helper to serialize Firestore data (converts Timestamps to ISO strings)
function serializeFirestoreData(data: any): any {
  if (!data) return data;

  if (data.toDate && typeof data.toDate === 'function') {
    return data.toDate().toISOString();
  }

  if (data instanceof Date) {
    return data.toISOString();
  }

  if (Array.isArray(data)) {
    return data.map(serializeFirestoreData);
  }

  if (typeof data === 'object') {
    const serialized: any = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        serialized[key] = serializeFirestoreData(data[key]);
      }
    }
    return serialized;
  }

  return data;
}

// Helper to remove undefined values
function removeUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined);
  }
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const cleaned: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
        cleaned[key] = removeUndefined(obj[key]);
      }
    }
    return cleaned;
  }
  return obj;
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  return requireAuth(async (decodedToken) => {
    try {
      const campaignId = params.id;
      const userId = decodedToken.uid;

      // Fetch campaign from Firestore
      const campaignDoc = await firestore.collection('campaigns').doc(campaignId).get();

      if (!campaignDoc.exists) {
        return NextResponse.json(
          { success: false, error: 'Campaign not found' },
          { status: 404 }
        );
      }

      const campaign = campaignDoc.data();

      // Check authorization
      const isBrandOwner = campaign?.brandId === userId;
      const isPublishedCampaign = ['PUBLISHED', 'ACTIVE', 'IN_PROGRESS'].includes(campaign?.status || '');

      // Allow brand owner OR published campaigns
      if (!isBrandOwner && !isPublishedCampaign) {
        return NextResponse.json(
          {
            success: false,
            error: 'Unauthorized: You can only view your own campaigns or published campaigns.'
          },
          { status: 403 }
        );
      }

      // Additional check: If campaign is private and user is not the owner, verify invitation
      if (!isBrandOwner && campaign?.campaignVisibility === 'private') {
        const invitationSnapshot = await firestore
          .collection('campaign_invitations')
          .where('campaignId', '==', campaignId)
          .where('influencerId', '==', userId)
          .where('status', '==', 'accepted')
          .limit(1)
          .get();

        if (invitationSnapshot.empty) {
          return NextResponse.json(
            {
              success: false,
              error: 'This is a private campaign. You need an invitation to view it.'
            },
            { status: 403 }
          );
        }
      }

      // Fetch applications for this campaign
      const applicationsSnapshot = await firestore
        .collection('applications')
        .where('campaignId', '==', campaignId)
        .get();

      const applications = applicationsSnapshot.docs.map(doc => serializeFirestoreData(doc.data()));

      return NextResponse.json({
        success: true,
        data: {
          campaign: { ...serializeFirestoreData(campaign), id: campaignDoc.id },
          applications,
        },
      });
    } catch (error) {
      console.error(`Error fetching campaign ${params.id}:`, error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch campaign' },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  return requireAuth(async (decodedToken) => {
    try {
      const campaignId = params.id;
      const userId = decodedToken.uid;

      // Fetch campaign from Firestore
      const campaignDoc = await firestore.collection('campaigns').doc(campaignId).get();

      if (!campaignDoc.exists) {
        return NextResponse.json(
          { success: false, error: 'Campaign not found' },
          { status: 404 }
        );
      }

      const campaign = campaignDoc.data();

      // Check authorization: only brand who created it can delete
      if (campaign?.brandId !== userId) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: You can only delete your own campaigns' },
          { status: 403 }
        );
      }

      // Delete the campaign
      await firestore.collection('campaigns').doc(campaignId).delete();

      return NextResponse.json({
        success: true,
        message: 'Campaign deleted successfully',
      });
    } catch (error) {
      console.error(`Error deleting campaign ${params.id}:`, error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete campaign' },
        { status: 500 }
      );
    }
  });
}

/**
 * Build campaign updates from request body
 */
function buildCampaignUpdates(body: any, existing: any): any {
  const updates: any = {
    updatedAt: new Date(),
  };

  // Basic Info updates
  if (body.campaignTitle !== undefined) updates.campaignTitle = body.campaignTitle;
  if (body.description !== undefined) updates.description = body.description;
  if (body.campaignObjectives !== undefined) updates.campaignObjectives = body.campaignObjectives;
  if (body.campaignCategories !== undefined) updates.campaignCategories = body.campaignCategories;
  if (body.kpi !== undefined) updates.kpi = body.kpi;
  if (body.campaignVisibility !== undefined) updates.campaignVisibility = body.campaignVisibility;
  if (body.status !== undefined) updates.status = body.status;

  // File Attachments
  if (body.campaignAssets !== undefined) updates.campaignAssets = body.campaignAssets;
  if (body.campaignMoodBoard !== undefined) updates.campaignMoodBoard = body.campaignMoodBoard;
  if (body.campaignBrief !== undefined) updates.campaignBrief = body.campaignBrief;
  if (body.campaignContract !== undefined) updates.campaignContract = body.campaignContract;

  // Timeline
  if (body.campaignStart !== undefined) {
    updates.campaignStart = body.campaignStart ? new Date(body.campaignStart) : null;
  }
  if (body.campaignEnd !== undefined) {
    updates.campaignEnd = body.campaignEnd ? new Date(body.campaignEnd) : null;
  }

  // Nested objects - merge with existing
  if (body.campaignProduct !== undefined) {
    updates.campaignProduct = {
      ...existing.campaignProduct,
      ...body.campaignProduct,
      productValue: body.campaignProduct?.productValue !== undefined
        ? Number(body.campaignProduct.productValue)
        : existing.campaignProduct?.productValue || 0,
      reimburseAmount: body.campaignProduct?.reimburseAmount !== undefined
        ? Number(body.campaignProduct.reimburseAmount)
        : existing.campaignProduct?.reimburseAmount || 0,
    };
  }

  if (body.audience !== undefined) {
    updates.audience = {
      ...existing.audience,
      ...body.audience,
      ageMin: body.audience?.ageMin !== undefined ? Number(body.audience.ageMin) : existing.audience?.ageMin || 18,
      ageMax: body.audience?.ageMax !== undefined ? Number(body.audience.ageMax) : existing.audience?.ageMax || 65,
      minFollowers: body.audience?.minFollowers !== undefined ? Number(body.audience.minFollowers) : existing.audience?.minFollowers || 0,
      minEngagements: body.audience?.minEngagements !== undefined ? Number(body.audience.minEngagements) : existing.audience?.minEngagements || 0,
    };
  }

  if (body.budget !== undefined) {
    updates.budget = {
      ...existing.budget,
      ...body.budget,
      fixedAmount: body.budget?.fixedAmount !== undefined ? Number(body.budget.fixedAmount) : existing.budget?.fixedAmount || 0,
      minRangeAmount: body.budget?.minRangeAmount !== undefined ? Number(body.budget.minRangeAmount) : existing.budget?.minRangeAmount || 0,
      maxRangeAmount: body.budget?.maxRangeAmount !== undefined ? Number(body.budget.maxRangeAmount) : existing.budget?.maxRangeAmount || 0,
      applicationDeadline: body.budget?.applicationDeadline ? new Date(body.budget.applicationDeadline) : existing.budget?.applicationDeadline,
      contentCreationDate: body.budget?.contentCreationDate ? new Date(body.budget.contentCreationDate) : existing.budget?.contentCreationDate,
      contentCreationStart: body.budget?.contentCreationStart ? new Date(body.budget.contentCreationStart) : existing.budget?.contentCreationStart,
      contentCreationEnd: body.budget?.contentCreationEnd ? new Date(body.budget.contentCreationEnd) : existing.budget?.contentCreationEnd,
      bidsMarketPlace: body.budget?.bidsMarketPlace ? {
        ...existing.budget?.bidsMarketPlace,
        ...body.budget.bidsMarketPlace,
        minFollowers: body.budget.bidsMarketPlace?.minFollowers !== undefined
          ? Number(body.budget.bidsMarketPlace.minFollowers)
          : existing.budget?.bidsMarketPlace?.minFollowers || 0,
        maxPrice: body.budget.bidsMarketPlace?.maxPrice !== undefined
          ? Number(body.budget.bidsMarketPlace.maxPrice)
          : existing.budget?.bidsMarketPlace?.maxPrice || 0,
      } : existing.budget?.bidsMarketPlace,
    };
  }

  if (body.tasks !== undefined) {
    updates.tasks = {
      ...existing.tasks,
      ...body.tasks,
      metaData: body.tasks?.metaData ? {
        ...existing.tasks?.metaData,
        ...body.tasks.metaData,
      } : existing.tasks?.metaData,
    };

    // Update total deliverables in stats
    if (body.tasks?.requiredDeliverables) {
      updates.stats = {
        ...existing.stats,
        totalDeliverables: body.tasks.requiredDeliverables.length,
      };
    }
  }

  return updates;
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  return requireAuth(async (decodedToken) => {
    try {
      const campaignId = params.id;
      const userId = decodedToken.uid;
      const body = await req.json();

      // Fetch campaign from Firestore
      const campaignDoc = await firestore.collection('campaigns').doc(campaignId).get();

      if (!campaignDoc.exists) {
        return NextResponse.json(
          { success: false, error: 'Campaign not found' },
          { status: 404 }
        );
      }

      const existingCampaign = campaignDoc.data();

      // Check authorization: only brand who created it can update
      if (existingCampaign?.brandId !== userId) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: You can only edit your own campaigns' },
          { status: 403 }
        );
      }

      const updates = buildCampaignUpdates(body, existingCampaign);
      const cleanedUpdates = removeUndefined(updates);

      // Validate when publishing (status changing to PUBLISHED)
      if (body.status === 'PUBLISHED' || body.status === 'published') {
        const merged = { ...existingCampaign, ...cleanedUpdates };
        const validationErrors = validateCampaign(merged, false);
        if (validationErrors.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: `Cannot publish: Missing or invalid fields: ${validationErrors.join(', ')}`,
              missingFields: validationErrors,
            },
            { status: 400 }
          );
        }
      }

      await firestore.collection('campaigns').doc(campaignId).update(cleanedUpdates);

      const updatedDoc = await firestore.collection('campaigns').doc(campaignId).get();

      return NextResponse.json({
        success: true,
        data: { campaign: { ...serializeFirestoreData(updatedDoc.data()), id: campaignId } },
      });
    } catch (error) {
      console.error(`Error updating campaign ${params.id}:`, error);
      return NextResponse.json(
        { success: false, error: 'Failed to update campaign' },
        { status: 500 }
      );
    }
  });
}
