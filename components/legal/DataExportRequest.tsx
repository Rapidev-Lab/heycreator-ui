'use client';

import { useState, useEffect } from 'react';
import {
  Download,
  CheckSquare,
  Square,
  FileJson,
  FileText,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  HardDrive,
} from 'lucide-react';
import type { DataExportRequest as DataExportRequestType } from '@/types/legal';

// ===== MOCK PAST EXPORTS =====

const MOCK_PAST_EXPORTS: DataExportRequestType[] = [
  {
    id: 'exp-001',
    userId: 'mock-brand-user-1',
    workspaceId: 'ws-nike-sa',
    status: 'downloaded',
    requestedAt: '2026-02-10T09:00:00Z',
    completedAt: '2026-02-10T09:02:14Z',
    expiresAt: '2026-02-17T09:02:14Z',
    downloadUrl: '#',
    format: 'json',
    includeData: {
      profiles: true,
      campaigns: true,
      analytics: true,
      notes: true,
      searchHistory: false,
    },
    fileSizeBytes: 2_847_392,
  },
  {
    id: 'exp-002',
    userId: 'mock-brand-user-1',
    workspaceId: 'ws-nike-sa',
    status: 'expired',
    requestedAt: '2026-01-15T14:00:00Z',
    completedAt: '2026-01-15T14:01:52Z',
    expiresAt: '2026-01-22T14:01:52Z',
    format: 'csv',
    includeData: {
      profiles: true,
      campaigns: false,
      analytics: false,
      notes: false,
      searchHistory: true,
    },
    fileSizeBytes: 421_830,
  },
];

