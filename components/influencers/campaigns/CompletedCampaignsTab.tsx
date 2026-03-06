'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Clipboard,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  DollarSign,
  Users,
} from 'lucide-react';
import { useApplications } from '@/lib/hooks/useApplications';
import { applyFilters, type FilterValues } from '@/components/influencers/campaigns/CampaignSearchFilters';
import PaginationBar from '@/components/ui/PaginationBar';
import type { CampaignApplicationData } from '@/components/ui/CampaignApplicationCard';

function formatEarnings(amount: number, currency: string): string {
  if (!amount) return '—';
  const symbol = currency === 'ZAR' ? 'R' : currency === 'USD' ? '$' : currency;
  return `${symbol}${Number(amount).toLocaleString('en-ZA')}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr || dateStr === 'TBD') return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-ZA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function CompletedStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; textColor: string; bgColor: string }> = {
    'In Progress': { label: 'In Progress', textColor: 'text-blue-700', bgColor: 'bg-blue-100' },
    Completed: { label: 'Completed', textColor: 'text-green-700', bgColor: 'bg-green-100' },
    Scheduled: { label: 'Scheduled', textColor: 'text-amber-700', bgColor: 'bg-amber-100' },
    Pending: { label: 'Pending', textColor: 'text-gray-600', bgColor: 'bg-gray-100' },
  };
  const { label, textColor, bgColor } = config[status] || config.Pending;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 ${bgColor} ${textColor} text-xs font-medium rounded-full`}>
      {label}
    </span>
  );
}

function getCompletedStatus(app: CampaignApplicationData): string {
  const campStatus = (app.campaignStatus || '').toLowerCase();
  if (campStatus === 'completed') return 'Completed';
  if (campStatus === 'active' || campStatus === 'published') return 'In Progress';
  if (campStatus === 'scheduled') return 'Scheduled';
  return 'Pending';
}

interface CompletedCampaignsTabProps {
  searchQuery: string;
  dropdownFilters: FilterValues;
  onSwitchTab?: (tab: string) => void;
}

export default function CompletedCampaignsTab({
  searchQuery,
  dropdownFilters,
  onSwitchTab,
}: CompletedCampaignsTabProps) {
  const router = useRouter();
  const { applications, isLoading, error } = useApplications();
  const [currentPage, setCurrentPage] = useState(0);

  // Reset page when search/filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, dropdownFilters]);

  // All accepted applications
  const acceptedApps = useMemo(() => {
    return applications.filter((app) => app.status === 'accepted');
  }, [applications]);

  // Filter for completed/accepted campaigns
  const completedCampaigns = useMemo(() => {
    // Apply dropdown filters with campaignEndDate
    let completed = applyFilters(acceptedApps, dropdownFilters, 'campaignEndDate');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      completed = completed.filter(
        (app) =>
          app.title.toLowerCase().includes(q) ||
          app.brandName.toLowerCase().includes(q)
      );
    }

    return completed;
  }, [acceptedApps, searchQuery, dropdownFilters]);

  // Stats
  const activeCount = useMemo(() => {
    return applications.filter(
      (app) =>
        app.status === 'accepted' &&
        (app.campaignStatus || '').toLowerCase() !== 'completed'
    ).length;
  }, [applications]);

  const completedCount = useMemo(() => {
    return applications.filter(
      (app) =>
        app.status === 'accepted' &&
        (app.campaignStatus || '').toLowerCase() === 'completed'
    ).length;
  }, [applications]);

  const totalEarnings = useMemo(() => {
    return applications
      .filter((app) => app.status === 'accepted')
      .reduce((sum, app) => sum + (app.yourBid || app.budgetMax || 0), 0);
  }, [applications]);

  return (
    <>
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-5">
        <span className="w-2 h-2 rounded-full bg-blue-500" />
        <span className="text-lg font-bold text-brand-navy">All completed campaigns</span>
      </div>

      {/* Campaigns Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-brand-navy mb-4">Campaigns Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-xl p-4 bg-[#F8F9FD]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-3 h-3 rounded-full border-2 border-blue-500" />
                Active Campaigns
              </div>
              <button
                onClick={() => onSwitchTab?.('active')}
                className="text-xs font-medium text-[#FF385C] hover:underline"
              >
                View all
              </button>
            </div>
            <p className="text-3xl font-bold text-brand-navy">{activeCount}</p>
          </div>

          <div className="border border-gray-200 rounded-xl p-4 bg-[#F8F9FD]">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Completed Campaigns
            </div>
            <p className="text-3xl font-bold text-brand-navy">{completedCount}</p>
          </div>

          <div className="border border-gray-200 rounded-xl p-4 bg-[#F8F9FD]">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Users className="w-3.5 h-3.5" />
              Total earnings
            </div>
            <p className="text-3xl font-bold text-brand-navy">
              R {totalEarnings.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Loading State — skeleton cards */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-5/6 mb-4" />
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="h-5 bg-gray-200 rounded w-24" />
                <div className="h-6 bg-green-100 rounded-full w-24" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-3">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && completedCampaigns.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Clipboard className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Completed Campaigns</h3>
          <p className="text-gray-600 mb-4">
            You don&apos;t have any completed campaigns yet
          </p>
          <button
            onClick={() => router.push('/influencers/marketplace')}
            className="inline-flex items-center px-6 py-2 bg-brand-navy text-white rounded-full hover:bg-brand-navy-light transition-colors"
          >
            Browse Campaigns
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && completedCampaigns.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">
                    Profile
                  </th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">
                    Campaign Name
                  </th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">
                    Earnings
                  </th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">
                    Status
                  </th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">
                    Due Date
                  </th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">
                    Date Completed
                  </th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {completedCampaigns.slice(currentPage * 6, (currentPage + 1) * 6).map((app) => {
                  const imgSrc = app.productImageUrl || app.brandLogo;
                  const initials = app.brandName
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();
                  const displayStatus = getCompletedStatus(app);

                  return (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      {/* Profile */}
                      <td className="px-5 py-4">
                        {imgSrc ? (
                          <img
                            src={`/api/image-proxy?url=${encodeURIComponent(imgSrc)}`}
                            alt=""
                            className="w-11 h-11 rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-500 ${imgSrc ? 'hidden' : ''}`}
                        >
                          {initials}
                        </div>
                      </td>

                      {/* Campaign Name */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-brand-navy leading-tight">
                          {app.title}
                        </p>
                        <p className="text-xs text-[#FF385C] mt-0.5">{app.brandName}</p>
                      </td>

                      {/* Earnings */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-green-600">
                          {formatEarnings(app.yourBid || app.budgetMax, app.currency || 'ZAR')}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <CompletedStatusBadge status={displayStatus} />
                      </td>

                      {/* Due Date */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-600">
                          {formatDate(app.endDate)}
                        </span>
                      </td>

                      {/* Date Completed */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-600">
                          {app.reviewedAt ? formatDate(app.reviewedAt) : '—'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() => router.push(`/influencers/campaigns/${app.campaignId}`)}
                          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                        >
                          View details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 pb-4">
            <PaginationBar
              currentPage={currentPage}
              totalCount={completedCampaigns.length}
              pageSize={6}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}
    </>
  );
}
