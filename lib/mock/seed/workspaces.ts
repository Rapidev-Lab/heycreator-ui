import { Workspace, WorkspaceUsage } from '@/types/workspace';

const now = new Date().toISOString();
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
const fourteenDaysFromNow = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

const growthUsage: WorkspaceUsage = {
  searchesUsed: 32,
  searchesLimit: 50,
  campaignsActive: 8,
  campaignsLimit: 25,
  seatsUsed: 2,
  seatsLimit: 3,
  billingCycleStart: thirtyDaysAgo,
  billingCycleEnd: thirtyDaysFromNow,
};

const discoveryUsage: WorkspaceUsage = {
  searchesUsed: 15,
  searchesLimit: 20,
  campaignsActive: 4,
  campaignsLimit: 5,
  seatsUsed: 1,
  seatsLimit: 1,
  billingCycleStart: thirtyDaysAgo,
  billingCycleEnd: thirtyDaysFromNow,
};

const scaleUsage: WorkspaceUsage = {
  searchesUsed: 87,
  searchesLimit: -1,
  campaignsActive: 14,
  campaignsLimit: -1,
  seatsUsed: 5,
  seatsLimit: 10,
  billingCycleStart: thirtyDaysAgo,
  billingCycleEnd: thirtyDaysFromNow,
};

export const mockWorkspaces: { id: string; data: Workspace }[] = [
  {
    id: 'ws-nike-sa',
    data: {
      id: 'ws-nike-sa',
      name: 'Nike South Africa',
      slug: 'nike-south-africa',
      logoUrl: null,
      ownerId: 'mock-brand-user-1',
      brandName: 'Nike SA',
      industry: 'Fashion',
      website: 'https://www.nike.com/za',
      companySize: '1000+',
      planTier: 'growth',
      status: 'active',
      trialEndsAt: null,
      subscriptionId: 'sub-nike-sa-001',
      usage: growthUsage,
      settings: {
        currency: 'ZAR',
        brandColor: '#111111',
        notificationsEnabled: true,
        weeklyDigest: true,
      },
      agencyId: 'agency-demo-1',
      createdAt: thirtyDaysAgo,
      updatedAt: now,
      archivedAt: null,
    },
  },
  {
    id: 'ws-adidas-za',
    data: {
      id: 'ws-adidas-za',
      name: 'Adidas ZA',
      slug: 'adidas-za',
      logoUrl: null,
      ownerId: 'mock-brand-user-1',
      brandName: 'Adidas South Africa',
      industry: 'Fashion',
      website: 'https://www.adidas.co.za',
      companySize: '1000+',
      planTier: 'discovery',
      status: 'active',
      trialEndsAt: null,
      subscriptionId: 'sub-adidas-za-001',
      usage: discoveryUsage,
      settings: {
        currency: 'ZAR',
        brandColor: '#000000',
        notificationsEnabled: true,
        weeklyDigest: false,
      },
      agencyId: 'agency-demo-1',
      createdAt: thirtyDaysAgo,
      updatedAt: now,
      archivedAt: null,
    },
  },
  {
    id: 'ws-freshly-baked',
    data: {
      id: 'ws-freshly-baked',
      name: 'Freshly Baked Co',
      slug: 'freshly-baked-co',
      logoUrl: null,
      ownerId: 'mock-brand-user-1',
      brandName: 'Freshly Baked Co',
      industry: 'Food & Beverage',
      website: 'https://freshlybaked.co.za',
      companySize: '11-50',
      planTier: 'growth',
      status: 'trial',
      trialEndsAt: fourteenDaysFromNow,
      subscriptionId: null,
      usage: {
        searchesUsed: 5,
        searchesLimit: 50,
        campaignsActive: 1,
        campaignsLimit: 25,
        seatsUsed: 1,
        seatsLimit: 3,
        billingCycleStart: now,
        billingCycleEnd: fourteenDaysFromNow,
      },
      settings: {
        currency: 'ZAR',
        brandColor: '#D97706',
        notificationsEnabled: true,
        weeklyDigest: true,
      },
      agencyId: null,
      createdAt: now,
      updatedAt: now,
      archivedAt: null,
    },
  },
];
