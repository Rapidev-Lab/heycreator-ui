"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import {
  Loader2,
  AlertTriangle,
  ArrowLeft,
  ClipboardList,
  Download,
} from "lucide-react";
import ProfileCompletionGuard from "@/components/auth/ProfileCompletionGuard";
import EmailVerificationGuard from "@/components/auth/EmailVerificationGuard";
import CampaignOverviewTab from "@/components/influencers/campaigns/CampaignOverviewTab";
import CampaignContentTab from "@/components/influencers/campaigns/CampaignContentTab";
import CampaignBriefTab from "@/components/influencers/campaigns/CampaignBriefTab";
import ReviewCampaignDeliverableModal from "@/components/influencers/campaigns/ReviewCampaignDeliverableModal";
import TasksDeliverablesModal from "@/components/influencers/campaigns/TasksDeliverablesModal";
import CampaignPaymentsTab from "@/components/influencers/campaigns/CampaignPaymentsTab";
import CampaignAnalyticsTab from "@/components/influencers/campaigns/CampaignAnalyticsTab";
import type { DeliverableFormData } from "@/components/influencers/campaigns/ReviewCampaignDeliverableModal";
import type { DeliverableSubmission } from "@/types/campaign";

type Tab = "overview" | "content" | "brief" | "payments" | "analytics";

const TABS: { key: Tab; label: string; disabled?: boolean }[] = [
  { key: "overview", label: "Overview" },
  { key: "content", label: "Content" },
  { key: "brief", label: "Brief" },
  { key: "payments", label: "Payments" },
  { key: "analytics", label: "Analytics" },
];

// Status badge config
const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> =
  {
    PUBLISHED: {
      label: "Active Campaign",
      bg: "bg-green-100",
      text: "text-green-700",
    },
    ACTIVE: {
      label: "Active Campaign",
      bg: "bg-green-100",
      text: "text-green-700",
    },
    IN_PROGRESS: {
      label: "In Progress",
      bg: "bg-blue-100",
      text: "text-blue-700",
    },
    COMPLETED: { label: "Completed", bg: "bg-gray-100", text: "text-gray-600" },
    CLOSED: { label: "Closed", bg: "bg-gray-100", text: "text-gray-500" },
  };

