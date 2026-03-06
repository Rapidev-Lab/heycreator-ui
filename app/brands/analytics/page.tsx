"use client";

import { useState, useEffect, useCallback } from "react";
import AnalyticsMainContent from "@/components/brands/analytics/AnalyticsMainContent";
import SavedReportsTabContent from "@/components/brands/analytics/SavedReportsTabContent";
import { useAuth } from "@/lib/firebase/auth-context";
import { Campaign } from "@/types/campaign";

type AnalyticsTab = "analytics" | "saved";

const ANALYTICS_TABS: { id: AnalyticsTab; label: string }[] = [
  { id: "analytics", label: "Analytics" },
  { id: "saved", label: "Saved Reports" },
];

export default function BrandAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("analytics");
  const { firebaseUser } = useAuth();
  
  // State for shared data
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Reusable fetch logic
  const fetchRecentCampaigns = useCallback(async () => {
    if (!firebaseUser) return;
    setLoading(true);
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch("/api/campaigns", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const all: Campaign[] = data.data.campaigns || [];

        // 3-Month Filter Logic as requested
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const recent = all.filter((c) => {
          const date = c.updatedAt ? new Date(c.updatedAt as any) : new Date(c.createdAt as any);
          return date >= threeMonthsAgo;
        });

        setCampaigns(recent);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser]);

  useEffect(() => {
    fetchRecentCampaigns();
  }, [fetchRecentCampaigns]);

  // Derived count for the Saved Reports badge
  const savedCount = campaigns.filter(c => (c as any).reportStatus === "SAVED").length;
  
  return (
    <>
      {/* Header bar */}
      <div className="bg-white px-4 sm:px-6 lg:px-8 pt-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-brand-navy">Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage your analytics.</p>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex gap-8">
          {ANALYTICS_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = tab.id === "saved" ? savedCount : undefined;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative pb-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-brand-navy border-b-2 border-brand-navy"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                {count !== undefined && count > 0 && (
                  <span
                    className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-brand-navy text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === "analytics" && <AnalyticsMainContent />}

          {activeTab === "saved" && (
            <SavedReportsTabContent
              campaigns={campaigns}
              loading={loading}
              onRefresh={fetchRecentCampaigns}
            />
          )}
        </div>
      </div>
    </>
  );
}