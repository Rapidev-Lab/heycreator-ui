'use client';

import { useState, useMemo } from 'react';
import { UserPlus, Users, Building2 } from 'lucide-react';
import { useWorkspace } from '@/lib/context/workspace-context';
import { PLAN_TIERS } from '@/types/workspace';
import { mockTeamInvitations } from '@/lib/mock/seed/team-invitations';
import SeatCounter from '@/components/team/SeatCounter';
import TeamMembersTable from '@/components/team/TeamMembersTable';
import InviteMemberModal from '@/components/team/InviteMemberModal';

// ===== LOADING SKELETON =====

function TeamPageSkeleton() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-pulse">
      <div className="h-8 w-56 bg-gray-200 rounded-lg" />
      <div className="h-5 w-80 bg-gray-100 rounded" />
      <div className="flex items-center justify-between">
        <div className="w-16 h-16 bg-gray-200 rounded-full" />
        <div className="h-10 w-36 bg-gray-200 rounded-lg" />
      </div>
      <div className="h-64 bg-gray-100 rounded-xl" />
    </div>
  );
}

// ===== EMPTY WORKSPACE STATE =====

function NoWorkspace() {
  return (
    <div className="p-6 lg:p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-navy/5 flex items-center justify-center mb-4">
        <Building2 className="w-8 h-8 text-brand-navy" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">No Workspace Selected</h2>
      <p className="text-gray-500 mb-2 max-w-sm text-sm">
        Select a workspace from the sidebar to manage your team.
      </p>
    </div>
  );
}

// ===== MAIN PAGE =====

export default function TeamManagementPage() {
  const { currentWorkspace, members, userRole, isLoading } = useWorkspace();
  const [inviteOpen, setInviteOpen] = useState(false);

  // Derive seats from plan tier
  const seatsTotal = useMemo(() => {
    if (!currentWorkspace) return 1;
    return PLAN_TIERS[currentWorkspace.planTier]?.seats ?? 1;
  }, [currentWorkspace]);

  // Map WorkspaceMembers to the shape TeamMembersTable expects
  const tableMembers = useMemo(
    () =>
      members.map((m) => ({
        id: m.id,
        name: m.displayName,
        email: m.email,
        role: m.role as 'owner' | 'admin' | 'editor' | 'viewer',
        status: m.status === 'deactivated' ? ('suspended' as const) : (m.status as 'active' | 'pending' | 'suspended'),
        avatarUrl: m.photoURL ?? undefined,
        lastActiveAt: m.lastActiveAt,
        joinedAt: m.joinedAt ?? m.invitedAt,
      })),
    [members]
  );

  // Filter invitations to current workspace and adapt their status
  const tableInvitations = useMemo(() => {
    if (!currentWorkspace) return [];
    return mockTeamInvitations
      .filter(
        (inv) =>
          inv.workspaceId === currentWorkspace.id &&
          (inv.status === 'pending' || inv.status === 'expired')
      )
      .map((inv) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        status: inv.status as 'pending' | 'expired',
        createdAt: inv.createdAt,
        expiresAt: inv.expiresAt,
      }));
  }, [currentWorkspace]);

  const seatsUsed = useMemo(
    () => members.filter((m) => m.status === 'active' || m.status === 'pending').length,
    [members]
  );

  const canManage = userRole === 'owner' || userRole === 'admin';

  // ===== RENDER =====

  if (isLoading) return <TeamPageSkeleton />;
  if (!currentWorkspace) return <NoWorkspace />;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage members and roles for{' '}
            <span className="font-medium text-gray-700">{currentWorkspace.name}</span>
          </p>
        </div>

        {/* Invite button (desktop) */}
        {canManage && (
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-brand-navy text-white rounded-lg text-sm font-semibold hover:bg-brand-navy/90 transition-colors self-start"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        )}
      </div>

      {/* Seat counter + invite button row */}
      <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-xl border border-gray-200">
        {/* Left: seat stats */}
        <div className="flex items-center gap-4">
          <SeatCounter used={seatsUsed} total={seatsTotal} />
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {seatsTotal - seatsUsed > 0
                ? `${seatsTotal - seatsUsed} seat${seatsTotal - seatsUsed !== 1 ? 's' : ''} available`
                : 'All seats filled'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 capitalize">
              {currentWorkspace.planTier} plan &mdash; {seatsTotal} seat{seatsTotal !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>

        {/* Mobile invite button */}
        {canManage && (
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="sm:hidden inline-flex items-center gap-2 px-4 py-2.5 bg-brand-navy text-white rounded-lg text-sm font-semibold hover:bg-brand-navy/90 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Invite
          </button>
        )}
      </div>

      {/* Team members table */}
      <TeamMembersTable
        members={tableMembers}
        invitations={tableInvitations}
        currentUserRole={userRole ?? 'viewer'}
        onRoleChange={(memberId, newRole) => {
          // TODO: call role change API
          console.log('Role change:', memberId, newRole);
        }}
        onRemoveMember={(memberId) => {
          // TODO: call remove member API
          console.log('Remove member:', memberId);
        }}
        onResendInvitation={(invId) => {
          // TODO: call resend invitation API
          console.log('Resend invitation:', invId);
        }}
        onRevokeInvitation={(invId) => {
          // TODO: call revoke invitation API
          console.log('Revoke invitation:', invId);
        }}
      />

      {/* Invite modal */}
      {currentWorkspace && (
        <InviteMemberModal
          isOpen={inviteOpen}
          onClose={() => setInviteOpen(false)}
          workspaceId={currentWorkspace.id}
          workspaceName={currentWorkspace.name}
          seatsUsed={seatsUsed}
          seatsTotal={seatsTotal}
        />
      )}
    </div>
  );
}