export default function ManageCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params?.id as string;
  const { firebaseUser, userProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Campaign data from API
  const [campaign, setCampaign] = useState<any>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  // Deliverables
  const [deliverables, setDeliverables] = useState<DeliverableSubmission[]>([]);
  const [deliverablesLoading, setDeliverablesLoading] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingDeliverable, setEditingDeliverable] =
    useState<DeliverableSubmission | null>(null);

  // Tasks modal state
  const [showTasksModal, setShowTasksModal] = useState(false);

  // Fetch campaign data
  const fetchCampaign = useCallback(async () => {
    if (!firebaseUser || !campaignId) return;
    setLoading(true);
    setError(null);

    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`/api/influencers/campaigns/${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 404) setError("Campaign not found");
        else if (res.status === 403)
          setError("You do not have access to this campaign");
        else setError("Failed to load campaign");
        return;
      }

      const data = await res.json();
      if (data.success && data.data?.campaign) {
        setCampaign(data.data.campaign);
        if (data.data.applicationStatus?.id) {
          setApplicationId(data.data.applicationStatus.id);
        }
      } else {
        setError("Failed to load campaign");
      }
    } catch (err) {
      console.error("Error fetching campaign:", err);
      setError("Failed to load campaign. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [firebaseUser, campaignId]);

  // Fetch deliverables for this application
  const fetchDeliverables = useCallback(async () => {
    if (!firebaseUser || !applicationId) return;
    setDeliverablesLoading(true);

    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(
        `/api/deliverables?applicationId=${applicationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        const data = await res.json();
        setDeliverables(data.data?.deliverables || []);
      }
    } catch (err) {
      console.error("Error fetching deliverables:", err);
    } finally {
      setDeliverablesLoading(false);
    }
  }, [firebaseUser, applicationId]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  useEffect(() => {
    if (applicationId) {
      fetchDeliverables();
    }
  }, [applicationId, fetchDeliverables]);

  // Modal handlers
  const handleOpenCreate = () => {
    setEditingDeliverable(null);
    setShowModal(true);
  };

  const handleOpenEdit = (deliverable: DeliverableSubmission) => {
    setEditingDeliverable(deliverable);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDeliverable(null);
  };

  const handleSubmitDeliverable = async (data: DeliverableFormData) => {
    if (!firebaseUser || !applicationId) return;
    const token = await firebaseUser.getIdToken();

    if (editingDeliverable) {
      const res = await fetch(`/api/deliverables/${editingDeliverable.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update deliverable");
      }
    } else {
      const res = await fetch("/api/deliverables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          applicationId,
          ...data,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit deliverable");
      }
    }

    handleCloseModal();
    fetchDeliverables();
  };

  const handleDeleteDeliverable = async (deliverableId: string) => {
    if (!firebaseUser) return;
    const token = await firebaseUser.getIdToken();

    const res = await fetch(`/api/deliverables/${deliverableId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to delete deliverable");
    }

    handleCloseModal();
    fetchDeliverables();
  };

  // Tasks modal handlers
  const handleTaskSubmitUrl = async (
    platform: string,
    deliverableType: string,
    contentUrl: string,
  ) => {
    if (!firebaseUser || !applicationId)
      throw new Error("Not authenticated or no application");
    const token = await firebaseUser.getIdToken();

    // Check if a deliverable already exists for this platform + type
    const existing = deliverables.find(
      (d) =>
        d.platform?.toLowerCase() === platform.toLowerCase() &&
        d.deliverableType?.toLowerCase() === deliverableType.toLowerCase(),
    );

    if (existing) {
      // Update the existing deliverable instead of creating a duplicate
      const res = await fetch(`/api/deliverables/${existing.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contentUrl }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update URL");
      }
    } else {
      // Create new deliverable
      const res = await fetch("/api/deliverables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          applicationId,
          platform,
          deliverableType,
          contentUrl,
          caption: "",
          contentScreenshots: [],
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit URL");
      }
    }

    fetchDeliverables();
  };

  const handleTaskEditUrl = async (
    deliverableId: string,
    contentUrl: string,
  ) => {
    if (!firebaseUser) throw new Error("Not authenticated");
    const token = await firebaseUser.getIdToken();

    // Check if this deliverable is approved — use submit_live_link action
    const targetDeliverable = deliverables.find((d) => d.id === deliverableId);
    const isApproved = targetDeliverable?.status === 'approved';

    const requestBody = isApproved
      ? { action: 'submit_live_link', liveUrl: contentUrl }
      : { contentUrl };

    const res = await fetch(`/api/deliverables/${deliverableId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to update URL");
    }

    fetchDeliverables();
  };

  // Extract available platforms and deliverable types from campaign
  const availablePlatforms =
    campaign?.tasks?.requiredDeliverables
      ?.map(
        (d: any) => d.platform?.charAt(0).toUpperCase() + d.platform?.slice(1),
      )
      .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i) || [];

  const availableDeliverableTypes =
    campaign?.tasks?.requiredDeliverables
      ?.map((d: any) => d.contentType)
      .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i) || [];

  // Creator info for preview
  const creatorName =
    userProfile?.displayName || firebaseUser?.displayName || "Creator";
  const creatorAvatar = userProfile?.photoURL || firebaseUser?.photoURL || null;

  // Loading state
  if (loading) {
    return (
      <ProfileCompletionGuard>
        <EmailVerificationGuard>
          <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-10 h-10 text-brand-navy animate-spin mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Loading campaign...</p>
            </div>
          </div>
        </EmailVerificationGuard>
      </ProfileCompletionGuard>
    );
  }

  // Error state
  if (error || !campaign) {
    return (
      <ProfileCompletionGuard>
        <EmailVerificationGuard>
          <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {error === "Campaign not found"
                  ? "Campaign Not Found"
                  : "Something Went Wrong"}
              </h2>
              <p className="text-gray-500 mb-6 text-sm">
                {error ||
                  "This campaign doesn't exist or you don't have access."}
              </p>
              <button
                onClick={() =>
                  router.push("/influencers/campaigns?tab=applications")
                }
                className="px-6 py-2.5 bg-brand-navy text-white text-sm font-medium rounded-full hover:bg-brand-navy-light transition-colors"
              >
                Back to all campaigns
              </button>
            </div>
          </div>
        </EmailVerificationGuard>
      </ProfileCompletionGuard>
    );
  }

  const statusStyle = STATUS_MAP[campaign.status] || STATUS_MAP.ACTIVE;

  return (
    <ProfileCompletionGuard>
      <EmailVerificationGuard>
        <div className="min-h-screen bg-[#F8F9FB]">
          {/* ===== PAGE HEADER ===== */}
          <div className="bg-white border-b border-gray-200">
            <div className="px-6 lg:px-8 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-brand-navy">
                    Manage Campaign
                  </h1>
                  <p className="text-sm text-gray-500">
                    View and manage this Campaign.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {activeTab === "payments" ? (
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowTasksModal(true)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ClipboardList className="w-4 h-4" />
                      View Tasks
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-4 flex gap-6 border border-x-0 border-t-0 border-b-grey-50">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => !tab.disabled && setActiveTab(tab.key)}
                    disabled={tab.disabled}
                    className={`pb-2 text-sm font-semibold transition-colors relative ${
                      activeTab === tab.key
                        ? "text-brand-navy border-b-2 border-brand-navy"
                        : tab.disabled
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Back link */}
              <div className="bg-white mt-4">
                <button
                  onClick={() => router.push("/influencers/campaigns")}
                  className="flex items-center gap-2 text-brand-navy-dark hover:text-brand-navy transition-colors text-sm font-medium mb-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to all campaigns
                </button>
              </div>
            </div>
          </div>

          {/* ===== CONTENT AREA ===== */}
          <div className="px-6 lg:px-8 py-6">
            {/* Campaign info — visible on all tabs */}
            <div className="mb-6 bg-white rounded-2xl border border-gray-200 p-6">
              {/* Category pills + Status */}
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {(campaign.categories || []).map((cat: string) => (
                  <span
                    key={cat}
                    className="px-3 py-1 bg-[#F0F0F0] text-[#666666] text-xs font-medium rounded-full"
                  >
                    {cat}
                  </span>
                ))}
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${statusStyle.bg} ${statusStyle.text}`}
                >
                  {statusStyle.label}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-brand-navy mb-1">
                {campaign.title}
              </h2>

              {/* Brand name */}
              {campaign.brandInfo?.name &&
                campaign.brandInfo.name !== "Unknown Brand" && (
                  <p className="text-sm text-[#FF385C] font-medium mb-2">
                    {campaign.brandInfo.name}
                  </p>
                )}

              {/* Description */}
              {campaign.description && (
                <p className="text-sm text-gray-600 leading-relaxed mt-2 max-w-3xl">
                  {campaign.description}
                </p>
              )}
            </div>

            {/* ===== TAB CONTENT ===== */}
            {activeTab === "overview" && (
              <CampaignOverviewTab campaign={campaign} />
            )}

            {activeTab === "content" && (
              <CampaignContentTab
                deliverables={deliverables}
                loading={deliverablesLoading}
                onAddNew={handleOpenCreate}
                onEditDeliverable={handleOpenEdit}
                onSubmitUrl={async (deliverableId, contentUrl) => {
                  if (!firebaseUser) return;
                  const token = await firebaseUser.getIdToken();
                  const target = deliverables.find((d) => d.id === deliverableId);
                  const isApproved = target?.status === 'approved';
                  const body = isApproved
                    ? { action: 'submit_live_link', liveUrl: contentUrl }
                    : { contentUrl };
                  const res = await fetch(`/api/deliverables/${deliverableId}`, {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(body),
                  });
                  if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || "Failed to submit URL");
                  }
                  fetchDeliverables();
                }}
                creatorName={
                  userProfile?.displayName ||
                  firebaseUser?.displayName ||
                  undefined
                }
                creatorAvatar={
                  userProfile?.photoURL || firebaseUser?.photoURL || null
                }
              />
            )}

            {activeTab === "brief" && <CampaignBriefTab campaign={campaign} />}

            {activeTab === "payments" && (
              <CampaignPaymentsTab campaign={campaign} />
            )}

            {activeTab === "analytics" && (
              <CampaignAnalyticsTab campaign={campaign} />
            )}
          </div>
        </div>

        {/* Deliverable Modal */}
        <ReviewCampaignDeliverableModal
          isOpen={showModal}
          onClose={handleCloseModal}
          onSubmit={handleSubmitDeliverable}
          onDelete={editingDeliverable ? handleDeleteDeliverable : undefined}
          campaignId={campaignId}
          applicationId={applicationId || ""}
          existingDeliverable={editingDeliverable}
          creatorName={creatorName}
          creatorAvatar={creatorAvatar}
          availablePlatforms={availablePlatforms}
          availableDeliverableTypes={availableDeliverableTypes}
        />

        {/* Tasks & Deliverables Modal */}
        <TasksDeliverablesModal
          isOpen={showTasksModal}
          onClose={() => setShowTasksModal(false)}
          campaign={campaign}
          deliverables={deliverables}
          creatorName={creatorName}
          creatorUsername={userProfile?.email?.split("@")[0] || undefined}
          creatorAvatar={creatorAvatar}
          applicationId={applicationId || ""}
          onSubmitUrl={handleTaskSubmitUrl}
          onEditUrl={handleTaskEditUrl}
        />
      </EmailVerificationGuard>
    </ProfileCompletionGuard>
  );
}
