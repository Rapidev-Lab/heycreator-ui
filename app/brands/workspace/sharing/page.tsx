'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Share2,
  Link2,
  Eye,
  Clock,
  ChevronDown,
  FolderOpen,
  Users,
} from 'lucide-react';
import { useWorkspace } from '@/lib/context/workspace-context';
import { SharedLink } from '@/types/sharing';
import SharedLinksTable from '@/components/sharing/SharedLinksTable';
import ShareLinkModal from '@/components/sharing/ShareLinkModal';
import { mockSharedLinks } from '@/lib/mock/seed/shared-links';

// ===== HELPERS =====

function getRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// ===== STAT CARD =====

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: 'green' | 'blue' | 'gray';
  subtitle?: string;
}

function StatCard({ icon, label, value, accent, subtitle }: StatCardProps) {
  const accentStyles: Record<string, string> = {
    green: 'bg-green-50 text-green-600 border-green-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    gray: 'bg-gray-50 text-gray-500 border-gray-100',
  };
  const iconBg = accentStyles[accent];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1.5">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ===== SHARE DROPDOWN =====

interface ShareDropdownProps {
  onShareCampaign: () => void;
  onShareCreator: () => void;
}

function ShareDropdown({ onShareCampaign, onShareCreator }: ShareDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-brand-navy rounded-lg hover:bg-brand-navy/90 active:bg-brand-navy/95 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-navy/30 focus:ring-offset-1"
      >
        <Share2 className="w-4 h-4" />
        Share Something
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-20 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5">
            <button
              onClick={() => {
                onShareCampaign();
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
            >
              <FolderOpen className="w-4 h-4 text-gray-400" />
              Share Campaign
            </button>
            <button
              onClick={() => {
                onShareCreator();
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
            >
              <Users className="w-4 h-4 text-gray-400" />
              Share Creator Profile
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ===== MODAL STATE TYPE =====

type ModalState =
  | { open: false }
  | {
      open: true;
      resourceType: 'campaign' | 'creator_profile';
      resourceId: string;
      resourceName: string;
    };

// ===== MAIN PAGE =====

export default function SharingPage() {
  const router = useRouter();
  const { currentWorkspace, isLoading } = useWorkspace();

  const [links, setLinks] = useState<SharedLink[]>(mockSharedLinks);
  const [modal, setModal] = useState<ModalState>({ open: false });

  // Filter to current workspace links
  const workspaceLinks = useMemo(() => {
    if (!currentWorkspace) return [];
    return links.filter((l) => l.workspaceId === currentWorkspace.id);
  }, [links, currentWorkspace]);

  // Stats derived from workspace links
  const stats = useMemo(() => {
    const active = workspaceLinks.filter((l) => l.status === 'active');
    const expired = workspaceLinks.filter((l) => l.status === 'expired' || l.status === 'revoked');
    const totalViews = workspaceLinks.reduce((acc, l) => acc + l.viewCount, 0);
    return {
      activeCount: active.length,
      totalViews,
      expiredCount: expired.length,
    };
  }, [workspaceLinks]);

  const handleRevoke = useCallback((linkId: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === linkId ? { ...l, status: 'revoked' as const } : l))
    );
  }, []);

  const handleCopyLink = useCallback((token: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.heycreator.com';
    // Determine type from token pattern for routing
    const url = token.includes('creator')
      ? `${origin}/shared/creator/${token}`
      : `${origin}/shared/campaign/${token}`;
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  }, []);

  function openShareCampaign() {
    setModal({
      open: true,
      resourceType: 'campaign',
      resourceId: 'mock-campaign-1',
      resourceName: 'Summer Vibes 2026',
    });
  }

  function openShareCreator() {
    setModal({
      open: true,
      resourceType: 'creator_profile',
      resourceId: 'mock-gi-3',
      resourceName: 'Thandi Moyo',
    });
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  // No workspace guard
  if (!currentWorkspace) {
    return (
      <div className="p-6 lg:p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-14 h-14 rounded-2xl bg-brand-navy/5 flex items-center justify-center mb-4">
          <Share2 className="w-7 h-7 text-brand-navy" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Workspace Selected</h2>
        <p className="text-gray-500 mb-6 max-w-sm text-sm">
          Select or create a workspace to manage shared links.
        </p>
        <button
          onClick={() => router.push('/brands/workspace/create')}
          className="px-6 py-2.5 bg-brand-navy text-white rounded-lg text-sm font-semibold hover:bg-brand-navy/90 transition-colors"
        >
          Create Workspace
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-brand-navy/5 flex items-center justify-center">
              <Link2 className="w-4 h-4 text-brand-navy" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Shared Links</h1>
          </div>
          <p className="text-sm text-gray-500 ml-10">
            Manage links shared with external stakeholders
          </p>
        </div>

        {/* Share Dropdown — right-aligned */}
        <div className="sm:flex-shrink-0">
          <ShareDropdown
            onShareCampaign={openShareCampaign}
            onShareCreator={openShareCreator}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<Share2 className="w-4 h-4" />}
          label="Active Links"
          value={stats.activeCount}
          accent="green"
          subtitle={stats.activeCount === 1 ? '1 link active' : `${stats.activeCount} links active`}
        />
        <StatCard
          icon={<Eye className="w-4 h-4" />}
          label="Total Views"
          value={stats.totalViews.toLocaleString()}
          accent="blue"
          subtitle="Across all shared links"
        />
        <StatCard
          icon={<Clock className="w-4 h-4" />}
          label="Expired / Revoked"
          value={stats.expiredCount}
          accent="gray"
          subtitle="No longer accessible"
        />
      </div>

      {/* Shared Links Table */}
      <SharedLinksTable
        links={workspaceLinks}
        onRevoke={handleRevoke}
        onCopyLink={handleCopyLink}
      />

      {/* Tip section */}
      {workspaceLinks.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          Shared links give read-only access to campaigns or creator profiles. Revoking a link
          immediately removes access for anyone using it.
        </p>
      )}

      {/* Share Link Modal */}
      {modal.open && (
        <ShareLinkModal
          isOpen={modal.open}
          onClose={() => setModal({ open: false })}
          resourceType={modal.resourceType}
          resourceId={modal.resourceId}
          resourceName={modal.resourceName}
        />
      )}
    </div>
  );
}
