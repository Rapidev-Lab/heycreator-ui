'use client';

import Link from 'next/link';
import {
  Building2,
  Building,
  Users,
  CreditCard,
  Megaphone,
  TrendingDown,
  Plus,
  FileSpreadsheet,
  BarChart3,
  Settings,
} from 'lucide-react';
import { Agency, AgencyDashboardData, AgencyWorkspaceSummary } from '@/types/agency';
import WorkspaceOverviewCard from './WorkspaceOverviewCard';
import VolumeDiscountBanner from './VolumeDiscountBanner';

// ─── Inline Mock Data ─────────────────────────────────────────────────────────

const MOCK_AGENCY: Agency = {
  id: 'agency-rapidev-001',
  name: 'Rapidev Digital Agency',
  ownerId: 'user-owner-001',
  workspaceIds: ['ws-nike-sa', 'ws-adidas-za', 'ws-agency-hub'],
  plan: 'agency_pro',
  maxWorkspaces: 15,
  volumeDiscount: 15,
  totalSeats: 14,
  billingEmail: 'billing@rapidev.co.za',
  createdAt: '2025-06-01T08:00:00Z',
  updatedAt: '2026-02-18T10:00:00Z',
};

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

const MOCK_DASHBOARD_DATA: AgencyDashboardData = {
  agency: MOCK_AGENCY,
  workspaces: MOCK_WORKSPACES,
  totalMonthlySpend: 89250, // after 15% discount
  totalSearches: 135,
  totalCampaigns: 23,
  totalMembers: 10,
  savingsFromDiscount: 15750,
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: string;
  valueClassName?: string;
  subtitle?: string;
}

function StatCard({ icon, iconBg, title, value, valueClassName, subtitle }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
        <p className={`text-2xl font-bold mt-0.5 ${valueClassName ?? 'text-brand-navy'}`}>
          {value}
        </p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Quick Action Card ────────────────────────────────────────────────────────

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  href: string;
  iconBg: string;
}

