'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  X,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import type { DeliverableSubmission } from '@/types/campaign';

// ============================================================================
// Types
// ============================================================================

interface TaskItem {
  platform: string;
  type: string;
  details: string;
  dueDate: string;
  submission?: DeliverableSubmission & {
    creatorName?: string;
    creatorAvatar?: string | null;
  };
}

export interface BrandDeliverablesModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: any;
  deliverables: any[];
}

// ============================================================================
// Helpers
// ============================================================================

function formatDate(dateStr: string): string {
  if (!dateStr) return 'TBD';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'TBD';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function ensureProtocol(url: string): string {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
}

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================================
// Status badge config
// ============================================================================

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending_approval: {
    label: 'Pending Approval',
    className: 'bg-yellow-50 text-yellow-600 border border-yellow-200',
  },
  pending: {
    label: 'Pending',
    className: 'bg-transparent text-yellow-600 border border-yellow-300',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-blue-50 text-blue-600 border border-blue-200',
  },
  submitted: {
    label: 'Submitted',
    className: 'bg-blue-100 text-blue-700',
  },
  approved: {
    label: 'Approved',
    className: 'bg-green-100 text-green-700',
  },
  revision_requested: {
    label: 'Revision',
    className: 'bg-orange-100 text-orange-700',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-700',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-100 text-green-700',
  },
};

// ============================================================================
// Filter Dropdown
// ============================================================================

