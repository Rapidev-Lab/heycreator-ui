'use client';

import { Clock, MapPin, DollarSign, Calendar, Users, CheckCircle, AlertCircle } from 'lucide-react';
import ViralityCTA from './ViralityCTA';

// ===== TYPES =====

interface Deliverable {
  type: string;
  quantity: number;
  description: string;
}

interface TargetAudience {
  ageRange: string;
  gender: string;
  locations: string[];
  interests: string[];
}

interface SharedCampaignViewProps {
  campaign: {
    name: string;
    brand: string;
    brandLogo?: string;
    description: string;
    status: string;
    platforms: string[];
    budget: string;
    startDate: string;
    endDate: string;
    deliverables: Deliverable[];
    targetAudience: TargetAudience;
    requirements: string[];
  };
  sharedBy: string;
  expiresAt: string | null;
}

// ===== HELPERS =====

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

function getPlatformColor(platform: string): string {
  const map: Record<string, string> = {
    Instagram: 'bg-pink-50 text-pink-700 border border-pink-200',
    TikTok: 'bg-slate-50 text-slate-700 border border-slate-200',
    YouTube: 'bg-red-50 text-red-700 border border-red-200',
    Twitter: 'bg-sky-50 text-sky-700 border border-sky-200',
    Facebook: 'bg-blue-50 text-blue-700 border border-blue-200',
    LinkedIn: 'bg-blue-50 text-blue-700 border border-blue-200',
  };
  return map[platform] ?? 'bg-gray-50 text-gray-700 border border-gray-200';
}

const DELIVERABLE_COLORS = [
  'bg-brand-navy/10 text-brand-navy',
  'bg-purple-100 text-purple-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-sky-100 text-sky-700',
];

// ===== QUICK FACT CARD =====

function FactCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
      <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-gray-900 mt-0.5 leading-tight">{value}</p>
      </div>
    </div>
  );
}

// ===== MAIN COMPONENT =====

export default function SharedCampaignView({
  campaign,
  sharedBy,
  expiresAt,
}: SharedCampaignViewProps) {
  const expired = isExpired(expiresAt);

  const brandInitial = campaign.brand.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Banner — "Shared by…" */}
      <div className="w-full bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-semibold text-gray-700 text-xs">HeyCreator</span>
            <span className="text-gray-300">/</span>
            <span className="text-xs">Shared by {sharedBy}</span>
          </div>
          {expiresAt && !expired && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              Expires {formatDate(expiresAt)}
            </div>
          )}
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 relative">
        {/* Expired Overlay */}
        {expired && (
          <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
            <div className="text-center px-6 py-10">
              <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">This link has expired</h2>
              <p className="text-sm text-gray-500">
                This shared link is no longer valid. Please contact the sender to get a new link.
              </p>
            </div>
          </div>
        )}

        {/* Campaign Header */}
        <div className={`mb-8 ${expired ? 'opacity-40 pointer-events-none select-none' : ''}`}>
          <div className="flex items-start gap-4">
            {/* Brand Avatar */}
            {campaign.brandLogo ? (
              <img
                src={campaign.brandLogo}
                alt={campaign.brand}
                className="w-14 h-14 rounded-xl object-cover border border-gray-200 flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-brand-navy/10 text-brand-navy flex items-center justify-center text-xl font-bold flex-shrink-0">
                {brandInitial}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-sm text-gray-500 font-medium">{campaign.brand}</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    campaign.status.toLowerCase() === 'active'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}
                >
                  {campaign.status}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {campaign.name}
              </h1>
              {/* Platform Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {campaign.platforms.map((p) => (
                  <span key={p} className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getPlatformColor(p)}`}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${expired ? 'opacity-40 pointer-events-none select-none' : ''}`}>
          {/* LEFT: 2/3 — Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                Campaign Brief
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">{campaign.description}</p>
            </div>

            {/* Deliverables */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                Deliverables
              </h2>
              <div className="space-y-3">
                {campaign.deliverables.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        DELIVERABLE_COLORS[i % DELIVERABLE_COLORS.length]
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-gray-900">{d.type}</span>
                        <span className="text-xs bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded-md font-medium">
                          x{d.quantity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{d.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                Requirements
              </h2>
              <ul className="space-y-2">
                {campaign.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RIGHT: 1/3 — Quick Facts */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">
                Campaign Details
              </h2>
              <div className="space-y-3">
                <FactCard
                  icon={<DollarSign className="w-4 h-4 text-green-600" />}
                  label="Budget"
                  value={campaign.budget}
                />
                <FactCard
                  icon={<Calendar className="w-4 h-4 text-brand-navy" />}
                  label="Start Date"
                  value={formatDate(campaign.startDate)}
                />
                <FactCard
                  icon={<Calendar className="w-4 h-4 text-gray-400" />}
                  label="End Date"
                  value={formatDate(campaign.endDate)}
                />
              </div>
            </div>

            {/* Target Audience */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">
                Target Audience
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Age Range</p>
                  <p className="text-sm font-semibold text-gray-800">{campaign.targetAudience.ageRange}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Gender</p>
                  <p className="text-sm font-semibold text-gray-800">{campaign.targetAudience.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1.5">Locations</p>
                  <div className="flex flex-wrap gap-1">
                    {campaign.targetAudience.locations.map((loc) => (
                      <span
                        key={loc}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-50 border border-gray-200 text-gray-700 rounded-full font-medium"
                      >
                        <MapPin className="w-2.5 h-2.5 text-gray-400" />
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1.5">Interests</p>
                  <div className="flex flex-wrap gap-1">
                    {campaign.targetAudience.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-2 py-0.5 text-xs bg-brand-navy/5 text-brand-navy border border-brand-navy/10 rounded-full font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Virality CTA Footer */}
        <div className="mt-10">
          <ViralityCTA />
        </div>
      </div>
    </div>
  );
}
