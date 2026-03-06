'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronDown, Check, Plus, Building2 } from 'lucide-react';
import { useWorkspace } from '@/lib/context/workspace-context';
import type { Workspace, PlanTier, WorkspaceStatus } from '@/types/workspace';

// ===== PLAN TIER BADGE =====

interface PlanBadgeProps {
  tier: PlanTier;
}

function PlanBadge({ tier }: PlanBadgeProps) {
  const styles: Record<PlanTier, string> = {
    scale: 'bg-green-100 text-green-700',
    growth: 'bg-blue-100 text-blue-700',
    discovery: 'bg-gray-100 text-gray-600',
  };

  const labels: Record<PlanTier, string> = {
    scale: 'Scale',
    growth: 'Growth',
    discovery: 'Discovery',
  };

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold leading-none ${styles[tier]}`}
    >
      {labels[tier]}
    </span>
  );
}

// ===== TRIAL BADGE =====

interface TrialBadgeProps {
  trialEndsAt: string | null;
}

function TrialBadge({ trialEndsAt }: TrialBadgeProps) {
  const daysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86_400_000))
    : null;

  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold leading-none bg-amber-100 text-amber-700">
      {daysLeft !== null ? `Trial · ${daysLeft}d` : 'Trial'}
    </span>
  );
}

// ===== WORKSPACE AVATAR =====

interface WorkspaceAvatarProps {
  name: string;
  size?: 'sm' | 'md';
}

const AVATAR_COLORS = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-teal-500',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function WorkspaceAvatar({ name, size = 'md' }: WorkspaceAvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase();
  const color = getAvatarColor(name);
  const sizeClasses = size === 'sm' ? 'w-6 h-6 text-[11px]' : 'w-8 h-8 text-sm';

  return (
    <div
      className={`${color} ${sizeClasses} rounded-md flex items-center justify-center text-white font-semibold flex-shrink-0`}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}

// ===== DROPDOWN ITEM =====

interface WorkspaceItemProps {
  workspace: Workspace;
  isActive: boolean;
  onSelect: (id: string) => void;
}

function WorkspaceItem({ workspace, isActive, onSelect }: WorkspaceItemProps) {
  const isTrial = workspace.status === 'trial';

  return (
    <button
      type="button"
      onClick={() => onSelect(workspace.id)}
      className={`
        w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors
        ${isActive ? 'bg-brand-navy-50' : 'hover:bg-gray-50'}
      `}
      aria-current={isActive ? 'true' : undefined}
    >
      {/* Avatar */}
      <WorkspaceAvatar name={workspace.name} size="md" />

      {/* Name + badges */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 truncate leading-tight">
          {workspace.name}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <PlanBadge tier={workspace.planTier} />
          {isTrial && <TrialBadge trialEndsAt={workspace.trialEndsAt} />}
        </div>
      </div>

      {/* Active checkmark */}
      {isActive && (
        <Check className="w-4 h-4 text-brand-navy flex-shrink-0" aria-label="Active workspace" />
      )}
    </button>
  );
}

// ===== MAIN COMPONENT =====

export default function WorkspaceSwitcher() {
  const { currentWorkspace, workspaces, switchWorkspace, isLoading } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = useCallback(
    (workspaceId: string) => {
      switchWorkspace(workspaceId);
      setIsOpen(false);
    },
    [switchWorkspace]
  );

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg animate-pulse">
        <div className="w-8 h-8 rounded-md bg-gray-200 flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="h-3 bg-gray-200 rounded w-3/4" />
          <div className="h-2.5 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    );
  }

  // No workspace state
  if (!currentWorkspace) {
    return (
      <Link
        href="/brands/workspace/create"
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-dashed border-gray-300 hover:border-brand-navy hover:bg-brand-navy-50 transition-colors group"
      >
        <div className="w-8 h-8 rounded-md border-2 border-dashed border-gray-300 group-hover:border-brand-navy flex items-center justify-center flex-shrink-0 transition-colors">
          <Building2 className="w-4 h-4 text-gray-400 group-hover:text-brand-navy transition-colors" />
        </div>
        <span className="text-sm font-medium text-gray-500 group-hover:text-brand-navy transition-colors">
          Create workspace
        </span>
      </Link>
    );
  }

  const isTrial = currentWorkspace.status === 'trial';

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`
          w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-colors
          ${
            isOpen
              ? 'border-brand-navy bg-brand-navy-50'
              : 'border-transparent hover:bg-gray-100'
          }
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Current workspace: ${currentWorkspace.name}. Click to switch.`}
      >
        {/* Avatar */}
        <WorkspaceAvatar name={currentWorkspace.name} size="sm" />

        {/* Name + plan */}
        <div className="min-w-0 flex-1 text-left">
          <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
            {currentWorkspace.name}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <PlanBadge tier={currentWorkspace.planTier} />
            {isTrial && <TrialBadge trialEndsAt={currentWorkspace.trialEndsAt} />}
          </div>
        </div>

        {/* Chevron */}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className="
            absolute top-full left-0 right-0 mt-1 z-50
            bg-white border border-gray-200 rounded-xl shadow-brand-lg
            overflow-hidden animate-fade-in
          "
          role="listbox"
          aria-label="Available workspaces"
        >
          {/* Workspace list */}
          <div className="p-1.5 space-y-0.5 max-h-64 overflow-y-auto">
            {workspaces.map((ws) => (
              <WorkspaceItem
                key={ws.id}
                workspace={ws}
                isActive={ws.id === currentWorkspace.id}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Create workspace CTA */}
          <div className="p-1.5">
            <Link
              href="/brands/workspace/create"
              onClick={() => setIsOpen(false)}
              className="
                flex items-center gap-2.5 px-3 py-2.5 rounded-lg
                text-sm font-medium text-gray-700
                hover:bg-gray-50 transition-colors
              "
            >
              <div className="w-8 h-8 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
                <Plus className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
              </div>
              <span>Create workspace</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
