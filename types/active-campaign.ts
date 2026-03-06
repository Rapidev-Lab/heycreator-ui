/**
 * Types for the Active Campaign Card component.
 * Used by ActiveCampaignCard and ActiveCampaignsTab.
 */

export interface ActiveDeliverable {
  platform: string;
  contentType: string;
  quantity: number;
  completed: boolean;
}

export interface DeliverableProgress {
  total: number;
  completed: number;
  percentage: number;
}

export interface ActiveCampaignCardData {
  id: string;
  applicationId: string;

  title: string;
  brandName: string;
  brandLogo: string;
  description: string;
  category: string;
  categories: string[];
  campaignObjectives: string[];
  productImageUrl?: string;

  budgetAmount: number;
  currency: string;

  tasksDueDays: number;
  tasksDueDate: string;

  progress: DeliverableProgress | null;
  deliverables: ActiveDeliverable[];

  isSaved?: boolean;
}
