'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Search,
  MoreVertical,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  X,
} from 'lucide-react';
import RoleSelector, { type SelectableRole } from './RoleSelector';
import { ROLE_PERMISSIONS } from '@/types/team';

// ===== TYPES =====

type MemberRole = 'owner' | 'admin' | 'editor' | 'viewer';
type MemberStatus = 'active' | 'pending' | 'suspended';
type InvitationStatus = 'pending' | 'expired';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  avatarUrl?: string;
  lastActiveAt?: string;
  joinedAt: string;
}

interface TeamInvitation {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: InvitationStatus;
  createdAt: string;
  expiresAt: string;
}

interface TeamMembersTableProps {
  members: TeamMember[];
  invitations: TeamInvitation[];
  currentUserRole: MemberRole;
  onRoleChange?: (memberId: string, newRole: string) => void;
  onRemoveMember?: (memberId: string) => void;
  onResendInvitation?: (invitationId: string) => void;
  onRevokeInvitation?: (invitationId: string) => void;
}

// ===== UTILITY =====

function getRelativeTime(isoDate?: string): string {
  if (!isoDate) return 'Never';
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 5) return 'Just now';
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

const STATUS_CONFIG: Record<MemberStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-green-50 text-green-700' },
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700' },
  suspended: { label: 'Suspended', className: 'bg-red-50 text-red-700' },
};

const ROLE_LABEL: Record<MemberRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
};

// ===== AVATAR =====

function MemberAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  return avatarUrl ? (
    <img
      src={avatarUrl}
      alt={getInitials(name)}
      className="w-9 h-9 rounded-full border border-gray-200 object-cover flex-shrink-0"
    />
  ) : (
    <div className="w-9 h-9 rounded-full bg-brand-navy/10 text-brand-navy flex items-center justify-center text-sm font-semibold flex-shrink-0">
      {getInitials(name)}
    </div>
  );
}

// ===== KEBAB MENU =====

function ActionMenu({
  memberId,
  memberName,
  onRemove,
}: {
  memberId: string;
  memberName: string;
  onRemove: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label={`Options for ${memberName}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
          <button
            type="button"
            onClick={() => {
              onRemove(memberId);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
          >
            <X className="w-4 h-4" />
            Remove from workspace
          </button>
        </div>
      )}
    </div>
  );
}

// ===== MEMBER ROW =====

function MemberRow({
  member,
  canManage,
  canChangeRole,
  onRoleChange,
  onRemove,
}: {
  member: TeamMember;
  canManage: boolean;
  canChangeRole: boolean;
  onRoleChange?: (id: string, role: string) => void;
  onRemove?: (id: string) => void;
}) {
  const statusConfig = STATUS_CONFIG[member.status];
  const isOwner = member.role === 'owner';

  return (
    <div className="flex items-center gap-3 px-4 py-3 min-w-0">
      {/* Avatar + name/email */}
      <MemberAvatar name={member.name} avatarUrl={member.avatarUrl} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
          {isOwner && (
            <span className="text-[10px] font-semibold text-brand-navy bg-brand-navy/10 px-1.5 py-0.5 rounded flex-shrink-0">
              Owner
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 truncate">{member.email}</p>
      </div>

      {/* Role */}
      <div className="w-40 flex-shrink-0 hidden sm:block">
        {canChangeRole && !isOwner ? (
          <RoleSelector
            value={member.role as SelectableRole}
            onChange={(newRole) => onRoleChange?.(member.id, newRole)}
          />
        ) : (
          <span className="text-xs font-medium text-gray-600 px-2 py-1 bg-gray-50 rounded-md capitalize">
            {ROLE_LABEL[member.role]}
          </span>
        )}
      </div>

      {/* Status badge */}
      <div className="flex-shrink-0 hidden md:block">
        <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${statusConfig.className}`}>
          {statusConfig.label}
        </span>
      </div>

      {/* Last active */}
      <div className="flex-shrink-0 w-28 text-right hidden lg:block">
        <span className="text-xs text-gray-400">{getRelativeTime(member.lastActiveAt)}</span>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 w-8">
        {canManage && !isOwner && onRemove && (
          <ActionMenu memberId={member.id} memberName={member.name} onRemove={onRemove} />
        )}
      </div>
    </div>
  );
}

// ===== INVITATION ROW =====

