'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Loader2,
  Clipboard,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Filter,
  Search,
  AlertTriangle,
} from 'lucide-react';
import ProfileCompletionGuard from '@/components/auth/ProfileCompletionGuard';
import EmailVerificationGuard from '@/components/auth/EmailVerificationGuard';
import CampaignApplicationCard from '@/components/ui/CampaignApplicationCard';
import { useAuth } from '@/lib/firebase/auth-context';
import type { ApplicationStatus, CampaignApplicationData } from '@/components/ui/CampaignApplicationCard';

// Prevent static rendering
export const dynamic = 'force-dynamic';

type FilterStatus = 'all' | 'pending' | 'accepted' | 'declined' | 'withdrawn';

function MyApplicationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { firebaseUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<CampaignApplicationData[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0, withdrawn: 0 });
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<string>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    if (!firebaseUser) return;
    setIsLoading(true);
    setError(null);

    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch('/api/influencers/applications?limit=50', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to load applications');
        return;
      }

      if (data.data) {
        // Map API response to CampaignApplicationData format
        const mapped: CampaignApplicationData[] = data.data.applications.map((app: any) => {
          const campaign = app.campaign || {};
          const budget = campaign.budget || {};
          const budgetMin = budget.compensationModel === 'range' ? budget.minRangeAmount : budget.fixedAmount;
          const budgetMax = budget.compensationModel === 'range' ? budget.maxRangeAmount : budget.fixedAmount;

          // Map API status to card status
          let cardStatus: ApplicationStatus = 'pending';
          if (app.status === 'accepted') cardStatus = 'accepted';
          else if (app.status === 'rejected') cardStatus = 'declined';
          else if (app.status === 'withdrawn') cardStatus = 'expired';

          // Format dates
          const startDate = campaign.timeline?.campaignStart
            ? new Date(campaign.timeline.campaignStart).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'TBD';
          const endDate = campaign.timeline?.campaignEnd
            ? new Date(campaign.timeline.campaignEnd).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'TBD';

          // Days remaining for deadline
          const deadlineStr = budget.applicationDeadline;
          let daysRemaining = 0;
          if (deadlineStr) {
            const diff = Math.ceil((new Date(deadlineStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            daysRemaining = Math.max(0, diff);
          }

          return {
            id: app.id,
            campaignId: campaign.id || app.campaignId || '',
            title: campaign.title || 'Unknown Campaign',
            brandName: campaign.brandName || 'Unknown Brand',
            brandLogo: campaign.brandLogo || '',
            category: (campaign.categories || [])[0] || 'Campaign',
            tags: (campaign.categories || []).slice(1, 3),
            yourBid: app.proposedRate || 0,
            budgetMin: budgetMin || 0,
            budgetMax: budgetMax || 0,
            status: cardStatus,
            daysRemaining,
            startDate,
            endDate,
            appliedAt: app.appliedAt || null,
          };
        });

        setApplications(mapped);
        setStats(data.data.stats || { total: 0, pending: 0, accepted: 0, rejected: 0, withdrawn: 0 });
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [firebaseUser]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Client-side filter
  const filteredApplications = applications.filter((app) => {
    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'declined') {
        if (app.status !== 'declined') return false;
      } else if (statusFilter === 'withdrawn') {
        if (app.status !== 'expired') return false;
      } else if (app.status !== statusFilter) return false;
    }
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return app.title.toLowerCase().includes(q) || app.brandName.toLowerCase().includes(q);
    }
    return true;
  });

  // Client-side sort using actual dates
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    const dateA = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
    const dateB = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
    if (sortBy === 'oldest') return dateA - dateB;
    return dateB - dateA;
  });

  const handleView = (campaignId: string, status?: ApplicationStatus) => {
    if (status === 'accepted') {
      router.push(`/influencers/campaigns/${campaignId}`);
    } else {
      router.push(`/influencers/marketplace/${campaignId}`);
    }
  };

  const handleWithdraw = async (applicationId: string) => {
    if (withdrawingId) return;
    if (!confirm('Are you sure you want to withdraw this application?')) return;

    setWithdrawingId(applicationId);
    try {
      const token = await firebaseUser?.getIdToken();
      const res = await fetch(`/api/influencers/applications/${applicationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to withdraw application');
        return;
      }
      // Refresh the list
      fetchApplications();
    } catch (err) {
      console.error('Error withdrawing application:', err);
      setError('Failed to withdraw application. Please try again.');
    } finally {
      setWithdrawingId(null);
    }
  };

  const successRate = stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0;

  return (
    <ProfileCompletionGuard>
      <EmailVerificationGuard>
        <div className="min-h-screen bg-white">
          {/* Success Banner */}
          {showSuccess && (
            <div className="bg-green-50 border-b border-green-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mr-3" />
                  <p className="text-sm text-green-800 font-medium">
                    Application submitted successfully!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-6 lg:px-8 py-6">
            {/* Page Title */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-brand-navy">My Campaigns</h1>
              <p className="text-sm text-gray-500 mt-1">Track and manage your campaign applications</p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span className="text-sm">{error}</span>
                <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700 text-sm font-medium">
                  Dismiss
                </button>
              </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 uppercase tracking-wide font-medium mb-1">
                  <Clipboard className="w-3.5 h-3.5" />
                  Total
                </div>
                <p className="text-2xl font-bold text-brand-navy">{stats.total}</p>
              </div>
              <div className="bg-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 uppercase tracking-wide font-medium mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  Pending
                </div>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="bg-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 uppercase tracking-wide font-medium mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Accepted
                </div>
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <div className="bg-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 uppercase tracking-wide font-medium mb-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Success Rate
                </div>
                <p className="text-2xl font-bold text-brand-navy">{successRate}%</p>
              </div>
            </div>
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-transparent text-sm"
              />
            </div>
            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {([
                    { value: 'all', label: 'All' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'accepted', label: 'Accepted' },
                    { value: 'declined', label: 'Rejected' },
                    { value: 'withdrawn', label: 'Withdrawn' },
                  ] as { value: FilterStatus; label: string }[]).map(option => (
                    <button
                      key={option.value}
                      onClick={() => setStatusFilter(option.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${statusFilter === option.value
                          ? 'bg-brand-navy text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="sm:ml-auto flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy"
                  >
                    <option value="latest">Latest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-brand-navy animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading applications...</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && sortedApplications.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Clipboard className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Found</h3>
                <p className="text-gray-600 mb-4">
                  {statusFilter !== 'all'
                    ? `You don't have any ${statusFilter} applications yet`
                    : "You haven't applied to any campaigns yet"}
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

            {/* Applications List */}
            {!isLoading && sortedApplications.length > 0 && (
              <div className="space-y-4">
                {sortedApplications.map(application => (
                  <CampaignApplicationCard
                    key={application.id}
                    application={application}
                    onView={() => handleView(application.campaignId, application.status)}
                    onWithdraw={application.status === 'pending' ? () => handleWithdraw(application.id) : undefined}
                    isWithdrawing={withdrawingId === application.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </EmailVerificationGuard>
    </ProfileCompletionGuard>
  );
}

// Wrapper component with Suspense boundary
export default function MyApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-brand-navy animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading applications...</p>
          </div>
        </div>
      }
    >
      <MyApplicationsContent />
    </Suspense>
  );
}
