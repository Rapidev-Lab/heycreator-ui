'use client';

import { useState } from 'react';
import {
  Rocket,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  X,
  ArrowRight,
  Building2,
  User,
  Search,
  Megaphone,
  Users,
} from 'lucide-react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

type ChecklistItemStatus = 'completed' | 'current' | 'pending';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  status: ChecklistItemStatus;
  actionLabel: string;
  actionHref: string;
  icon: React.ReactNode;
}

interface OnboardingChecklistProps {
  onDismiss: () => void;
}

// ─── Checklist Items ──────────────────────────────────────────────────────────

const INITIAL_ITEMS: ChecklistItem[] = [
  {
    id: 'create-workspace',
    label: 'Create your workspace',
    description: 'Your workspace is the home for all your campaigns, creators and team members.',
    status: 'completed',
    actionLabel: 'View Workspace',
    actionHref: '/brands/workspace',
    icon: <Building2 className="w-4 h-4" />,
  },
  {
    id: 'setup-profile',
    label: 'Set up your profile',
    description: 'Add your company logo, website and industry so creators know who you are.',
    status: 'completed',
    actionLabel: 'Edit Profile',
    actionHref: '/brands/settings',
    icon: <User className="w-4 h-4" />,
  },
  {
    id: 'first-search',
    label: 'Run your first search',
    description:
      'Discover creators across Instagram, TikTok, YouTube and more with our AI-powered search.',
    status: 'current',
    actionLabel: 'Go to Discover',
    actionHref: '/brands/discover',
    icon: <Search className="w-4 h-4" />,
  },
  {
    id: 'create-campaign',
    label: 'Create a campaign',
    description:
      'Launch your first influencer campaign by setting up briefs, deliverables and budgets.',
    status: 'pending',
    actionLabel: 'Create Campaign',
    actionHref: '/brands/campaigns/create',
    icon: <Megaphone className="w-4 h-4" />,
  },
  {
    id: 'invite-team',
    label: 'Invite a team member',
    description:
      'Collaborate more effectively by bringing your colleagues into your workspace.',
    status: 'pending',
    actionLabel: 'Invite Team',
    actionHref: '/brands/settings',
    icon: <Users className="w-4 h-4" />,
  },
];

// ─── Item Component ───────────────────────────────────────────────────────────

function ChecklistItemRow({
  item,
  isExpanded,
  onToggle,
}: {
  item: ChecklistItem;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const isCompleted = item.status === 'completed';
  const isCurrent = item.status === 'current';

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        isCurrent
          ? 'border-primary bg-primary-light/40'
          : isCompleted
          ? 'border-gray-100 bg-gray-50/50'
          : 'border-gray-100 bg-white hover:border-gray-200'
      }`}
    >
      {/* Header row */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        {/* Status icon */}
        <div className="flex-shrink-0">
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-status-success" />
          ) : isCurrent ? (
            <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
          ) : (
            <Circle className="w-5 h-5 text-gray-300" />
          )}
        </div>

        {/* Label */}
        <span
          className={`flex-1 text-sm font-medium ${
            isCompleted ? 'text-text-muted line-through' : 'text-text-primary'
          }`}
        >
          {item.label}
        </span>

        {/* Expand/collapse */}
        <div className="flex-shrink-0 text-text-muted">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 space-y-3 animate-fade-in">
          <p className="text-xs text-text-muted leading-relaxed pl-8">{item.description}</p>
          {!isCompleted && (
            <div className="pl-8">
              <Link
                href={item.actionHref}
                className="inline-flex items-center gap-1.5 bg-brand-navy text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-brand-navy-light transition-colors"
              >
                {item.actionLabel}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OnboardingChecklist({ onDismiss }: OnboardingChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>(INITIAL_ITEMS);
  const [expandedId, setExpandedId] = useState<string | null>('first-search');
  const [allComplete, setAllComplete] = useState(false);

  const completedCount = items.filter((i) => i.status === 'completed').length;
  const totalCount = items.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  function handleToggle(id: string) {
    setExpandedId(expandedId === id ? null : id);
  }

  // Simulate completing an item (for demo purposes, toggle current to completed)
  function handleMarkComplete(id: string) {
    const updated = items.map((item) => {
      if (item.id === id) return { ...item, status: 'completed' as ChecklistItemStatus };
      return item;
    });

    // Set next pending item to current
    const firstPending = updated.find((i) => i.status === 'pending');
    if (firstPending) {
      const withCurrent = updated.map((item) =>
        item.id === firstPending.id ? { ...item, status: 'current' as ChecklistItemStatus } : item
      );
      setItems(withCurrent);
    } else {
      setItems(updated);
    }

    const allDone = updated.every((i) => i.status === 'completed');
    if (allDone) setAllComplete(true);
  }

  if (allComplete) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-brand-md p-6 w-full max-w-sm relative overflow-hidden">
        {/* Confetti background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {['#00A8CC', '#001F54', '#10B981', '#F59E0B', '#EF4444'].map((color, i) => (
            <div
              key={i}
              className="absolute w-2.5 h-2.5 rounded-full opacity-20 animate-bounce"
              style={{
                backgroundColor: color,
                top: `${10 + i * 15}%`,
                left: `${5 + i * 20}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${1 + i * 0.3}s`,
              }}
            />
          ))}
          {['#00A8CC', '#001F54', '#10B981'].map((color, i) => (
            <div
              key={`right-${i}`}
              className="absolute w-2 h-2 rotate-45 opacity-20 animate-pulse"
              style={{
                backgroundColor: color,
                top: `${20 + i * 20}%`,
                right: `${5 + i * 15}%`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>

        <div className="relative text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-status-success-bg flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-status-success" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">You are all set!</h3>
            <p className="text-sm text-text-muted mt-1">
              You have completed all onboarding steps. You are ready to get the most out of Hey Creator.
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="w-full bg-brand-navy text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-brand-navy-light transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-brand-md p-5 w-full max-w-sm relative">
      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
        aria-label="Dismiss checklist"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pr-6">
        <div className="w-9 h-9 rounded-xl bg-brand-navy flex items-center justify-center flex-shrink-0">
          <Rocket className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-text-primary">Get Started</h3>
          <p className="text-xs text-text-muted">
            {completedCount} of {totalCount} completed
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-navy rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-text-muted">{progressPercent}% complete</span>
          <span className="text-xs text-text-muted">
            {totalCount - completedCount} remaining
          </span>
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {items.map((item) => (
          <ChecklistItemRow
            key={item.id}
            item={item}
            isExpanded={expandedId === item.id}
            onToggle={() => handleToggle(item.id)}
          />
        ))}
      </div>

      {/* Dismiss link */}
      <div className="mt-4 text-center">
        <button
          onClick={onDismiss}
          className="text-xs text-text-muted hover:text-text-secondary transition-colors underline underline-offset-2"
        >
          Dismiss checklist
        </button>
      </div>
    </div>
  );
}
