'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Shield,
  Bell,
  Link2,
  Settings,
  Users,
  CreditCard,
  Download,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import { useWorkspace } from '@/lib/context/workspace-context';
import type { WorkspaceRole } from '@/types/workspace';

// ===== TYPES =====

export type SettingsTab =
  | 'profile'
  | 'security'
  | 'notifications'
  | 'connected'
  | 'general'
  | 'members'
  | 'plans'
  | 'data'
  | 'integrations'
  | 'danger';

interface TabDefinition {
  id: SettingsTab;
  label: string;
  icon: React.ReactNode;
  roles?: WorkspaceRole[];
}

interface TabGroup {
  label: string;
  tabs: TabDefinition[];
}

// ===== TAB CONFIGURATION =====

const TAB_GROUPS: TabGroup[] = [
  {
    label: 'Account',
    tabs: [
      {
        id: 'profile',
        label: 'My Profile',
        icon: <User className="w-4 h-4" />,
      },
      {
        id: 'security',
        label: 'Password & Security',
        icon: <Shield className="w-4 h-4" />,
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: <Bell className="w-4 h-4" />,
      },
      {
        id: 'connected',
        label: 'Connected Accounts',
        icon: <Link2 className="w-4 h-4" />,
      },
    ],
  },
  {
    label: 'Workspace',
    tabs: [
      {
        id: 'general',
        label: 'General',
        icon: <Settings className="w-4 h-4" />,
        roles: ['owner', 'admin', 'editor'],
      },
      {
        id: 'members',
        label: 'Members',
        icon: <Users className="w-4 h-4" />,
        roles: ['owner', 'admin', 'editor'],
      },
      {
        id: 'plans',
        label: 'Plans & Billing',
        icon: <CreditCard className="w-4 h-4" />,
        roles: ['owner', 'admin'],
      },
    ],
  },
  {
    label: 'Advanced',
    tabs: [
      {
        id: 'data',
        label: 'Data & Export',
        icon: <Download className="w-4 h-4" />,
        roles: ['owner', 'admin'],
      },
      {
        id: 'integrations',
        label: 'API & Integrations',
        icon: <Zap className="w-4 h-4" />,
        roles: ['owner', 'admin'],
      },
      {
        id: 'danger',
        label: 'Danger Zone',
        icon: <AlertTriangle className="w-4 h-4" />,
        roles: ['owner'],
      },
    ],
  },
];

// ===== PROPS =====

interface SettingsLayoutProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
  children: React.ReactNode;
}

// ===== SKELETON LOADING =====

function SettingsSkeleton() {
  return (
    <div className="p-6 lg:p-8 animate-pulse">
      <div className="h-8 w-40 bg-gray-200 rounded-lg mb-1" />
      <div className="h-4 w-48 bg-gray-100 rounded mb-6" />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 flex-shrink-0 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-9 bg-gray-100 rounded-lg" />
          ))}
        </div>
        <div className="flex-1 h-96 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

// ===== INNER LAYOUT (uses hooks) =====

function SettingsLayoutInner({ activeTab, onTabChange, children }: SettingsLayoutProps) {
  const { currentWorkspace, userRole, isLoading } = useWorkspace();

  // Filter visible tabs based on user role
  const visibleGroups: TabGroup[] = TAB_GROUPS.map((group) => ({
    ...group,
    tabs: group.tabs.filter((tab) => {
      if (!tab.roles) return true;
      if (!userRole) return false;
      return (tab.roles as WorkspaceRole[]).includes(userRole);
    }),
  })).filter((group) => group.tabs.length > 0);

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  const workspaceName = currentWorkspace?.name ?? 'Your Workspace';

  return (
    <div className="p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">{workspaceName}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ===== SIDEBAR NAV (desktop) / HORIZONTAL SCROLL (mobile) ===== */}
        <nav
          className="lg:w-56 flex-shrink-0"
          aria-label="Settings navigation"
        >
          {/* Mobile: horizontal scrollable tab bar */}
          <div className="flex lg:hidden gap-1 overflow-x-auto pb-2 -mx-6 px-6">
            {visibleGroups.flatMap((group) =>
              group.tabs.map((tab) => {
                const isDanger = tab.id === 'danger';
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={[
                      'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0',
                      isActive
                        ? 'bg-brand-navy text-white'
                        : isDanger
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-gray-600 hover:bg-gray-100',
                    ].join(' ')}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                );
              })
            )}
          </div>

          {/* Desktop: grouped sidebar nav */}
          <div className="hidden lg:flex lg:flex-col gap-5">
            {visibleGroups.map((group) => (
              <div key={group.label}>
                {/* Group header */}
                <p className="px-3 mb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {group.label}
                </p>

                <div className="flex flex-col gap-0.5">
                  {group.tabs.map((tab) => {
                    const isDanger = tab.id === 'danger';
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        aria-current={isActive ? 'page' : undefined}
                        className={[
                          'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left w-full',
                          isActive
                            ? 'bg-brand-navy text-white'
                            : isDanger
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-gray-600 hover:bg-gray-100',
                        ].join(' ')}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* ===== CONTENT AREA ===== */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// ===== PUBLIC EXPORT (wrapped in Suspense for useSearchParams compatibility) =====

export default function SettingsLayout(props: SettingsLayoutProps) {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsLayoutInner {...props} />
    </Suspense>
  );
}