function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const selectedLabel =
    value === 'all'
      ? label
      : options.find((o) => o.value === value)?.label || label;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E0E0E0] rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        {selectedLabel}
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 min-w-[160px] bg-white border border-[#E0E0E0] rounded-lg shadow-lg z-10 py-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                value === opt.value
                  ? 'text-brand-navy font-semibold bg-gray-50'
                  : 'text-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

export default function BrandDeliverablesModal({
  isOpen,
  onClose,
  campaign,
  deliverables,
}: BrandDeliverablesModalProps) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');

  // ---- Build task items: map required deliverables to submissions ----
  const taskItems: TaskItem[] = useMemo(() => {
    const required = campaign?.tasks?.requiredDeliverables || [];
    const submissions = [...deliverables];

    return required.map((req: any) => {
      const platform = req.platform || '';
      const type = req.contentType || req.type || '';
      const details = req.description || req.details || '';
      const dueDate = req.dueDate || '';

      const matchIdx = submissions.findIndex(
        (s) =>
          s.platform?.toLowerCase() === platform.toLowerCase() &&
          s.deliverableType?.toLowerCase() === type.toLowerCase()
      );

      let submission: TaskItem['submission'];
      if (matchIdx !== -1) {
        submission = submissions.splice(matchIdx, 1)[0];
      }

      return { platform, type, details, dueDate, submission };
    });
  }, [campaign, deliverables]);

  // ---- Stats ----
  const approvedCount = taskItems.filter(
    (t) =>
      t.submission?.status === 'approved' ||
      t.submission?.status === 'completed'
  ).length;
  const totalCount = taskItems.length;
  const progressPct =
    totalCount > 0 ? (approvedCount / totalCount) * 100 : 0;

  // ---- Filter ----
  const filteredItems = useMemo(() => {
    return taskItems.filter((item) => {
      if (statusFilter !== 'all') {
        if (statusFilter === 'pending_approval') {
          if (item.submission) return false;
        } else {
          const s = item.submission?.status;
          if (!s || s !== statusFilter) return false;
        }
      }
      if (platformFilter !== 'all') {
        if (item.platform.toLowerCase() !== platformFilter.toLowerCase())
          return false;
      }
      return true;
    });
  }, [taskItems, statusFilter, platformFilter]);

  const uniquePlatforms = useMemo(() => {
    const set = new Set(taskItems.map((t) => t.platform));
    return Array.from(set);
  }, [taskItems]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto">
      <div className="bg-white w-full max-w-[1200px] min-h-screen md:min-h-0 md:my-8 md:rounded-xl md:shadow-2xl flex flex-col md:max-h-[90vh]">
        {/* ===== Header ===== */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-bold text-brand-navy-dark">
            Tasks &amp; Deliverables
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ===== Scrollable Body ===== */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* --- Campaign Info Card --- */}
          <div className="bg-[#F8F9FD] rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between gap-6 flex-wrap">
              {/* Left: Campaign title */}
              <div>
                <p className="text-base font-bold text-brand-navy-dark">
                  {campaign?.title || campaign?.campaignTitle || 'Campaign'}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {campaign?.status ? capitalize(campaign.status) : ''}
                </p>
              </div>

              {/* Right: Progress */}
              <div className="text-right">
                <p className="text-sm text-brand-navy-dark mb-2">
                  Deliverables {approvedCount}/{totalCount} Approved
                </p>
                <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-navy rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(progressPct, totalCount > 0 ? 2 : 0)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* --- Filters --- */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex items-center gap-3">
              <FilterDropdown
                label="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'pending_approval', label: 'Pending Approval' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'submitted', label: 'Submitted' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'revision_requested', label: 'Revision Requested' },
                  { value: 'rejected', label: 'Rejected' },
                ]}
              />
              <FilterDropdown
                label="Platform"
                value={platformFilter}
                onChange={setPlatformFilter}
                options={[
                  { value: 'all', label: 'All Platforms' },
                  ...uniquePlatforms.map((p) => ({
                    value: p,
                    label: capitalize(p),
                  })),
                ]}
              />
            </div>
          </div>

          {/* --- Table --- */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            {/* Table header */}
            <div className="grid grid-cols-[90px_80px_1fr_130px_120px_140px_1fr_80px] gap-2 px-5 py-3 border-b border-gray-200 bg-gray-50 min-w-[1020px]">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Platform
              </span>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Type
              </span>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Details
              </span>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </span>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Due Date
              </span>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Creator
              </span>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                URL
              </span>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Action
              </span>
            </div>

            {/* Empty state */}
            {filteredItems.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-gray-400 min-w-[1020px]">
                No deliverables found
              </div>
            )}

            {/* Rows */}
            {filteredItems.map((item, index) => {
              const status = item.submission?.status;
              const hasSubmission = !!item.submission;

              const displayStatus = !hasSubmission
                ? STATUS_CONFIG.pending_approval
                : STATUS_CONFIG[status!] || STATUS_CONFIG.pending;

              const hasUrl = !!item.submission?.contentUrl;
              const isUrlSubmitted =
                hasUrl &&
                ['submitted', 'approved', 'completed'].includes(
                  status as string
                );

              return (
                <div
                  key={`${item.platform}-${item.type}-${index}`}
                  className="grid grid-cols-[90px_80px_1fr_130px_120px_140px_1fr_80px] gap-2 px-5 py-4 border-b border-gray-100 last:border-b-0 items-center min-w-[1020px]"
                >
                  {/* Platform */}
                  <span className="text-sm text-gray-700">
                    {capitalize(item.platform)}
                  </span>

                  {/* Type */}
                  <span className="text-sm text-gray-700">
                    {capitalize(item.type)}
                  </span>

                  {/* Details */}
                  <span className="text-sm text-gray-600 pr-2 line-clamp-2">
                    {item.details}
                  </span>

                  {/* Status Badge */}
                  <div>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${displayStatus.className}`}
                    >
                      {displayStatus.label}
                    </span>
                  </div>

                  {/* Due Date */}
                  <span className="text-sm text-gray-600">
                    {formatDate(item.dueDate)}
                  </span>

                  {/* Creator */}
                  <div className="flex items-center gap-2 min-w-0">
                    {hasSubmission && item.submission?.creatorName ? (
                      <>
                        <div className="w-6 h-6 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                          {item.submission.creatorAvatar ? (
                            <img
                              src={item.submission.creatorAvatar}
                              alt={item.submission.creatorName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold bg-brand-navy">
                              {item.submission.creatorName
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-gray-700 truncate">
                          {item.submission.creatorName}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-400">--</span>
                    )}
                  </div>

                  {/* URL Column */}
                  <div className="min-w-0">
                    {isUrlSubmitted ? (
                      <a
                        href={ensureProtocol(item.submission!.contentUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#FF385C] hover:underline truncate block"
                      >
                        {item.submission!.contentUrl.replace(
                          /^https?:\/\//,
                          ''
                        )}
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">
                        Not submitted
                      </span>
                    )}
                  </div>

                  {/* Action Column */}
                  <div className="flex items-center justify-end">
                    {isUrlSubmitted ? (
                      <button
                        onClick={() => {
                          if (item.submission?.contentUrl) {
                            window.open(
                              ensureProtocol(item.submission.contentUrl),
                              '_blank'
                            );
                          }
                        }}
                        className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        title="Open link"
                      >
                        <ArrowRight className="w-4 h-4 text-gray-600" />
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center opacity-40 cursor-not-allowed"
                        title="No submission yet"
                      >
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
