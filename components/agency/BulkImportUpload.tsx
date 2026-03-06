'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Upload,
  FileSpreadsheet,
  X,
  Download,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { BulkImportRow, BulkImportResult } from '@/types/agency';

// ─── Mock CSV template & parse helpers ───────────────────────────────────────

const CSV_TEMPLATE_HEADERS = 'Brand Name,Industry,Website,Contact Email,Contact Name,Plan';
const CSV_TEMPLATE_ROWS = [
  'Example Brand,Fashion,https://example.co.za,contact@example.co.za,Jane Smith,growth',
  'Another Co,Technology,https://another.co.za,hello@another.co.za,John Doe,discovery',
];
const CSV_TEMPLATE = [CSV_TEMPLATE_HEADERS, ...CSV_TEMPLATE_ROWS].join('\n');

const MOCK_PARSED_ROWS: BulkImportRow[] = [
  {
    brandName: 'Levi Strauss SA',
    industry: 'Fashion',
    website: 'https://levis.co.za',
    contactEmail: 'marketing@levis.co.za',
    contactName: 'Priya Naidoo',
    plan: 'growth',
    status: 'pending',
  },
  {
    brandName: 'Takealot Digital',
    industry: 'E-commerce',
    website: 'https://takealot.com',
    contactEmail: 'brands@takealot.com',
    contactName: 'Sipho Dlamini',
    plan: 'scale',
    status: 'pending',
  },
  {
    brandName: 'Nando\'s ZA',
    industry: 'Food & Beverage',
    website: 'https://nandos.co.za',
    contactEmail: 'digital@nandos.co.za',
    contactName: 'Ayanda Khumalo',
    plan: 'growth',
    status: 'pending',
  },
  {
    brandName: 'Bad Email Corp',
    industry: 'Retail',
    contactEmail: 'notavalidemail',
    contactName: 'Unknown User',
    plan: 'discovery',
    status: 'pending',
  },
  {
    brandName: 'Clicks Group',
    industry: 'Health & Beauty',
    website: 'https://clicks.co.za',
    contactEmail: 'digital@clicks.co.za',
    contactName: 'Nomsa Mokoena',
    plan: 'discovery',
    status: 'pending',
  },
];

