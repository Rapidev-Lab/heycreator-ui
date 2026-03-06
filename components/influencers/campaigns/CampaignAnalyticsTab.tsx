'use client';

import { useState, useMemo } from 'react';
import {
  FileText,
  Heart,
  Eye,
  Users,
  DollarSign,
  TrendingUp,
  ClipboardList,
  Plus,
  MapPin,
  Image as ImageIcon,
  Download,
  Instagram,
  Music2,
  Youtube,
  X as TwitterX,
  Facebook,
} from 'lucide-react';

interface CampaignAnalyticsTabProps {
  campaign: any;
}

/* ── Helpers ── */

function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return 'TBD';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'TBD';
  return `${String(date.getDate()).padStart(2, '0')} ${date.toLocaleDateString('en-GB', { month: 'short' })}, ${date.getFullYear()}`;
}

function formatCurrency(amount: number, currency: string = 'ZAR'): string {
  const symbol = currency === 'ZAR' ? 'R' : currency === 'USD' ? '$' : currency + ' ';
  return `${symbol} ${amount.toLocaleString('en-ZA')}`;
}

function formatCompact(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}m`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
  return num.toString();
}

function formatCompactUpper(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
}

/* ── Platform Icons (from MetricsTable pattern) ── */

function PlatformIcon({ platform }: { platform: string }) {
  const cls = 'w-4 h-4 fill-brand-navy';

  switch (platform) {
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cls}>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cls}>
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cls}>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case 'twitter':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cls}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cls}>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    default:
      return null;
  }
}

/* ── Constants ── */

const PLATFORM_TABS: { id: string; label: string; icon: React.ElementType }[] = [
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'tiktok', label: 'TikTok', icon: Music2 },
  { id: 'youtube', label: 'YouTube', icon: Youtube },
  { id: 'x', label: 'X', icon: TwitterX },
  { id: 'facebook', label: 'Facebook', icon: Facebook },
];

const PERFORMANCE_CARDS = [
  { key: 'posts', label: 'Posts', icon: FileText },
  { key: 'engagements', label: 'Engagements', icon: Heart },
  { key: 'potentialReach', label: 'Potential Reach', icon: Eye },
  { key: 'womenAudience', label: 'Women Audience', icon: Users },
  { key: 'emv', label: 'EMV', icon: DollarSign },
  { key: 'engagementRate', label: 'Engagement Rate', icon: TrendingUp },
] as const;

/* ── Main Component ── */

export default function CampaignAnalyticsTab({ campaign }: CampaignAnalyticsTabProps) {
  const [activePlatform, setActivePlatform] = useState('instagram');
  const [notes, setNotes] = useState<{ text: string; author: string; createdAt: string }[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState('');

  const analyticsData = useMemo(() => {
    const budget = campaign?.budget;
    const currency = budget?.currency || 'ZAR';
    const timeline = campaign?.timeline || {};
    const categories = campaign?.categories || [];
    const objectives = campaign?.objectives || [];
    const locationStr = campaign?.audience?.targetLocation || 'Cape Town, Johannesburg';
    const locations = locationStr.split(',').map((l: string) => l.trim()).filter(Boolean);

    return {
      summary: {
        title: campaign?.title || campaign?.campaignTitle || 'Campaign',
        subtitle: categories[0] || 'Digital Marketing',
        startDate: timeline.campaignStart,
        endDate: timeline.campaignEnd,
        postCount: campaign?.stats?.completedDeliverables || 4,
        creators: campaign?.stats?.acceptedApplications || 6,
        engagements: 123000,
        reach: 2000000,
        emv: budget?.fixedAmount ? Math.round(budget.fixedAmount * 3.2) : 3200000,
        currency,
        objectives: objectives.length > 0 ? objectives : ['Increase awareness', 'Brand sales for fragrances', 'Generate UGC content'],
        locations,
      },
      performance: {
        posts: 25,
        engagements: 192000,
        potentialReach: 123000,
        womenAudience: 83,
        emv: budget?.fixedAmount ? Math.round(budget.fixedAmount * 2.2) : 2200000,
        engagementRate: 4.8,
        currency,
      },
      metrics: [
        { network: 'Instagram', platform: 'instagram', followers: 116200, engagements: 10400, engRate: 3.60, reach: 9542.08, brand: 9030 },
        { network: 'TikTok', platform: 'tiktok', followers: 98000, engagements: 7206, engRate: 9.25, reach: 10055.97, brand: 8153 },
        { network: 'YouTube', platform: 'youtube', followers: 41200, engagements: 2520, engRate: 4.01, reach: 3109.87, brand: 4470 },
      ],
      demographics: {
        averageAge: 28,
        ageRanges: [
          { range: '18-24', percentage: 35 },
          { range: '25-34', percentage: 45 },
          { range: '35-44', percentage: 15 },
          { range: '45+', percentage: 5 },
        ],
        topCountries: [
          { country: 'South Africa', flag: '\u{1F1FF}\u{1F1E6}', percentage: 52.6 },
          { country: 'UK', flag: '\u{1F1EC}\u{1F1E7}', percentage: 23.8 },
          { country: 'USA', flag: '\u{1F1FA}\u{1F1F8}', percentage: 16.2 },
        ],
        interests: categories.length >= 3 ? categories.slice(0, 3) : ['Beauty', 'Skincare', 'Wellness'],
        brandAffinity: [
          { brand: 'Dior', percentage: 90 },
          { brand: "L'Or\u00e9al", percentage: 80 },
          { brand: 'Zara', percentage: 70 },
        ],
      },
      topContent: Array.from({ length: 6 }, (_, i) => ({
        id: `content-${i}`,
        thumbnail: campaign?.product?.productImagesUrls?.[i % (campaign?.product?.productImagesUrls?.length || 1)] || '',
      })),
    };
  }, [campaign]);

  function formatPerformanceValue(key: string, value: number): string {
    switch (key) {
      case 'posts':
        return value.toString();
      case 'engagements':
        return formatCompact(value);
      case 'potentialReach':
        return formatCompactUpper(value);
      case 'womenAudience':
        return `${value}%`;
      case 'emv':
        return `${analyticsData.performance.currency === 'ZAR' ? 'R' : '$'} ${formatCompact(value)}`;
      case 'engagementRate':
        return `${value}%`;
      default:
        return value.toString();
    }
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setNotes((prev) => [
      {
        text: newNote.trim(),
        author: 'You',
        createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      },
      ...prev,
    ]);
    setNewNote('');
    setIsAddingNote(false);
  };

  return (
    <div className="space-y-6">
      {/* ===== SECTION 1: CAMPAIGN SUMMARY ===== */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-brand-navy">
              {analyticsData.summary.title}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {analyticsData.summary.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button className="px-5 py-2.5 bg-brand-navy text-white text-sm font-semibold rounded-lg hover:bg-brand-navy-light transition-colors">
              Save Report
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 mt-5">
          <div>
            <p className="text-xs text-gray-500 mb-1">Start Date</p>
            <p className="text-sm font-bold text-brand-navy">
              {formatShortDate(analyticsData.summary.startDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">End Date</p>
            <p className="text-sm font-bold text-brand-navy">
              {formatShortDate(analyticsData.summary.endDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Post Count</p>
            <p className="text-sm font-bold text-brand-navy">
              {analyticsData.summary.postCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Creators</p>
            <p className="text-sm font-bold text-brand-navy">
              {analyticsData.summary.creators}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Engagements</p>
            <p className="text-sm font-bold text-brand-navy">
              {formatCompact(analyticsData.summary.engagements)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Reach</p>
            <p className="text-sm font-bold text-brand-navy">
              {formatCompact(analyticsData.summary.reach)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">EMV</p>
            <p className="text-sm font-bold text-brand-navy">
              {formatCurrency(analyticsData.summary.emv, analyticsData.summary.currency)}
            </p>
          </div>
        </div>

        {/* Objectives */}
        {analyticsData.summary.objectives.length > 0 && (
          <div className="mt-5">
            <p className="text-xs text-gray-500 mb-2">Objectives</p>
            <div className="flex flex-wrap gap-2">
              {analyticsData.summary.objectives.map((obj: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-brand-navy text-white text-xs font-medium rounded-full"
                >
                  {obj}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Locations */}
        {analyticsData.summary.locations.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Locations</p>
            <div className="flex items-center gap-1.5 text-sm text-brand-navy">
              <MapPin className="w-4 h-4 text-gray-400" />
              {analyticsData.summary.locations.join(', ')}
            </div>
          </div>
        )}
      </div>

      {/* ===== SECTION 2: PERFORMANCE SUMMARY ===== */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-base font-bold text-brand-navy mb-4">
          Performance Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PERFORMANCE_CARDS.map((card) => {
            const Icon = card.icon;
            const value = analyticsData.performance[card.key as keyof typeof analyticsData.performance] as number;
            return (
              <div key={card.key} className="bg-[#F8F9FD] rounded-[10px] border border-[#E0E0E0] p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-gray-400" />
                  <p className="text-[11px] text-gray-500 uppercase tracking-wide font-medium">
                    {card.label}
                  </p>
                </div>
                <p className="text-lg font-bold text-brand-navy">
                  {formatPerformanceValue(card.key, value)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== SECTION 3: AVERAGE METRICS ===== */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-base font-bold text-brand-navy mb-4">
          Average Metrics
        </h3>

        {/* Platform filter tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {PLATFORM_TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activePlatform === id;
            return (
              <button
                key={id}
                onClick={() => setActivePlatform(id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#FF385C] text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            );
          })}
        </div>

        {/* Data table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 pr-4">
                  Network
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 pr-4">
                  Followers
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 pr-4">
                  Engagements
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 pr-4">
                  Eng Rate
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3 pr-4">
                  Reach
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase pb-3">
                  Brand
                </th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.metrics.map((row) => (
                <tr
                  key={row.platform}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={row.platform} />
                      <span className="text-sm font-medium text-brand-navy">
                        {row.network}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className="text-sm text-brand-navy">
                      {row.followers.toLocaleString('en-ZA', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className="text-sm text-brand-navy">
                      {row.engagements.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className="text-sm text-brand-navy">
                      {row.engRate.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className="text-sm text-brand-navy">
                      {row.reach.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className="text-sm text-brand-navy">
                      {row.brand.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== SECTION 4: AUDIENCE DEMOGRAPHICS ===== */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-base font-bold text-brand-navy mb-5">
          Audience Demographics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Average Age */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-brand-navy">Average Age</h4>
              <span className="text-3xl font-bold text-brand-navy">
                {analyticsData.demographics.averageAge}
              </span>
            </div>
            <div className="space-y-3">
              {analyticsData.demographics.ageRanges.map((range) => (
                <div key={range.range}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">{range.range}</span>
                    <span className="text-xs font-semibold text-gray-700">
                      {range.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-brand-navy"
                      style={{ width: `${range.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Countries */}
          <div>
            <h4 className="text-sm font-semibold text-brand-navy mb-4">
              Top Countries
            </h4>
            <div className="space-y-4">
              {analyticsData.demographics.topCountries.map((country, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{country.flag}</span>
                    <span className="text-sm text-gray-700">{country.country}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {country.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Audience Interests */}
          <div>
            <h4 className="text-sm font-semibold text-brand-navy mb-3">
              Audience Interests
            </h4>
            <div className="flex flex-wrap gap-2">
              {analyticsData.demographics.interests.map((interest: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-gray-100 text-brand-navy text-xs font-medium rounded-full"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Brand Affinity */}
          <div>
            <h4 className="text-sm font-semibold text-brand-navy mb-3">
              Brand Affinity
            </h4>
            <div className="space-y-3">
              {analyticsData.demographics.brandAffinity.map((item) => (
                <div key={item.brand}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{item.brand}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {item.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-brand-navy"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== SECTION 5: TOP PERFORMING CONTENT ===== */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-brand-navy">
            Top Performing Content
          </h3>
          <button className="text-sm text-brand-navy hover:underline font-medium">
            View All
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {analyticsData.topContent.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-36 h-36 rounded-xl overflow-hidden bg-gray-100"
            >
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ===== SECTION 6: INTERNAL NOTES ===== */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-gray-700" />
            <h3 className="text-base font-bold text-brand-navy">
              Internal Notes
            </h3>
            <span className="text-sm text-gray-400">({notes.length})</span>
          </div>
          <button
            onClick={() => setIsAddingNote(true)}
            className="flex items-center gap-1 text-sm font-medium text-brand-navy hover:text-brand-navy-light transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>

        {/* Add note form */}
        {isAddingNote && (
          <div className="mb-4 border border-gray-200 rounded-xl p-4">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write your note here..."
              className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent"
              rows={3}
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => { setIsAddingNote(false); setNewNote(''); }}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-navy rounded-lg hover:bg-brand-navy-light transition-colors disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Notes list */}
        {notes.length > 0 ? (
          <div className="space-y-3">
            {notes.map((note, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-xl p-4"
              >
                <p className="text-sm text-gray-700">{note.text}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-500">{note.author}</span>
                  <span className="text-xs text-gray-300">|</span>
                  <span className="text-xs text-gray-500">{note.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isAddingNote && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">
                No internal notes yet. Click &quot;Add New&quot; to create one.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
