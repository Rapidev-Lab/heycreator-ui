'use client';

import { FileSpreadsheet, CheckCircle, XCircle, Clock } from 'lucide-react';
import BulkImportUpload from '@/components/agency/BulkImportUpload';

// ─── Mock Past Import History ─────────────────────────────────────────────────

interface ImportHistoryEntry {
  id: string;
  filename: string;
  importedAt: string;
  totalRows: number;
  successful: number;
  failed: number;
}

const IMPORT_HISTORY: ImportHistoryEntry[] = [
  {
    id: 'import-001',
    filename: 'q1-2026-new-clients.csv',
    importedAt: '2026-02-10T14:32:00Z',
    totalRows: 8,
    successful: 7,
    failed: 1,
  },
  {
    id: 'import-002',
    filename: 'january-onboarding-batch.csv',
    importedAt: '2026-01-15T09:15:00Z',
    totalRows: 5,
    successful: 5,
    failed: 0,
  },
];

function formatImportDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function AgencyImportPage() {
  return (
    <>
      {/* Page Header */}
      <div className="bg-white px-4 sm:px-6 lg:px-8 pt-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-navy flex items-center justify-center flex-shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-navy">
                Bulk Workspace Import
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Onboard multiple brand clients at once using a CSV file
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Description Card */}
          <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5 shadow-sm">
            <h2 className="text-base font-bold text-brand-navy mb-2">How it works</h2>
            <ol className="space-y-2">
              {[
                'Download the CSV template and fill in your brand client details.',
                'Upload the completed CSV file by dragging it to the drop zone or clicking Browse.',
                'Review the preview table to confirm the parsed data looks correct.',
                'Click "Import Workspaces" — workspaces are created instantly with a single click.',
                'Successfully created workspaces will appear in your Agency Dashboard immediately.',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="w-5 h-5 rounded-full bg-brand-navy/10 text-brand-navy text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Upload Component */}
          <BulkImportUpload />

          {/* Import History */}
          <div>
            <h2 className="text-lg font-bold text-brand-navy mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              Import History
            </h2>

            <div className="space-y-3">
              {IMPORT_HISTORY.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  {/* File info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                      <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-brand-navy truncate">
                        {entry.filename}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatImportDate(entry.importedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm font-bold text-green-600">
                        {entry.successful}
                      </span>
                      <span className="text-xs text-gray-400">created</span>
                    </div>
                    {entry.failed > 0 && (
                      <div className="flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <span className="text-sm font-bold text-red-500">
                          {entry.failed}
                        </span>
                        <span className="text-xs text-gray-400">failed</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-400 border-l border-gray-200 pl-4">
                      {entry.totalRows} total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