const PLAN_LABELS: Record<string, string> = {
  discovery: 'Discovery',
  growth: 'Growth',
  scale: 'Scale',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlanBadge({ plan }: { plan: string }) {
  const normalized = plan.toLowerCase();
  let className = 'bg-gray-100 text-gray-600';
  if (normalized === 'growth') className = 'bg-blue-100 text-blue-700';
  if (normalized === 'scale') className = 'bg-brand-navy text-white';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${className}`}>
      {PLAN_LABELS[normalized] ?? plan}
    </span>
  );
}

function RowStatusBadge({ row }: { row: BulkImportRow }) {
  if (row.status === 'created') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
        <CheckCircle className="w-3.5 h-3.5" />
        Created
      </span>
    );
  }
  if (row.status === 'error') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
        <AlertTriangle className="w-3.5 h-3.5" />
        Error
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400">
      <Loader2 className="w-3.5 h-3.5 animate-spin" />
      Pending
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BulkImportUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<BulkImportRow[]>([]);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Only .csv files are supported. Please select a CSV file.');
      return;
    }
    setSelectedFile(file);
    setImportResult(null);
    // Simulate CSV parse — use mock data
    setParsedRows(MOCK_PARSED_ROWS);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  function handleRemoveFile() {
    setSelectedFile(null);
    setParsedRows([]);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleDownloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'heycreator-bulk-import-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport() {
    if (parsedRows.length === 0) return;
    setIsImporting(true);

    // Simulate async import with 1.5s delay
    await new Promise<void>((resolve) => setTimeout(resolve, 1500));

    const processedRows: BulkImportRow[] = parsedRows.map((row) => {
      // Mock validation: flag rows with invalid email format
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.contactEmail);
      if (!emailValid) {
        return { ...row, status: 'error', errorMessage: 'Invalid email address format' };
      }
      return { ...row, status: 'created' };
    });

    const successful = processedRows.filter((r) => r.status === 'created').length;
    const failed = processedRows.filter((r) => r.status === 'error').length;

    setImportResult({
      totalRows: processedRows.length,
      successful,
      failed,
      rows: processedRows,
      importedAt: new Date().toISOString(),
    });
    setParsedRows(processedRows);
    setIsImporting(false);
  }

  const displayRows = importResult ? importResult.rows : parsedRows.slice(0, 5);
  const showPreview = parsedRows.length > 0;

  return (
    <div className="space-y-6">
      {/* Import Result Summary */}
      {importResult && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <h3 className="text-base font-bold text-brand-navy">Import Complete</h3>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl">
              <span className="text-2xl font-black text-brand-navy">{importResult.totalRows}</span>
              <span className="text-xs text-gray-500 font-medium leading-tight">
                Total<br />Rows
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 rounded-xl">
              <span className="text-2xl font-black text-green-600">{importResult.successful}</span>
              <span className="text-xs text-green-600 font-medium leading-tight">
                Created<br />Successfully
              </span>
            </div>
            {importResult.failed > 0 && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 rounded-xl">
                <span className="text-2xl font-black text-red-600">{importResult.failed}</span>
                <span className="text-xs text-red-600 font-medium leading-tight">
                  Failed<br />to Import
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Drop Zone */}
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 py-12 px-6 transition-all cursor-pointer ${
            isDragging
              ? 'border-brand-navy bg-brand-navy/5'
              : 'border-gray-200 bg-white hover:border-brand-navy/40 hover:bg-gray-50/50'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileInputChange}
          />
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              isDragging ? 'bg-brand-navy/10' : 'bg-gray-100'
            }`}
          >
            <Upload className={`w-6 h-6 ${isDragging ? 'text-brand-navy' : 'text-gray-400'}`} />
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-gray-700">
              {isDragging ? 'Release to upload' : 'Drop your CSV here'}
            </p>
            <p className="text-sm text-gray-400 mt-1">or</p>
            <button
              type="button"
              className="mt-2 text-sm font-bold text-brand-navy underline underline-offset-2 hover:text-brand-navy-light"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Browse Files
            </button>
          </div>
          <p className="text-xs text-gray-400">Only .csv files are supported</p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadTemplate();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-brand-navy border border-brand-navy/20 rounded-xl hover:bg-brand-navy/5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download Template CSV
          </button>
        </div>
      ) : (
        /* Selected File Info */
        <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-brand-navy">{selectedFile.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {(selectedFile.size / 1024).toFixed(1)} KB · {parsedRows.length} rows detected
              </p>
            </div>
          </div>
          <button
            onClick={handleRemoveFile}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Preview Table */}
      {showPreview && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-brand-navy">
                Preview
                {!importResult && parsedRows.length > 5 && (
                  <span className="ml-2 text-xs font-medium text-gray-400">
                    (showing first 5 of {parsedRows.length} rows)
                  </span>
                )}
              </h3>
            </div>
            <p className="text-xs text-gray-400">
              Column mapping: Brand Name · Industry · Website · Contact Email · Contact Name · Plan
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/60 border-b border-gray-100">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Brand
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Industry
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                    Contact
                  </th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Plan
                  </th>
                  {importResult && (
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      row.status === 'error'
                        ? 'bg-red-50/40 hover:bg-red-50/60'
                        : 'hover:bg-gray-50/40'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-brand-navy">{row.brandName}</p>
                        {row.website && (
                          <p className="text-xs text-gray-400 truncate max-w-[160px]">
                            {row.website}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.industry}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div>
                        <p className="text-xs font-medium text-gray-700">{row.contactName}</p>
                        <p
                          className={`text-xs truncate max-w-[180px] ${
                            row.status === 'error' && row.errorMessage?.includes('email')
                              ? 'text-red-500 font-medium'
                              : 'text-gray-400'
                          }`}
                        >
                          {row.contactEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <PlanBadge plan={row.plan} />
                    </td>
                    {importResult && (
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <RowStatusBadge row={row} />
                          {row.errorMessage && (
                            <p className="text-xs text-red-500 max-w-[140px] text-center leading-tight">
                              {row.errorMessage}
                            </p>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Import Button */}
          {!importResult && (
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between gap-4 bg-gray-50/40">
              <p className="text-sm text-gray-500">
                Ready to import{' '}
                <span className="font-bold text-brand-navy">{parsedRows.length} workspace</span>
                {parsedRows.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={handleImport}
                disabled={isImporting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-navy text-white rounded-xl text-sm font-bold hover:bg-brand-navy-light transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importing…
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Import {parsedRows.length} Workspace{parsedRows.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
