'use client';

import { useRouter } from 'next/navigation';
import {
  Search,
  FolderOpen,
  Users,
  Settings,
  CreditCard,
  Clock,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  LayoutDashboard,
} from 'lucide-react';
import { useWorkspace } from '@/lib/context/workspace-context';
import { PLAN_TIERS } from '@/types/workspace';

// ===== QUICK ACTION =====

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  href: string;
  onClick?: () => void;
}

function QuickAction({ icon, label, description, href, onClick }: QuickActionProps) {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        if (onClick) onClick();
        else router.push(href);
      }}
      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-brand-navy/20 hover:shadow-sm transition-all text-left w-full group"
    >
      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-600 group-hover:bg-brand-navy/5 group-hover:text-brand-navy transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 truncate">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-brand-navy transition-colors" />
    </button>
  );
}

// ===== MEMBER ROW =====

interface MemberRowProps {
  name: string;
  email: string;
  role: string;
  lastActive: string;
  photoURL: string | null;
}

function MemberRow({ name, email, role, lastActive, photoURL }: MemberRowProps) {
  const initial = name.charAt(0).toUpperCase();
  const relativeTime = getRelativeTime(lastActive);

  return (
    <div className="flex items-center gap-3 py-3">
      {photoURL ? (
        <img src={photoURL} alt={initial} className="w-8 h-8 rounded-full border border-gray-200" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-brand-navy/10 text-brand-navy flex items-center justify-center text-xs font-semibold">
          {initial}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
        <p className="text-xs text-gray-400 truncate">{email}</p>
      </div>
      <span className="text-xs font-medium text-gray-500 capitalize px-2 py-0.5 bg-gray-50 rounded-md">
        {role}
      </span>
      <span className="text-xs text-gray-400 hidden sm:block">{relativeTime}</span>
    </div>
  );
}

function getRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

// ===== MAIN PAGE =====

export default function WorkspaceDashboardPage() {
  const router = useRouter();
  const { currentWorkspace, members, userRole, isLoading } = useWorkspace();

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="p-6 lg:p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-navy/5 flex items-center justify-center mb-4">
          <Settings className="w-8 h-8 text-brand-navy" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Workspace Selected</h2>
        <p className="text-gray-500 mb-6 max-w-sm">
          Create your first workspace to start discovering creators and managing campaigns.
        </p>
        <button
          onClick={() => router.push('/brands/workspace/create')}
          className="px-6 py-2.5 bg-brand-navy text-white rounded-lg text-sm font-semibold hover:bg-brand-navy/90 transition-colors"
        >
          Create Workspace
        </button>
      </div>
    );
  }

  const ws = currentWorkspace;
  const planConfig = PLAN_TIERS[ws.planTier];
  const activeMembers = members.filter((m) => m.status === 'active');
  const isAdmin = userRole === 'owner' || userRole === 'admin';

  // Trial days
  const trialDays = ws.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(ws.trialEndsAt).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{ws.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 capitalize">
              {ws.planTier} Plan
            </span>
            {ws.status === 'trial' && trialDays !== null && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                <Clock className="w-3 h-3" />
                Trial: {trialDays} day{trialDays !== 1 ? 's' : ''} left
              </span>
            )}
            <span className="text-xs text-gray-400">{ws.industry}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/brands/settings?tab=general')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          {userRole === 'owner' && (
            <button
              onClick={() => router.push('/brands/workspace/billing')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-navy rounded-lg hover:bg-brand-navy/90 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Billing
            </button>
          )}
        </div>
      </div>

      {/* Trial Warning Banner */}
      {ws.status === 'trial' && trialDays !== null && trialDays <= 3 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              Your trial expires in {trialDays} day{trialDays !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Subscribe now to keep your workspace and all your data.
            </p>
          </div>
          <button
            onClick={() => router.push('/brands/workspace/billing/plans')}
            className="px-4 py-1.5 text-xs font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Subscribe
          </button>
        </div>
      )}

      {/* Two-column grid: Quick Actions + Team Members */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <QuickAction
              icon={<Search className="w-5 h-5" />}
              label="Discover Creators"
              description="Find the perfect influencers for your brand"
              href="/brands/discover"
            />
            <QuickAction
              icon={<FolderOpen className="w-5 h-5" />}
              label="Create Campaign"
              description="Launch a new influencer marketing campaign"
              href="/brands/campaigns/create"
            />
            {isAdmin && (
              <QuickAction
                icon={<Users className="w-5 h-5" />}
                label="Manage Team"
                description={`${activeMembers.length} active member${activeMembers.length !== 1 ? 's' : ''}`}
                href="/brands/settings?tab=members"
              />
            )}
            <QuickAction
              icon={<LayoutDashboard className="w-5 h-5" />}
              label="Usage & Plan"
              description="View your search, campaign, and plan usage"
              href="/brands/settings?tab=plans"
            />
            {userRole === 'owner' && (
              <QuickAction
                icon={<CreditCard className="w-5 h-5" />}
                label="Manage Billing"
                description={`${planConfig.name} plan — R${planConfig.price.toLocaleString()}/mo`}
                href="/brands/workspace/billing"
              />
            )}
          </div>
        </div>

        {/* Team Members */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Team Members</h2>
            <button
              onClick={() => router.push('/brands/settings?tab=members')}
              className="text-xs font-medium text-brand-cyan hover:text-brand-cyan/80 transition-colors"
            >
              View All
            </button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-5">
            {activeMembers.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No team members yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {activeMembers.slice(0, 5).map((member) => (
                  <MemberRow
                    key={member.id}
                    name={member.displayName}
                    email={member.email}
                    role={member.role}
                    lastActive={member.lastActiveAt}
                    photoURL={member.photoURL}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Insight */}
      <div className="bg-gradient-to-r from-brand-navy/5 to-brand-cyan/5 rounded-xl border border-brand-navy/10 p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-navy/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-brand-navy" />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-navy mb-1">AI Insight</p>
            <p className="text-sm text-gray-600">
              Your workspace is running smoothly. You have {ws.usage.campaignsActive} active campaign{ws.usage.campaignsActive !== 1 ? 's' : ''} and {activeMembers.length} team member{activeMembers.length !== 1 ? 's' : ''} collaborating.
              {ws.status === 'trial' && trialDays !== null
                ? ` Your trial ends in ${trialDays} day${trialDays !== 1 ? 's' : ''} — subscribe to keep everything running.`
                : ' Keep discovering great creators for your next campaign.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
