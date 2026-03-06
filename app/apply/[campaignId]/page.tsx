"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { ShieldX, ArrowLeft } from "lucide-react";

export default function ApplyRedirectPage() {
  const router = useRouter();
  const { campaignId } = useParams();
  const { firebaseUser, user, loading } = useAuth();
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (loading) return;

    // Target URL with shared flag to bypass email verification for viewing
    const targetUrl = `/influencers/marketplace/${campaignId}?shared=true`;

    if (!firebaseUser) {
      // Not logged in - redirect to influencer login
      router.replace(`/auth/influencer/login?redirect=${encodeURIComponent(targetUrl)}`);
      return;
    }

    // Check user role
    const userRole = user?.role;

    if (userRole === "brand") {
      // Brand users cannot access shared campaign links
      setAccessDenied(true);
      return;
    }

    // Influencer (or role not yet loaded) - allow access
    // The campaign page will handle email verification state
    if (userRole === "influencer" || !userRole) {
      router.replace(targetUrl);
    }
  }, [firebaseUser, user, loading, campaignId, router]);

  // Access denied view for brand users
  if (accessDenied) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldX className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-brand-navy mb-3">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            This campaign link is for influencers only. Brand accounts cannot apply to campaigns.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/brands/dashboard")}
              className="w-full px-6 py-3 bg-brand-navy text-white rounded-xl font-semibold hover:bg-brand-navy-light transition-colors"
            >
              Go to Brand Dashboard
            </button>
            <button
              onClick={() => router.back()}
              className="w-full px-6 py-3 bg-white text-gray-600 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading/redirecting state
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-brand-navy border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
