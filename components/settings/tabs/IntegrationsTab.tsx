'use client';

import { Lock, Zap, Key, Globe } from 'lucide-react';

// ===== TYPES =====

interface IntegrationCard {
  id: string;
  initial: string;
  name: string;
  description: string;
}

// ===== STATIC DATA =====

const INTEGRATIONS: IntegrationCard[] = [
  {
    id: 'slack',
    initial: 'S',
    name: 'Slack',
    description: 'Get notifications in Slack channels',
  },
  {
    id: 'zapier',
    initial: 'Z',
    name: 'Zapier',
    description: 'Connect with 5,000+ apps',
  },
  {
    id: 'gsheets',
    initial: 'G',
    name: 'Google Sheets',
    description: 'Export data automatically',
  },
  {
    id: 'hubspot',
    initial: 'H',
    name: 'HubSpot',
    description: 'Sync creator contacts',
  },
];

// ===== SUB-COMPONENTS =====

function ComingSoonBadge({ variant = 'amber' }: { variant?: 'amber' | 'purple' }) {
  const styles =
    variant === 'purple'
      ? 'bg-purple-100 text-purple-700'
      : 'bg-amber-100 text-amber-700';
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles}`}>
      Coming Soon
    </span>
  );
}

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 ${className}`}>
      {children}
    </div>
  );
}

// ===== MAIN EXPORT =====

export default function IntegrationsTab() {
  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">API &amp; Integrations</h2>
          <ComingSoonBadge variant="purple" />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Connect HeyCreator with your existing tools and workflows.
        </p>
      </div>

      {/* ===== API KEYS (disabled) ===== */}
      <div className="opacity-50 pointer-events-none">
        <SectionCard>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-navy/5 flex items-center justify-center flex-shrink-0">
              <Key className="w-4 h-4 text-brand-navy" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-0.5">API Access</h3>
              <p className="text-sm text-gray-500">
                Generate API keys to integrate HeyCreator with your applications.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {/* Mock existing key row */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2 min-w-0">
                <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-sm font-mono text-gray-700 truncate">
                  hc_live_&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;3f9a
                </span>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">Last used 3 days ago</span>
            </div>

            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-medium cursor-not-allowed"
            >
              <Key className="w-4 h-4" />
              Generate API Key
            </button>
          </div>
        </SectionCard>
      </div>

      {/* ===== WEBHOOKS (disabled) ===== */}
      <div className="opacity-50 pointer-events-none">
        <SectionCard>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-navy/5 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-brand-navy" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Webhook Notifications</h3>
              <p className="text-sm text-gray-500">
                Receive real-time notifications when events occur in your workspace.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {/* Placeholder form row */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="url"
                  disabled
                  placeholder="https://your-app.com/webhook"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>
              <select
                disabled
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
              >
                <option>Select events</option>
              </select>
            </div>

            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-medium cursor-not-allowed"
            >
              <Zap className="w-4 h-4" />
              Add Webhook URL
            </button>
          </div>
        </SectionCard>
      </div>

      {/* ===== AVAILABLE INTEGRATIONS ===== */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Available Integrations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {INTEGRATIONS.map((integration) => (
            <div
              key={integration.id}
              className="opacity-50 bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3"
            >
              {/* Icon circle */}
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-gray-500">{integration.initial}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-800">{integration.name}</p>
                  <ComingSoonBadge />
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{integration.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== CTA ===== */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 text-center">
        <p className="text-sm font-semibold text-gray-800 mb-1">
          Interested in integrations?
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Let us know which integrations matter most to you.
        </p>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-brand-navy text-brand-navy rounded-lg text-sm font-medium hover:bg-brand-navy hover:text-white transition-colors"
        >
          Request an Integration
        </button>
      </div>

    </div>
  );
}
