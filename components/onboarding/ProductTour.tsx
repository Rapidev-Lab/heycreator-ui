'use client';

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Search,
  Megaphone,
  BarChart2,
  Users,
  X,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TourStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

interface ProductTourProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

// ─── Tour Steps ───────────────────────────────────────────────────────────────

const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    title: 'Welcome to your workspace!',
    description:
      'Hey Creator is your all-in-one influencer marketing platform. Let us show you around so you can get the most out of it from day one.',
    icon: <LayoutDashboard className="w-7 h-7 text-white" />,
    position: 'center',
  },
  {
    id: 2,
    title: 'Discover Creators',
    description:
      'Search across Instagram, TikTok, YouTube, Twitter and Facebook simultaneously. Use filters like location, follower count and engagement rate to find your perfect match.',
    icon: <Search className="w-7 h-7 text-white" />,
    position: 'left',
  },
  {
    id: 3,
    title: 'Manage Campaigns',
    description:
      'Create campaigns, set budgets and timelines, define deliverables, and invite creators to apply. Track every campaign from brief to completion in one place.',
    icon: <Megaphone className="w-7 h-7 text-white" />,
    position: 'right',
  },
  {
    id: 4,
    title: 'Track Usage',
    description:
      'Monitor your monthly search usage, seat allocations and API calls from the usage dashboard. Upgrade your plan when your team needs more capacity.',
    icon: <BarChart2 className="w-7 h-7 text-white" />,
    position: 'bottom',
  },
  {
    id: 5,
    title: 'Invite Your Team',
    description:
      'Collaborate with your marketing team by inviting colleagues to your workspace. Assign roles and share creator lists, notes and campaigns seamlessly.',
    icon: <Users className="w-7 h-7 text-white" />,
    position: 'center',
  },
];

// ─── Tooltip Position Styles ──────────────────────────────────────────────────

type Position = TourStep['position'];

function getTooltipClasses(position: Position): string {
  switch (position) {
    case 'center':
      return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    case 'top':
      return 'top-24 left-1/2 -translate-x-1/2';
    case 'bottom':
      return 'bottom-24 left-1/2 -translate-x-1/2';
    case 'left':
      return 'top-1/2 left-16 -translate-y-1/2';
    case 'right':
      return 'top-1/2 right-16 -translate-y-1/2';
    default:
      return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
  }
}

function getArrowClasses(position: Position): string | null {
  switch (position) {
    case 'left':
      return 'absolute top-1/2 -right-2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-white drop-shadow-sm';
    case 'right':
      return 'absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white drop-shadow-sm';
    case 'top':
      return 'absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white drop-shadow-sm';
    case 'bottom':
      return 'absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-white drop-shadow-sm';
    default:
      return null;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProductTour({ isOpen, onComplete, onSkip }: ProductTourProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay to allow backdrop to render before showing tooltip
      const t = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
      setCurrentIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentIndex];
  const isLast = currentIndex === TOUR_STEPS.length - 1;
  const isFirst = currentIndex === 0;
  const arrowClass = getArrowClasses(step.position);

  function handleNext() {
    if (isLast) {
      onComplete();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  function handleBack() {
    if (!isFirst) {
      setCurrentIndex((prev) => prev - 1);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={onSkip}
      />

      {/* Tooltip card */}
      <div
        className={`absolute ${getTooltipClasses(step.position)} z-10 transition-all duration-300`}
        style={{
          opacity: visible ? 1 : 0,
          transform: `${getTooltipClasses(step.position).includes('translate') ? '' : ''} ${
            visible ? 'scale(1)' : 'scale(0.95)'
          }`,
        }}
      >
        <div className="relative bg-white rounded-2xl shadow-brand-lg w-80 sm:w-96 p-6">
          {/* Arrow indicator */}
          {arrowClass && <div className={arrowClass} />}

          {/* Skip button */}
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
            aria-label="Skip tour"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Step counter */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold text-primary bg-primary-light px-2.5 py-1 rounded-full">
              {currentIndex + 1} of {TOUR_STEPS.length}
            </span>
          </div>

          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-brand-navy flex items-center justify-center mb-4">
            {step.icon}
          </div>

          {/* Content */}
          <h3 className="text-base font-bold text-text-primary mb-2">{step.title}</h3>
          <p className="text-sm text-text-secondary leading-relaxed mb-6">{step.description}</p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            {/* Back button */}
            {!isFirst ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {/* Next / Done */}
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 bg-brand-navy text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-navy-light transition-colors"
            >
              {isLast ? 'Done' : 'Next'}
              {!isLast && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mt-5">
            {TOUR_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-5 h-2 bg-brand-navy'
                    : 'w-2 h-2 bg-gray-200 hover:bg-gray-300'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* Skip link */}
          <div className="text-center mt-3">
            <button
              onClick={onSkip}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors underline underline-offset-2"
            >
              Skip tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
