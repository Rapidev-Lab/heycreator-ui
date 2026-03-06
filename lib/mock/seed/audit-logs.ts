/**
 * Mock audit log seed data for workspace ws-nike-sa.
 *
 * 20 entries spread across the last 30 days covering:
 * - Campaign lifecycle events (created, published)
 * - Team management (member invited, role changed)
 * - Workspace settings updates
 * - Creator discovery actions (search, creator saved)
 * - Data export requests
 * - Billing plan changes
 * - Login events
 *
 * Users represented:
 *   mock-brand-user-1  — Demo Brand (workspace owner)
 *   user-sarah-001     — Sarah Marketing (editor)
 *   user-mike-001      — Mike Analytics (viewer)
 *   user-jessica-001   — Jessica Creative (editor)
 *
 * Canonical "today": 2026-03-06
 */

import { AuditLogEntry } from '@/types/legal';

// ---------------------------------------------------------------------------
// Date helper — canonical "today": 2026-03-06
// ---------------------------------------------------------------------------

function D(offsetDays: number, hour = 9): string {
  const base = new Date('2026-03-06T12:00:00.000Z');
  base.setUTCDate(base.getUTCDate() + offsetDays);
  base.setUTCHours(hour, 0, 0, 0);
  return base.toISOString();
}

// ---------------------------------------------------------------------------
// Audit log entries
// ---------------------------------------------------------------------------

