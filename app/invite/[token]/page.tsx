'use client';

import { use, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Shield,
  Edit3,
  Eye,
  ArrowRight,
  Users,
} from 'lucide-react';
import { mockTeamInvitations } from '@/lib/mock/seed/team-invitations';

// ===== TYPES =====

type PageParams = { token: string };

type InviteState = 'loading' | 'valid' | 'expired' | 'accepted' | 'not_found';

// ===== ROLE METADATA =====

const ROLE_META = {
  admin: {
    label: 'Admin',
    description: 'Full access to workspace settings and team management',
    icon: <Shield className="w-4 h-4" />,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
  },
  editor: {
    label: 'Editor',
    description: 'Can create and edit campaigns, manage creators',
    icon: <Edit3 className="w-4 h-4" />,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  viewer: {
    label: 'Viewer',
    description: 'Read-only access to campaigns and analytics',
    icon: <Eye className="w-4 h-4" />,
    iconBg: 'bg-gray-50',
    iconColor: 'text-gray-600',
  },
} as const;

// ===== MOCK WORKSPACE NAMES =====

const WORKSPACE_NAMES: Record<string, string> = {
  'ws-nike-sa': 'Nike South Africa',
  'ws-adidas-za': 'Adidas ZA',
  'ws-freshly-baked': 'Freshly Baked Co',
};

// ===== ACCEPT BUTTON =====

function AcceptButton({ onClick, isLoading }: { onClick: () => void; isLoading: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-navy text-white text-sm font-semibold rounded-xl hover:bg-brand-navy/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Accepting invitation...
        </>
      ) : (
        <>
          Accept Invitation
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );
}

// ===== EXPIRED STATE =====

function ExpiredState({ invitedByName }: { invitedByName: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
        <Clock className="w-7 h-7 text-gray-400" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">Invitation expired</h2>
        <p className="text-sm text-gray-500 mt-1">
          This invitation from <span className="font-medium text-gray-700">{invitedByName}</span> is no
          longer valid.
        </p>
      </div>
      <div className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 text-left">
        <p className="text-sm text-gray-600">
          Team invitations expire after 7 days. Ask your workspace admin to send a new invitation.
        </p>
      </div>
      <Link
        href="/auth/brand/login"
        className="w-full text-center px-6 py-3 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
      >
        Request New Invitation
      </Link>
    </div>
  );
}

// ===== NOT FOUND STATE =====

function NotFoundState() {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-red-400" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">Invalid invitation</h2>
        <p className="text-sm text-gray-500 mt-1">
          This invitation link is not valid or has already been used.
        </p>
      </div>
      <Link
        href="/auth/brand/login"
        className="w-full text-center px-6 py-3 bg-brand-navy text-white text-sm font-semibold rounded-xl hover:bg-brand-navy/90 transition-colors"
      >
        Go to HeyCreator
      </Link>
    </div>
  );
}

// ===== ACCEPTED STATE =====

function AcceptedState({ workspaceName }: { workspaceName: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-500" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">You&apos;re in!</h2>
        <p className="text-sm text-gray-500 mt-1">
          Welcome to <span className="font-medium text-gray-700">{workspaceName}</span>. You now have
          access to the workspace.
        </p>
      </div>
      <Link
        href="/brands/workspace/dashboard"
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-navy text-white text-sm font-semibold rounded-xl hover:bg-brand-navy/90 transition-colors"
      >
        Go to Workspace
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ===== MAIN PAGE =====

export default function InviteAcceptPage({ params }: { params: Promise<PageParams> }) {
  const { token } = use(params);
  const [isAccepting, setIsAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  // Find invitation in mock data
  const invitation = useMemo(
    () => mockTeamInvitations.find((inv) => inv.token === token) ?? null,
    [token]
  );

  // Determine state
  const pageState: InviteState = useMemo(() => {
    if (!invitation) return 'not_found';
    if (invitation.status === 'expired') return 'expired';
    if (invitation.status === 'accepted' && !accepted) return 'expired'; // treat as expired for this demo
    if (accepted) return 'accepted';
    return 'valid';
  }, [invitation, accepted]);

  const workspaceName = invitation ? (WORKSPACE_NAMES[invitation.workspaceId] ?? 'Unknown Workspace') : '';
  const roleMeta = invitation ? ROLE_META[invitation.role] : null;

  const handleAccept = async () => {
    setIsAccepting(true);
    // Mock API call
    await new Promise((res) => setTimeout(res, 1200));
    setIsAccepting(false);
    setAccepted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/logo.svg"
            alt="HeyCreator"
            className="h-8 w-auto"
            onError={(e) => {
              // Fallback if logo is missing
              const target = e.currentTarget;
              target.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.className = 'flex items-center gap-2';
              fallback.innerHTML =
                '<div class="w-8 h-8 bg-brand-navy rounded-lg flex items-center justify-center"><span class="text-white text-sm font-bold">H</span></div><span class="text-lg font-bold text-brand-navy">HeyCreator</span>';
              target.parentNode?.appendChild(fallback);
            }}
          />
        </div>

        {/* State-based content */}
        {pageState === 'not_found' && <NotFoundState />}

        {pageState === 'expired' && invitation && (
          <ExpiredState invitedByName={invitation.invitedByName} />
        )}

        {pageState === 'accepted' && <AcceptedState workspaceName={workspaceName} />}

        {pageState === 'valid' && invitation && roleMeta && (
          <div className="space-y-6">
            {/* Heading */}
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-brand-navy/5 flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-brand-navy" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">You&apos;ve been invited!</h1>
              <p className="text-sm text-gray-500 mt-1.5">
                <span className="font-medium text-gray-700">{invitation.invitedByName}</span> has invited
                you to join their workspace.
              </p>
            </div>

            {/* Workspace info card */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Workspace
                </span>
                <span className="text-sm font-semibold text-gray-900">{workspaceName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Invited by
                </span>
                <span className="text-sm font-medium text-gray-700">{invitation.invitedByName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Your role
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${roleMeta.iconBg} ${roleMeta.iconColor}`}
                  >
                    {roleMeta.icon}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{roleMeta.label}</span>
                </div>
              </div>
            </div>

            {/* Role description */}
            <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg">
              <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${roleMeta.iconBg} ${roleMeta.iconColor}`}>
                {roleMeta.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-700">{roleMeta.label} role</p>
                <p className="text-xs text-gray-500 mt-0.5">{roleMeta.description}</p>
              </div>
            </div>

            {/* Personal message */}
            {invitation.message && (
              <blockquote className="relative px-4 py-3 bg-gray-50 border-l-4 border-brand-navy/30 rounded-r-lg">
                <p className="text-sm text-gray-600 italic">&ldquo;{invitation.message}&rdquo;</p>
                <footer className="text-xs text-gray-400 mt-1.5">&mdash; {invitation.invitedByName}</footer>
              </blockquote>
            )}

            {/* Accept button */}
            <AcceptButton onClick={handleAccept} isLoading={isAccepting} />

            {/* Sign in link */}
            <p className="text-center text-xs text-gray-400">
              Already have an account?{' '}
              <Link
                href="/auth/brand/login"
                className="font-medium text-brand-navy hover:text-brand-navy/80 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="mt-6 text-xs text-gray-400 text-center">
        &copy; {new Date().getFullYear()} HeyCreator &mdash;{' '}
        <Link href="/privacy" className="hover:text-gray-600 transition-colors">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
