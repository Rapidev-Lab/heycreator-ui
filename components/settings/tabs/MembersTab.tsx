'use client';

import { useState } from 'react';
import { Users, UserPlus, X, MoreVertical, Shield } from 'lucide-react';
import { useWorkspace } from '@/lib/context/workspace-context';
import { WORKSPACE_ROLE_LABELS, type WorkspaceRole, type WorkspaceMember } from '@/types/workspace';

function MemberRow({
  member,
  canManage,
  isPending,
  isDeactivated,
}: {
  member: WorkspaceMember;
  canManage: boolean;
  isPending?: boolean;
  isDeactivated?: boolean;
}) {
  const initial = member.displayName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {member.photoURL ? (
        <img
          src={member.photoURL}
          alt={initial}
          className="w-9 h-9 rounded-full border border-gray-200 object-cover"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-brand-navy/10 text-brand-navy flex items-center justify-center text-sm font-semibold flex-shrink-0">
          {initial}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 truncate">{member.displayName}</p>
          {isPending && (
            <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex-shrink-0">
              Pending
            </span>
          )}
          {isDeactivated && (
            <span className="text-[10px] font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded flex-shrink-0">
              Deactivated
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 truncate">{member.email}</p>
      </div>
      <span className="text-xs font-medium text-gray-500 px-2 py-1 bg-gray-50 rounded-md capitalize flex-shrink-0">
        {WORKSPACE_ROLE_LABELS[member.role]}
      </span>
      {canManage && member.role !== 'owner' && (
        <button
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Member options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default function MembersTab() {
  const { members, currentWorkspace, userRole } = useWorkspace();
  const canManage = userRole === 'owner' || userRole === 'admin';

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('editor');

  const activeMembers = members.filter((m) => m.status === 'active');
  const pendingMembers = members.filter((m) => m.status === 'pending');
  const deactivatedMembers = members.filter((m) => m.status === 'deactivated');

  const seatsUsed = activeMembers.length + pendingMembers.length;
  const seatsLimit = currentWorkspace?.usage.seatsLimit ?? 1;

  const handleInvite = () => {
    // TODO: call invite API
    setInviteEmail('');
    setShowInviteModal(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Members</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your workspace team members and their roles.
        </p>
      </div>

      {/* Seats summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50 rounded-xl">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Team Seats: {seatsUsed}/{seatsLimit}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {seatsLimit - seatsUsed > 0
              ? `${seatsLimit - seatsUsed} seat${seatsLimit - seatsUsed !== 1 ? 's' : ''} available`
              : 'All seats are filled — upgrade to add more'}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-semibold hover:bg-brand-navy/90 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        )}
      </div>

      {/* Active Members */}
      {activeMembers.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Active Members ({activeMembers.length})
          </h4>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {activeMembers.map((member) => (
              <MemberRow key={member.id} member={member} canManage={canManage} />
            ))}
          </div>
        </div>
      )}

      {/* Pending Invitations */}
      {pendingMembers.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Pending Invitations ({pendingMembers.length})
          </h4>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {pendingMembers.map((member) => (
              <MemberRow key={member.id} member={member} canManage={canManage} isPending />
            ))}
          </div>
        </div>
      )}

      {/* Deactivated */}
      {deactivatedMembers.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Deactivated ({deactivatedMembers.length})
          </h4>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 opacity-60">
            {deactivatedMembers.map((member) => (
              <MemberRow key={member.id} member={member} canManage={canManage} isDeactivated />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {members.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
          <Users className="w-10 h-10" />
          <p className="text-sm">No team members yet.</p>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Invite Team Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none bg-white"
                >
                  <option value="admin">Admin &mdash; Full access except billing</option>
                  <option value="editor">Editor &mdash; Create campaigns, search creators</option>
                  <option value="viewer">Viewer &mdash; Read-only access</option>
                </select>
              </div>
              {seatsUsed >= seatsLimit && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700 font-medium">
                    All seats are used. This invitation requires an additional paid seat.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={!inviteEmail.trim()}
                className="px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-semibold hover:bg-brand-navy/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
