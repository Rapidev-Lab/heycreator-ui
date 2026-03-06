'use client';

/**
 * Brand Applications Management Page
 *
 * Centralized view of all applications across all campaigns
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  FileText,
  Eye,
} from 'lucide-react';
import { Application, ApplicationStatus } from '@/types/campaign';
import { useAuth } from '@/lib/firebase/auth-context';

export default function BrandApplicationsPage() {
  const router = useRouter();
  const { user, firebaseUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | ApplicationStatus>('all');

  useEffect(() => {
    if (user && firebaseUser) {
      loadApplications();
    }
  }, [user, firebaseUser]);

  async function loadApplications() {
    if (!firebaseUser || !user) return;

    try {
      setLoading(true);

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      try {
        const token = await firebaseUser.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.warn('Failed to get ID token, using fallback auth:', error);
        headers['x-user-id'] = user.uid;
      }

      const response = await fetch('/api/applications', {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.data?.applications || []);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(
    applicationId: string,
    status: ApplicationStatus.ACCEPTED | ApplicationStatus.REJECTED
  ) {
    if (!firebaseUser || !user) return;

    try {
      let contractTerms = undefined;
      let rejectionReason = undefined;

      if (status === ApplicationStatus.ACCEPTED) {
        const application = applications.find((a) => a.id === applicationId);
        const agreedPrice = application?.proposedPrice || 5000;
        const agreedDeliveryDate = new Date();
        agreedDeliveryDate.setDate(agreedDeliveryDate.getDate() + 14);

        contractTerms = {
          agreedPrice: agreedPrice / 100,
          agreedDeliveryDate: agreedDeliveryDate.toISOString().split('T')[0],
        };
      } else {
        rejectionReason = 'Thank you for applying. We decided to go with other creators.';
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      try {
        const token = await firebaseUser.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.warn('Failed to get ID token, using fallback auth:', error);
        headers['x-user-id'] = user.uid;
      }

      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          status,
          contractTerms,
          rejectionReason,
        }),
      });

      if (response.ok) {
        await loadApplications();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to review application');
      }
    } catch (error) {
      console.error('Error reviewing application:', error);
      alert('Failed to review application');
    }
  }

  const filteredApplications =
    filter === 'all' ? applications : applications.filter((a) => a.status === filter);

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === ApplicationStatus.PENDING).length,
    underReview: applications.filter((a) => a.status === ApplicationStatus.UNDER_REVIEW).length,
    accepted: applications.filter((a) => a.status === ApplicationStatus.ACCEPTED).length,
    rejected: applications.filter((a) => a.status === ApplicationStatus.REJECTED).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy mx-auto" />
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Application Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Review and manage applications across all your campaigns
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="w-4 h-4" />
              Total
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              Pending
            </div>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Eye className="w-4 h-4" />
              Under Review
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.underReview}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4" />
              Accepted
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.accepted}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <XCircle className="w-4 h-4" />
              Rejected
            </div>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: ApplicationStatus.PENDING, label: 'Pending' },
                { value: ApplicationStatus.UNDER_REVIEW, label: 'Under Review' },
                { value: ApplicationStatus.ACCEPTED, label: 'Accepted' },
                { value: ApplicationStatus.REJECTED, label: 'Rejected' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value as any)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filter === option.value
                      ? 'bg-brand-navy text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No applications found</p>
              <p className="text-sm text-gray-500 mt-1">
                {filter === 'all'
                  ? 'Applications will appear here once creators apply to your campaigns'
                  : `No ${filter.replace('_', ' ')} applications yet`}
              </p>
            </div>
          ) : (
            filteredApplications.map((application) => (
              <div key={application.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.campaign?.title || 'Campaign'}
                      </h3>
                      <ApplicationStatusBadge status={application.status} />
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700">Pitch</h4>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-3">
                        {application.pitchMessage}
                      </p>
                    </div>

                    {application.proposedPrice && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700">Proposed Price</h4>
                        <p className="mt-1 text-sm text-gray-900 font-semibold">
                          R{(application.proposedPrice / 100).toLocaleString('en-ZA')}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                      <span>Applied {new Date(application.createdAt).toLocaleDateString()}</span>
                      <button
                        onClick={() => router.push(`/brands/campaigns/${application.campaignId}/dashboard`)}
                        className="text-brand-navy hover:underline"
                      >
                        View Campaign →
                      </button>
                    </div>
                  </div>

                  {application.status === ApplicationStatus.PENDING && (
                    <div className="ml-4 flex flex-col gap-2">
                      <button
                        onClick={() => handleReview(application.id, ApplicationStatus.ACCEPTED)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReview(application.id, ApplicationStatus.REJECTED)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const config: Record<
    ApplicationStatus,
    { bg: string; text: string; icon: React.ReactNode }
  > = {
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      icon: <Clock className="w-3 h-3 mr-1" />,
    },
    under_review: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      icon: <Eye className="w-3 h-3 mr-1" />,
    },
    accepted: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: <CheckCircle className="w-3 h-3 mr-1" />,
    },
    rejected: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      icon: <XCircle className="w-3 h-3 mr-1" />,
    },
    withdrawn: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      icon: <XCircle className="w-3 h-3 mr-1" />,
    },
    completed: {
      bg: 'bg-brand-navy-50',
      text: 'text-brand-navy',
      icon: <CheckCircle className="w-3 h-3 mr-1" />,
    },
  };

  const { bg, text, icon } = config[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}
    >
      {icon}
      {status.replace('_', ' ')}
    </span>
  );
}
