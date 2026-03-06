/**
 * Publish Campaign API Route
 *
 * POST /api/campaigns/[id]/publish - Publish a draft campaign
 */

import { NextRequest } from 'next/server';
import {
  requireBrandRole,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/middleware/campaign-auth';
import {
  getCampaignById,
  publishCampaign,
  convertTimestamps,
} from '@/lib/firebase/campaigns';
import { CampaignStatus } from '@/types/campaign';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * POST /api/campaigns/[id]/publish
 *
 * Publish a draft campaign to make it visible to creators
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // Require brand role
    const auth = await requireBrandRole(request);
    if (auth instanceof Response) return auth;

    // Get campaign
    const campaign = await getCampaignById(id);

    if (!campaign) {
      return createErrorResponse('Campaign not found', 404, 'NOT_FOUND');
    }

    // Check ownership
    if (campaign.brandId !== auth.userId) {
      return createErrorResponse(
        'You do not have permission to publish this campaign',
        403,
        'FORBIDDEN'
      );
    }

    // Check if campaign is in draft status
    if (campaign.status !== CampaignStatus.DRAFT) {
      return createErrorResponse(
        `Campaign is already ${campaign.status}. Only draft campaigns can be published.`,
        400,
        'INVALID_STATUS'
      );
    }

    // Validate campaign is complete before publishing
    const validationErrors = validateCampaignForPublishing(campaign);
    if (validationErrors.length > 0) {
      return createErrorResponse(
        'Campaign is incomplete. Please fix the following: ' + validationErrors.join(', '),
        400,
        'INCOMPLETE_CAMPAIGN'
      );
    }

    // Publish campaign
    await publishCampaign(id);

    // Get updated campaign
    const updatedCampaign = await getCampaignById(id);

    if (!updatedCampaign) {
      return createErrorResponse('Campaign not found after publish', 404, 'NOT_FOUND');
    }

    return createSuccessResponse({
      campaign: convertTimestamps(updatedCampaign),
      message: 'Campaign published successfully and is now visible to creators!',
    });
  } catch (error) {
    console.error('Error publishing campaign:', error);
    return createErrorResponse('Failed to publish campaign', 500);
  }
}

/**
 * Check if campaign is V2 schema
 */
function isV2Campaign(campaign: any): boolean {
  return campaign?.schemaVersion === 2;
}

/**
 * Validate V2 campaign has all required fields for publishing
 */
function validateV2CampaignForPublishing(campaign: any): string[] {
  const errors: string[] = [];

  // Basic Details
  if (!campaign.campaignTitle || campaign.campaignTitle.trim().length < 3) {
    errors.push('Campaign title must be at least 3 characters');
  }

  if (!campaign.description || campaign.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  }

  if (!campaign.campaignObjectives || !Array.isArray(campaign.campaignObjectives) || campaign.campaignObjectives.length === 0) {
    errors.push('At least one campaign objective is required');
  }

  if (!campaign.kpi || campaign.kpi.trim().length === 0) {
    errors.push('KPI is required');
  }

  // Product
  if (!campaign.campaignProduct) {
    errors.push('Campaign product information is required');
  } else {
    if (!campaign.campaignProduct.productType || campaign.campaignProduct.productType.trim().length === 0) {
      errors.push('Product type is required');
    }
    if (!campaign.campaignProduct.productName || campaign.campaignProduct.productName.trim().length === 0) {
      errors.push('Product name is required');
    }
  }

  // Budget
  if (!campaign.budget) {
    errors.push('Budget information is required');
  } else {
    const model = campaign.budget.compensationModel;
    if (model === 'fixed') {
      if (!campaign.budget.fixedAmount || campaign.budget.fixedAmount <= 0) {
        errors.push('Fixed budget amount must be greater than 0');
      }
    } else if (model === 'range') {
      if (!campaign.budget.minRangeAmount || campaign.budget.minRangeAmount <= 0) {
        errors.push('Minimum budget range must be greater than 0');
      }
      if (!campaign.budget.maxRangeAmount || campaign.budget.maxRangeAmount <= 0) {
        errors.push('Maximum budget range must be greater than 0');
      }
      if (campaign.budget.minRangeAmount > campaign.budget.maxRangeAmount) {
        errors.push('Minimum budget cannot exceed maximum budget');
      }
    }
  }

  // Tasks
  if (!campaign.tasks) {
    errors.push('Task information is required');
  } else {
    if (!campaign.tasks.requiredDeliverables || campaign.tasks.requiredDeliverables.length === 0) {
      errors.push('At least one deliverable is required');
    }
  }

  // Audience
  if (!campaign.audience) {
    errors.push('Audience information is required');
  } else {
    if (campaign.audience.minFollowers === undefined || campaign.audience.minFollowers < 0) {
      errors.push('Minimum followers must be 0 or greater');
    }
  }

  // Timeline
  if (!campaign.campaignStart) {
    errors.push('Campaign start date is required');
  }
  if (!campaign.campaignEnd) {
    errors.push('Campaign end date is required');
  }

  return errors;
}

/**
 * Validate V1 campaign has all required fields for publishing
 */
function validateV1CampaignForPublishing(campaign: any): string[] {
  const errors: string[] = [];

  // Basic Details (Step 1)
  if (!campaign.title || campaign.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters');
  }

  if (!campaign.description || campaign.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  }

  if (!campaign.objectives || campaign.objectives.trim().length < 10) {
    errors.push('Objectives must be at least 10 characters');
  }

  if (!campaign.KPIs || campaign.KPIs.trim().length < 10) {
    errors.push('KPIs must be at least 10 characters');
  }

  if (!campaign.productCategory || campaign.productCategory.trim().length === 0) {
    errors.push('Product category is required');
  }

  // Budget (Step 4)
  if (!campaign.budget || campaign.budget.amount <= 0) {
    errors.push('Budget must be greater than 0');
  }

  // Deliverables (Step 5) - Check both deliverables and taskDeliverables
  const hasDeliverables = (campaign.deliverables && campaign.deliverables.length > 0) ||
                          (campaign.taskDeliverables && campaign.taskDeliverables.length > 0);

  if (!hasDeliverables) {
    errors.push('At least one deliverable is required');
  }

  // Creator Requirements (Step 3)
  if (!campaign.requirements) {
    errors.push('Creator requirements must be defined');
  } else {
    if (campaign.requirements.minFollowers === undefined || campaign.requirements.minFollowers < 0) {
      errors.push('Minimum followers requirement must be 0 or greater');
    }

    if (campaign.requirements.minEngagementRate === undefined || campaign.requirements.minEngagementRate < 0) {
      errors.push('Minimum engagement rate must be 0 or greater');
    }

    if (!campaign.requirements.languages || campaign.requirements.languages.length === 0) {
      errors.push('At least one language requirement is required');
    }

    if (!campaign.requirements.platforms || campaign.requirements.platforms.length === 0) {
      errors.push('At least one platform requirement is required');
    }
  }

  // Timeline (Step 4) - More lenient, just check duration exists
  if (!campaign.timeline || !campaign.timeline.duration) {
    errors.push('Campaign duration is required');
  }

  return errors;
}

/**
 * Validate campaign has all required fields for publishing
 * Routes to V1 or V2 validation based on schema version
 */
function validateCampaignForPublishing(campaign: any): string[] {
  if (isV2Campaign(campaign)) {
    return validateV2CampaignForPublishing(campaign);
  }
  return validateV1CampaignForPublishing(campaign);
}
