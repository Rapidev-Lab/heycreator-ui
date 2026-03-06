'use client';

import { useState } from 'react';
import {
  Eye,
  Copy,
  Check,
  Lock,
  Globe,
  MoreVertical,
  Trash2,
  Link2,
  Calendar,
} from 'lucide-react';
import { SharedLink, SharedLinkType, SharedLinkStatus } from '@/types/sharing';

// ===== PROPS =====

interface SharedLinksTableProps {
  links: SharedLink[];
  onRevoke: (linkId: string) => void;
  onCopyLink: (token: string) => void;
}

// ===== HELPERS =====

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

function getTypeLabel(type: SharedLinkType): string {
  if (type === 'campaign') return 'Campaign';
  if (type === 'creator_profile') return 'Creator';
  return 'List';
}

// ===== TYPE BADGE =====

function TypeBadge({ type }: { type: SharedLinkType }) {
  const styles: Record<SharedLinkType, string> = {
    campaign: 'bg-blue-50 text-blue-700 border border-blue-200',
    creator_profile: 'bg-purple-50 text-purple-700 border border-purple-200',
    creator_list: 'bg-green-50 text-green-700 border border-green-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[type]}`}>
      {getTypeLabel(type)}
    </span>
  );
}

// ===== STATUS BADGE =====

function StatusBadge({ status }: { status: SharedLinkStatus }) {
  const styles: Record<SharedLinkStatus, string> = {
    active: 'bg-green-50 text-green-700 border border-green-200',
    expired: 'bg-gray-100 text-gray-500 border border-gray-200',
    revoked: 'bg-red-50 text-red-700 border border-red-200',
  };
  const labels: Record<SharedLinkStatus, string> = {
    active: 'Active',
    expired: 'Expired',
    revoked: 'Revoked',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

// ===== ROW ACTIONS DROPDOWN =====

interface RowActionsProps {
  link: SharedLink;
  onRevoke: (linkId: string) => void;
  onCopy: (token: string) => void;
  copiedToken: string | null;
}

function RowActions({ link, onRevoke, onCopy, copiedToken }: RowActionsProps) {
  const [open, setOpen] = useState(false);
  const isCopied = copiedToken === link.token;
  const canInteract = link.status === 'active';

  return (
    <div className="flex items-center gap-1.5 justify-end">
      {/* Copy Link */}
      <button
        onClick={() => onCopy(link.token)}
        disabled={!canInteract}
        title={canInteract ? 'Copy link' : 'Link is not active'}
        className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 ${
          isCopied
            ? 'bg-green-50 border-green-200 text-green-700'
            : canInteract
            ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
        }`}
        aria-label={isCopied ? 'Copied' : 'Copy link'}
      >
        {isCopied ? (
          <>
            <Check className="w-3 h-3" />
            Copied
          </>
        ) : (
          <>
            <Copy className="w-3 h-3" />
            Copy
          </>
        )}
      </button>

      {/* More Options (revoke only for active links) */}
      {canInteract && (
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {open && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOpen(false)}
              />
              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-1 z-20 w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                <button
                  onClick={() => {
                    onRevoke(link.id);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Revoke Link
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ===== EMPTY STATE =====

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
        <Link2 className="w-6 h-6 text-gray-300" />
      </div>
      <p className="text-sm font-semibold text-gray-500">No shared links yet</p>
      <p className="text-xs text-gray-400 mt-1 max-w-xs">
        Share a campaign or creator profile to get started.
      </p>
    </div>
  );
}

// ===== MAIN COMPONENT =====

export default function SharedLinksTable({
  links,
  onRevoke,
  onCopyLink,
}: SharedLinksTableProps) {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const activeCount = links.filter((l) => l.status === 'active').length;

  function handleCopy(token: string) {
    onCopyLink(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-bold text-gray-900">Shared Links</h3>
          {activeCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
              {activeCount} active
            </span>
          )}
        </div>
      </div>

      {links.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Resource
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Views
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap hidden sm:table-cell">
                  Created
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap hidden md:table-cell">
                  Expires
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Status
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {links.map((link) => (
                <tr
                  key={link.id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  {/* Resource */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 min-w-0">
                      {link.password ? (
                        <span title="Password protected"><Lock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" /></span>
                      ) : (
                        <Globe className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                      )}
                      <span className="text-sm font-semibold text-gray-900 truncate max-w-[160px]">
                        {link.resourceName}
                      </span>
                    </div>
                    {link.createdByName && (
                      <p className="text-xs text-gray-400 mt-0.5 pl-[22px]">
                        by {link.createdByName}
                      </p>
                    )}
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3.5">
                    <TypeBadge type={link.type} />
                  </td>

                  {/* Views */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Eye className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-medium">{link.viewCount.toLocaleString()}</span>
                    </div>
                  </td>

                  {/* Created */}
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="w-3 h-3 text-gray-300" />
                      {formatDate(link.createdAt)}
                    </div>
                  </td>

                  {/* Expires */}
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-xs text-gray-500">
                      {link.expiresAt
                        ? isExpired(link.expiresAt)
                          ? <span className="text-red-500 font-medium">Expired</span>
                          : formatDate(link.expiresAt)
                        : <span className="text-gray-400">Never</span>}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <StatusBadge status={link.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <RowActions
                      link={link}
                      onRevoke={onRevoke}
                      onCopy={handleCopy}
                      copiedToken={copiedToken}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