const entries: AuditLogEntry[] = [
  // -------------------------------------------------------------------------
  // Day -30: Workspace setup — owner creates first campaign
  // -------------------------------------------------------------------------
  {
    id: 'al-1',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-1',
    userName: 'Demo Brand',
    action: 'campaign.created',
    entityType: 'campaign',
    entityId: 'mock-campaign-1',
    details: 'Created campaign "Summer Running Collection" with a budget of R45,000.',
    ipAddress: '196.21.144.10',
    timestamp: D(-30, 9),
  },
  // -------------------------------------------------------------------------
  // Day -28: Login from new device
  // -------------------------------------------------------------------------
  {
    id: 'al-2',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-1',
    userName: 'Demo Brand',
    action: 'login.success',
    entityType: 'user',
    entityId: 'mock-brand-user-1',
    details: 'Successful login from Chrome on macOS (Cape Town, ZA).',
    ipAddress: '196.21.144.10',
    timestamp: D(-28, 8),
  },
  // -------------------------------------------------------------------------
  // Day -27: Creator saved to workspace list
  // -------------------------------------------------------------------------
  {
    id: 'al-3',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-1',
    userName: 'Demo Brand',
    action: 'creator.saved',
    entityType: 'global_influencer',
    entityId: 'mock-gi-3',
    details: 'Saved creator @nomvula_style (245K followers, 6.8% engagement) to workspace.',
    ipAddress: '196.21.144.10',
    timestamp: D(-27, 10),
  },
  // -------------------------------------------------------------------------
  // Day -26: Team member invited — Sarah Marketing
  // -------------------------------------------------------------------------
  {
    id: 'al-4',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-1',
    userName: 'Demo Brand',
    action: 'member.invited',
    entityType: 'member',
    entityId: 'user-sarah-001',
    details: 'Invited sarah.marketing@nikesa.co.za as Editor.',
    ipAddress: '196.21.144.10',
    timestamp: D(-26, 11),
  },
  // -------------------------------------------------------------------------
  // Day -25: Influencer search performed
  // -------------------------------------------------------------------------
  {
    id: 'al-5',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-1',
    userName: 'Demo Brand',
    action: 'search.performed',
    entityType: 'search',
    entityId: undefined,
    details: 'Searched for "South African fitness creators" on Instagram (14 results returned).',
    ipAddress: '196.21.144.10',
    timestamp: D(-25, 9),
  },
  // -------------------------------------------------------------------------
  // Day -24: Sarah accepts invitation and logs in
  // -------------------------------------------------------------------------
  {
    id: 'al-6',
    workspaceId: 'ws-nike-sa',
    userId: 'user-sarah-001',
    userName: 'Sarah Marketing',
    action: 'login.success',
    entityType: 'user',
    entityId: 'user-sarah-001',
    details: 'Sarah Marketing joined the workspace and logged in for the first time.',
    ipAddress: '41.185.8.200',
    timestamp: D(-24, 14),
  },
  // -------------------------------------------------------------------------
  // Day -22: Campaign published
  // -------------------------------------------------------------------------
  {
    id: 'al-7',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-1',
    userName: 'Demo Brand',
    action: 'campaign.published',
    entityType: 'campaign',
    entityId: 'mock-campaign-1',
    details: 'Published campaign "Summer Running Collection" — now visible to creators on the marketplace.',
    ipAddress: '196.21.144.10',
    timestamp: D(-22, 10),
  },
  // -------------------------------------------------------------------------
  // Day -21: Mike Analytics invited as Viewer
  // -------------------------------------------------------------------------
  {
    id: 'al-8',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-1',
    userName: 'Demo Brand',
    action: 'member.invited',
    entityType: 'member',
    entityId: 'user-mike-001',
    details: 'Invited mike.analytics@nikesa.co.za as Viewer.',
    ipAddress: '196.21.144.10',
    timestamp: D(-21, 13),
  },
  // -------------------------------------------------------------------------
  // Day -20: Data export requested by Sarah
  // -------------------------------------------------------------------------
  {
    id: 'al-9',
    workspaceId: 'ws-nike-sa',
    userId: 'user-sarah-001',
    userName: 'Sarah Marketing',
    action: 'export.requested',
    entityType: 'export',
    entityId: 'export-001',
    details: 'Requested CSV export of creator shortlist (12 profiles) for internal review.',
    ipAddress: '41.185.8.200',
    timestamp: D(-20, 16),
  },
  // -------------------------------------------------------------------------
  // Day -19: Settings updated — brand colour changed
  // -------------------------------------------------------------------------
  {
    id: 'al-10',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-1',
    userName: 'Demo Brand',
    action: 'settings.updated',
    entityType: 'workspace',
    entityId: 'ws-nike-sa',
    details: 'Updated workspace settings: brand colour changed from #000000 to #111111, weekly digest enabled.',
    ipAddress: '196.21.144.10',
    timestamp: D(-19, 11),
  },
  // -------------------------------------------------------------------------
  // Day -18: Second campaign created
  // -------------------------------------------------------------------------
  {
    id: 'al-11',
    workspaceId: 'ws-nike-sa',
    userId: 'user-sarah-001',
    userName: 'Sarah Marketing',
    action: 'campaign.created',
    entityType: 'campaign',
    entityId: 'mock-campaign-2',
    details: 'Created campaign "Air Max Day Influencer Push" with a budget of R28,000.',
    ipAddress: '41.185.8.200',
    timestamp: D(-18, 14),
  },
  // -------------------------------------------------------------------------
  // Day -17: Jessica Creative invited
  // -------------------------------------------------------------------------
  {
    id: 'al-12',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-1',
    userName: 'Demo Brand',
    action: 'member.invited',
    entityType: 'member',
    entityId: 'user-jessica-001',
    details: 'Invited jessica.creative@nikesa.co.za as Editor.',
    ipAddress: '196.21.144.10',
    timestamp: D(-17, 9),
  },
  // -------------------------------------------------------------------------
  // Day -15: Mike's role upgraded from Viewer to Editor
  // -------------------------------------------------------------------------
  {
    id: 'al-13',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-1',
    userName: 'Demo Brand',
    action: 'member.role_changed',
    entityType: 'member',
    entityId: 'user-mike-001',
    details: 'Changed Mike Analytics role from Viewer to Editor — expanded campaign access required.',
    ipAddress: '196.21.144.10',
    timestamp: D(-15, 10),
  },
  // -------------------------------------------------------------------------
  // Day -14: Creator saved by Jessica
  // -------------------------------------------------------------------------
  {
    id: 'al-14',
    workspaceId: 'ws-nike-sa',
    userId: 'user-jessica-001',
    userName: 'Jessica Creative',
    action: 'creator.saved',
    entityType: 'global_influencer',
    entityId: 'mock-gi-7',
    details: 'Saved creator @runwithzara (Sports & Fitness, 89K followers) and added tag "sports-ambassador".',
    ipAddress: '105.235.132.44',
    timestamp: D(-14, 11),
  },
  // -------------------------------------------------------------------------
  // Day -12: Billing plan upgraded from Discovery to Growth
  // -------------------------------------------------------------------------
  {
    id: 'al-15',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-1',
    userName: 'Demo Brand',
    action: 'billing.plan_changed',
    entityType: 'subscription',
    entityId: 'sub-nike-sa-001',
    details: 'Upgraded subscription from Discovery (R20,000/mo) to Growth (R35,000/mo). Effective immediately.',
    ipAddress: '196.21.144.10',
    timestamp: D(-12, 15),
  },
  // -------------------------------------------------------------------------
  // Day -10: Search performed by Mike
  // -------------------------------------------------------------------------
  {
    id: 'al-16',
    workspaceId: 'ws-nike-sa',
    userId: 'user-mike-001',
    userName: 'Mike Analytics',
    action: 'search.performed',
    entityType: 'search',
    entityId: undefined,
    details: 'Searched for "trail running South Africa" on TikTok and Instagram (9 results returned).',
    ipAddress: '41.185.9.117',
    timestamp: D(-10, 10),
  },
  // -------------------------------------------------------------------------
  // Day -9: Third campaign created
  // -------------------------------------------------------------------------
  {
    id: 'al-17',
    workspaceId: 'ws-nike-sa',
    userId: 'user-sarah-001',
    userName: 'Sarah Marketing',
    action: 'campaign.created',
    entityType: 'campaign',
    entityId: 'mock-campaign-3',
    details: 'Created campaign "Women in Sport SA" — awareness drive targeting female fitness creators.',
    ipAddress: '41.185.8.200',
    timestamp: D(-9, 9),
  },
  // -------------------------------------------------------------------------
  // Day -7: Creator saved — third profile added
  // -------------------------------------------------------------------------
  {
    id: 'al-18',
    workspaceId: 'ws-nike-sa',
    userId: 'user-jessica-001',
    userName: 'Jessica Creative',
    action: 'creator.saved',
    entityType: 'global_influencer',
    entityId: 'mock-gi-5',
    details: 'Saved creator @glowbyjess (Beauty & Lifestyle, 312K followers) and added to "Summer Campaign" list.',
    ipAddress: '105.235.132.44',
    timestamp: D(-7, 14),
  },
  // -------------------------------------------------------------------------
  // Day -3: Export requested — campaign performance report
  // -------------------------------------------------------------------------
  {
    id: 'al-19',
    workspaceId: 'ws-nike-sa',
    userId: 'user-mike-001',
    userName: 'Mike Analytics',
    action: 'export.requested',
    entityType: 'export',
    entityId: 'export-002',
    details: 'Requested PDF export of "Summer Running Collection" campaign performance report.',
    ipAddress: '41.185.9.117',
    timestamp: D(-3, 11),
  },
  // -------------------------------------------------------------------------
  // Day -1: Settings updated — notifications enabled for all members
  // -------------------------------------------------------------------------
  {
    id: 'al-20',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-1',
    userName: 'Demo Brand',
    action: 'settings.updated',
    entityType: 'workspace',
    entityId: 'ws-nike-sa',
    details: 'Updated notification settings: push notifications enabled for all workspace members.',
    ipAddress: '196.21.144.10',
    timestamp: D(-1, 16),
  },
];

// ---------------------------------------------------------------------------
// Export in seed-pattern format: { id, data }
// ---------------------------------------------------------------------------

export const mockAuditLogs: { id: string; data: AuditLogEntry }[] = entries.map((entry) => ({
  id: entry.id,
  data: entry,
}));
