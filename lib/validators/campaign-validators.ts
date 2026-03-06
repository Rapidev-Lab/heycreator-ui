/**
 * Shared campaign validation logic.
 * Used by both POST /api/campaigns and PATCH /api/campaigns/[id].
 */

export function validateCampaign(body: any, isDraft: boolean): string[] {
  const errors: string[] = [];

  if (!isDraft) {
    // Basic Info
    if (!body.campaignTitle?.trim() || body.campaignTitle.trim().length < 3) {
      errors.push("campaignTitle (min 3 characters)");
    }
    if (!body.description?.trim() || body.description.trim().length < 10) {
      errors.push("description (min 10 characters)");
    }
    if (
      !Array.isArray(body.campaignObjectives) ||
      body.campaignObjectives.length === 0
    ) {
      errors.push("campaignObjectives (at least one required)");
    }
    if (!body.kpi?.trim()) {
      errors.push("kpi");
    }

    // Product
    if (!body.campaignProduct?.productType) {
      errors.push("campaignProduct.productType");
    }

    // Budget
    if (!body.budget?.compensationModel) {
      errors.push("budget.compensationModel");
    }
    if (
      body.budget?.compensationModel === "fixed" &&
      !body.budget?.fixedAmount
    ) {
      errors.push("budget.fixedAmount");
    }
    if (
      body.budget?.compensationModel === "range" &&
      (!body.budget?.minRangeAmount || !body.budget?.maxRangeAmount)
    ) {
      errors.push("budget.minRangeAmount and budget.maxRangeAmount");
    }

    // Tasks
    if (
      !body.tasks?.requiredDeliverables ||
      body.tasks.requiredDeliverables.length === 0
    ) {
      errors.push("tasks.requiredDeliverables (at least one required)");
    }

    // Audience
    if (
      body.audience?.minFollowers === undefined ||
      body.audience?.minFollowers === null
    ) {
      errors.push("audience.minFollowers");
    }
  } else {
    // For drafts, only require campaignTitle
    if (!body.campaignTitle?.trim()) {
      errors.push("campaignTitle");
    }
  }

  return errors;
}
