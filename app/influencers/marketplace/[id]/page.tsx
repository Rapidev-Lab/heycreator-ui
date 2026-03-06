"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  Eye,
  Hash,
  AtSign,
  ExternalLink,
  Gift,
  Send,
  Bookmark,
  Clock,
  MessageCircle,
  Mail,
  ShieldAlert,
} from "lucide-react";
import ProfileCompletionGuard from "@/components/auth/ProfileCompletionGuard";
import EmailVerificationGuard from "@/components/auth/EmailVerificationGuard";
import ApplicationModal from "@/components/influencers/ApplicationModal";
import { useAuth } from "@/lib/firebase/auth-context";
import { useSavedCampaigns } from "@/lib/hooks/useSavedCampaigns";

interface CampaignDetail {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  kpi: string;
  categories: string[];
  budget: {
    compensationModel: string;
    currency: string;
    fixedAmount: number;
    minRangeAmount: number;
    maxRangeAmount: number;
    paymentTerms: string;
    applicationDeadline: string | null;
    contentCreationStart: string | null;
    contentCreationEnd: string | null;
  };
  timeline: {
    campaignStart: string | null;
    campaignEnd: string | null;
    applicationDeadline: string | null;
  };
  product: {
    productType?: string;
    productName?: string;
    productValue?: number;
    productLink?: string;
    productImagesUrls?: string[];
    keepsProduct?: boolean;
    willReimburse_or_productShipped?: boolean;
    reimburseAmount?: number;
  };
  audience: {
    ageMin?: number;
    ageMax?: number;
    gender?: string;
    targetLocation?: string;
    minFollowers?: number;
    minEngagements?: number;
  };
  tasks: {
    requiredDeliverables?: {
      platform: string;
      contentType?: string;
      type?: string;
      quantity: number;
      description: string;
    }[];
    dos?: string[];
    donts?: string[];
    metaData?: {
      requiredHashTags?: string[];
      mentions_or_tags?: string[];
    };
    questions?: { question: string; answers: { text: string }[] }[];
  };
  brandInfo: {
    id: string;
    name: string;
    logo: string | null;
    verified: boolean;
  };
  stats: { views: number; applications: number };
}

function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return "TBD";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "TBD";
  return date.toLocaleDateString("en-ZA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateSlash(dateStr: string | null): string {
  if (!dateStr) return "TBD";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "TBD";
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

function formatCurrency(amount: number, currency: string = "ZAR"): string {
  const symbol =
    currency === "ZAR" ? "R" : currency === "USD" ? "$" : currency + " ";
  return `${symbol}${amount.toLocaleString()}`;
}

function getDaysRemaining(dateStr: string | null): number {
  if (!dateStr) return 0;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 0;
  return Math.max(
    0,
    Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );
}

function formatProductType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function isPastDate(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr).getTime() < Date.now();
}

function formatFollowerCount(count: number): string {
  if (count >= 1000000)
    return `${(count / 1000000).toFixed(count % 1000000 === 0 ? 0 : 1)}M`;
  if (count >= 1000)
    return `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}k`;
  return count.toString();
}

function getContentTypeBadgeColor(contentType: string | undefined): string {
  const type = (contentType || "").toLowerCase();
  if (type.includes("reel")) return "bg-red-100 text-red-600";
  if (type.includes("story") || type.includes("stories"))
    return "bg-brand-navy-50 text-brand-navy";
  if (type.includes("video")) return "bg-red-100 text-red-600";
  if (type.includes("post")) return "bg-blue-100 text-blue-600";
  return "bg-gray-100 text-gray-600";
}

const DELIVERABLE_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
];

export default function MarketplaceCampaignBriefPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { firebaseUser, user, emailVerified } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<any>(null);
  const [invitationStatus, setInvitationStatus] = useState<any>(null);
  const [invitationLoading, setInvitationLoading] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const { isSaved, toggleSave } = useSavedCampaigns();

  const campaignId = params?.id as string;
  const campaignSaved = isSaved(campaignId);

  // Check if this is from a shared link (bypasses profile completion and email verification for viewing)
  // We read the param once, store it in sessionStorage, then clear it from the URL to prevent persistence
  const sharedParamProcessed = useRef(false);
  const [isSharedLink, setIsSharedLink] = useState(false);

  useEffect(() => {
    if (sharedParamProcessed.current) return;

    // Check URL param or sessionStorage for shared campaign access
    const sharedFromUrl = searchParams?.get('shared') === 'true';
    const sessionKey = `shared_campaign_${campaignId}`;
    const sharedFromSession = typeof window !== 'undefined' && sessionStorage.getItem(sessionKey) === 'true';

    if (sharedFromUrl || sharedFromSession) {
      setIsSharedLink(true);

      if (sharedFromUrl) {
        // Store in sessionStorage so guards can access it on refresh
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(sessionKey, 'true');
        }
        // Clear the query param from URL without navigation
        const url = new URL(window.location.href);
        url.searchParams.delete('shared');
        window.history.replaceState({}, '', url.toString());
      }
    }
    sharedParamProcessed.current = true;
  }, [searchParams, campaignId]);

  // Check if user can perform actions (apply, save, etc.)
  const canPerformActions = emailVerified;

  // Handle resend verification email
  const handleResendVerification = async () => {
    if (!firebaseUser) return;
    setResendingVerification(true);
    try {
      const { sendEmailVerification } = await import('firebase/auth');
      await sendEmailVerification(firebaseUser);
      alert('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Error sending verification:', error);
      alert(error.message || 'Failed to send verification email');
    } finally {
      setResendingVerification(false);
    }
  };

  const fetchCampaign = useCallback(async () => {
    if (!firebaseUser || !campaignId) return;
    setIsLoading(true);
    setError(null);

    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`/api/influencers/campaigns/${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 404) setError("Campaign not found");
        else if (res.status === 403)
          setError("This campaign is no longer available");
        else setError("Failed to load campaign");
        return;
      }

      const data = await res.json();
      if (data.success && data.data?.campaign) {
        setCampaign(data.data.campaign);
        setApplicationStatus(data.data.applicationStatus);
        setInvitationStatus(data.data.invitationStatus);
      } else {
        setError("Failed to load campaign");
      }
    } catch (err) {
      console.error("Error fetching campaign:", err);
      setError("Failed to load campaign. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [firebaseUser, campaignId]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  const handleApply = async (data: {
    pitchMessage: string;
    proposedRate?: number;
    questionAnswers?: { question: string; answer: string }[];
  }) => {
    if (!firebaseUser) throw new Error("Please log in to apply");
    const token = await firebaseUser.getIdToken();
    const res = await fetch(`/api/influencers/campaigns/${campaignId}/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.error || "Failed to submit application");
    }

    // If accepting via invitation, also patch invitation to 'accepted'
    if (invitationStatus && invitationStatus.status === 'sent' && invitationStatus.id) {
      fetch(`/api/influencers/invitations/${invitationStatus.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "accepted" }),
      }).catch((err) => console.error("Failed to patch invitation:", err));
      setInvitationStatus({ ...invitationStatus, status: "accepted" });
    }

    setApplicationStatus({
      id: result.data.application.id,
      status: "pending",
      appliedAt: new Date().toISOString(),
    });
    setApplySuccess(true);
  };

  const handleInvitationResponse = async (action: 'accepted' | 'declined') => {
    if (!firebaseUser || !invitationStatus?.id) return;
    setInvitationLoading(action);
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`/api/influencers/invitations/${invitationStatus.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: action }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setInvitationStatus({ ...invitationStatus, status: action });
      }
    } catch (err) {
      console.error('Error responding to invitation:', err);
    } finally {
      setInvitationLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-brand-navy animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading campaign brief...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {error === "Campaign not found"
              ? "Campaign Not Found"
              : "Something Went Wrong"}
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            {error || "This campaign doesn't exist or is no longer available."}
          </p>
          <button
            onClick={() => router.push("/influencers/marketplace")}
            className="px-6 py-2.5 bg-brand-navy text-white text-sm font-medium rounded-full hover:bg-brand-navy-light transition-colors"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const budget = campaign.budget || {};
  const budgetMin =
    budget.compensationModel === "range"
      ? budget.minRangeAmount
      : budget.fixedAmount;
  const budgetMax =
    budget.compensationModel === "range"
      ? budget.maxRangeAmount
      : budget.fixedAmount;
  const deliverables = campaign.tasks?.requiredDeliverables || [];
  const dos = campaign.tasks?.dos || [];
  const donts = campaign.tasks?.donts || [];
  const hashtags = campaign.tasks?.metaData?.requiredHashTags || [];
  const mentions = campaign.tasks?.metaData?.mentions_or_tags || [];
  const questions = campaign.tasks?.questions || [];
  const timeline = campaign.timeline || {};
  const deadlineDays = getDaysRemaining(timeline.applicationDeadline);
  const isOpen = deadlineDays > 0;
  const currency = budget.currency || "ZAR";

  // Build timeline milestones
  const milestones: {
    label: string;
    date: string | null;
    description: string;
  }[] = [];
  if (timeline.applicationDeadline) {
    milestones.push({
      label: "Application Deadline",
      date: timeline.applicationDeadline,
      description: isOpen
        ? `Last day for influencers to apply`
        : "Application period has ended",
    });
  }
  if (budget.contentCreationStart) {
    milestones.push({
      label: "Campaign Start",
      date: budget.contentCreationStart,
      description: "Content creation and approval begins",
    });
  }
  if (timeline.campaignEnd) {
    milestones.push({
      label: "Campaign End",
      date: timeline.campaignEnd,
      description: "Final content submissions and approvals due",
    });
  }

  return (
    <ProfileCompletionGuard>
      <EmailVerificationGuard>
        <div className="min-h-screen bg-gray-50 pb-20">
          {/* ===== PAGE HEADER ===== */}
          <div className="bg-white px-4 sm:px-6 lg:px-8 pt-4 border-b border-gray-200">
            <div>
              <h1 className="text-xl font-bold text-brand-navy">Marketplace</h1>
              <p className="text-sm text-gray-500 mt-1">
                Explore campaigns open for bidding
              </p>
            </div>
            <div className="flex gap-6 mt-4 -mb-[1px]">
              <button
                onClick={() => router.push("/influencers/marketplace")}
                className="pb-3 border-b-2 border-brand-navy text-sm font-semibold text-brand-navy"
              >
                All campaigns
              </button>
              <span className="pb-3 border-b-2 border-transparent text-sm font-medium text-gray-400 cursor-default">
                Invites
              </span>
              <span className="pb-3 border-b-2 border-transparent text-sm font-medium text-gray-400 cursor-default">
                Recommended
              </span>
              <span className="pb-3 border-b-2 border-transparent text-sm font-medium text-gray-400 cursor-default">
                Saved
              </span>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
              {/* ===== BACK LINK ===== */}
              <button
                onClick={() => router.push("/influencers/marketplace")}
                className="flex items-center gap-2 text-gray-500 hover:text-brand-navy transition-colors text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to all campaigns
              </button>

              {/* ===== HERO CARD ===== */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                {/* Badges + Action Buttons Row */}
                <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {(campaign.categories || []).map((cat: string) => (
                      <span
                        key={cat}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                      >
                        {cat}
                      </span>
                    ))}
                    {invitationStatus ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                        <Send className="w-3 h-3" />
                        Invited
                      </span>
                    ) : isOpen ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Public Campaign
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => toggleSave(campaignId)}
                      className={`flex items-center gap-1.5 px-4 py-2 border text-sm font-medium rounded-lg transition-colors ${
                        campaignSaved
                          ? "border-brand-navy text-brand-navy bg-blue-50 hover:bg-blue-100"
                          : "border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Bookmark
                        className="w-4 h-4"
                        fill={campaignSaved ? "currentColor" : "none"}
                      />
                      {campaignSaved ? "Saved" : "Save for later"}
                    </button>
                    <button
                      onClick={() => alert("Chat functionality coming soon!")}
                      className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat
                    </button>
                    {/* Invitation: pending response → Accept opens ApplicationModal */}
                    {invitationStatus && invitationStatus.status === 'sent' && !applicationStatus && (
                      <>
                        <button
                          onClick={() => handleInvitationResponse('declined')}
                          disabled={invitationLoading !== null}
                          className="flex items-center gap-1.5 px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {invitationLoading === 'declined' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          Decline
                        </button>
                        <button
                          onClick={() => setShowApplyModal(true)}
                          disabled={invitationLoading !== null}
                          className="flex items-center gap-1.5 px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Accept Invitation
                        </button>
                      </>
                    )}
                    {/* Invitation: accepted (shown regardless of applicationStatus) */}
                    {invitationStatus && invitationStatus.status === 'accepted' && (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-200">
                        <CheckCircle2 className="w-4 h-4" />
                        Invitation Accepted
                      </span>
                    )}
                    {/* Invitation: declined (shown regardless of applicationStatus) */}
                    {invitationStatus && invitationStatus.status === 'declined' && (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-full border border-red-200">
                        <XCircle className="w-4 h-4" />
                        Invitation Declined
                      </span>
                    )}
                    {/* Regular apply flow (no invitation) */}
                    {!invitationStatus && !applicationStatus && isOpen && (
                      <button
                        onClick={() => setShowApplyModal(true)}
                        className="flex items-center gap-1.5 px-5 py-2 bg-brand-navy text-white text-sm font-semibold rounded-lg hover:bg-brand-navy-light transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        Apply now
                      </button>
                    )}
                    {/* Applied badge only when no invitation */}
                    {applicationStatus && !invitationStatus && (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg">
                        <CheckCircle2 className="w-4 h-4" />
                        Applied
                      </span>
                    )}
                  </div>
                </div>

                {/* Invitation Banner */}
                {invitationStatus && invitationStatus.status === 'sent' && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                    <Send className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-blue-800">You&apos;ve been invited to this campaign</p>
                      {invitationStatus.message && (
                        <p className="text-xs text-blue-600 mt-0.5">&ldquo;{invitationStatus.message}&rdquo;</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Title + Brand */}
                <h2 className="text-2xl font-bold text-brand-navy mb-1">
                  {campaign.title}
                </h2>
                {campaign.brandInfo?.name &&
                  campaign.brandInfo.name !== "Unknown Brand" && (
                    <p className="text-sm text-[#FF385C] font-medium mb-4">
                      {campaign.brandInfo.name}
                    </p>
                  )}

                {/* Description */}
                {campaign.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {campaign.description}
                  </p>
                )}
              </div>

              {/* ===== TIMELINE CARD (Horizontal) ===== */}
              {milestones.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-base font-bold text-brand-navy mb-8">
                    Timeline
                  </h3>
                  <div className="relative">
                    {/* Connecting line */}
                    <div className="absolute top-[7px] left-0 right-0 h-0.5 bg-gray-200" />
                    <div className="flex justify-between relative">
                      {milestones.map((m, i) => {
                        const past = isPastDate(m.date);
                        const dotColor = past
                          ? "bg-amber-400"
                          : i === 0
                            ? "bg-[#FBBF24]"
                            : "bg-gray-300";
                        return (
                          <div
                            key={i}
                            className="flex flex-col items-start flex-1 pr-4 last:pr-0"
                          >
                            <div
                              className={`w-3.5 h-3.5 rounded-full ${dotColor} relative z-10 ring-4 ring-white`}
                            />
                            <p className="text-sm font-semibold text-brand-navy mt-3">
                              {m.label}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {formatShortDate(m.date)}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {m.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
                {/* ===== DETAILS CARD (3-column with dividers) ===== */}
                <div className="">
                  <h3 className="text-base font-bold text-brand-navy mb-4">
                    Details
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border border-gray-200 rounded-xl p-4 bg-[#F8F9FD]">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold">
                          Compensation
                        </span>
                      </div>
                      <p className="text-lg font-bold text-brand-navy">
                        {budgetMin === budgetMax
                          ? formatCurrency(budgetMin, currency)
                          : `${formatCurrency(budgetMin, currency)} - ${formatCurrency(budgetMax, currency)}`}
                      </p>
                    </div>
                    <div className="border border-gray-200 rounded-xl p-4 bg-[#F8F9FD]">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold">
                          Apply By
                        </span>
                      </div>
                      <p className="text-lg font-bold text-brand-navy">
                        {formatDateSlash(timeline.applicationDeadline)}
                      </p>
                    </div>
                    <div className="border border-gray-200 rounded-xl p-4 bg-[#F8F9FD]">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold">
                          Location
                        </span>
                      </div>
                      <p className="text-lg font-bold text-brand-navy">
                        {campaign.audience?.targetLocation || "Anywhere"}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Divider */}
                <div className="w-full h-px bg-[#D1D5DB]" />

                {/* ===== CAMPAIGN OBJECTIVES ===== */}
                {campaign.objectives && campaign.objectives.length > 0 && (
                  <div>
                    <h3 className="text-base font-bold text-brand-navy mb-3">
                      Campaign Objectives
                    </h3>
                    {campaign.kpi && (
                      <p className="text-sm text-gray-600 leading-relaxed mb-4">
                        {campaign.kpi}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4">
                      {campaign.objectives.map((obj, i) => (
                        <span
                          key={i}
                          className="text-sm text-brand-navy-dark font-medium underline-offset-4 bg-[#F8F9FD] rounded-full px-2"
                        >
                          {obj}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div className="w-full h-px bg-[#D1D5DB]" />

                {/* ===== PRODUCT DETAILS ===== */}
                {campaign.product?.productName && (
                  <div>
                    <h3 className="text-base font-bold text-brand-navy mb-4">
                      Product Details
                    </h3>
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-start gap-5">
                      <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {campaign.product.productImagesUrls?.[0] ? (
                          <img
                            src={campaign.product.productImagesUrls[0]}
                            alt={campaign.product.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-7 h-7 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-base font-semibold text-brand-navy">
                            {campaign.product.productName}
                          </h4>
                          {campaign.product.productValue ? (
                            <span className="text-sm font-bold text-brand-navy whitespace-nowrap">
                              Value:{" "}
                              {formatCurrency(
                                campaign.product.productValue,
                                currency,
                              )}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-gray-500 mb-2">
                          {campaign.product.productType
                            ? formatProductType(campaign.product.productType) +
                              ". "
                            : ""}
                          {campaign.product.keepsProduct &&
                            "You get to keep the product. "}
                          {campaign.product.willReimburse_or_productShipped &&
                            "Product will be shipped to you."}
                        </p>
                        {campaign.product.productLink && (
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">
                              Product Link
                            </p>
                            <a
                              href={campaign.product.productLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-brand-navy-dark hover:underline break-all"
                            >
                              {campaign.product.productLink}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div className="w-full h-px bg-[#D1D5DB]" />

                {/* ===== DELIVERABLES (individual cards) ===== */}
                {deliverables.length > 0 && (
                  <div>
                    <h3 className="text-base font-bold text-brand-navy mb-4">
                      What you need to deliver
                    </h3>
                    <div className="space-y-3">
                      {deliverables.map((d, i) => {
                        const color =
                          DELIVERABLE_COLORS[i % DELIVERABLE_COLORS.length];
                        const resolvedType = d.type || d.contentType || "";
                        const badgeColor = getContentTypeBadgeColor(
                          resolvedType,
                        );
                        return (
                          <div
                            key={i}
                            className="bg-white rounded-xl border border-gray-200 p-5"
                          >
                            {/* Platform + Content Type */}
                            <div className="flex items-center gap-2 mb-3">
                              <span
                                className="px-4 py-1 text-xs font-bold rounded-md capitalize text-[#FF385C] bg-[#F8F9FD]"
                              >
                                {resolvedType || "Content"}
                              </span>
                              <span className="text-sm font-semibold text-brand-navy">
                                {d.platform.charAt(0).toUpperCase() +
                                  d.platform.slice(1)}
                              </span>
                            </div>
                            {/* Number + Description */}
                            <div className="flex items-start gap-3">
                              <span
                                className="w-7 h-7 rounded-full bg-brand-navy-dark text-[#FFFFFF] flex items-center justify-center text-xs font-bold flex-shrink-0"
                              >
                                {i + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-700">
                                  {(d.quantity || 1) > 1
                                    ? `x${d.quantity} `
                                    : ""}
                                  {d.description ||
                                    `${resolvedType || "Content"} delivery`}
                                </p>
                                {budget.contentCreationEnd && (
                                  <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>
                                      Due:{" "}
                                      {formatShortDate(
                                        budget.contentCreationEnd,
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              {/* ===== CONTENT GUIDELINES CARD ===== */}
              {(dos.length > 0 || donts.length > 0) && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-base font-bold text-brand-navy mb-5">
                    Content Guidelines
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {dos.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-green-600 mb-3 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          </span>
                          Do&apos;s
                        </p>
                        <ul className="space-y-2.5">
                          {dos.map((item, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-gray-600"
                            >
                              <span className="text-green-500 mt-0.5 flex-shrink-0">
                                &#10003;
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {donts.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                          </span>
                          Don&apos;ts
                        </p>
                        <ul className="space-y-2.5">
                          {donts.map((item, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-gray-600"
                            >
                              <span className="text-red-400 mt-0.5 flex-shrink-0">
                                &#10007;
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ===== ADDITIONAL REQUIREMENTS CARD (includes screening questions) ===== */}
              {(hashtags.length > 0 ||
                mentions.length > 0 ||
                questions.length > 0) && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-base font-bold text-brand-navy mb-5">
                    Additional Requirements
                  </h3>
                  <div className="space-y-5">
                    {hashtags.length > 0 && (
                      <div>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold mb-2">
                          Required Hashtags
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {hashtags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 bg-brand-navy text-white text-xs font-medium rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {mentions.length > 0 && (
                      <div>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold mb-2">
                          Required Mentions / Tags
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {mentions.map((m, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 bg-brand-navy text-white text-xs font-medium rounded-full"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {questions.length > 0 && (
                      <div>
                        <p className="text-[11px] text-[#999999] uppercase tracking-wide font-semibold mb-2">
                          Application Questions
                        </p>
                        <ol className="space-y-2.5">
                          {questions.map((q, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-gray-700"
                            >
                              <span className="font-semibold text-[#5B6CF6] min-w-[16px]">
                                {i + 1}
                              </span>
                              <span className="text-[#666666]">{q.question}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ===== IDEAL CREATOR PROFILE CARD ===== */}
              {campaign.audience &&
                (campaign.audience.minFollowers ||
                  campaign.audience.ageMin ||
                  campaign.audience.targetLocation ||
                  campaign.audience.gender) && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-base font-bold text-brand-navy mb-5">
                      Ideal Creator Profile
                    </h3>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                      {/* Demographics Column */}
                      <div>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold mb-3">
                          Demographics
                        </p>
                        <div className="space-y-2">
                          {(campaign.audience.ageMin ||
                            campaign.audience.ageMax) && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                Age Range
                              </span>
                              <span className="text-sm font-bold text-brand-navy">
                                {campaign.audience.ageMin || 18}-
                                {campaign.audience.ageMax || 65}
                              </span>
                            </div>
                          )}
                          {campaign.audience.gender &&
                            campaign.audience.gender !== "any" && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                  Gender
                                </span>
                                <span className="text-sm font-bold text-brand-navy capitalize">
                                  {campaign.audience.gender}
                                </span>
                              </div>
                            )}
                        </div>
                      </div>
                      {/* Audience Size Column */}
                      <div>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold mb-3">
                          Audience Size
                        </p>
                        <div className="space-y-2">
                          {campaign.audience.minFollowers ? (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                Followers
                              </span>
                              <span className="text-sm font-bold text-brand-navy">
                                {formatFollowerCount(
                                  campaign.audience.minFollowers,
                                )}
                                +
                              </span>
                            </div>
                          ) : null}
                          {campaign.audience.minEngagements ? (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                Min Engagement
                              </span>
                              <span className="text-sm font-bold text-brand-navy">
                                {campaign.audience.minEngagements}%
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    {/* Interests */}
                    {campaign.categories && campaign.categories.length > 0 && (
                      <div className="mt-5 pt-4 border-t border-gray-100">
                        <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold mb-1">
                          Interests
                        </p>
                        <p className="text-sm text-gray-700">
                          {campaign.categories.join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>

          {/* ===== BOTTOM STICKY BAR ===== */}
          <div className="fixed bottom-0 right-0 left-0 lg:left-60 bg-white border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-3 z-30">
            <div className="flex items-center justify-end gap-3 ml-auto">
              <button
                onClick={() => toggleSave(campaignId)}
                className={`flex items-center gap-1.5 px-4 py-2 border text-sm font-medium rounded-lg transition-colors ${
                  campaignSaved
                    ? "border-brand-navy text-brand-navy bg-blue-50 hover:bg-blue-100"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Bookmark
                  className="w-4 h-4"
                  fill={campaignSaved ? "currentColor" : "none"}
                />
                {campaignSaved ? "Saved" : "Save for later"}
              </button>
              <button
                onClick={() => alert("Chat functionality coming soon!")}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Chat
              </button>
              {/* Invitation: pending response → Accept opens ApplicationModal */}
              {invitationStatus && invitationStatus.status === 'sent' && !applicationStatus && (
                <>
                  <button
                    onClick={() => handleInvitationResponse('declined')}
                    disabled={invitationLoading !== null}
                    className="flex items-center gap-1.5 px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {invitationLoading === 'declined' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Decline
                  </button>
                  <button
                    onClick={() => setShowApplyModal(true)}
                    disabled={invitationLoading !== null}
                    className="flex items-center gap-1.5 px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Accept Invitation
                  </button>
                </>
              )}
              {/* Invitation: accepted */}
              {invitationStatus && invitationStatus.status === 'accepted' && (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-200">
                  <CheckCircle2 className="w-4 h-4" />
                  Invitation Accepted
                </span>
              )}
              {/* Invitation: declined */}
              {invitationStatus && invitationStatus.status === 'declined' && (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-full border border-red-200">
                  <XCircle className="w-4 h-4" />
                  Invitation Declined
                </span>
              )}
              {/* Regular apply flow (no invitation) */}
              {!invitationStatus && !applicationStatus && isOpen && (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="flex items-center gap-1.5 px-5 py-2 bg-brand-navy text-white text-sm font-semibold rounded-lg hover:bg-brand-navy-light transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Apply now
                </button>
              )}
              {/* Applied badge only when no invitation */}
              {applicationStatus && !invitationStatus && (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  Applied
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Success Modal */}
        {applySuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
              <div className="w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-9 h-9 text-green-500" />
              </div>
              <p className="text-sm font-medium text-gray-800 mb-2">
                Thank you for applying to be part of this campaign.
              </p>
              <p className="text-sm text-gray-500 mb-1">
                Our team will review submissions and reach out to selected
                participants soon.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                You&apos;ll be notified of the outcome soon.
              </p>
              <button
                onClick={() => {
                  setApplySuccess(false);
                  router.push("/influencers/campaigns?success=true");
                }}
                className="px-8 py-2.5 bg-brand-navy text-white text-sm font-semibold rounded-lg hover:bg-brand-navy-light transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Application Modal */}
        <ApplicationModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          onSubmit={handleApply}
          campaignTitle={campaign?.title || ""}
          campaignDescription={campaign?.description}
          brandName={campaign?.brandInfo?.name}
          productImageUrl={campaign?.product?.productImagesUrls?.[0]}
          location={campaign?.audience?.targetLocation}
          campaignBudget={{
            compensationModel: campaign?.budget?.compensationModel || "fixed",
            fixedAmount: campaign?.budget?.fixedAmount || 0,
            minRangeAmount: campaign?.budget?.minRangeAmount || 0,
            maxRangeAmount: campaign?.budget?.maxRangeAmount || 0,
            currency: campaign?.budget?.currency || "ZAR",
          }}
          deliverables={(campaign?.tasks?.requiredDeliverables || []).map(
            (d) => ({
              platform: d.platform,
              contentType: d.type || d.contentType || "",
              quantity: d.quantity,
              description: d.description,
            }),
          )}
          screeningQuestions={(campaign?.tasks?.questions || []).map((q) => ({
            question: q.question,
            answers: (q.answers || [])
              .map((a: any) => (typeof a === "string" ? a : a.text || ""))
              .filter((a: string) => a.trim() !== ""),
          }))}
        />
      </EmailVerificationGuard>
    </ProfileCompletionGuard>
  );
}
