'use client';

import { useState } from 'react';
import { Plus, Search, Building2 } from 'lucide-react';
import Link from 'next/link';
import { AgencyWorkspaceSummary } from '@/types/agency';
import WorkspaceOverviewCard from '@/components/agency/WorkspaceOverviewCard';

// ─── Inline Mock Data ─────────────────────────────────────────────────────────

const MOCK_WORKSPACES: AgencyWorkspaceSummary[] = [
  {
    workspaceId: 'ws-nike-sa',
    workspaceName: 'Nike SA',
    plan: 'Growth',
    searchesUsed: 32,
    searchesLimit: 50,
    campaignsActive: 6,
    campaignsLimit: 10,
    seatsUsed: 2,
    seatsLimit: 3,
    monthlySpendZAR: 35000,
    status: 'active',
  },
  {
    workspaceId: 'ws-adidas-za',
    workspaceName: 'Adidas ZA',
    plan: 'Discovery',
    searchesUsed: 18,
    searchesLimit: 20,
    campaignsActive: 2,
    campaignsLimit: 3,
    seatsUsed: 1,
    seatsLimit: 1,
    monthlySpendZAR: 20000,
    status: 'active',
  },
  {
    workspaceId: 'ws-agency-hub',
    workspaceName: 'Agency Hub',
    plan: 'Scale',
    searchesUsed: 85,
    searchesLimit: -1,
    campaignsActive: 15,
    campaignsLimit: -1,
    seatsUsed: 7,
    seatsLimit: 10,
    monthlySpendZAR: 50000,
    status: 'active',
  },
];

type StatusFilter = 'all' | 'active' | 'trial' | 'suspended';

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'trial', label: 'Trial' },
  { id: 'suspended', label: 'Suspended' },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function AgencyWorkspacesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredWorkspaces = MOCK_WORKSPACES.filter((ws) => {
    const matchesSearch = ws.workspaceName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || ws.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      {/* Page Header */}
      <div className="bg-white px-4 sm:px-6 lg:px-8 pt-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-navy flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-navy">Agency Workspaces</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage all brand workspaces under your agency
              </p>
            </div>
          </div>

          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-navy text-white rounded-xl text-sm font-bold hover:bg-brand-navy-light transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Add Workspace
          </button>
        </div>

        {/* Search + Filter Row */}
        <div className="flex flex-col sm:flex-row gap-3 pb-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search workspaces…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-colors placeholder-gray-400"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setStatusFilter(filter.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === filter.id
                    ? 'bg-white text-brand-navy shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-[1440px] mx-auto">
          {filteredWorkspaces.length > 0 ? (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Showing{' '}
                <span className="font-semibold text-brand-navy">{filteredWorkspaces.length}</span>{' '}
                workspace{filteredWorkspaces.length !== 1 ? 's' : ''}
                {statusFilter !== 'all' && (
                  <span>
                    {' '}· filtered by{' '}
                    <span className="font-semibold capitalize">{statusFilter}</span>
                  </span>
                )}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredWorkspaces.map((workspace) => (
                  <WorkspaceOverviewCard
                    key={workspace.workspaceId}
                    workspace={workspace}
                  />
                ))}

                {/* Add Workspace CTA */}
                <button className="bg-white border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-3 py-10 hover:border-brand-navy/30 hover:bg-gray-50/50 transition-all group min-h-[220px]">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-brand-navy/10 transition-colors">
                    <Plus className="w-5 h-5 text-gray-400 group-hover:text-brand-navy transition-colors" />
                  </div>
                  <div className="text-center px-4">
                    <p className="text-sm font-bold text-gray-500 group-hover:text-brand-navy transition-colors">
                      Add New Workspace
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      12 slots remaining on Agency Pro
                    </p>
                  </div>
                </button>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-gray-200 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-base font-bold text-gray-600 mb-1">No workspaces found</h3>
              <p className="text-sm text-gray-400 mb-6">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : "You haven't added any brand workspaces yet"}
              </p>
              {(searchQuery || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="text-sm font-semibold text-brand-navy hover:underline"
                >
                  Clear filters
                </button>
              )}
              {!searchQuery && statusFilter === 'all' && (
                <Link
                  href="/brands/agency"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-navy text-white rounded-xl text-sm font-bold hover:bg-brand-navy-light transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Workspace
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
