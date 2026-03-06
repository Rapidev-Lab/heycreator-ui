'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  X,
  ChevronDown,
  ArrowRight,
  Pencil,
  SlidersHorizontal,
  Check,
  Loader2,
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
  submission?: DeliverableSubmission;
}

export interface TasksDeliverablesModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: any;
  deliverables: DeliverableSubmission[];
  creatorName: string;
  creatorUsername?: string;
  creatorAvatar: string | null;
  socialStats?: { platform: string; followers: string }[];
  applicationId: string;
  loading?: boolean;
  onSubmitUrl: (
    platform: string,
    deliverableType: string,
    contentUrl: string
  ) => Promise<void>;
  onEditUrl: (deliverableId: string, contentUrl: string) => Promise<void>;
  onRefresh?: () => void;
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

function isValidUrl(raw: string): boolean {
  try {
    const withProtocol = ensureProtocol(raw);
    const parsed = new URL(withProtocol);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
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

  // Close on outside click
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

export default function TasksDeliverablesModal({
  isOpen,
  onClose,
  campaign,
  deliverables,
  creatorName,
  creatorUsername,
  creatorAvatar,
  socialStats,
  applicationId,
  loading = false,
  onSubmitUrl,
  onEditUrl,
  onRefresh,
}: TasksDeliverablesModalProps) {
  // URL input state per row index (for new submissions)
  const [urlInputs, setUrlInputs] = useState<Record<number, string>>({});

  // Edit mode state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrlValue, setEditUrlValue] = useState('');

  // Loading state
  const [submittingIndex, setSubmittingIndex] = useState<number | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // ---- Poll for fresh data every 15s while modal is open ----
  useEffect(() => {
    if (!isOpen || loading || !onRefresh) return;

    const interval = setInterval(() => {
      onRefresh();
    }, 15_000);

    return () => clearInterval(interval);
  }, [isOpen, loading, onRefresh]);

  // ---- Build task items: map required deliverables to submissions ----
  const taskItems: TaskItem[] = useMemo(() => {
    const required = campaign?.tasks?.requiredDeliverables || [];
    // Clone so we can remove matched items to avoid double-matching
    const submissions = [...deliverables];

    return required.map((req: any) => {
      const platform = req.platform || '';
      const type = req.contentType || req.type || '';
      const details = req.description || req.details || '';
      const dueDate = req.dueDate || '';

      // Find a matching submission by platform + deliverableType
      const matchIdx = submissions.findIndex(
        (s) =>
          s.platform?.toLowerCase() === platform.toLowerCase() &&
          s.deliverableType?.toLowerCase() === type.toLowerCase()
      );

      let submission: DeliverableSubmission | undefined;
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

  // Dynamic column header
  const hasAnyUrl = taskItems.some(
    (t) =>
      t.submission?.contentUrl &&
      ['submitted', 'approved', 'completed'].includes(
        t.submission.status as string
      )
  );

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
      if (dateFilter !== 'all') {
        const dueDate = item.dueDate ? new Date(item.dueDate) : null;
        if (!dueDate || isNaN(dueDate.getTime())) return false;
        const now = new Date();
        if (dateFilter === 'upcoming' && dueDate <= now) return false;
        if (dateFilter === 'overdue' && dueDate > now) return false;
      }
      return true;
    });
  }, [taskItems, statusFilter, platformFilter, dateFilter]);

  const uniquePlatforms = useMemo(() => {
    const set = new Set(taskItems.map((t) => t.platform));
    return Array.from(set);
  }, [taskItems]);

  // ---- Handlers ----
  const handleSubmitUrl = async (index: number, item: TaskItem) => {
    const raw = urlInputs[index]?.trim();
    if (!raw) {
      setError('Please enter a post URL');
      return;
    }
    if (!isValidUrl(raw)) {
      setError('Please enter a valid URL (e.g. https://www.instagram.com/p/abc123)');
      return;
    }

    const url = ensureProtocol(raw);
    setSubmittingIndex(index);
    setError(null);

    try {
      await onSubmitUrl(item.platform, item.type, url);
      setUrlInputs((prev) => ({ ...prev, [index]: '' }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to submit URL'
      );
    } finally {
      setSubmittingIndex(null);
    }
  };

  const handleEditUrl = async (deliverableId: string) => {
    const raw = editUrlValue.trim();
    if (!raw) return;
    if (!isValidUrl(raw)) {
      setError('Please enter a valid URL (e.g. https://www.instagram.com/p/abc123)');
      return;
    }

    const url = ensureProtocol(raw);
    setEditSubmitting(true);
    setError(null);

    try {
      await onEditUrl(deliverableId, url);
      setEditingId(null);
      setEditUrlValue('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update URL'
      );
    } finally {
      setEditSubmitting(false);
    }
  };

  // ---- Render ----
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
          {loading ? (
            <div className="space-y-6 animate-pulse">
              {/* Creator info skeleton */}
              <div className="bg-[#F8F9FD] rounded-xl p-5">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gray-200" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-200 rounded" />
                      <div className="h-3 w-20 bg-gray-200 rounded" />
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-4 w-40 bg-gray-200 rounded ml-auto" />
                    <div className="h-3 w-28 bg-gray-200 rounded ml-auto" />
                    <div className="w-64 h-2 bg-gray-200 rounded-full" />
                  </div>
                </div>
              </div>
              {/* Filter bar skeleton */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-24 bg-gray-200 rounded-lg" />
                  <div className="h-8 w-24 bg-gray-200 rounded-lg" />
                  <div className="h-8 w-24 bg-gray-200 rounded-lg" />
                </div>
              </div>
              {/* Table skeleton */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
                  <div className="h-3 w-full bg-gray-200 rounded" />
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="px-5 py-4 border-b border-gray-100 flex items-center gap-4">
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                    <div className="h-4 w-16 bg-gray-200 rounded" />
                    <div className="h-4 flex-1 bg-gray-200 rounded" />
                    <div className="h-6 w-24 bg-gray-200 rounded-full" />
                    <div className="h-4 w-28 bg-gray-200 rounded" />
                    <div className="h-8 flex-1 bg-gray-200 rounded-lg" />
                    <div className="h-8 w-20 bg-gray-200 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
          <>
          {/* --- Creator Info Card --- */}
          <div className="bg-[#F8F9FD] rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between gap-6 flex-wrap">
              {/* Left: Creator */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                  {creatorAvatar ? (
                    <img
                      src={creatorAvatar}
                      alt={creatorName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg bg-brand-navy">
                      {creatorName?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900">
                    {creatorName}
                  </p>
                  {creatorUsername && (
                    <p className="text-sm text-gray-500">
                      @{creatorUsername}
                    </p>
                  )}
                  {socialStats && socialStats.length > 0 && (
                    <div className="flex items-center gap-3 mt-0.5">
                      {socialStats.map((stat, i) => (
                        <span key={i} className="text-xs text-gray-500">
                          {stat.platform}: {stat.followers}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Campaign info + progress */}
              <div className="text-right">
                <p className="text-base font-bold text-brand-navy-dark mb-1">
                  {campaign?.title ||
                    campaign?.campaignTitle ||
                    'Campaign'}
                </p>
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
            <div className="flex items-center justify-between">
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
                <FilterDropdown
                  label="Date"
                  value={dateFilter}
                  onChange={setDateFilter}
                  options={[
                    { value: 'all', label: 'All Dates' },
                    { value: 'upcoming', label: 'Upcoming' },
                    { value: 'overdue', label: 'Overdue' },
                  ]}
                />
              </div>

              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <SlidersHorizontal className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* --- Error --- */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* --- Table --- */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            {/* Table header */}
            <div className="grid grid-cols-[100px_80px_1fr_140px_140px_1fr_120px] gap-2 px-5 py-3 border-b border-gray-200 bg-gray-50 min-w-[920px]">
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
                {hasAnyUrl ? 'URL' : 'URL Submission'}
              </span>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Action
              </span>
            </div>

            {/* Empty state */}
            {filteredItems.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-gray-400 min-w-[920px]">
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
              const isEditing = editingId === item.submission?.id;

              return (
                <div
                  key={`${item.platform}-${item.type}-${index}`}
                  className="grid grid-cols-[100px_80px_1fr_140px_140px_1fr_120px] gap-2 px-5 py-4 border-b border-gray-100 last:border-b-0 items-center min-w-[920px]"
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

                  {/* URL Column */}
                  <div className="min-w-0">
                    {isUrlSubmitted && !isEditing ? (
                      /* Show URL link */
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
                    ) : isEditing ? (
                      /* Edit URL input */
                      <div>
                        <p className="text-xs font-semibold text-gray-800 mb-1">
                          Input post URL
                        </p>
                        <input
                          type="text"
                          value={editUrlValue}
                          onChange={(e) => setEditUrlValue(e.target.value)}
                          placeholder="e.g. https://www.instagram.com/p/abc123"
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy focus:border-transparent bg-[#F8F9FD] placeholder-brand-navy-dark/50"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter')
                              handleEditUrl(item.submission!.id);
                          }}
                        />
                      </div>
                    ) : status === 'approved' ? (
                      /* URL input — only active after approval */
                      <div>
                        <p className="text-xs font-semibold text-gray-800 mb-1">
                          Input post URL
                        </p>
                        <input
                          type="text"
                          value={urlInputs[index] || ''}
                          onChange={(e) =>
                            setUrlInputs((prev) => ({
                              ...prev,
                              [index]: e.target.value,
                            }))
                          }
                          placeholder="e.g. https://www.instagram.com/p/abc123"
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy focus:border-transparent placeholder-brand-navy-dark/50 bg-[#F8F9FD]"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter')
                              handleSubmitUrl(index, item);
                          }}
                        />
                      </div>
                    ) : (
                      /* Not yet approved — show disabled placeholder */
                      <span className="text-sm text-gray-400 italic">
                        Available after approval
                      </span>
                    )}
                  </div>

                  {/* Action Column */}
                  <div className="flex items-center gap-2 justify-end">
                    {(status === 'approved' || status === 'completed') &&
                    hasUrl &&
                    !isEditing ? (
                      /* Approved / Completed → edit + arrow buttons */
                      <>
                        <button
                          onClick={() => {
                            setEditingId(item.submission!.id);
                            setEditUrlValue(
                              item.submission!.contentUrl?.replace(
                                /^https?:\/\//,
                                ''
                              ) || ''
                            );
                          }}
                          className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Pencil className="w-4 h-4 text-gray-600" />
                        </button>
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
                        >
                          <ArrowRight className="w-4 h-4 text-gray-600" />
                        </button>
                      </>
                    ) : status === 'submitted' &&
                      hasUrl &&
                      !isEditing ? (
                      /* Submitted → edit + arrow buttons */
                      <>
                        <button
                          onClick={() => {
                            setEditingId(item.submission!.id);
                            setEditUrlValue(
                              item.submission!.contentUrl?.replace(
                                /^https?:\/\//,
                                ''
                              ) || ''
                            );
                          }}
                          className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Pencil className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => {
                            if (item.submission?.contentUrl) {
                              window.open(
                                ensureProtocol(
                                  item.submission.contentUrl
                                ),
                                '_blank'
                              );
                            }
                          }}
                          className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <ArrowRight className="w-4 h-4 text-gray-600" />
                        </button>
                      </>
                    ) : isEditing ? (
                      /* Edit mode → submit button */
                      <button
                        onClick={() =>
                          handleEditUrl(item.submission!.id)
                        }
                        disabled={editSubmitting}
                        className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        {editSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            Submit{' '}
                            <Check className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    ) : status === 'approved' ? (
                      /* Approved → submit button for post URL */
                      <button
                        onClick={() => handleSubmitUrl(index, item)}
                        disabled={submittingIndex === index}
                        className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        {submittingIndex === index ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            Submit{' '}
                            <Check className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    ) : (
                      /* Not yet approved — no action available */
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
