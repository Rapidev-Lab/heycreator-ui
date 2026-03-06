import { MockFirestore, MockTimestamp } from '../mock-firestore';
import { mockUsers, mockBrandProfiles, mockInfluencerProfiles } from './users';
import { mockCampaignsSeed } from './campaigns';
import { mockGlobalInfluencers } from './global-influencers';
import { mockApplications } from './applications';
import { mockNotifications } from './notifications';
import { mockWorkspaces } from './workspaces';
import { mockWorkspaceMembers } from './workspace-members';
import { mockSubscriptions } from './subscriptions';
import { mockInvoices } from './invoices';
import { mockPaymentMethods } from './payment-methods';
import { mockTeamInvitations } from './team-invitations';
import { mockSharedLinks } from './shared-links';
import { mockUsageRecords, mockUsageSummaries, mockUsageAlerts } from './usage-records';
import { mockAgencyData } from './agency-data';

/**
 * Populate all collections in a MockFirestore instance.
 * Called once on first access (guarded by globalForMock._mockSeeded).
 */
export function seedMockData(db: MockFirestore): void {
  // Users
  for (const u of mockUsers) {
    db._getCollection('users').set(u.id, u.data);
  }

  // Brand profiles
  for (const bp of mockBrandProfiles) {
    db._getCollection('brand_profiles').set(bp.id, bp.data);
  }

  // Influencer profiles
  for (const ip of mockInfluencerProfiles) {
    db._getCollection('influencer_profiles').set(ip.id, ip.data);
  }

  // Campaigns
  for (const c of mockCampaignsSeed) {
    db._getCollection('campaigns').set(c.id, c.data);
  }

  // Global influencers
  for (const gi of mockGlobalInfluencers) {
    db._getCollection('global_influencers').set(gi.id, gi.data);
  }

  // Campaign applications
  for (const app of mockApplications) {
    db._getCollection('campaign_applications').set(app.id, app.data);
  }

  // User collections (saved/starred profiles)
  const now = MockTimestamp.now();
  const userCollections = [
    {
      id: 'mock-uc-1',
      data: {
        userId: 'mock-brand-user-1',
        profileId: 'mock-gi-3',
        status: 'active',
        starred: true,
        internalNotes: 'Great South African influencer, perfect for local campaigns',
        tags: ['fashion', 'SA'],
        createdAt: now,
        updatedAt: now,
      },
    },
    {
      id: 'mock-uc-2',
      data: {
        userId: 'mock-brand-user-1',
        profileId: 'mock-gi-5',
        status: 'active',
        starred: false,
        internalNotes: '',
        tags: ['beauty'],
        createdAt: now,
        updatedAt: now,
      },
    },
    {
      id: 'mock-uc-3',
      data: {
        userId: 'mock-brand-user-1',
        profileId: 'mock-gi-7',
        status: 'active',
        starred: true,
        internalNotes: 'Sports brand ambassador potential',
        tags: ['sports', 'fitness'],
        createdAt: now,
        updatedAt: now,
      },
    },
  ];

  for (const uc of userCollections) {
    db._getCollection('user_collections').set(uc.id, uc.data);
  }

  // Notifications
  for (const n of mockNotifications) {
    db._getCollection('notifications').set(n.id, n.data);
  }

  // Workspaces
  for (const ws of mockWorkspaces) {
    db._getCollection('workspaces').set(ws.id, ws.data);
  }

  // Workspace members
  for (const wm of mockWorkspaceMembers) {
    db._getCollection('workspace_members').set(wm.id, wm.data);
  }

  // Subscriptions
  for (const sub of mockSubscriptions) {
    db._getCollection('subscriptions').set(sub.id, sub.data);
  }

  // Invoices
  for (const inv of mockInvoices) {
    db._getCollection('invoices').set(inv.id, inv.data);
  }

  // Payment methods
  for (const pm of mockPaymentMethods) {
    db._getCollection('payment_methods').set(pm.id, pm.data);
  }

  // Team invitations
  for (const inv of mockTeamInvitations) {
    db._getCollection('team_invitations').set(inv.id, inv);
  }

  // Shared links
  for (const sl of mockSharedLinks) {
    db._getCollection('shared_links').set(sl.id, sl);
  }

  // Usage records
  for (const ur of mockUsageRecords) {
    db._getCollection('usage_records').set(ur.id, ur.data);
  }

  // Usage summaries
  for (const us of mockUsageSummaries) {
    db._getCollection('usage_summaries').set(us.id, us.data);
  }

  // Usage alerts
  for (const ua of mockUsageAlerts) {
    db._getCollection('usage_alerts').set(ua.id, ua.data);
  }

  // Agency data
  if (mockAgencyData) {
    db._getCollection('agencies').set(mockAgencyData.id, mockAgencyData);
  }

  // Profile dedup locks (empty — will be populated by profile creation flows)
  // No seed data needed.

  // Mark all seeded collections as dirty so they get persisted to disk
  const seededCollections = [
    'users', 'brand_profiles', 'influencer_profiles',
    'campaigns', 'global_influencers', 'campaign_applications',
    'user_collections', 'notifications',
    'workspaces', 'workspace_members',
    'subscriptions', 'invoices', 'payment_methods',
    'team_invitations', 'shared_links',
    'usage_records', 'usage_summaries', 'usage_alerts', 'agencies',
  ];
  for (const name of seededCollections) {
    db._markDirty(name);
  }
}
