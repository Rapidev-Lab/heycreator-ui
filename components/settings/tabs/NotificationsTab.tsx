'use client';

import { useState } from 'react';
import { FolderOpen, Users, CreditCard, Search, Mail, Smartphone, Monitor } from 'lucide-react';

// ===== TYPES =====

type ChannelKey = 'email' | 'push' | 'inApp';

interface CategoryPrefs {
  email: boolean;
  push: boolean;
  inApp: boolean;
}

interface NotificationCategory {
  id: string;
  icon: React.ReactNode;
  name: string;
  description: string;
}

// ===== STATIC DATA =====

const CATEGORIES: NotificationCategory[] = [
  {
    id: 'campaigns',
    icon: <FolderOpen className="w-4 h-4" />,
    name: 'Campaigns',
    description: 'New applications, status changes, and deadlines',
  },
  {
    id: 'team',
    icon: <Users className="w-4 h-4" />,
    name: 'Team',
    description: 'Member joined, role changes, and invitations',
  },
  {
    id: 'billing',
    icon: <CreditCard className="w-4 h-4" />,
    name: 'Billing',
    description: 'Payment due, invoice ready, and plan changes',
  },
  {
    id: 'discovery',
    icon: <Search className="w-4 h-4" />,
    name: 'Discovery',
    description: 'Enrichment complete and new recommendations',
  },
];

// Reasonable defaults: Email + In-App ON, Push mostly OFF
const DEFAULT_PREFS: Record<string, CategoryPrefs> = {
  campaigns: { email: true, push: false, inApp: true },
  team: { email: true, push: false, inApp: true },
  billing: { email: true, push: true, inApp: true },
  discovery: { email: false, push: false, inApp: true },
};

// ===== TOGGLE SWITCH =====

function ToggleSwitch({
  enabled,
  onToggle,
  label,
}: {
  enabled: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={onToggle}
      className={[
        'relative inline-flex w-11 h-6 rounded-full transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-2 cursor-pointer',
        enabled ? 'bg-brand-navy' : 'bg-gray-200',
      ].join(' ')}
    >
      <span
        className={[
          'inline-block w-5 h-5 rounded-full bg-white shadow transition-transform mt-0.5',
          enabled ? 'translate-x-[22px]' : 'translate-x-0.5',
        ].join(' ')}
      />
    </button>
  );
}

// ===== CHANNEL HEADER CELL =====

function ChannelHeader({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-gray-400">{icon}</span>
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
    </div>
  );
}

// ===== MAIN EXPORT =====

export default function NotificationsTab() {
  const [prefs, setPrefs] = useState<Record<string, CategoryPrefs>>(DEFAULT_PREFS);

  const toggle = (categoryId: string, channel: ChannelKey) => {
    setPrefs((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [channel]: !prev[categoryId][channel],
      },
    }));
  };

  const enableAll = () => {
    const next: Record<string, CategoryPrefs> = {};
    CATEGORIES.forEach((c) => {
      next[c.id] = { email: true, push: true, inApp: true };
    });
    setPrefs(next);
  };

  const disableAll = () => {
    const next: Record<string, CategoryPrefs> = {};
    CATEGORIES.forEach((c) => {
      next[c.id] = { email: false, push: false, inApp: false };
    });
    setPrefs(next);
  };

  const resetToDefaults = () => {
    setPrefs(DEFAULT_PREFS);
  };

  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose how and when you want to be notified.
        </p>
      </div>

      {/* ===== PREFERENCES GRID ===== */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

        {/* Column header row */}
        <div className="grid grid-cols-[1fr_80px_80px_80px] gap-4 items-center px-5 py-3 bg-gray-50 border-b border-gray-200">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Category
          </span>
          <ChannelHeader icon={<Mail className="w-4 h-4" />} label="Email" />
          <ChannelHeader icon={<Smartphone className="w-4 h-4" />} label="Push" />
          <ChannelHeader icon={<Monitor className="w-4 h-4" />} label="In-App" />
        </div>

        {/* Category rows */}
        <div className="divide-y divide-gray-100">
          {CATEGORIES.map((category) => {
            const catPrefs = prefs[category.id] ?? { email: false, push: false, inApp: false };
            return (
              <div
                key={category.id}
                className="grid grid-cols-[1fr_80px_80px_80px] gap-4 items-center px-5 py-4"
              >
                {/* Category info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-brand-navy/5 flex items-center justify-center flex-shrink-0 text-brand-navy">
                    {category.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{category.name}</p>
                    <p className="text-xs text-gray-500 truncate">{category.description}</p>
                  </div>
                </div>

                {/* Email toggle */}
                <div className="flex justify-center">
                  <ToggleSwitch
                    enabled={catPrefs.email}
                    onToggle={() => toggle(category.id, 'email')}
                    label={`${category.name} email notifications`}
                  />
                </div>

                {/* Push toggle */}
                <div className="flex justify-center">
                  <ToggleSwitch
                    enabled={catPrefs.push}
                    onToggle={() => toggle(category.id, 'push')}
                    label={`${category.name} push notifications`}
                  />
                </div>

                {/* In-App toggle */}
                <div className="flex justify-center">
                  <ToggleSwitch
                    enabled={catPrefs.inApp}
                    onToggle={() => toggle(category.id, 'inApp')}
                    label={`${category.name} in-app notifications`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={enableAll}
            className="px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-brand-navy-light transition-colors"
          >
            Enable All
          </button>
          <button
            type="button"
            onClick={disableAll}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Disable All
          </button>
          <button
            type="button"
            onClick={resetToDefaults}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

    </div>
  );
}
