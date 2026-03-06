"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, X, Check, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import InviteRow from "./InviteRow";
import ApplicationRow from "./ApplicationRow";
import ApprovedRow from "./ApprovedRow";
import PublishedRow from "./PublishedRow";
import { Campaign } from "@/types/campaign";
import { InfluencerBid } from "@/types/influencer-bid";
import { auth } from "@/lib/firebase/config";

interface Invitation {
  id: string;
  campaignId: string;
  influencerId: string;
  brandId: string;
  status: "sent" | "accepted" | "rejected";
  message: string | null;
  invitedAt: string | null;
  influencer: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    totalFollowers: number;
    engagementRate: number;
    socialStats: { platform: string; followers: number }[];
  } | null;
}

interface InfluencersTabContentProps {
  activeSubTab: string;
  campaignId: string;
  onStatsChange?: () => void;
}

export default function InfluencersTabContent({
  activeSubTab,
  campaignId,
  onStatsChange,
}: InfluencersTabContentProps) {
  const { firebaseUser } = useAuth();
  const currentTab = activeSubTab?.toUpperCase() || "INVITES";
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ type: 'accept' | 'decline'; applicationId: string; name: string } | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  const fetchApplications = useCallback(async () => {
    if (!firebaseUser || !campaignId) return;
    setIsLoading(true);

    try {
      const token = await firebaseUser.getIdToken();
      // Map sub-tab to status filter
      let statusParam = '';
      if (currentTab === 'APPLICATIONS') statusParam = '?status=pending';
      else if (currentTab === 'APPROVED') statusParam = '?status=accepted';
      else if (currentTab === 'PUBLISHED') statusParam = '?status=accepted';

      const res = await fetch(
        `/api/brands/campaigns/${campaignId}/applications${statusParam}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          let apps = data.data?.applications || [];

          // For PUBLISHED tab, enrich with deliverable data and filter
          if (currentTab === 'PUBLISHED' && apps.length > 0) {
            const delRes = await fetch(
              `/api/deliverables?campaignId=${campaignId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (delRes.ok) {
              const delData = await delRes.json();
              const deliverables = delData.data?.deliverables || delData.deliverables || [];

              // Group deliverables by applicationId
              const delByApp: Record<string, any[]> = {};
              deliverables.forEach((d: any) => {
                const appId = d.applicationId;
                if (!appId) return;
                if (!delByApp[appId]) delByApp[appId] = [];
                delByApp[appId].push(d);
              });

              // Enrich apps with deliverable counts
              apps = apps.map((app: any) => {
                const appDels = delByApp[app.id] || [];
                const completed = appDels.filter((d: any) => d.status === 'completed').length;
                return { ...app, _totalDeliverables: appDels.length, _completedDeliverables: completed };
              });

              // Only show apps that have at least one completed deliverable
              apps = apps.filter((app: any) => app._completedDeliverables > 0);
            }
          }

          setApplications(apps);
        }
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [firebaseUser, campaignId, currentTab]);

  const fetchInvitations = useCallback(async () => {
    if (!firebaseUser || !campaignId) return;
    setIsLoading(true);

    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(
        `/api/campaigns/${campaignId}/invitations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setApplications(data.data?.invitations || []);
        }
      }
    } catch (err) {
      console.error('Error fetching invitations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [firebaseUser, campaignId]);

  useEffect(() => {
    if (currentTab === 'INVITES') {
      fetchInvitations();
      return;
    }
    fetchApplications();
  }, [fetchApplications, fetchInvitations, currentTab]);

  // Show confirmation modal instead of acting directly
  const handleApprove = (applicationId: string) => {
    const app = applications.find((a: any) => a.id === applicationId);
    const name = app?.influencer?.displayName || app?.influencerData?.displayName || 'this creator';
    setConfirmModal({ type: 'accept', applicationId, name });
  };

  const handleDecline = (applicationId: string) => {
    const app = applications.find((a: any) => a.id === applicationId);
    const name = app?.influencer?.displayName || app?.influencerData?.displayName || 'this creator';
    setDeclineReason('');
    setConfirmModal({ type: 'decline', applicationId, name });
  };

  const confirmAction = async () => {
    if (!firebaseUser || !confirmModal) return;
    setActionLoading(confirmModal.applicationId);
    try {
      const token = await firebaseUser.getIdToken();
      const body: any = confirmModal.type === 'accept'
        ? { action: 'accept' }
        : { action: 'reject', rejectionReason: declineReason.trim() || undefined };
      const res = await fetch(
        `/api/brands/campaigns/${campaignId}/applications/${confirmModal.applicationId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );
      if (res.ok) {
        fetchApplications();
        onStatsChange?.();
      }
    } catch (err) {
      console.error(`Error ${confirmModal.type}ing application:`, err);
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
      setDeclineReason('');
    }
  };

  const renderHeaders = () => {
    if (currentTab === "APPLICATIONS") {
      return (
        <div className="grid grid-cols-12 items-center bg-[#FDFDFD] border-b border-gray-100 min-w-[700px]">
          <div className="col-span-1 text-center py-4 text-[10px] font-black text-gray-400 tracking-[0.2em] border-r border-gray-100">
            PROFILE
          </div>
          <div className="col-span-3 px-6 py-4 text-[10px] font-black text-gray-400 tracking-[0.2em] border-r border-gray-100">
            INFLUENCER
          </div>
          <div className="col-span-2 px-6 py-4 text-[10px] font-black text-gray-400 tracking-[0.2em] border-r border-gray-100">
            OFFER
          </div>
          <div className="col-span-3 px-6 py-4 text-[10px] font-black text-gray-400 tracking-[0.2em] border-r border-gray-100">
            COMMENTS
          </div>
          <div className="col-span-3 px-6 py-4 text-right text-[10px] font-black text-gray-400 tracking-[0.2em]">
            ACTIONS
          </div>
        </div>
      );
    }

    if (currentTab === "APPROVED") {
      return (
        <div className="grid grid-cols-12 items-center bg-[#FDFDFD] border-b border-gray-100 min-w-[700px]">
          <div className="col-span-1 text-center py-4 text-[10px] font-black text-gray-400 tracking-[0.2em] border-r border-gray-100">
            PROFILE
          </div>
          <div className="col-span-3 px-6 py-4 text-[10px] font-black text-gray-400 tracking-[0.2em] border-r border-gray-100">
            INFLUENCER
          </div>
          <div className="col-span-4 px-6 py-4 text-[10px] font-black text-gray-400 tracking-[0.2em] border-r border-gray-100 text-center">
            PERFORMANCE
          </div>
          <div className="col-span-3 px-6 py-4 text-[10px] font-black text-gray-400 tracking-[0.2em] border-r border-gray-100">
            TASK PROGRESS
          </div>
          <div className="col-span-1 px-6 py-4 text-right text-[10px] font-black text-gray-400 tracking-[0.2em]">
            ACTIONS
          </div>
        </div>
      );
    }

    if (currentTab === "PUBLISHED") {
      return (
        <div className="grid grid-cols-12 items-center bg-[#FDFDFD] border-b border-gray-100 min-w-[700px]">
          <div className="col-span-1 text-center py-4 text-[10px] font-black text-gray-400 tracking-[0.2em] border-r border-gray-100 uppercase">
            PROFILE
          </div>
          <div className="col-span-2 px-6 py-4 text-[10px] font-black text-gray-400 tracking-[0.2em] border-r border-gray-100 uppercase">
            INFLUENCER
          </div>
          <div className="col-span-4 px-6 py-4 text-[10px] font-black text-gray-400 tracking-[0.2em] border-r border-gray-100 uppercase">
            PERFORMANCE
          </div>
          <div className="col-span-3 px-6 py-4 text-[10px] font-black text-gray-400 tracking-[0.2em] border-r border-gray-100 uppercase">
            TASK PROGRESS
          </div>
          <div className="col-span-2 px-6 py-4 text-right text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase">
            ACTIONS
          </div>
        </div>
      );
    }

    // Default (INVITES)
    return (
      <div className="grid grid-cols-12 items-center bg-[#FDFDFD] border-b border-gray-100 min-w-[800px]">
        <div className="col-span-1 text-center py-4 text-[10px] font-black text-gray-400 tracking-[0.2em] border-r border-gray-100">
          PROFILE
        </div>
        <div className="col-span-3 px-6 py-4 text-[10px] font-black text-gray-400 tracking-[0.2em] border-r border-gray-100">
          INFLUENCER
        </div>
        <div className="col-span-2 px-6 py-4 text-[10px] font-black text-gray-400 tracking-[0.2em] border-r border-gray-100">
          STATUS
        </div>
        <div className="col-span-3 px-8 py-4 text-[10px] font-black text-gray-400 tracking-[0.2em] border-r border-gray-100">
          OFFER
        </div>
        <div className="col-span-3 px-6 py-4 text-right text-[10px] font-black text-gray-400 tracking-[0.2em]">
          ACTIONS
        </div>
      </div>
    );
  };

  // Map API invitation to the format InviteRow expects (InfluencerBid)
  const mapToInviteRow = (inv: any): InfluencerBid => {
    // Map API statuses to BidStatus
    const statusMap: Record<string, InfluencerBid['status']> = {
      sent: 'invited',
      accepted: 'accepted',
      rejected: 'rejected',
      pending: 'pending',
    };
    return {
      id: inv.id,
      influencerId: inv.influencerId || '',
      influencerName: inv.influencer?.name || 'Creator',
      avatar: inv.influencer?.avatar || '',
      socialStats: (inv.influencer?.socialStats || []).map((s: any) => ({
        platform: s.platform as any,
        followers: s.followers || 0,
      })),
      bidAmount: 0,
      status: statusMap[inv.status] || 'invited',
      comments: inv.message ? [inv.message] : [],
      submittedAt: inv.invitedAt || new Date().toISOString(),
    };
  };

  // Map API application to the format ApplicationRow expects
  const mapToApplicationRow = (app: any) => ({
    id: app.id,
    offerAmount: app.proposedRate || 0,
    comment: app.pitchMessage || "No comment provided",
    pitchMessage: app.pitchMessage || "",
    questionAnswers: app.questionAnswers || [],
    influencer: {
      name: app.influencer?.displayName || app.influencerData?.displayName || "Unknown",
      image: app.influencer?.photoURL || app.influencerData?.photoURL || "",
      igFollowers: (app.influencer?.totalFollowers || app.followerCount || 0).toLocaleString(),
      ttFollowers: "0",
      verified: app.qualificationMet || false,
    },
  });

  const mapToApprovedRow = (app: any) => ({
    id: app.id,
    completedDeliverables: app._completedDeliverables || 0,
    totalDeliverables: app._totalDeliverables || 0,
    performance: {
      reach: (app.influencer?.totalFollowers || 0).toLocaleString(),
      engagement: `${(app.influencer?.engagementRate || 0).toFixed(1)}%`,
      trueReach: "0",
    },
    influencer: {
      name: app.influencer?.displayName || app.influencerData?.displayName || "Unknown",
      image: app.influencer?.photoURL || app.influencerData?.photoURL || "",
      igFollowers: (app.influencer?.totalFollowers || 0).toLocaleString(),
      ttFollowers: "0",
    },
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Scroll hint - mobile only */}
      <div className="md:hidden flex items-center gap-1.5 px-4 py-2 bg-gray-50 border-b border-gray-100">
        <svg
          className="w-3.5 h-3.5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01"
          />
        </svg>
        <span className="text-[11px] text-gray-400 font-medium">
          Scroll right to see all columns
        </span>
      </div>

      {/* Horizontally scrollable table wrapper */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="min-w-[700px]">
          {renderHeaders()}

          <div className="flex flex-col">
            {isLoading && (
              <div className="py-20 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            )}

            {!isLoading && applications.map((app) => {
              if (currentTab === "INVITES") {
                return (
                  <InviteRow
                    key={app.id}
                    bid={mapToInviteRow(app)}
                  />
                );
              }

              if (currentTab === "APPLICATIONS") {
                const mapped = mapToApplicationRow(app);
                return (
                  <ApplicationRow
                    key={app.id}
                    application={mapped}
                    onApprove={() => handleApprove(app.id)}
                    onDecline={() => handleDecline(app.id)}
                    onViewProfile={() => setSelectedApplication(mapped)}
                  />
                );
              }

              if (currentTab === "APPROVED") {
                return <ApprovedRow key={app.id} data={mapToApprovedRow(app)} />;
              }

              if (currentTab === "PUBLISHED") {
                return (
                  <PublishedRow
                    key={app.id}
                    data={mapToApprovedRow(app)}
                    onChat={() => {}}
                    onViewTasks={() => {}}
                  />
                );
              }

              return null;
            })}

            {!isLoading && applications.length === 0 && (
              <div className="py-20 text-center text-gray-400 font-medium">
                No {currentTab === 'INVITES' ? 'invitations' : 'applications'} found.
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {selectedApplication.influencer.image ? (
                    <img
                      src={selectedApplication.influencer.image}
                      alt={selectedApplication.influencer.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                      {selectedApplication.influencer.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {selectedApplication.influencer.name}
                  </h3>
                  <p className="text-xs text-gray-400">Application Details</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApplication(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Proposed Rate */}
              {selectedApplication.offerAmount > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Proposed Rate
                  </h4>
                  <p className="text-lg font-bold text-[#4ADE80]">
                    R{selectedApplication.offerAmount.toLocaleString()}
                  </p>
                </div>
              )}

              {/* Pitch Message */}
              {selectedApplication.pitchMessage && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Pitch Message
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedApplication.pitchMessage}
                  </p>
                </div>
              )}

              {/* Screening Question Answers */}
              {selectedApplication.questionAnswers.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Screening Questions
                  </h4>
                  <div className="space-y-3">
                    {selectedApplication.questionAnswers.map(
                      (qa: { question: string; answer: string }, idx: number) => (
                        <div
                          key={idx}
                          className="bg-gray-50 rounded-xl p-3"
                        >
                          <p className="text-xs font-semibold text-gray-600 mb-1">
                            {qa.question}
                          </p>
                          <p className="text-sm text-gray-800">
                            {qa.answer}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Accept / Decline Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6 text-center">
              <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4 ${
                confirmModal.type === 'accept' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {confirmModal.type === 'accept' ? (
                  <Check className="w-7 h-7 text-green-600" />
                ) : (
                  <AlertTriangle className="w-7 h-7 text-red-600" />
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {confirmModal.type === 'accept' ? 'Accept Application' : 'Decline Application'}
              </h3>
              <p className="text-sm text-gray-500 mb-5">
                {confirmModal.type === 'accept'
                  ? `Are you sure you want to accept ${confirmModal.name}'s application? They will be notified and added to the campaign.`
                  : `Are you sure you want to decline ${confirmModal.name}'s application?`}
              </p>

              {confirmModal.type === 'decline' && (
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="Add a reason (optional)..."
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy focus:border-transparent resize-none mb-5"
                />
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setConfirmModal(null); setDeclineReason(''); }}
                  disabled={!!actionLoading}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  disabled={!!actionLoading}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                    confirmModal.type === 'accept'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {confirmModal.type === 'accept' ? 'Accept' : 'Decline'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
