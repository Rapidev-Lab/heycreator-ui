'use client';

import { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { AuditLogEntry } from '@/types/legal';

// ===== MOCK DATA =====

const MOCK_AUDIT_ENTRIES: AuditLogEntry[] = [
  {
    id: 'log-001',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-1',
    userName: 'Sarah Johnson',
    action: 'campaign.created',
    entityType: 'campaign',
    entityId: 'camp-001',
    details: 'Created campaign "Summer Activation 2026"',
    ipAddress: '196.25.101.42',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-002',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-2',
    userName: 'David Mokoena',
    action: 'search.performed',
    entityType: 'search',
    details: 'Searched for "fitness influencers Cape Town" on Instagram',
    ipAddress: '41.21.88.77',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-003',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-1',
    userName: 'Sarah Johnson',
    action: 'member.invited',
    entityType: 'member',
    entityId: 'mock-brand-user-3',
    details: 'Invited lebo.dlamini@agency.co.za as Editor',
    ipAddress: '196.25.101.42',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-004',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-3',
    userName: 'Lebo Dlamini',
    action: 'login.success',
    entityType: 'session',
    details: 'Logged in via Google OAuth',
    ipAddress: '105.27.44.11',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-005',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-1',
    userName: 'Sarah Johnson',
    action: 'settings.updated',
    entityType: 'workspace',
    details: 'Updated workspace name from "Nike ZA" to "Nike South Africa"',
    ipAddress: '196.25.101.42',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-006',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-2',
    userName: 'David Mokoena',
    action: 'campaign.updated',
    entityType: 'campaign',
    entityId: 'camp-001',
    details: 'Updated campaign brief for "Summer Activation 2026"',
    ipAddress: '41.21.88.77',
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-007',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-1',
    userName: 'Sarah Johnson',
    action: 'billing.plan_changed',
    entityType: 'subscription',
    details: 'Upgraded plan from Starter to Growth',
    ipAddress: '196.25.101.42',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-008',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-3',
    userName: 'Lebo Dlamini',
    action: 'search.performed',
    entityType: 'search',
    details: 'Searched for "lifestyle bloggers Johannesburg" on TikTok',
    ipAddress: '105.27.44.11',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 3600000).toISOString(),
  },
  {
    id: 'log-009',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-2',
    userName: 'David Mokoena',
    action: 'member.role_changed',
    entityType: 'member',
    entityId: 'mock-brand-user-3',
    details: 'Changed Lebo Dlamini\'s role from Viewer to Editor',
    ipAddress: '41.21.88.77',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-010',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-1',
    userName: 'Sarah Johnson',
    action: 'campaign.published',
    entityType: 'campaign',
    entityId: 'camp-002',
    details: 'Published campaign "Winter Collection Drop"',
    ipAddress: '196.25.101.42',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-011',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-3',
    userName: 'Lebo Dlamini',
    action: 'login.failed',
    entityType: 'session',
    details: 'Failed login attempt — incorrect password',
    ipAddress: '105.27.44.11',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-012',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-1',
    userName: 'Sarah Johnson',
    action: 'settings.updated',
    entityType: 'workspace',
    details: 'Updated notification preferences for campaign applications',
    ipAddress: '196.25.101.42',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-013',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-2',
    userName: 'David Mokoena',
    action: 'search.performed',
    entityType: 'search',
    details: 'Searched for "running athletes South Africa" on YouTube',
    ipAddress: '41.21.88.77',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-014',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-1',
    userName: 'Sarah Johnson',
    action: 'billing.payment_method_added',
    entityType: 'subscription',
    details: 'Added Visa card ending in 4242 as default payment method',
    ipAddress: '196.25.101.42',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-015',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-1',
    userName: 'Sarah Johnson',
    action: 'member.removed',
    entityType: 'member',
    details: 'Removed john.smith@oldagency.com from workspace',
    ipAddress: '196.25.101.42',
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-016',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-2',
    userName: 'David Mokoena',
    action: 'campaign.created',
    entityType: 'campaign',
    entityId: 'camp-003',
    details: 'Created campaign "Heritage Day Activation"',
    ipAddress: '41.21.88.77',
    timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-017',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-3',
    userName: 'Lebo Dlamini',
    action: 'login.success',
    entityType: 'session',
    details: 'Logged in via email/password',
    ipAddress: '196.44.21.88',
    timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-018',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-1',
    userName: 'Sarah Johnson',
    action: 'settings.updated',
    entityType: 'workspace',
    details: 'Enabled two-factor authentication for workspace',
    ipAddress: '196.25.101.42',
    timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-019',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-2',
    userName: 'David Mokoena',
    action: 'search.performed',
    entityType: 'search',
    details: 'Searched for "food influencers Durban" on Instagram',
    ipAddress: '41.21.88.77',
    timestamp: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-020',
    workspaceId: 'ws-nike-sa',
    userId: 'mock-brand-user-1',
    userName: 'Sarah Johnson',
    action: 'login.success',
    entityType: 'session',
    details: 'First login — workspace created',
    ipAddress: '196.25.101.42',
    timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ===== HELPERS =====

type ActionCategory = 'all' | 'campaign' | 'member' | 'settings' | 'search' | 'billing' | 'login';
type DateRange = '7d' | '30d' | '90d' | 'all';

interface ActionBadgeConfig {
  label: string;
  className: string;
}

function getActionBadgeConfig(action: string): ActionBadgeConfig {
  if (action.startsWith('campaign.'))
    return { label: 'Campaign',  className: 'bg-blue-50 text-blue-700 border-blue-200' };
  if (action.startsWith('member.'))
    return { label: 'Member',    className: 'bg-purple-50 text-purple-700 border-purple-200' };
  if (action.startsWith('settings.'))
    return { label: 'Settings',  className: 'bg-gray-50 text-gray-600 border-gray-200' };
  if (action.startsWith('search.'))
    return { label: 'Search',    className: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
  if (action.startsWith('billing.'))
    return { label: 'Billing',   className: 'bg-green-50 text-green-700 border-green-200' };
  if (action.startsWith('login.'))
    return { label: 'Login',     className: 'bg-brand-navy/10 text-brand-navy border-brand-navy/20' };
  return   { label: 'Action',    className: 'bg-gray-50 text-gray-600 border-gray-200' };
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

function fullDatetime(iso: string): string {
  return new Date(iso).toLocaleString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function filterByDateRange(entries: AuditLogEntry[], range: DateRange): AuditLogEntry[] {
  if (range === 'all') return entries;
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const cutoff = Date.now() - days * 86_400_000;
  return entries.filter((e) => new Date(e.timestamp).getTime() >= cutoff);
}

const PAGE_SIZE = 10;

// ===== COMPONENT =====

interface AuditLogViewerProps {
  workspaceId: string;
}

export default function AuditLogViewer({ workspaceId: _workspaceId }: AuditLogViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<ActionCategory>('all');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let entries = filterByDateRange(MOCK_AUDIT_ENTRIES, dateRange);

    if (actionFilter !== 'all') {
      entries = entries.filter((e) => e.action.startsWith(actionFilter + '.'));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      entries = entries.filter(
        (e) =>
          e.details.toLowerCase().includes(q) ||
          e.userName.toLowerCase().includes(q) ||
          e.action.toLowerCase().includes(q)
      );
    }

    return entries;
  }, [searchQuery, actionFilter, dateRange]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePagePage = Math.min(page, totalPages);
  const pageEntries = filtered.slice((safePagePage - 1) * PAGE_SIZE, safePagePage * PAGE_SIZE);

  const handleExport = () => {
    const rows = [
      ['Timestamp', 'User', 'Action', 'Details', 'IP Address'],
      ...filtered.map((e) => [
        e.timestamp, e.userName, e.action, e.details, e.ipAddress,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-navy" />
          <h2 className="text-lg font-bold text-gray-900">Audit Log</h2>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export Log (CSV)</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 bg-white border border-gray-200 rounded-xl p-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Search entries..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy"
          />
        </div>

        {/* Action type dropdown */}
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value as ActionCategory); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy bg-white text-gray-700"
        >
          <option value="all">All Actions</option>
          <option value="campaign">Campaigns</option>
          <option value="member">Members</option>
          <option value="settings">Settings</option>
          <option value="search">Search</option>
          <option value="billing">Billing</option>
          <option value="login">Login</option>
        </select>

        {/* Date range */}
        <select
          value={dateRange}
          onChange={(e) => { setDateRange(e.target.value as DateRange); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy bg-white text-gray-700"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                  Timestamp
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                  User
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                  Action
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                  Details
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pageEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-sm text-gray-400">
                    No audit log entries match your filters.
                  </td>
                </tr>
              ) : (
                pageEntries.map((entry) => {
                  const badge = getActionBadgeConfig(entry.action);
                  return (
                    <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">

                      {/* Timestamp */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          title={fullDatetime(entry.timestamp)}
                          className="text-sm text-gray-600 cursor-default"
                        >
                          {relativeTime(entry.timestamp)}
                        </span>
                      </td>

                      {/* User */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-brand-navy/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-brand-navy">
                              {entry.userName.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-800 truncate max-w-[120px]">
                            {entry.userName}
                          </span>
                        </div>
                      </td>

                      {/* Action badge */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Details */}
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-sm text-gray-600 truncate">{entry.details}</p>
                      </td>

                      {/* IP */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <code className="text-xs font-mono text-gray-400">{entry.ipAddress}</code>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Showing{' '}
            <span className="font-semibold text-gray-700">
              {filtered.length === 0
                ? 0
                : (safePagePage - 1) * PAGE_SIZE + 1}
              –{Math.min(safePagePage * PAGE_SIZE, filtered.length)}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-gray-700">{filtered.length}</span>{' '}
            {filtered.length === 1 ? 'entry' : 'entries'}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePagePage <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-gray-600 px-2">
              {safePagePage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePagePage >= totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
