'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AgencyWorkspaceSummary } from '@/types/agency';

interface WorkspaceOverviewCardProps {
  workspace: AgencyWorkspaceSummary;
}

function getPlanBadge(plan: string): { label: string; className: string } {
  const normalized = plan.toLowerCase();
  if (normalized === 'scale') {
    return {
      label: 'Scale',
      className: 'bg-brand-navy text-white',
    };
  }
  if (normalized === 'growth') {
    return {
      label: 'Growth',
      className: 'bg-blue-100 text-blue-700',
    };
  }
  return {
    label: 'Discovery',
    className: 'bg-gray-100 text-gray-600',
  };
}

function getStatusDot(status: AgencyWorkspaceSummary['status']): string {
  if (status === 'active') return 'bg-green-500';
  if (status === 'trial') return 'bg-amber-400';
  return 'bg-red-500';
}

function getStatusLabel(status: AgencyWorkspaceSummary['status']): string {
  if (status === 'active') return 'Active';
  if (status === 'trial') return 'Trial';
  return 'Suspended';
}

interface MiniProgressBarProps {
  label: string;
  used: number;
  limit: number;
}

function MiniProgressBar({ label, used, limit }: MiniProgressBarProps) {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const isNearLimit = !isUnlimited && percentage >= 80;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        <span className="text-xs text-gray-700 font-semibold">
          {used.toLocaleString()}
          {isUnlimited ? ' / ∞' : ` / ${limit.toLocaleString()}`}
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        {!isUnlimited && (
          <div
            className={`h-full rounded-full transition-all ${
              isNearLimit ? 'bg-amber-400' : 'bg-brand-navy'
            }`}
            style={{ width: `${percentage}%` }}
          />
        )}
        {isUnlimited && (
          <div className="h-full rounded-full bg-gradient-to-r from-brand-navy/30 to-brand-navy/10 w-full" />
        )}
      </div>
    </div>
  );
}

export default function WorkspaceOverviewCard({ workspace }: WorkspaceOverviewCardProps) {
  const planBadge = getPlanBadge(workspace.plan);
  const statusDotClass = getStatusDot(workspace.status);
  const statusLabel = getStatusLabel(workspace.status);

  const formattedSpend = `R${workspace.monthlySpendZAR.toLocaleString('en-ZA')}`;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Card Header */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-brand-navy truncate">
              {workspace.workspaceName}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${planBadge.className}`}
              >
                {planBadge.label}
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDotClass}`} />
                <span className="text-xs text-gray-500 font-medium">{statusLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Progress Bars */}
      <div className="px-5 py-4 space-y-3 flex-1">
        <MiniProgressBar
          label="Searches"
          used={workspace.searchesUsed}
          limit={workspace.searchesLimit}
        />
        <MiniProgressBar
          label="Campaigns"
          used={workspace.campaignsActive}
          limit={workspace.campaignsLimit}
        />
        <MiniProgressBar
          label="Seats"
          used={workspace.seatsUsed}
          limit={workspace.seatsLimit}
        />
      </div>

      {/* Card Footer */}
      <div className="px-5 pb-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium">Monthly Spend</p>
          <p className="text-base font-bold text-brand-navy">{formattedSpend}</p>
        </div>
        <Link
          href="/brands/workspace/dashboard"
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-navy hover:text-brand-navy-light transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Manage
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
