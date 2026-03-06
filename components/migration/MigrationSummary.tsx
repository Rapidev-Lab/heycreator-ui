'use client';

import {
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Megaphone,
  Users,
  FileText,
  List,
  Search,
} from 'lucide-react';
import { MigrationSummaryData } from '@/types/migration';

interface MigrationSummaryProps {
  summary?: MigrationSummaryData;
}

const DEFAULT_SUMMARY: MigrationSummaryData = {
  campaignsMigrated: 3,
  creatorsMigrated: 45,
  notesMigrated: 12,
  listsMigrated: 2,
  searchHistoryMigrated: 87,
  errorsEncountered: 0,
  duration: '2 minutes 34 seconds',
  newWorkspaceId: 'ws-nike-sa',
  newWorkspaceName: 'Nike SA Hub',
};

interface StatItem {
  label: string;
  count: number;
  icon: React.ReactNode;
}

export default function MigrationSummary({ summary = DEFAULT_SUMMARY }: MigrationSummaryProps) {
  const stats: StatItem[] = [
    {
      label: 'Campaigns',
      count: summary.campaignsMigrated,
      icon: <Megaphone className="w-4 h-4 text-brand-navy" />,
    },
    {
      label: 'Creators',
      count: summary.creatorsMigrated,
      icon: <Users className="w-4 h-4 text-brand-navy" />,
    },
    {
      label: 'Notes',
      count: summary.notesMigrated,
      icon: <FileText className="w-4 h-4 text-brand-navy" />,
    },
    {
      label: 'Creator Lists',
      count: summary.listsMigrated,
      icon: <List className="w-4 h-4 text-brand-navy" />,
    },
    {
      label: 'Search History',
      count: summary.searchHistoryMigrated,
      icon: <Search className="w-4 h-4 text-brand-navy" />,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border-l-4 border-l-status-success border border-gray-100 shadow-brand-md p-6 w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-status-success-bg flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-5 h-5 text-status-success" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Migration Complete</h2>
          <p className="text-sm text-text-muted">All your data has been successfully moved</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 bg-background-subtle rounded-xl p-3"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-navy-50 flex items-center justify-center flex-shrink-0">
              {stat.icon}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-status-success" />
                <span className="text-sm font-semibold text-text-primary">{stat.count}</span>
              </div>
              <p className="text-xs text-text-muted">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Errors warning */}
      {summary.errorsEncountered > 0 && (
        <div className="flex items-start gap-3 bg-status-warning-bg border border-status-warning-light rounded-xl p-3 mb-5">
          <AlertTriangle className="w-4 h-4 text-status-warning mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-medium">{summary.errorsEncountered} item(s)</span> could not be
            migrated due to errors. You can review them in the migration report.
          </p>
        </div>
      )}

      {/* Duration */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-4 pt-4 border-t border-gray-100">
        <Clock className="w-4 h-4" />
        <span>Completed in {summary.duration}</span>
      </div>

      {/* New workspace link */}
      <div className="flex items-center justify-between bg-brand-navy-50 rounded-xl px-4 py-3">
        <div>
          <p className="text-xs text-text-muted mb-0.5">New workspace</p>
          <p className="text-sm font-semibold text-brand-navy">{summary.newWorkspaceName}</p>
        </div>
        <a
          href={`/brands/workspace`}
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          Open
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
