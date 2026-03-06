'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';
import { DeliverableStatus } from '@/types/campaign';
import ContentSubmissionCard, { ContentSubmission } from '@/components/campaigns/ContentSubmissionCard';
import ContentReviewModal from './ContentReviewModal';

type ContentFilterTab = 'all' | 'pending' | 'approved' | 'revisions';

interface ContentTabContentProps {
  campaignId: string;
  onStatusChange?: () => void;
}

function formatSubmittedDate(val: any): string {
  if (!val) return 'Unknown';
  try {
    const d = new Date(val);
    return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return 'Unknown';
  }
}

function mapDeliverableToSubmission(d: any): ContentSubmission {
  return {
    id: d.id,
    creatorName: d.creatorName || 'Creator',
    creatorAvatar: d.creatorAvatar || null,
    platform: d.platform || 'Instagram',
    postType: d.deliverableType || 'Post',
    submittedDate: formatSubmittedDate(d.submittedAt || d.createdAt),
    thumbnailUrl: d.contentScreenshots?.[0] || '',
    contentScreenshots: d.contentScreenshots || [],
    caption: d.caption || '',
    liveUrl: d.liveUrl || undefined,
    status: d.status as DeliverableStatus,
  };
}

export default function ContentTabContent({ campaignId, onStatusChange }: ContentTabContentProps) {
  const { firebaseUser } = useAuth();
  const [activeFilterTab, setActiveFilterTab] = useState<ContentFilterTab>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<ContentSubmission | null>(null);
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeliverables = useCallback(async () => {
    if (!firebaseUser || !campaignId) return;
    setLoading(true);
    setError(null);

    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`/api/deliverables?campaignId=${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to fetch deliverables');
      }

      const data = await res.json();
      console.log('[ContentTabContent] API response:', JSON.stringify(data, null, 2));
      if (data.success && data.data?.deliverables) {
        setSubmissions(data.data.deliverables.map(mapDeliverableToSubmission));
      } else {
        setSubmissions([]);
      }
    } catch (err: any) {
      console.error('Error fetching deliverables:', err);
      setError(err.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [firebaseUser, campaignId]);

  useEffect(() => {
    fetchDeliverables();
  }, [fetchDeliverables]);

  // Calculate counts
  const counts = {
    all: submissions.length,
    pending: submissions.filter(s => s.status === DeliverableStatus.SUBMITTED).length,
    approved: submissions.filter(s => s.status === DeliverableStatus.APPROVED || s.status === DeliverableStatus.COMPLETED).length,
    revisions: submissions.filter(s => s.status === DeliverableStatus.REJECTED || s.status === DeliverableStatus.REVISION_REQUESTED).length,
  };

  // Filter submissions
  const filteredSubmissions = submissions.filter(submission => {
    if (activeFilterTab === 'all') return true;
    if (activeFilterTab === 'pending') return submission.status === DeliverableStatus.SUBMITTED;
    if (activeFilterTab === 'approved') return submission.status === DeliverableStatus.APPROVED || submission.status === DeliverableStatus.COMPLETED;
    if (activeFilterTab === 'revisions') return submission.status === DeliverableStatus.REJECTED || submission.status === DeliverableStatus.REVISION_REQUESTED;
    return true;
  });

  const handleApprove = async (id: string) => {
    if (!firebaseUser) return;
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`/api/deliverables/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (res.ok) {
        setSubmissions(prev => prev.map(s =>
          s.id === id ? { ...s, status: DeliverableStatus.APPROVED } : s
        ));
        if (selectedSubmission?.id === id) {
          setSelectedSubmission(prev => prev ? { ...prev, status: DeliverableStatus.APPROVED } : null);
        }
        onStatusChange?.();
      }
    } catch (err) {
      console.error('Error approving deliverable:', err);
    }
  };

  const handleReject = async (id: string, notes?: string) => {
    if (!firebaseUser) return;
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`/api/deliverables/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'request_revision', revisionNotes: notes || 'Revision requested by brand.' }),
      });

      if (res.ok) {
        setSubmissions(prev => prev.map(s =>
          s.id === id ? { ...s, status: DeliverableStatus.REVISION_REQUESTED } : s
        ));
        if (selectedSubmission?.id === id) {
          setSelectedSubmission(prev => prev ? { ...prev, status: DeliverableStatus.REVISION_REQUESTED } : null);
        }
        onStatusChange?.();
      }
    } catch (err) {
      console.error('Error requesting revision:', err);
    }
  };

  const handleView = (submission: ContentSubmission) => {
    setSelectedSubmission(submission);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400 mr-2" />
        <span className="text-sm text-gray-500 font-medium">Loading content submissions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-red-500 font-medium">{error}</p>
        <button
          onClick={fetchDeliverables}
          className="mt-3 px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-semibold hover:bg-brand-navy-dark transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {counts.pending > 0 && (
        <div className="bg-[#FFF4E5] border border-[#FFE4C4] rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF9800] rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-brand-navy">
                {counts.pending} submission{counts.pending !== 1 ? 's' : ''} pending review
              </h4>
              <p className="text-xs text-gray-600">
                Review content to approve or request revisions
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveFilterTab('pending')}
            className="px-5 py-2.5 bg-[#FF6B35] text-white rounded-lg text-sm font-semibold hover:bg-[#E55A2B] transition-colors flex items-center gap-2"
          >
            Review
            <span className="text-lg">&rsaquo;</span>
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveFilterTab('all')}
              className={`px-6 py-3 text-sm font-semibold transition-colors ${
                activeFilterTab === 'all'
                  ? 'bg-[#4A90E2] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setActiveFilterTab('pending')}
              className={`px-6 py-3 text-sm font-semibold transition-colors ${
                activeFilterTab === 'pending'
                  ? 'bg-[#4A90E2] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Pending ({counts.pending})
            </button>
            <button
              onClick={() => setActiveFilterTab('approved')}
              className={`px-6 py-3 text-sm font-semibold transition-colors ${
                activeFilterTab === 'approved'
                  ? 'bg-[#4A90E2] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Approved ({counts.approved})
            </button>
            <button
              onClick={() => setActiveFilterTab('revisions')}
              className={`px-6 py-3 text-sm font-semibold transition-colors ${
                activeFilterTab === 'revisions'
                  ? 'bg-[#4A90E2] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Revisions ({counts.revisions})
            </button>
          </nav>
        </div>

        {/* Submissions Count */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-bold text-brand-navy">
            {filteredSubmissions.length} Submission{filteredSubmissions.length !== 1 ? 's' : ''}
          </h3>
        </div>

        {/* Submissions Grid */}
        <div className="p-6">
          {filteredSubmissions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSubmissions.map(submission => (
                <ContentSubmissionCard
                  key={submission.id}
                  submission={submission}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onView={handleView}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">No submissions found</p>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedSubmission && (
        <ContentReviewModal
          submission={selectedSubmission}
          allSubmissions={submissions}
          onClose={() => setSelectedSubmission(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onSelectSubmission={(s) => setSelectedSubmission(s)}
        />
      )}
    </div>
  );
}
