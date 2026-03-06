'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Clipboard,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { useApplications } from '@/lib/hooks/useApplications';
import { applyFilters, type FilterValues } from '@/components/influencers/campaigns/CampaignSearchFilters';
import PaginationBar from '@/components/ui/PaginationBar';
import type { ApplicationStatus } from '@/components/ui/CampaignApplicationCard';

function formatOffer(amount: number, currency: string): string {
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

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const config: Record<string, { label: string; textColor: string; bgColor: string }> = {
    accepted: { label: 'Approved', textColor: 'text-green-700', bgColor: 'bg-green-100' },
    pending: { label: 'Pending', textColor: 'text-orange-700', bgColor: 'bg-orange-100' },
    declined: { label: 'Rejected', textColor: 'text-red-700', bgColor: 'bg-red-100' },
    expired: { label: 'Expired', textColor: 'text-gray-600', bgColor: 'bg-gray-100' },
    'counter-offer': { label: 'Counter-Offer', textColor: 'text-amber-700', bgColor: 'bg-amber-100' },
  };
  const { label, textColor, bgColor } = config[status] || config.pending;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 ${bgColor} ${textColor} text-xs font-medium rounded-full`}>
      {label}
    </span>
  );
}

interface ApplicationsTableTabProps {
  searchQuery: string;
  dropdownFilters: FilterValues;
}

export default function ApplicationsTableTab({
  searchQuery,
  dropdownFilters,
}: ApplicationsTableTabProps) {
  const router = useRouter();
  const {
    filteredApplications,
    isLoading,
    error,
  } = useApplications();

  const [currentPage, setCurrentPage] = useState(0);

  // Reset page when search/filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, dropdownFilters]);

  const displayApplications = useMemo(() => {
    // Apply dropdown filters first
    let result = applyFilters(filteredApplications, dropdownFilters);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (app) =>
          app.title.toLowerCase().includes(q) ||
          app.brandName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [filteredApplications, searchQuery, dropdownFilters]);

  return (
    <>
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-5">
        <span className="w-2 h-2 rounded-full bg-blue-500" />
        <span className="text-lg font-bold text-brand-navy">Your Applications</span>
      </div>

      {/* Loading State — skeleton rows */}
      {isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-32" />
                </div>
                <div className="h-6 bg-gray-100 rounded-full w-20" />
                <div className="h-4 bg-gray-100 rounded w-24" />
                <div className="h-4 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-3">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && displayApplications.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Clipboard className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Found</h3>
          <p className="text-gray-600 mb-4">
            You haven&apos;t applied to any campaigns yet
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
      {!isLoading && !error && displayApplications.length > 0 && (
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
                    Offer
                  </th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">
                    Status
                  </th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">
                    Due Date
                  </th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3 max-w-[220px]">
                    Message
                  </th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayApplications.slice(currentPage * 6, (currentPage + 1) * 6).map((app) => {
                  const imgSrc = app.productImageUrl || app.brandLogo;
                  const initials = app.brandName
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();

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

                      {/* Offer */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-green-600">
                          {formatOffer(app.yourBid || app.budgetMax, app.currency || 'ZAR')}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={app.status} />
                      </td>

                      {/* Due Date */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-600">
                          {app.applicationDeadlineDate || formatDate(app.endDate)}
                        </span>
                      </td>

                      {/* Message */}
                      <td className="px-5 py-4 max-w-[220px]">
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {app.pitchMessage || '—'}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            disabled
                            title="Chat (coming soon)"
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center cursor-not-allowed"
                          >
                            <MessageSquare className="w-4 h-4 text-gray-300" />
                          </button>
                          <button
                            onClick={() => {
                              if (app.status === 'accepted') {
                                router.push(`/influencers/campaigns/${app.campaignId}`);
                              } else {
                                router.push(`/influencers/marketplace/${app.campaignId}`);
                              }
                            }}
                            title="View Campaign"
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            <ArrowRight className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
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
              totalCount={displayApplications.length}
              pageSize={6}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}
    </>
  );
}
