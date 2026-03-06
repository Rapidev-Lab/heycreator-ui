'use client';

import { useState } from 'react';
import { Globe, Check, Settings } from 'lucide-react';
import { useWorkspace } from '@/lib/context/workspace-context';
import type { IndustryType, CompanySize } from '@/types/firebase';
import type { SupportedCurrency } from '@/types/workspace';

// ===== CONSTANTS =====

const INDUSTRIES: IndustryType[] = [
  'Fashion', 'Beauty', 'Food & Beverage', 'Technology', 'Travel',
  'Fitness', 'Gaming', 'Education', 'E-commerce', 'Other',
];

const COMPANY_SIZES: { value: CompanySize; label: string }[] = [
  { value: '1-10', label: '1–10 employees' },
  { value: '11-50', label: '11–50 employees' },
  { value: '51-200', label: '51–200 employees' },
  { value: '201-1000', label: '201–1,000 employees' },
  { value: '1000+', label: '1,000+ employees' },
];

const CURRENCIES: { value: SupportedCurrency; label: string; flag: string }[] = [
  { value: 'ZAR', label: 'South African Rand', flag: '🇿🇦' },
  { value: 'USD', label: 'US Dollar', flag: '🇺🇸' },
  { value: 'EUR', label: 'Euro', flag: '🇪🇺' },
  { value: 'GBP', label: 'British Pound', flag: '🇬🇧' },
];

// ===== COMPONENT =====

export default function GeneralTab() {
  const { currentWorkspace, userRole } = useWorkspace();
  const isOwner = userRole === 'owner';

  const ws = currentWorkspace;
  const [name, setName] = useState(ws?.name ?? '');
  const [brandName, setBrandName] = useState(ws?.brandName ?? '');
  const [website, setWebsite] = useState(ws?.website ?? '');
  const [industry, setIndustry] = useState<IndustryType>(ws?.industry ?? 'Other');
  const [companySize, setCompanySize] = useState<CompanySize>(ws?.companySize ?? '1-10');
  const [currency, setCurrency] = useState<SupportedCurrency>(ws?.settings.currency ?? 'ZAR');
  const [brandColor, setBrandColor] = useState(ws?.settings.brandColor ?? '#001F54');
  const [notifications, setNotifications] = useState(ws?.settings.notificationsEnabled ?? true);
  const [weeklyDigest, setWeeklyDigest] = useState(ws?.settings.weeklyDigest ?? true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // TODO: persist to Firestore via API
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!ws) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
        <Settings className="w-10 h-10" />
        <p className="text-sm">No workspace selected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Workspace Identity */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 mb-1">Workspace Identity</h3>
        <p className="text-sm text-gray-500 mb-4">Basic information about your workspace</p>
        <div className="space-y-4">
          {/* Workspace Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Workspace Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isOwner}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
            />
          </div>

          {/* Brand Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand Name
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              disabled={!isOwner}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
            />
          </div>

          {/* Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  disabled={!isOwner}
                  placeholder="https://example.com"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value as IndustryType)}
                disabled={!isOwner}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none bg-white disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Company Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
            <select
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value as CompanySize)}
              disabled={!isOwner}
              className="w-full sm:w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none bg-white disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {COMPANY_SIZES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 mb-1">Preferences</h3>
        <p className="text-sm text-gray-500 mb-4">Customize your workspace experience</p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
                disabled={!isOwner}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none bg-white disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.flag} {c.value} &mdash; {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  disabled={!isOwner}
                  className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer disabled:cursor-not-allowed"
                />
                <input
                  type="text"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  disabled={!isOwner}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Notification Toggles */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Workspace Notifications</p>
                <p className="text-xs text-gray-400">Receive alerts for team activity</p>
              </div>
              <button
                onClick={() => isOwner && setNotifications(!notifications)}
                disabled={!isOwner}
                aria-pressed={notifications}
                className={[
                  'relative w-11 h-6 rounded-full transition-colors',
                  notifications ? 'bg-brand-navy' : 'bg-gray-200',
                  !isOwner ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                ].join(' ')}
              >
                <div
                  className={[
                    'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                    notifications ? 'translate-x-[22px]' : 'translate-x-0.5',
                  ].join(' ')}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Weekly Digest</p>
                <p className="text-xs text-gray-400">Summary email every Monday</p>
              </div>
              <button
                onClick={() => isOwner && setWeeklyDigest(!weeklyDigest)}
                disabled={!isOwner}
                aria-pressed={weeklyDigest}
                className={[
                  'relative w-11 h-6 rounded-full transition-colors',
                  weeklyDigest ? 'bg-brand-navy' : 'bg-gray-200',
                  !isOwner ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                ].join(' ')}
              >
                <div
                  className={[
                    'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                    weeklyDigest ? 'translate-x-[22px]' : 'translate-x-0.5',
                  ].join(' ')}
                />
              </button>
            </div>
          </div>
        </div>
      </section>

      {isOwner && (
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-navy text-white rounded-lg text-sm font-semibold hover:bg-brand-navy/90 transition-colors"
          >
            {saved && <Check className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}
