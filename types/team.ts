export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface TeamInvitation {
  id: string;
  workspaceId: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  invitedBy: string; // userId
  invitedByName: string;
  status: InvitationStatus;
  token: string; // unique invite token
  message?: string; // optional personal message
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
}

export interface RolePermission {
  key: string;
  label: string;
  description: string;
  owner: boolean;
  admin: boolean;
  editor: boolean;
  viewer: boolean;
}

export const ROLE_PERMISSIONS: RolePermission[] = [
  {
    key: 'view_campaigns',
    label: 'View Campaigns',
    description: 'See all campaign data',
    owner: true,
    admin: true,
    editor: true,
    viewer: true,
  },
  {
    key: 'edit_campaigns',
    label: 'Edit Campaigns',
    description: 'Create and modify campaigns',
    owner: true,
    admin: true,
    editor: true,
    viewer: false,
  },
  {
    key: 'view_creators',
    label: 'View Creators',
    description: 'Browse creator profiles',
    owner: true,
    admin: true,
    editor: true,
    viewer: true,
  },
  {
    key: 'manage_creators',
    label: 'Manage Creators',
    description: 'Add, remove, and organize creators',
    owner: true,
    admin: true,
    editor: true,
    viewer: false,
  },
  {
    key: 'view_analytics',
    label: 'View Analytics',
    description: 'Access performance data',
    owner: true,
    admin: true,
    editor: true,
    viewer: true,
  },
  {
    key: 'export_data',
    label: 'Export Data',
    description: 'Download CSV/JSON exports',
    owner: true,
    admin: true,
    editor: false,
    viewer: false,
  },
  {
    key: 'manage_team',
    label: 'Manage Team',
    description: 'Invite and manage team members',
    owner: true,
    admin: true,
    editor: false,
    viewer: false,
  },
  {
    key: 'manage_billing',
    label: 'Manage Billing',
    description: 'View and manage subscription',
    owner: true,
    admin: false,
    editor: false,
    viewer: false,
  },
  {
    key: 'workspace_settings',
    label: 'Workspace Settings',
    description: 'Edit workspace configuration',
    owner: true,
    admin: true,
    editor: false,
    viewer: false,
  },
  {
    key: 'delete_workspace',
    label: 'Delete Workspace',
    description: 'Permanently delete workspace',
    owner: true,
    admin: false,
    editor: false,
    viewer: false,
  },
];