function QuickActionCard({ icon, label, description, href, iconBg }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm flex items-center gap-4 hover:shadow-md hover:border-brand-navy/20 transition-all group"
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg} group-hover:scale-105 transition-transform`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-brand-navy">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{description}</p>
      </div>
      <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex items-center justify-center flex-shrink-0 group-hover:border-brand-navy transition-colors">
        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-brand-navy transition-colors" />
      </div>
    </Link>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AgencyDashboard() {
  const data = MOCK_DASHBOARD_DATA;
  const { agency, workspaces } = data;

  // Determine next tier info for VolumeDiscountBanner
  const agencyPlanTiers: Record<
    Agency['plan'],
    { nextDiscount: number | undefined; workspacesNeeded: number | undefined }
  > = {
    agency_starter: { nextDiscount: 15, workspacesNeeded: 5 },
    agency_pro: { nextDiscount: 20, workspacesNeeded: Math.max(0, 15 - workspaces.length) },
    agency_enterprise: { nextDiscount: undefined, workspacesNeeded: undefined },
  };
  const tierInfo = agencyPlanTiers[agency.plan];
  const nextTierDiscount =
    tierInfo.nextDiscount !== undefined ? tierInfo.nextDiscount : undefined;
  const workspacesNeeded =
    tierInfo.workspacesNeeded !== undefined && tierInfo.workspacesNeeded > 0
      ? tierInfo.workspacesNeeded
      : undefined;

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
              <h1 className="text-2xl font-bold text-brand-navy">Agency Dashboard</h1>
              <p className="text-sm text-gray-500 mt-0.5">{agency.name}</p>
            </div>
          </div>

          <Link
            href="/brands/agency/workspaces"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-navy text-white rounded-xl text-sm font-bold hover:bg-brand-navy-light transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Workspace
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-[1440px] mx-auto space-y-8">

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              icon={<Building className="w-5 h-5 text-brand-navy" />}
              iconBg="bg-brand-navy/10"
              title="Total Workspaces"
              value={workspaces.length.toString()}
              subtitle={`of ${agency.maxWorkspaces} available`}
            />
            <StatCard
              icon={<Users className="w-5 h-5 text-blue-600" />}
              iconBg="bg-blue-50"
              title="Total Members"
              value={data.totalMembers.toString()}
              subtitle="across all workspaces"
            />
            <StatCard
              icon={<CreditCard className="w-5 h-5 text-emerald-600" />}
              iconBg="bg-emerald-50"
              title="Monthly Spend"
              value={`R${data.totalMonthlySpend.toLocaleString('en-ZA')}`}
              subtitle="after volume discount"
            />
            <StatCard
              icon={<Megaphone className="w-5 h-5 text-purple-600" />}
              iconBg="bg-purple-50"
              title="Active Campaigns"
              value={data.totalCampaigns.toString()}
              subtitle="across all workspaces"
            />
            <StatCard
              icon={<TrendingDown className="w-5 h-5 text-green-600" />}
              iconBg="bg-green-50"
              title="Volume Savings"
              value={`R${data.savingsFromDiscount.toLocaleString('en-ZA')}`}
              valueClassName="text-green-600"
              subtitle={`${agency.volumeDiscount}% discount applied`}
            />
          </div>

          {/* Workspaces Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-brand-navy">Your Workspaces</h2>
              <Link
                href="/brands/agency/workspaces"
                className="text-sm font-semibold text-brand-navy hover:underline"
              >
                Manage all
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {workspaces.map((workspace) => (
                <WorkspaceOverviewCard key={workspace.workspaceId} workspace={workspace} />
              ))}

              {/* Add Workspace CTA card */}
              {workspaces.length < agency.maxWorkspaces && (
                <Link
                  href="/brands/agency/workspaces"
                  className="bg-white border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-3 py-10 hover:border-brand-navy/30 hover:bg-gray-50/50 transition-all group min-h-[220px]"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-brand-navy/10 transition-colors">
                    <Plus className="w-5 h-5 text-gray-400 group-hover:text-brand-navy transition-colors" />
                  </div>
                  <div className="text-center px-4">
                    <p className="text-sm font-bold text-gray-500 group-hover:text-brand-navy transition-colors">
                      Add New Workspace
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {agency.maxWorkspaces - workspaces.length} slot
                      {agency.maxWorkspaces - workspaces.length !== 1 ? 's' : ''} remaining
                    </p>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-bold text-brand-navy mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <QuickActionCard
                icon={<Plus className="w-5 h-5 text-brand-navy" />}
                label="Add Workspace"
                description="Onboard a new brand client"
                href="/brands/agency/workspaces"
                iconBg="bg-brand-navy/10"
              />
              <QuickActionCard
                icon={<FileSpreadsheet className="w-5 h-5 text-blue-600" />}
                label="Bulk Import"
                description="Import multiple brands via CSV"
                href="/brands/agency/import"
                iconBg="bg-blue-50"
              />
              <QuickActionCard
                icon={<BarChart3 className="w-5 h-5 text-purple-600" />}
                label="View Analytics"
                description="Cross-workspace performance"
                href="/brands/agency/analytics"
                iconBg="bg-purple-50"
              />
              <QuickActionCard
                icon={<Settings className="w-5 h-5 text-gray-600" />}
                label="Manage Billing"
                description="Invoices, plans & discounts"
                href="/brands/agency/billing"
                iconBg="bg-gray-100"
              />
            </div>
          </div>

          {/* Volume Discount Banner */}
          <VolumeDiscountBanner
            currentWorkspaces={workspaces.length}
            discount={agency.volumeDiscount}
            nextTierDiscount={nextTierDiscount}
            workspacesNeeded={workspacesNeeded}
          />
        </div>
      </div>
    </>
  );
}