// ===== HELPERS =====

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: DataExportRequestType['status'] }) {
  const configs: Record<DataExportRequestType['status'], { label: string; className: string }> = {
    pending:    { label: 'Pending',    className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    processing: { label: 'Processing', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    ready:      { label: 'Ready',      className: 'bg-green-50 text-green-700 border-green-200' },
    downloaded: { label: 'Downloaded', className: 'bg-gray-50 text-gray-600 border-gray-200' },
    expired:    { label: 'Expired',    className: 'bg-red-50 text-red-600 border-red-200' },
  };
  const cfg = configs[status];
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

// ===== DATA SELECTION ITEM =====

interface DataItem {
  key: keyof DataExportRequestType['includeData'];
  label: string;
  count: string;
}

const DATA_ITEMS: DataItem[] = [
  { key: 'profiles',      label: 'Creator Profiles',    count: '45 profiles' },
  { key: 'campaigns',     label: 'Campaign Data',       count: '3 campaigns' },
  { key: 'analytics',     label: 'Analytics & Reports', count: 'All data' },
  { key: 'notes',         label: 'Notes & Comments',    count: '12 notes' },
  { key: 'searchHistory', label: 'Search History',      count: '87 searches' },
];

// ===== MAIN COMPONENT =====

type ExportState = 'idle' | 'processing' | 'ready';

export default function DataExportRequestComponent() {
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [includeData, setIncludeData] = useState<DataExportRequestType['includeData']>({
    profiles: true,
    campaigns: true,
    analytics: true,
    notes: true,
    searchHistory: false,
  });
  const [exportState, setExportState] = useState<ExportState>('idle');
  const [currentExport, setCurrentExport] = useState<DataExportRequestType | null>(null);

  // Simulate processing -> ready transition
  useEffect(() => {
    if (exportState === 'processing') {
      const timer = setTimeout(() => {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        setCurrentExport({
          id: 'exp-new',
          userId: 'mock-brand-user-1',
          workspaceId: 'ws-nike-sa',
          status: 'ready',
          requestedAt: now.toISOString(),
          completedAt: new Date(now.getTime() + 2000).toISOString(),
          expiresAt: expiresAt.toISOString(),
          downloadUrl: '#',
          format,
          includeData,
          fileSizeBytes: format === 'json' ? 2_103_442 : 849_221,
        });
        setExportState('ready');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [exportState, format, includeData]);

  const handleRequestExport = () => {
    setExportState('processing');
    setCurrentExport(null);
  };

  const handleDownload = () => {
    if (currentExport) {
      setCurrentExport({ ...currentExport, status: 'downloaded' });
    }
    // In production: trigger actual file download
  };

  const toggleDataItem = (key: keyof DataExportRequestType['includeData']) => {
    setIncludeData((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const hasAnySelected = Object.values(includeData).some(Boolean);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-navy/10 flex items-center justify-center flex-shrink-0">
          <Download className="w-5 h-5 text-brand-navy" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Export Your Data</h2>
          <p className="text-sm text-gray-500 mt-0.5 leading-relaxed max-w-lg">
            In accordance with GDPR and POPIA, you have the right to request a portable copy of all data HeyCreator holds about your workspace. Your export will be ready within a few minutes.
          </p>
        </div>
      </div>

      {/* Export form */}
      {exportState === 'idle' && (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">

          {/* Format selector */}
          <div className="p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Export Format</h3>
            <div className="grid grid-cols-2 gap-3">
              {/* JSON option */}
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  format === 'json'
                    ? 'border-brand-navy bg-brand-navy/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={format === 'json'}
                  onChange={() => setFormat('json')}
                  className="sr-only"
                />
                <FileJson
                  className={`w-5 h-5 flex-shrink-0 ${
                    format === 'json' ? 'text-brand-navy' : 'text-gray-400'
                  }`}
                />
                <div>
                  <p className={`text-sm font-semibold ${format === 'json' ? 'text-brand-navy' : 'text-gray-700'}`}>
                    JSON
                  </p>
                  <p className="text-xs text-gray-400">Full structured data</p>
                </div>
                {format === 'json' && (
                  <CheckCircle className="w-4 h-4 text-brand-navy ml-auto" />
                )}
              </label>

              {/* CSV option */}
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  format === 'csv'
                    ? 'border-brand-navy bg-brand-navy/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={() => setFormat('csv')}
                  className="sr-only"
                />
                <FileText
                  className={`w-5 h-5 flex-shrink-0 ${
                    format === 'csv' ? 'text-brand-navy' : 'text-gray-400'
                  }`}
                />
                <div>
                  <p className={`text-sm font-semibold ${format === 'csv' ? 'text-brand-navy' : 'text-gray-700'}`}>
                    CSV
                  </p>
                  <p className="text-xs text-gray-400">Spreadsheet-friendly</p>
                </div>
                {format === 'csv' && (
                  <CheckCircle className="w-4 h-4 text-brand-navy ml-auto" />
                )}
              </label>
            </div>
          </div>

          {/* Data selection */}
          <div className="p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Select Data to Include</h3>
            <div className="space-y-2">
              {DATA_ITEMS.map((item) => {
                const isChecked = includeData[item.key];
                return (
                  <label
                    key={item.key}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex-shrink-0 text-brand-navy">
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleDataItem(item.key)}
                      className="sr-only"
                    />
                    <span className="flex-1 text-sm font-medium text-gray-700">{item.label}</span>
                    <span className="text-xs text-gray-400">{item.count}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Request button */}
          <div className="p-5">
            <button
              type="button"
              onClick={handleRequestExport}
              disabled={!hasAnySelected}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                hasAnySelected
                  ? 'bg-brand-navy text-white hover:bg-brand-navy-light shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              Request Export
            </button>
            {!hasAnySelected && (
              <p className="text-xs text-red-500 text-center mt-2">
                Select at least one data type to export.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Processing state */}
      {exportState === 'processing' && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
          </div>
          <div>
            <p className="text-base font-bold text-gray-900">Generating your export...</p>
            <p className="text-sm text-gray-500 mt-1">
              We&apos;re compiling all your workspace data. This usually takes under a minute.
            </p>
          </div>
          <div className="w-full max-w-xs bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-pulse w-2/3" />
          </div>
        </div>
      )}

      {/* Ready state */}
      {exportState === 'ready' && currentExport && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold text-green-800">Your export is ready</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-green-700">
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5" />
                    {formatFileSize(currentExport.fileSizeBytes ?? 0)}
                  </span>
                  <span className="text-green-300">•</span>
                  <span className="uppercase font-semibold">{currentExport.format}</span>
                </div>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  Available for 7 days &mdash; expires{' '}
                  {currentExport.expiresAt ? formatDate(currentExport.expiresAt) : 'N/A'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { setExportState('idle'); setCurrentExport(null); }}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Request another export
          </button>
        </div>
      )}

      {/* Previous Exports */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">Previous Exports</h3>
        <div className="space-y-3">
          {MOCK_PAST_EXPORTS.map((exp) => (
            <div
              key={exp.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
            >
              <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                {exp.format === 'json' ? (
                  <FileJson className="w-4 h-4 text-gray-500" />
                ) : (
                  <FileText className="w-4 h-4 text-gray-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-800 uppercase">{exp.format} Export</p>
                  <StatusBadge status={exp.status} />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Requested {formatDate(exp.requestedAt)}
                  {exp.fileSizeBytes ? ` · ${formatFileSize(exp.fileSizeBytes)}` : ''}
                </p>
              </div>
              {exp.status === 'downloaded' && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  Downloaded
                </div>
              )}
              {exp.status === 'expired' && (
                <div className="flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Expired
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Privacy notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500 leading-relaxed">
        <p className="font-semibold text-gray-700 mb-1">Privacy Notice</p>
        <p>
          Your data export is generated securely and stored temporarily for download. Export files are automatically
          deleted after 7 days. HeyCreator does not share your exported data with third parties. This feature is provided
          in compliance with the Protection of Personal Information Act (POPIA) and the General Data Protection Regulation (GDPR).
        </p>
      </div>
    </div>
  );
}