function InvitationRow({
  invitation,
  canManage,
  onResend,
  onRevoke,
}: {
  invitation: TeamInvitation;
  canManage: boolean;
  onResend?: (id: string) => void;
  onRevoke?: (id: string) => void;
}) {
  const isExpired = invitation.status === 'expired';
  const sentDate = new Date(invitation.createdAt).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const expiresDate = new Date(invitation.expiresAt).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
  });

  const initials = invitation.email.slice(0, 1).toUpperCase();

  return (
    <div className="flex items-center gap-3 px-4 py-3 min-w-0">
      {/* Avatar placeholder */}
      <div className="w-9 h-9 rounded-full border-2 border-dashed border-gray-300 text-gray-400 flex items-center justify-center text-sm font-semibold flex-shrink-0">
        {initials}
      </div>

      {/* Email */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 truncate">{invitation.email}</p>
        <p className="text-xs text-gray-400">Sent {sentDate}</p>
      </div>

      {/* Role */}
      <div className="w-40 flex-shrink-0 hidden sm:block">
        <span className="text-xs font-medium text-gray-600 px-2 py-1 bg-gray-50 rounded-md capitalize">
          {invitation.role}
        </span>
      </div>

      {/* Status / expires */}
      <div className="flex-shrink-0 hidden md:block">
        {isExpired ? (
          <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-red-50 text-red-700">
            Expired
          </span>
        ) : (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Expires {expiresDate}
          </span>
        )}
      </div>

      {/* Last active placeholder */}
      <div className="flex-shrink-0 w-28 hidden lg:block" />

      {/* Actions */}
      <div className="flex-shrink-0 w-auto">
        {canManage && (
          <div className="flex items-center gap-2">
            {!isExpired && (
              <button
                type="button"
                onClick={() => onResend?.(invitation.id)}
                className="text-xs font-medium text-brand-navy hover:text-brand-navy/80 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Resend
              </button>
            )}
            <button
              type="button"
              onClick={() => onRevoke?.(invitation.id)}
              className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
            >
              Revoke
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== MAIN COMPONENT =====

export default function TeamMembersTable({
  members,
  invitations,
  currentUserRole,
  onRoleChange,
  onRemoveMember,
  onResendInvitation,
  onRevokeInvitation,
}: TeamMembersTableProps) {
  const [query, setQuery] = useState('');

  const canManage = currentUserRole === 'owner' || currentUserRole === 'admin';
  const canChangeRole = useMemo(() => {
    const perms = ROLE_PERMISSIONS.find((p) => p.key === 'manage_team');
    if (!perms) return false;
    return perms[currentUserRole] === true;
  }, [currentUserRole]);

  // Filter members
  const filteredMembers = useMemo(() => {
    if (!query.trim()) return members;
    const q = query.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
    );
  }, [members, query]);

  // Filter invitations
  const filteredInvitations = useMemo(() => {
    if (!query.trim()) return invitations;
    const q = query.toLowerCase();
    return invitations.filter((inv) => inv.email.toLowerCase().includes(q));
  }, [invitations, query]);

  const pendingInvitations = filteredInvitations.filter((inv) => inv.status === 'pending' || inv.status === 'expired');

  const isEmpty = members.length === 0 && invitations.length === 0;

  return (
    <div className="space-y-6">
      {/* Search */}
      {!isEmpty && (
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            aria-label="Search team members"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none bg-white transition-colors"
          />
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
            <Users className="w-7 h-7 text-gray-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">No team members yet</p>
            <p className="text-xs text-gray-400 mt-1">Invite your first team member to get started.</p>
          </div>
        </div>
      )}

      {/* Members table */}
      {filteredMembers.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <div className="w-9 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</span>
            </div>
            <div className="w-40 flex-shrink-0 hidden sm:block">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</span>
            </div>
            <div className="flex-shrink-0 w-20 hidden md:block">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</span>
            </div>
            <div className="flex-shrink-0 w-28 text-right hidden lg:block">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Active</span>
            </div>
            <div className="flex-shrink-0 w-8" aria-hidden="true" />
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-50">
            {filteredMembers.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                canManage={canManage}
                canChangeRole={canChangeRole}
                onRoleChange={onRoleChange}
                onRemove={onRemoveMember}
              />
            ))}
          </div>

          {/* No results after filter */}
          {filteredMembers.length === 0 && query && (
            <div className="flex items-center justify-center py-10 text-gray-400">
              <p className="text-sm">No members match &ldquo;{query}&rdquo;</p>
            </div>
          )}
        </div>
      )}

      {/* Pending invitations */}
      {pendingInvitations.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Pending Invitations ({pendingInvitations.length})
          </h3>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-50">
            {pendingInvitations.map((inv) => (
              <InvitationRow
                key={inv.id}
                invitation={inv}
                canManage={canManage}
                onResend={onResendInvitation}
                onRevoke={onRevokeInvitation}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
