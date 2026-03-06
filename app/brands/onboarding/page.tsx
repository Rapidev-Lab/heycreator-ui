'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Megaphone, Settings, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import ProductTour from '@/components/onboarding/ProductTour';
import OnboardingChecklist from '@/components/onboarding/OnboardingChecklist';

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuickActionCard {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  iconBg: string;
}

// ─── Quick Action Cards ───────────────────────────────────────────────────────

const QUICK_ACTIONS: QuickActionCard[] = [
  {
    id: 'discover',
    title: 'Discover Creators',
    description: 'Search across all major platforms to find creators that match your brand.',
    href: '/brands/discover',
    icon: <Search className="w-5 h-5 text-white" />,
    iconBg: 'bg-primary',
  },
  {
    id: 'campaign',
    title: 'Create Campaign',
    description: 'Launch a new campaign, set your brief and start inviting creators to apply.',
    href: '/brands/campaigns/create',
    icon: <Megaphone className="w-5 h-5 text-white" />,
    iconBg: 'bg-brand-navy',
  },
  {
    id: 'settings',
    title: 'Explore Settings',
    description: 'Configure your workspace, manage team members and update your billing plan.',
    href: '/brands/settings',
    icon: <Settings className="w-5 h-5 text-white" />,
    iconBg: 'bg-text-secondary',
  },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();

  const [tourOpen, setTourOpen] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);
  const [checklistDismissed, setChecklistDismissed] = useState(false);

  // Check localStorage on mount for tour completion state
  useEffect(() => {
    const tourDone = localStorage.getItem('onboarding_tour_completed') === 'true';
    setTourCompleted(tourDone);

    // Auto-open tour if not yet completed
    if (!tourDone) {
      setTourOpen(true);
    }
  }, []);

  // Redirect to dashboard when both tour is completed and checklist is dismissed
  useEffect(() => {
    if (tourCompleted && checklistDismissed) {
      router.push('/brands/dashboard');
    }
  }, [tourCompleted, checklistDismissed, router]);

  function handleTourComplete() {
    localStorage.setItem('onboarding_tour_completed', 'true');
    setTourCompleted(true);
    setTourOpen(false);
  }

  function handleTourSkip() {
    localStorage.setItem('onboarding_tour_completed', 'true');
    setTourCompleted(true);
    setTourOpen(false);
  }

  function handleChecklistDismiss() {
    setChecklistDismissed(true);
  }

  return (
    <>
      {/* Product tour overlay */}
      <ProductTour
        isOpen={tourOpen}
        onComplete={handleTourComplete}
        onSkip={handleTourSkip}
      />

      {/* Page content */}
      <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Welcome header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Getting started</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
              Welcome, Sarah!
            </h1>
            <p className="text-text-muted text-sm sm:text-base max-w-xl">
              Your workspace is ready. Complete the steps below to get the most out of Hey Creator,
              or jump straight in with one of the quick actions.
            </p>

            {/* Re-open tour button (shown after tour is completed) */}
            {tourCompleted && (
              <button
                onClick={() => setTourOpen(true)}
                className="mt-4 inline-flex items-center gap-2 text-sm text-primary font-medium hover:text-primary-dark transition-colors"
              >
                <Search className="w-4 h-4" />
                Replay product tour
              </button>
            )}
          </div>

          {/* Main layout: checklist + quick actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Quick action cards */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {QUICK_ACTIONS.map((action) => (
                  <Link
                    key={action.id}
                    href={action.href}
                    className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-brand-sm hover:shadow-brand-md transition-all duration-200 hover:-translate-y-0.5"
                  >
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-xl ${action.iconBg} flex items-center justify-center mb-4`}
                    >
                      {action.icon}
                    </div>

                    {/* Content */}
                    <h3 className="text-sm font-semibold text-text-primary mb-1.5">
                      {action.title}
                    </h3>
                    <p className="text-xs text-text-muted leading-relaxed mb-4">
                      {action.description}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-1 text-xs font-semibold text-brand-navy group-hover:text-primary transition-colors">
                      Get started
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Workspace info banner */}
              <div className="bg-gradient-to-r from-brand-navy to-brand-navy-light rounded-2xl p-5 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-brand-navy-200 uppercase tracking-wide mb-1">
                      Your workspace
                    </p>
                    <h3 className="text-base font-bold mb-1">Nike SA Hub</h3>
                    <p className="text-sm text-brand-navy-200">
                      Growth plan · 3 seats · 50 searches/month
                    </p>
                  </div>
                  <Link
                    href="/brands/workspace"
                    className="flex-shrink-0 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Manage
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Onboarding checklist */}
            {!checklistDismissed && (
              <div className="lg:col-span-1">
                <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
                  Setup Checklist
                </h2>
                <OnboardingChecklist onDismiss={handleChecklistDismiss} />
              </div>
            )}

            {/* If checklist dismissed, show a placeholder card */}
            {checklistDismissed && (
              <div className="lg:col-span-1">
                <div className="bg-status-success-bg border border-status-success/20 rounded-2xl p-5 text-center">
                  <div className="w-10 h-10 rounded-full bg-status-success/10 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-5 h-5 text-status-success" />
                  </div>
                  <p className="text-sm font-semibold text-status-success mb-1">All set!</p>
                  <p className="text-xs text-text-muted">
                    You have dismissed the setup checklist. You can always find guides in the Help
                    centre.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
