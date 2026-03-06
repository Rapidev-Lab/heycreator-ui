"use client";

import { useState, useEffect, useCallback } from "react";
import { notFound, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth-context";
import {
  Instagram,
  HelpCircle,
  Check,
  FileText,
  Edit,
  ChevronLeft,
  TrendingUp,
  Users,
  UserCheck,
  DollarSign,
  BarChart3,
  Share2,
} from "lucide-react";

import { Campaign } from "@/types/campaign";
import { getCurrencySymbol, formatDate } from "@/lib/utils/campaign";

// Tab Content Components
import OverviewTabContent from "@/components/campaigns/OverviewTabContent";
import InfluencersTabContent from "@/components/campaigns/InfluencersTabContent";
import ContentTabContent from "@/components/campaigns/ContentTabContent";
import ReportTabContent from "@/components/campaigns/ReportTabContent";
import CampaignBriefModal from "@/components/campaigns/CampaignBriefModal";
import TabsNavigation, { TabConfig } from "@/components/ui/TabsNavigation";
import InviteCreatorsModal from "@/components/campaigns/InviteCreatorsModal";
import ShareCampaignModal from "@/components/campaigns/ShareCampaignModal";
import BrandDeliverablesModal from "@/components/campaigns/BrandDeliverablesModal";

function getCampaignTitle(campaign: Campaign) {
  return campaign.campaignTitle || "";
}
function getTimelineData(campaign: Campaign) {
  return {
    applicationDeadline: campaign.budget?.applicationDeadline,
    startDate: campaign.campaignStart,
    endDate: campaign.campaignEnd,
  };
}

type TabType = "overview" | "creators" | "content" | "analytics" | "payments";

export default function CampaignDashboardPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { firebaseUser } = useAuth();
  const id = params.id as string;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittedDeliverables, setSubmittedDeliverables] = useState<any[]>([]);

  // Read initial tab state from URL params
  const initialTab = (searchParams.get("tab") as TabType) || "overview";
  const initialSubTab = searchParams.get("subtab")?.toUpperCase() || "INVITES";

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [activeSubTab, setActiveSubTab] = useState<string>(initialSubTab);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeliverablesModalOpen, setIsDeliverablesModalOpen] = useState(false);
  const [invitationsRefreshTrigger, setInvitationsRefreshTrigger] = useState(0);

  const CAMPAIGN_TABS: TabConfig[] = [
    { id: "overview", label: "overview" },
    { id: "creators", label: "creators" },
    { id: "content", label: "content" },
    { id: "analytics", label: "analytics" },
    { id: "payments", label: "payments", disabled: true },
  ];

  const fetchDeliverables = useCallback(async () => {
    if (!firebaseUser || !id) return;
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`/api/deliverables?campaignId=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.deliverables) {
          setSubmittedDeliverables(data.data.deliverables);
        }
      }
    } catch (err) {
      console.error("Error fetching deliverables:", err);
    }
  }, [firebaseUser, id]);

  const fetchCampaign = useCallback(async () => {
    if (!firebaseUser) return;
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      try {
        const token = await firebaseUser.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      } catch (e) {
        console.warn('Failed to get ID token:', e);
      }
      const response = await fetch(`/api/campaigns/${id}`, { method: 'GET', headers });
      if (!response.ok) {
        if (response.status === 404) {
          setCampaign(null);
          return;
        }
        throw new Error(`Failed to fetch campaign: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.data?.campaign) {
        setCampaign(data.data.campaign);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id, firebaseUser]);

  useEffect(() => {
    if (id && firebaseUser) fetchCampaign();
  }, [id, firebaseUser, fetchCampaign]);

  useEffect(() => {
    fetchDeliverables();
  }, [fetchDeliverables]);

  if (loading)
    return (
      <div className="p-8 text-center font-medium text-gray-500">
        Loading Campaign...
      </div>
    );
  if (!campaign) return notFound();

  // Use real stats from campaign data
  const dashboardStats = {
    influencers: campaign.stats?.acceptedApplications || 0,
    totalReach: "0",      // Not available yet
    engagementRate: "0",  // Not available yet
  };
  const creatorSubTabs = ["INVITES", "APPLICATIONS", "APPROVED", "PUBLISHED"];

  const timeline = getTimelineData(campaign);
  const timelineEvents = [
    {
      label: "Application Deadline",
      date: timeline?.applicationDeadline,
      desc: "Last day for influencers to apply",
      status: "completed",
    },
    {
      label: "Campaign Start",
      date: timeline?.startDate,
      desc: "Content creation begins",
      status: "completed",
    },
    {
      label: "Campaign End",
      date: timeline?.endDate,
      desc: "Final submissions due",
      status: "upcoming",
    },
  ];

  const requiredDeliverables = campaign?.tasks?.requiredDeliverables || [];
  const approvedCount = submittedDeliverables.filter(
    (d: any) => d.status?.toLowerCase() === "approved",
  ).length;
  const totalRequiredCount = requiredDeliverables.reduce(
    (sum: number, d: any) => sum + (Number(d.quantity) || 1),
    0,
  );
  const progressPercentage =
    totalRequiredCount > 0
      ? Math.min((approvedCount / totalRequiredCount) * 100, 100)
      : 0;

  const shareInvitationLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/apply/${id}`
      : "";

  return (
    <div className="min-h-screen bg-[#F8F9FD] pb-12">
      {/* ===== PAGE HEADER ===== */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-10 pt-4">
          <div className="max-w-[1440px] mx-auto">
            {/* Title + Action Buttons */}
            <div className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-brand-navy">
                  Manage Campaign
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  View and manage this Campaign.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-white border border-gray-200 text-brand-navy-dark rounded-lg text-xs md:text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-brand-navy-dark text-white rounded-lg text-xs md:text-sm font-bold shadow-sm hover:bg-brand-navy transition-colors whitespace-nowrap"
                >
                  + Invite creators
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="overflow-x-auto scrollbar-hide">
              <div className="min-w-max sm:min-w-0">
                <TabsNavigation
                  tabs={CAMPAIGN_TABS}
                  activeTab={activeTab}
                  onTabChange={(id) => setActiveTab(id as TabType)}
                />
              </div>
            </div>

            {/* Back link */}
            <div className="mt-4 mb-2">
              <Link
                href="/brands/campaigns"
                className="inline-flex items-center gap-2 text-sm font-medium text-brand-navy-dark hover:text-brand-navy transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to all campaigns
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ===== CONTENT AREA ===== */}
      <div className="px-4 sm:px-6 lg:px-10 py-8 max-w-[1440px] mx-auto">
        {/* --- DYNAMIC HEADER CARD --- */}
        <div
          className={`bg-white border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 ${
            activeTab === "creators" ? "rounded-xl mb-0" : "rounded-lg mb-8"
          }`}
        >
          <div className="p-4 md:p-8">
            {/* Campaign Title + Status */}
            <div className="mb-5 md:mb-8">
              <h2 className="text-xl md:text-3xl font-bold text-brand-navy-dark mb-2 leading-tight">
                {campaign.campaignTitle}
              </h2>
              {/* TODO: confirm with design what subheading should show here */}
              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-[#E8F5E9] text-[#2E7D32] rounded text-[10px] font-black uppercase tracking-wider">
                  {campaign.status}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-black uppercase tracking-wider">
                  PUBLIC
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-black uppercase tracking-wider">
                  ID: {campaign.id?.slice(0, 8)}
                </span>
              </div>
            </div>

            {/* Stats Row - Stacks on mobile, horizontal on desktop */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-10">
              {/* Deliverables Progress */}
              <div className="flex-1 md:max-w-md">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs md:text-[13px] font-normal text-brand-navy-dark">
                    Deliverables {approvedCount}/{totalRequiredCount}{" "}
                    Approved
                  </span>
                  <button
                    onClick={() => setIsDeliverablesModalOpen(true)}
                    className="text-xs md:text-[13px] text-brand-navy-dark font-normal underline"
                  >
                    View all
                  </button>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-navy-dark rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Divider - hidden on mobile */}
              <div className="hidden md:block w-px h-12 bg-gray-200" />

              {/* Stats Grid - 3 columns on mobile too, but smaller */}
              <div className="grid grid-cols-3 gap-4 md:flex md:items-center md:gap-12">
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-brand-navy-dark">
                    {dashboardStats.influencers}
                  </div>
                  <div className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Influencers
                  </div>
                </div>
                <div className="text-center opacity-40">
                  <div className="text-xl md:text-2xl font-bold text-gray-400">
                    {dashboardStats.totalReach}
                  </div>
                  <div className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                    Total Reach <HelpCircle className="w-3 h-3" />
                  </div>
                </div>
                <div className="text-center opacity-40">
                  <div className="text-xl md:text-2xl font-bold text-gray-400">
                    {dashboardStats.engagementRate}
                  </div>
                  <div className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Engagement
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CREATORS ATTACHED SUB-NAV - Scrollable on mobile */}
          {activeTab === "creators" && (
            <div className="overflow-x-auto scrollbar-hide border-t border-gray-100">
              <div className="flex bg-white px-4 md:px-8 min-w-max">
                {creatorSubTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveSubTab(tab)}
                    className={`px-6 md:px-10 py-4 md:py-5 text-[11px] md:text-[12px] font-black tracking-widest transition-all border-b-[3px] ${
                      activeSubTab === tab
                        ? "border-brand-navy-dark text-brand-navy-dark"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- TAB CONTENT --- */}
        <div className="mt-8 space-y-6">
          {activeTab === "overview" && (
            <OverviewTabContent
              campaign={campaign}
              onViewBrief={() => setIsBriefModalOpen(true)}
            />
          )}
          {activeTab === "creators" && (
            <InfluencersTabContent activeSubTab={activeSubTab} campaignId={id} onStatsChange={fetchCampaign} />
          )}
          {activeTab === "content" && (
            <ContentTabContent campaignId={id} onStatusChange={fetchDeliverables} />
          )}
          {activeTab === "analytics" && <ReportTabContent />}
        </div>
      </div>

      <CampaignBriefModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
        campaign={campaign}
      />
      <InviteCreatorsModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        campaignId={id}
        onInviteSent={() => {
          setInvitationsRefreshTrigger((prev) => prev + 1);
        }}
      />
      <ShareCampaignModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareLink={shareInvitationLink}
      />
      <BrandDeliverablesModal
        isOpen={isDeliverablesModalOpen}
        onClose={() => setIsDeliverablesModalOpen(false)}
        campaign={campaign}
        deliverables={submittedDeliverables}
      />
    </div>
  );
}
