'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Megaphone,
  Users,
  FileText,
  List,
  Search,
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
  AlertTriangle,
  CheckCircle,
  Check,
  Loader2,
  ArrowRight,
  FileBarChart2,
} from 'lucide-react';
import { MigrationStep } from '@/types/migration';
import MigrationSummary from './MigrationSummary';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LegacyDataItem {
  label: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}

interface PlanOption {
  id: 'discovery' | 'growth' | 'scale';
  name: string;
  price: string;
  seats: string;
  searches: string;
  recommended: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LEGACY_DATA: LegacyDataItem[] = [
  {
    label: 'Campaigns',
    count: 3,
    icon: <Megaphone className="w-5 h-5" />,
    color: 'text-purple-500 bg-purple-50',
  },
  {
    label: 'Creators',
    count: 45,
    icon: <Users className="w-5 h-5" />,
    color: 'text-blue-500 bg-blue-50',
  },
  {
    label: 'Notes',
    count: 12,
    icon: <FileText className="w-5 h-5" />,
    color: 'text-amber-500 bg-amber-50',
  },
  {
    label: 'Lists',
    count: 2,
    icon: <List className="w-5 h-5" />,
    color: 'text-green-500 bg-green-50',
  },
  {
    label: 'Search History',
    count: 87,
    icon: <Search className="w-5 h-5" />,
    color: 'text-cyan-500 bg-cyan-50',
  },
];

const INDUSTRY_OPTIONS = [
  'Fashion & Apparel',
  'Beauty & Cosmetics',
  'Food & Beverage',
  'Technology',
  'Travel & Hospitality',
  'Fitness & Wellness',
  'Gaming & Entertainment',
  'Education',
  'E-commerce',
  'Automotive',
  'Other',
];

const PLAN_OPTIONS: PlanOption[] = [
  {
    id: 'discovery',
    name: 'Discovery',
    price: 'R20K/mo',
    seats: '1 seat',
    searches: '20 searches',
    recommended: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 'R35K/mo',
    seats: '3 seats',
    searches: '50 searches',
    recommended: true,
  },
  {
    id: 'scale',
    name: 'Scale',
    price: 'R50K/mo',
    seats: '10 seats',
    searches: 'Unlimited',
    recommended: false,
  },
];

const MIGRATION_ENTITIES = [
  'Migrating campaigns...',
  'Migrating creators...',
  'Migrating notes...',
  'Migrating lists...',
  'Migrating search history...',
  'Finalising workspace setup...',
];

const STEP_LABELS: Record<Exclude<MigrationStep, 'migrating' | 'complete'>, string> = {
  review: 'Review Data',
  workspace: 'Create Workspace',
  confirm: 'Confirm',
};

const WIZARD_STEPS: Array<Exclude<MigrationStep, 'migrating' | 'complete'>> = [
  'review',
  'workspace',
  'confirm',
];

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({
  currentStep,
}: {
  currentStep: Exclude<MigrationStep, 'migrating' | 'complete'>;
}) {
  const currentIndex = WIZARD_STEPS.indexOf(currentStep);

  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {WIZARD_STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step} className="flex items-center">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-brand-navy text-white'
                    : isCurrent
                    ? 'bg-brand-navy text-white ring-4 ring-brand-navy-100'
                    : 'bg-gray-100 text-text-muted'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <span
                className={`text-xs font-medium whitespace-nowrap ${
                  isCurrent ? 'text-brand-navy' : isCompleted ? 'text-text-secondary' : 'text-text-muted'
                }`}
              >
                {STEP_LABELS[step]}
              </span>
            </div>

            {/* Connector line */}
            {index < WIZARD_STEPS.length - 1 && (
              <div
                className={`h-0.5 w-16 sm:w-24 mx-2 mb-5 transition-all duration-300 ${
                  index < currentIndex ? 'bg-brand-navy' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Review ───────────────────────────────────────────────────────────

function StepReview({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-bold text-text-primary mb-1">Review your data</h2>
        <p className="text-sm text-text-muted">
          Here is everything we found in your legacy account that will be migrated.
        </p>
      </div>

      {/* Data cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {LEGACY_DATA.map((item) => (
          <div
            key={item.label}
            className="bg-white border border-gray-100 rounded-xl p-4 shadow-brand-sm hover:shadow-brand-md transition-shadow"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${item.color}`}>
              {item.icon}
            </div>
            <p className="text-2xl font-bold text-text-primary">{item.count}</p>
            <p className="text-xs text-text-muted mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* AI suggestion */}
      <div className="bg-gradient-to-br from-brand-navy-50 to-primary-light rounded-2xl p-5 border border-brand-navy-100">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-navy flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-navy mb-1">AI Migration Assistant</p>
            <p className="text-sm text-text-secondary leading-relaxed">
              Based on your{' '}
              <span className="font-semibold text-brand-navy">3 campaigns</span> and{' '}
              <span className="font-semibold text-brand-navy">45 creators</span>, we recommend
              creating a{' '}
              <span className="font-semibold text-brand-navy">Growth workspace</span>. We have
              pre-filled the workspace configuration with optimal settings for your usage.
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <div className="h-1.5 w-24 rounded-full bg-brand-navy-200 overflow-hidden">
                <div className="h-full w-4/5 bg-brand-navy rounded-full" />
              </div>
              <span className="text-xs text-text-muted">85% confidence</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full flex items-center justify-center gap-2 bg-brand-navy text-white py-3 px-6 rounded-xl font-semibold hover:bg-brand-navy-light transition-colors"
      >
        Continue
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Step 2: Workspace ────────────────────────────────────────────────────────

interface WorkspaceConfig {
  name: string;
  industry: string;
  plan: 'discovery' | 'growth' | 'scale';
  teamEmails: string[];
}

function StepWorkspace({
  config,
  onChange,
  onNext,
  onBack,
}: {
  config: WorkspaceConfig;
  onChange: (updated: WorkspaceConfig) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState('');

  function handleAddEmail() {
    const trimmed = emailInput.trim();
    if (!trimmed) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (config.teamEmails.includes(trimmed)) {
      setEmailError('This email has already been added');
      return;
    }
    onChange({ ...config, teamEmails: [...config.teamEmails, trimmed] });
    setEmailInput('');
    setEmailError('');
  }

  function handleRemoveEmail(email: string) {
    onChange({ ...config, teamEmails: config.teamEmails.filter((e) => e !== email) });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-bold text-text-primary mb-1">Create your workspace</h2>
        <p className="text-sm text-text-muted">Configure your new workspace. You can change these settings later.</p>
      </div>

      {/* Workspace name */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Workspace name
        </label>
        <input
          type="text"
          value={config.name}
          onChange={(e) => onChange({ ...config, name: e.target.value })}
          placeholder="e.g. Nike SA Hub"
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent transition-all"
        />
      </div>

      {/* Industry */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Industry</label>
        <select
          value={config.industry}
          onChange={(e) => onChange({ ...config, industry: e.target.value })}
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent transition-all bg-white"
        >
          <option value="">Select an industry</option>
          {INDUSTRY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Plan selector */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">Select plan</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PLAN_OPTIONS.map((plan) => {
            const isSelected = config.plan === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => onChange({ ...config, plan: plan.id })}
                className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-brand-navy bg-brand-navy-50'
                    : 'border-border hover:border-brand-navy-200'
                }`}
              >
                {plan.recommended && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-brand-navy text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">
                    Recommended
                  </span>
                )}
                <p className="font-semibold text-sm text-text-primary mb-1">{plan.name}</p>
                <p className="text-base font-bold text-brand-navy mb-2">{plan.price}</p>
                <ul className="space-y-1">
                  <li className="text-xs text-text-muted">{plan.seats}</li>
                  <li className="text-xs text-text-muted">{plan.searches}</li>
                </ul>
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-navy flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Invite team members */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Invite team members{' '}
          <span className="text-text-light font-normal">(optional)</span>
        </label>
        <div className="flex gap-2">
          <input
            type="email"
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
              if (emailError) setEmailError('');
            }}
            onKeyDown={handleKeyDown}
            placeholder="colleague@company.com"
            className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent transition-all"
          />
          <button
            type="button"
            onClick={handleAddEmail}
            className="flex items-center gap-1.5 bg-brand-navy text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-navy-light transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        {emailError && <p className="text-xs text-status-error mt-1">{emailError}</p>}

        {config.teamEmails.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {config.teamEmails.map((email) => (
              <span
                key={email}
                className="flex items-center gap-1.5 bg-brand-navy-50 text-brand-navy text-xs font-medium px-3 py-1.5 rounded-full"
              >
                {email}
                <button
                  type="button"
                  onClick={() => handleRemoveEmail(email)}
                  className="text-brand-navy-300 hover:text-brand-navy transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 border border-border text-text-secondary py-3 px-5 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!config.name.trim() || !config.industry}
          className="flex-1 flex items-center justify-center gap-2 bg-brand-navy text-white py-3 px-6 rounded-xl font-semibold hover:bg-brand-navy-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Confirm ──────────────────────────────────────────────────────────

function StepConfirm({
  config,
  onStart,
  onBack,
}: {
  config: WorkspaceConfig;
  onStart: () => void;
  onBack: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);

  const planLabel = PLAN_OPTIONS.find((p) => p.id === config.plan)?.name ?? '';
  const planPrice = PLAN_OPTIONS.find((p) => p.id === config.plan)?.price ?? '';

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-bold text-text-primary mb-1">Confirm migration</h2>
        <p className="text-sm text-text-muted">
          Review your settings before starting the migration.
        </p>
      </div>

      {/* Workspace summary card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-brand-sm">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-4">
          Workspace Configuration
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">Name</span>
            <span className="text-sm font-semibold text-text-primary">{config.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">Plan</span>
            <span className="text-sm font-semibold text-text-primary">
              {planLabel}{' '}
              <span className="text-text-muted font-normal">({planPrice})</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">Industry</span>
            <span className="text-sm font-semibold text-text-primary">{config.industry}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">Team size</span>
            <span className="text-sm font-semibold text-text-primary">
              {config.teamEmails.length} invite{config.teamEmails.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Data to migrate */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-brand-sm">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-4">
          Data to migrate
        </p>
        <div className="space-y-2.5">
          {LEGACY_DATA.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.color}`}>
                  {item.icon}
                </div>
                <span className="text-sm text-text-secondary">{item.label}</span>
              </div>
              <span className="text-sm font-semibold text-text-primary">{item.count}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
          <span className="text-sm font-semibold text-text-primary">Total items</span>
          <span className="text-sm font-bold text-brand-navy">
            {LEGACY_DATA.reduce((acc, d) => acc + d.count, 0)}
          </span>
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 bg-status-warning-bg border border-status-warning-light rounded-xl p-4">
        <AlertTriangle className="w-5 h-5 text-status-warning mt-0.5 flex-shrink-0" />
        <p className="text-sm text-amber-800 leading-relaxed">
          <span className="font-semibold">This process cannot be undone.</span> All data will be
          moved to your new workspace. Your legacy account will be deactivated after migration.
        </p>
      </div>

      {/* Confirmation checkbox */}
      <label className="flex items-start gap-3 cursor-pointer">
        <div
          onClick={() => setConfirmed(!confirmed)}
          className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            confirmed ? 'bg-brand-navy border-brand-navy' : 'border-border'
          }`}
        >
          {confirmed && <Check className="w-3 h-3 text-white" />}
        </div>
        <span className="text-sm text-text-secondary leading-relaxed">
          I understand this will migrate all my data to the new workspace and deactivate my legacy
          account.
        </span>
      </label>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 border border-border text-text-secondary py-3 px-5 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onStart}
          disabled={!confirmed}
          className="flex-1 flex items-center justify-center gap-2 bg-brand-navy text-white py-3 px-6 rounded-xl font-semibold hover:bg-brand-navy-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Start Migration
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Migrating State ──────────────────────────────────────────────────────────

function MigratingState({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [entityIndex, setEntityIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const TOTAL_TICKS = 8;
    const TICK_MS = 500;
    let ticks = 0;

    intervalRef.current = setInterval(() => {
      ticks++;
      const newProgress = Math.min(Math.round((ticks / TOTAL_TICKS) * 100), 100);
      setProgress(newProgress);
      setEntityIndex(Math.min(Math.floor((ticks / TOTAL_TICKS) * MIGRATION_ENTITIES.length), MIGRATION_ENTITIES.length - 1));

      if (ticks >= TOTAL_TICKS) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTimeout(() => onComplete(), 600);
      }
    }, TICK_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onComplete]);

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8 animate-fade-in">
      {/* Circular progress ring */}
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="#001F54"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-brand-navy">{progress}%</span>
          <Loader2 className="w-4 h-4 text-text-muted animate-spin mt-1" />
        </div>
      </div>

      {/* Status text */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-text-primary">Migrating your data</h2>
        <p className="text-sm text-primary font-medium min-h-[20px] transition-all duration-300">
          {MIGRATION_ENTITIES[entityIndex]}
        </p>
        <p className="text-xs text-text-muted">Please do not close this window</p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-navy rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-text-muted">0</span>
          <span className="text-xs text-text-muted">
            {LEGACY_DATA.reduce((acc, d) => acc + d.count, 0)} items
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Complete State ───────────────────────────────────────────────────────────

function CompleteState() {
  return (
    <div className="flex flex-col items-center space-y-6 animate-fade-in-up py-4">
      {/* Success decoration */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-status-success-bg flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-status-success" />
        </div>
        {/* Decorative dots */}
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary opacity-60" />
        <div className="absolute -bottom-1 -left-2 w-3 h-3 rounded-full bg-brand-navy opacity-40" />
        <div className="absolute top-2 -left-3 w-2.5 h-2.5 rounded-full bg-status-warning opacity-50" />
        <div className="absolute bottom-2 -right-3 w-2 h-2 rounded-full bg-status-success opacity-70" />
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Migration Successful!</h2>
        <p className="text-sm text-text-muted">
          Your data has been moved to your new workspace. Welcome to Hey Creator!
        </p>
      </div>

      <MigrationSummary />

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <a
          href="/brands/dashboard"
          className="flex-1 flex items-center justify-center gap-2 bg-brand-navy text-white py-3 px-6 rounded-xl font-semibold hover:bg-brand-navy-light transition-colors text-sm"
        >
          Go to Workspace
          <ArrowRight className="w-4 h-4" />
        </a>
        <button
          type="button"
          className="flex items-center justify-center gap-2 border border-border text-text-secondary py-3 px-5 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
        >
          <FileBarChart2 className="w-4 h-4" />
          View Report
        </button>
      </div>
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export default function MigrationWizard() {
  const [step, setStep] = useState<MigrationStep>('review');
  const [workspaceConfig, setWorkspaceConfig] = useState<WorkspaceConfig>({
    name: 'Nike SA Hub',
    industry: 'Fashion & Apparel',
    plan: 'growth',
    teamEmails: [],
  });

  const isWizardStep = (s: MigrationStep): s is Exclude<MigrationStep, 'migrating' | 'complete'> =>
    s === 'review' || s === 'workspace' || s === 'confirm';

  return (
    <div className="min-h-screen bg-background flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-2xl">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-brand-lg p-6 sm:p-8">
          {/* Header */}
          {step !== 'migrating' && step !== 'complete' && (
            <div className="mb-2">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-xl bg-brand-navy flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-brand-navy">Data Migration</span>
              </div>
              {isWizardStep(step) && <StepIndicator currentStep={step} />}
            </div>
          )}

          {/* Step content */}
          {step === 'review' && (
            <StepReview onNext={() => setStep('workspace')} />
          )}

          {step === 'workspace' && (
            <StepWorkspace
              config={workspaceConfig}
              onChange={setWorkspaceConfig}
              onNext={() => setStep('confirm')}
              onBack={() => setStep('review')}
            />
          )}

          {step === 'confirm' && (
            <StepConfirm
              config={workspaceConfig}
              onStart={() => setStep('migrating')}
              onBack={() => setStep('workspace')}
            />
          )}

          {step === 'migrating' && (
            <MigratingState onComplete={() => setStep('complete')} />
          )}

          {step === 'complete' && <CompleteState />}
        </div>
      </div>
    </div>
  );
}
