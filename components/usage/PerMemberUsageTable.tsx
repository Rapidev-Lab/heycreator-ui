'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import type { WorkspaceRole } from '@/types/workspace';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortKey = 'name' | 'searches' | 'campaigns' | 'exports' | 'lastActive';
type SortDir = 'asc' | 'desc';

interface MemberRow {
  id: string;
  displayName: string;
  email: string;
  role: WorkspaceRole;
  searches: number;
  campaigns: number;
  exports: number;
  /** ISO datetime string */
  lastActiveAt: string;
}

interface PerMemberUsageTableProps {
  workspaceId: string;
}

// ---------------------------------------------------------------------------
// Mock data — hardcoded as specified
// ---------------------------------------------------------------------------

const MOCK_MEMBERS: MemberRow[] = [
  {
    id: 'member-1',
    displayName: 'Sarah Marketing',
    email: 'sarah.marketing@brand.com',
    role: 'owner',
    searches: 12,
    campaigns: 3,
    exports: 45,
    lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: 'member-2',
    displayName: 'Mike Analytics',
    email: 'mike.analytics@brand.com',
    role: 'admin',
    searches: 8,
    campaigns: 2,
    exports: 32,
    lastActiveAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
  {
    id: 'member-3',
    displayName: 'Jessica Creative',
    email: 'jessica.creative@brand.com',
    role: 'editor',
    searches: 7,
    campaigns: 1,
    exports: 18,
    lastActiveAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // Yesterday
  },
  {
    id: 'member-4',
    displayName: 'David Intern',
    email: 'david.intern@brand.com',
    role: 'viewer',
    searches: 5,
    campaigns: 0,
    exports: 5,
    lastActiveAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns a human-readable relative time string for a given ISO datetime.
 */
function relativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 5) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Date(isoDate).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' });
}

/**
 * Returns the initials (up to 2 characters) for a display name.
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const ROLE_BADGE_CLASSES: Record<WorkspaceRole, string> = {
  owner: 'bg-brand-navy text-white',
  admin: 'bg-blue-100 text-blue-700',
  editor: 'bg-green-100 text-green-700',
  viewer: 'bg-gray-100 text-gray-500',
};

const ROLE_LABELS: Record<WorkspaceRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
};

const AVATAR_BG: Record<WorkspaceRole, string> = {
  owner: 'bg-brand-navy text-white',
  admin: 'bg-blue-600 text-white',
  editor: 'bg-green-600 text-white',
  viewer: 'bg-gray-400 text-white',
};

// ---------------------------------------------------------------------------
// Sub-component: SortableHeader
// ---------------------------------------------------------------------------

interface SortableHeaderProps {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  direction: SortDir;
  onSort: (key: SortKey) => void;
  align?: 'left' | 'right';
}

function SortableHeader({
  label,
  sortKey,
  currentKey,
  direction,
  onSort,
  align = 'right',
}: SortableHeaderProps) {
  const isActive = currentKey === sortKey;

  return (
    <th
      className={`px-4 py-3 text-${align} text-xs font-semibold text-gray-500 uppercase tracking-wide select-none`}
    >
      <button
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors focus:outline-none focus-visible:underline"
        aria-sort={isActive ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
      >
        {label}
        <span className="text-gray-300">
          {isActive ? (
            direction === 'asc' ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )
          ) : (
            <ChevronsUpDown className="w-3 h-3" />
          )}
        </span>
      </button>
    </th>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * PerMemberUsageTable — shows a sortable breakdown of usage per team member.
 *
 * Columns: Member, Role, Searches, Campaigns, Exports, Last Active
 * Each metric column also shows the percentage of the team total in smaller text.
 *
 * Note: workspaceId is accepted as a prop for future API integration;
 * currently all data is rendered from the hardcoded MOCK_MEMBERS array.
 */
export default function PerMemberUsageTable({ workspaceId: _workspaceId }: PerMemberUsageTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('searches');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // ── Totals for percentage calculation ─────────────────────────────────────
  const totals = useMemo(() => {
    return MOCK_MEMBERS.reduce(
      (acc, m) => ({
        searches: acc.searches + m.searches,
        campaigns: acc.campaigns + m.campaigns,
        exports: acc.exports + m.exports,
      }),
      { searches: 0, campaigns: 0, exports: 0 }
    );
  }, []);

  // ── Sorting ────────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    return [...MOCK_MEMBERS].sort((a, b) => {
      let comparison = 0;

      switch (sortKey) {
        case 'name':
          comparison = a.displayName.localeCompare(b.displayName);
          break;
        case 'searches':
          comparison = a.searches - b.searches;
          break;
        case 'campaigns':
          comparison = a.campaigns - b.campaigns;
          break;
        case 'exports':
          comparison = a.exports - b.exports;
          break;
        case 'lastActive':
          comparison =
            new Date(a.lastActiveAt).getTime() -
            new Date(b.lastActiveAt).getTime();
          break;
      }

      return sortDir === 'asc' ? comparison : -comparison;
    });
  }, [sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function pct(value: number, total: number): string {
    if (total === 0) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full min-w-[600px]" aria-label="Per-member usage breakdown">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <SortableHeader
              label="Member"
              sortKey="name"
              currentKey={sortKey}
              direction={sortDir}
              onSort={handleSort}
              align="left"
            />
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Role
            </th>
            <SortableHeader
              label="Searches"
              sortKey="searches"
              currentKey={sortKey}
              direction={sortDir}
              onSort={handleSort}
            />
            <SortableHeader
              label="Campaigns"
              sortKey="campaigns"
              currentKey={sortKey}
              direction={sortDir}
              onSort={handleSort}
            />
            <SortableHeader
              label="Exports"
              sortKey="exports"
              currentKey={sortKey}
              direction={sortDir}
              onSort={handleSort}
            />
            <SortableHeader
              label="Last Active"
              sortKey="lastActive"
              currentKey={sortKey}
              direction={sortDir}
              onSort={handleSort}
            />
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {sorted.map((member) => (
            <tr
              key={member.id}
              className="hover:bg-gray-50/60 transition-colors"
            >
              {/* Member */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${AVATAR_BG[member.role]}`}
                    aria-hidden="true"
                  >
                    {getInitials(member.displayName)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {member.displayName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{member.email}</p>
                  </div>
                </div>
              </td>

              {/* Role */}
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_BADGE_CLASSES[member.role]}`}
                >
                  {ROLE_LABELS[member.role]}
                </span>
              </td>

              {/* Searches */}
              <td className="px-4 py-3 text-right">
                <span className="text-sm font-semibold text-gray-800 tabular-nums">
                  {member.searches}
                </span>
                <span className="ml-1.5 text-xs text-gray-400 tabular-nums">
                  {pct(member.searches, totals.searches)}
                </span>
              </td>

              {/* Campaigns */}
              <td className="px-4 py-3 text-right">
                <span className="text-sm font-semibold text-gray-800 tabular-nums">
                  {member.campaigns}
                </span>
                <span className="ml-1.5 text-xs text-gray-400 tabular-nums">
                  {pct(member.campaigns, totals.campaigns)}
                </span>
              </td>

              {/* Exports */}
              <td className="px-4 py-3 text-right">
                <span className="text-sm font-semibold text-gray-800 tabular-nums">
                  {member.exports}
                </span>
                <span className="ml-1.5 text-xs text-gray-400 tabular-nums">
                  {pct(member.exports, totals.exports)}
                </span>
              </td>

              {/* Last Active */}
              <td className="px-4 py-3 text-right">
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {relativeTime(member.lastActiveAt)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>

        {/* Totals footer */}
        <tfoot>
          <tr className="bg-gray-50 border-t border-gray-200">
            <td
              colSpan={2}
              className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"
            >
              Total ({MOCK_MEMBERS.length} members)
            </td>
            <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 tabular-nums">
              {totals.searches}
            </td>
            <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 tabular-nums">
              {totals.campaigns}
            </td>
            <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 tabular-nums">
              {totals.exports}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
