import { WorkspaceMember } from '@/types/workspace';

const now = new Date().toISOString();
const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
const twentyDaysAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString();

export const mockWorkspaceMembers: { id: string; data: WorkspaceMember }[] = [
  // Nike SA workspace members
  {
    id: 'wm-nike-1',
    data: {
      id: 'wm-nike-1',
      workspaceId: 'ws-nike-sa',
      userId: 'mock-brand-user-1',
      email: 'brand@demo.heycreator.com',
      displayName: 'Demo Brand',
      photoURL: null,
      role: 'owner',
      status: 'active',
      invitedBy: 'mock-brand-user-1',
      invitedAt: twentyDaysAgo,
      joinedAt: twentyDaysAgo,
      lastActiveAt: now,
      searchesUsed: 18,
    },
  },
  {
    id: 'wm-nike-2',
    data: {
      id: 'wm-nike-2',
      workspaceId: 'ws-nike-sa',
      userId: 'user-alice-001',
      email: 'alice.marketing@nikeza.com',
      displayName: 'Alice van der Merwe',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      role: 'editor',
      status: 'active',
      invitedBy: 'mock-brand-user-1',
      invitedAt: tenDaysAgo,
      joinedAt: tenDaysAgo,
      lastActiveAt: twoDaysAgo,
      searchesUsed: 14,
    },
  },
  {
    id: 'wm-nike-3',
    data: {
      id: 'wm-nike-3',
      workspaceId: 'ws-nike-sa',
      userId: 'user-pending-001',
      email: 'sarah.jones@externalbrand.com',
      displayName: 'Sarah Jones',
      photoURL: null,
      role: 'viewer',
      status: 'pending',
      invitedBy: 'mock-brand-user-1',
      invitedAt: twoDaysAgo,
      joinedAt: null,
      lastActiveAt: twoDaysAgo,
      searchesUsed: 0,
    },
  },

  // Adidas ZA workspace members
  {
    id: 'wm-adidas-1',
    data: {
      id: 'wm-adidas-1',
      workspaceId: 'ws-adidas-za',
      userId: 'mock-brand-user-1',
      email: 'brand@demo.heycreator.com',
      displayName: 'Demo Brand',
      photoURL: null,
      role: 'owner',
      status: 'active',
      invitedBy: 'mock-brand-user-1',
      invitedAt: twentyDaysAgo,
      joinedAt: twentyDaysAgo,
      lastActiveAt: fiveDaysAgo,
      searchesUsed: 15,
    },
  },

  // Freshly Baked Co workspace members
  {
    id: 'wm-fresh-1',
    data: {
      id: 'wm-fresh-1',
      workspaceId: 'ws-freshly-baked',
      userId: 'mock-brand-user-1',
      email: 'brand@demo.heycreator.com',
      displayName: 'Demo Brand',
      photoURL: null,
      role: 'owner',
      status: 'active',
      invitedBy: 'mock-brand-user-1',
      invitedAt: now,
      joinedAt: now,
      lastActiveAt: now,
      searchesUsed: 5,
    },
  },
  {
    id: 'wm-fresh-2',
    data: {
      id: 'wm-fresh-2',
      workspaceId: 'ws-freshly-baked',
      userId: 'user-bob-001',
      email: 'bob.chef@freshlybaked.co.za',
      displayName: 'Bob Nkosi',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
      role: 'admin',
      status: 'active',
      invitedBy: 'mock-brand-user-1',
      invitedAt: fiveDaysAgo,
      joinedAt: fiveDaysAgo,
      lastActiveAt: twoDaysAgo,
      searchesUsed: 0,
    },
  },
  {
    id: 'wm-fresh-3',
    data: {
      id: 'wm-fresh-3',
      workspaceId: 'ws-freshly-baked',
      userId: 'user-deactivated-001',
      email: 'former.employee@freshlybaked.co.za',
      displayName: 'Thabo Mokoena',
      photoURL: null,
      role: 'editor',
      status: 'deactivated',
      invitedBy: 'mock-brand-user-1',
      invitedAt: twentyDaysAgo,
      joinedAt: twentyDaysAgo,
      lastActiveAt: tenDaysAgo,
      searchesUsed: 3,
    },
  },
];
