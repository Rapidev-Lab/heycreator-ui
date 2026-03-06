'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  FolderOpen,
  Users,
  TrendingUp,
  Check,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { useWorkspace } from '@/lib/context/workspace-context';
import { PLAN_TIERS } from '@/types/workspace';

// ===== USAGE STAT CARD =====

interface UsageStatCardProps {
  label: string;
  value: string | number;
  subtext: string;
  icon: React.ReactNode;
  percent: number | null;
  colorClass: string;
}

function UsageStatCard({ label, value, subtext, icon, percent, colorClass }: UsageStatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorClass}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-400 mb-3">{subtext}</p>
      {percent !== null && (
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={[
              'h-full rounded-full transition-all duration-500',
              percent >= 80 ? 'bg-red-500' : percent >= 60 ? 'bg-amber-500' : 'bg-green-500',
            ].join(' ')}
            style={{ width: `${Math.min(100, percent)}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ===== MAIN COMPONENT =====

export default function PlansBillingTab() {
  const router = useRouter();
  const { currentWorkspace, userRole } = useWorkspace();

  if (!currentWorkspace) {
    return (
      <div className="py-16 text-center text-sm text-gray-400">
        No workspace selected.
      </div>
    );
  }

  const ws = currentWorkspace;
  const planConfig = PLAN_TIERS[ws.planTier];
  const isOwner = userRole === 'owner';
  const isAdmin = userRole === 'owner' || userRole === 'admin';

  // Usage percentages
  const searchPercent =
    ws.usage.searchesLimit === -1
      ? null
      : Math.round((ws.usage.searchesUsed / ws.usage.searchesLimit) * 100);

  const campaignPercent =
    ws.usage.campaignsLimit === -1
      ? null
      : Math.round((ws.usage.campaignsActive / ws.usage.campaignsLimit) * 100);

  const seatPercent = Math.round((ws.usage.seatsUsed / ws.usage.seatsLimit) * 100);

  return (
    <div className="space-y-8">
      {/* Current Plan */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 mb-1">Current Plan</h3>
        <p className="text-sm text-gray-500 mb-4">Your workspace subscription and usage overview</p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 rounded-xl">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900 capitalize">
                {planConfig.name}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {ws.status === 'trial' ? 'Trial' : 'Active'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              R{planConfig.price.toLocaleString()}/month
              {ws.status === 'trial' && ws.trialEndsAt && (
                <span className="text-amber-600 ml-2">
                  &middot; Trial ends{' '}
                  {new Date(ws.trialEndsAt).toLocaleDateString('en-ZA', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              )}
            </p>
          </div>
          {isOwner && (
            <button
              onClick={() => router.push('/brands/workspace/billing/plans')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-navy rounded-lg hover:bg-brand-navy/90 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              Upgrade Plan
            </button>
          )}
        </div>
      </section>

      {/* Usage Stats */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 mb-1">Usage</h3>
        <p className="text-sm text-gray-500 mb-4">
          Track your workspace consumption this billing cycle
        </p>

        <div className={`grid grid-cols-1 gap-4 ${isAdmin ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
          {/* Searches — all roles */}
          <UsageStatCard
            label="Searches Used"
            value={
              ws.usage.searchesLimit === -1
                ? ws.usage.searchesUsed
                : `${ws.usage.searchesUsed}/${ws.usage.searchesLimit}`
            }
            subtext={
              ws.usage.searchesLimit === -1
                ? 'Unlimited'
                : `${Math.max(0, ws.usage.searchesLimit - ws.usage.searchesUsed)} remaining`
            }
            icon={<Search className="w-5 h-5 text-blue-600" />}
            percent={searchPercent}
            colorClass="bg-blue-50"
          />

          {/* Campaigns — all roles */}
          <UsageStatCard
            label="Active Campaigns"
            value={
              ws.usage.campaignsLimit === -1
                ? ws.usage.campaignsActive
                : `${ws.usage.campaignsActive}/${ws.usage.campaignsLimit}`
            }
            subtext={
              ws.usage.campaignsLimit === -1
                ? 'Unlimited'
                : `${Math.max(0, ws.usage.campaignsLimit - ws.usage.campaignsActive)} remaining`
            }
            icon={<FolderOpen className="w-5 h-5 text-purple-600" />}
            percent={campaignPercent}
            colorClass="bg-purple-50"
          />

          {/* Seats — owner/admin only */}
          {isAdmin && (
            <UsageStatCard
              label="Team Seats"
              value={`${ws.usage.seatsUsed}/${ws.usage.seatsLimit}`}
              subtext={
                ws.usage.seatsLimit - ws.usage.seatsUsed > 0
                  ? `${ws.usage.seatsLimit - ws.usage.seatsUsed} available`
                  : 'All seats filled'
              }
              icon={<Users className="w-5 h-5 text-green-600" />}
              percent={seatPercent}
              colorClass="bg-green-50"
            />
          )}
        </div>
      </section>

      {/* Plan Features */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 mb-1">Plan Features</h3>
        <p className="text-sm text-gray-500 mb-4">
          What&apos;s included in your {planConfig.name} plan
        </p>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {planConfig.features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-3 px-4 py-3">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Manage Billing CTA */}
      <section>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Billing Management</h4>
              {isOwner ? (
                <>
                  <p className="text-sm text-gray-500 mb-4">
                    Need to update your payment method, view invoices, or cancel?
                  </p>
                  <button
                    onClick={() => router.push('/brands/workspace/billing')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-semibold hover:bg-brand-navy/90 transition-colors"
                  >
                    Manage Billing
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  Contact your workspace owner for billing changes.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
