'use client';

import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { useWorkspace } from '@/lib/context/workspace-context';
import type { AuditLogEntry } from '@/types/workspace';

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 3_600_000) return `${Math.max(1, Math.floor(diff / 60_000))} min ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} hours ago`;
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

const MOCK_AUDIT: AuditLogEntry[] = [
  {
    id: 'al-1',
    workspaceId: '',
    userId: 'mock-brand-user-1',
    userName: 'Demo Brand',
    action: 'campaign.created',
    description: 'Created campaign "Summer Vibes 2026"',
    timestamp: new Date(Date.now() - 3_600_000).toISOString(),
  },
  {
    id: 'al-2',
    workspaceId: '',
    userId: 'user-alice-001',
    userName: 'Alice van der Merwe',
    action: 'search.performed',
    description: 'Searched for "fashion influencers Cape Town"',
    timestamp: new Date(Date.now() - 7_200_000).toISOString(),
  },
  {
    id: 'al-3',
    workspaceId: '',
    userId: 'mock-brand-user-1',
    userName: 'Demo Brand',
    action: 'member.invited',
    description: 'Invited sarah.jones@externalbrand.com as Viewer',
    timestamp: new Date(Date.now() - 172_800_000).toISOString(),
  },
  {
    id: 'al-4',
    workspaceId: '',
    userId: 'mock-brand-user-1',
    userName: 'Demo Brand',
    action: 'settings.updated',
    description: 'Updated workspace currency to ZAR',
    timestamp: new Date(Date.now() - 432_000_000).toISOString(),
  },
];

export default function DataExportTab() {
  const { userRole } = useWorkspace();
  const canExport = userRole === 'owner' || userRole === 'admin';
  const [exporting, setExporting] = useState(false);

  const handleExport = (_format: 'csv' | 'json') => {
    setExporting(true);
    // TODO: call data export API
    setTimeout(() => setExporting(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Data &amp; Export</h2>
        <p className="text-sm text-gray-500 mt-1">
          Download workspace data and review recent activity.
        </p>
      </div>

      {/* Export Data */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 mb-1">Export Workspace Data</h3>
        <p className="text-sm text-gray-500 mb-4">
          Download all campaigns, creator lists, and analytics from this workspace.
        </p>
        {canExport ? (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Export as CSV'}
            </button>
            <button
              onClick={() => handleExport('json')}
              disabled={exporting}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Export as JSON'}
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">
            Only Owners and Admins can export workspace data.
          </p>
        )}
      </section>

      {/* Audit Log */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 mb-1">Audit Log</h3>
        <p className="text-sm text-gray-500 mb-4">Recent activity in this workspace.</p>
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="divide-y divide-gray-100">
            {MOCK_AUDIT.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 px-4 py-3">
                <div className="w-2 h-2 rounded-full bg-brand-navy/40 mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{entry.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {entry.userName} &middot; {formatTimestamp(entry.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
