'use client';

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import DiscoveryHeader from "@/components/brands/discover/DiscoveryHeader";
import RecommendedCreatorCard from "@/components/brands/discover/RecommendedCreatorCard";
import ResultsHeader from '@/components/discovery/results/ResultsHeader';
import { useToast } from "@/components/ui/ToastContainer";
import { auth } from "@/lib/firebase/config";

interface InviteCreatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  onInviteSent?: () => void;
}

export default function InviteCreatorsModal({ isOpen, onClose, campaignId, onInviteSent }: InviteCreatorsModalProps) {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("Keyword");
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // State for recommended creators from database
  const [recommendedCreators, setRecommendedCreators] = useState<any[]>([]);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const [invitingCreatorId, setInvitingCreatorId] = useState<string | null>(null);

  // Fetch creators from users collection when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchCreators = async () => {
      setLoadingRecommended(true);
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();
        const response = await fetch("/api/brands/creators/users?limit=20", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            // Transform user data to match CreatorCardData format
            const transformed = data.data.map((creator: any) => ({
              id: creator.id || creator.uid,
              avatarUrl: creator.photoURL || "",
              name: creator.displayName || creator.email?.split("@")[0] || "Creator",
              handle: creator.email ? `@${creator.email.split("@")[0]}` : "",
              isVerified: creator.emailVerified || false,
              isBookmarked: false,
              stats: {
                followers: "—",
                engagement: "—",
                reach: "—",
              },
              socials: [] as ('instagram' | 'tiktok' | 'youtube' | 'x' | 'facebook')[],
              specialty: "",
              tags: [] as string[],
            }));
            setRecommendedCreators(transformed);
          }
        }
      } catch (error) {
        console.error("Error fetching creators:", error);
      } finally {
        setLoadingRecommended(false);
      }
    };

    fetchCreators();
  }, [isOpen]);

  // Handle adding a creator to the campaign
  const handleAddToCampaign = async (creatorId: string) => {
    if (!creatorId || !campaignId) {
      console.error("Missing creatorId or campaignId", { creatorId, campaignId });
      return;
    }

    setInvitingCreatorId(creatorId);
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("Please log in to invite creators");
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch(`/api/campaigns/${campaignId}/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          influencerIds: [creatorId],
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Invitation sent successfully!");
        onInviteSent?.();
      } else {
        toast.error(data.error || "Failed to send invitation");
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error("Failed to send invitation. Please try again.");
    } finally {
      setInvitingCreatorId(null);
    }
  };

  // Search users collection for creators
  const handleInternalSearch = async () => {
    if (!searchTerm.trim()) return;

    setHasSearched(true);
    setIsLoading(true);
    setInfluencers([]);
    setSearchError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        setSearchError("Please log in to search creators");
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch(
        `/api/brands/creators/users?q=${encodeURIComponent(searchTerm)}&limit=30`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();
      if (response.ok && data.success && data.data) {
        const transformed = data.data.map((creator: any) => ({
          id: creator.id || creator.uid,
          avatarUrl: creator.photoURL || "",
          name: creator.displayName || creator.email?.split("@")[0] || "Creator",
          handle: creator.email ? `@${creator.email.split("@")[0]}` : "",
          isVerified: creator.emailVerified || false,
          isBookmarked: false,
          stats: {
            followers: "—",
            engagement: "—",
            reach: "—",
          },
          socials: [] as ('instagram' | 'tiktok' | 'youtube' | 'x' | 'facebook')[],
          specialty: "",
          tags: [] as string[],
        }));
        setInfluencers(transformed);
      } else {
        setSearchError(data.error || "Search failed. Please try again.");
      }
    } catch (error) {
      console.error("Error searching creators:", error);
      setSearchError("Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center ${!isOpen && "hidden"}`}>
      <div className="absolute inset-0 bg-brand-navy-dark/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-6xl h-[90vh] rounded-[32px] flex flex-col overflow-hidden">
        
        {/* Header - Always visible */}
        <div className="p-8 border-b flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-brand-navy-dark">Invite Creators</h2>
            <p className="text-gray-500 text-sm">Discover and recruit influencers for this campaign</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/50">
          {/* Search Bar Section - Matches Discovery Page Style */}
          <div className="p-8 bg-white border-b shrink-0">
             <DiscoveryHeader
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              searchType={searchType}
              onSearchTypeChange={setSearchType}
              isModalMode={true}
              onExecuteSearch={handleInternalSearch}
            />
          </div>

          {/* Conditional View Area */}
          <div className="flex-1 flex overflow-hidden">
            {!hasSearched ? (
              /* INITIAL VIEW: Recommended Influencers */
              <div className="flex-1 overflow-y-auto p-8">
                <h3 className="text-lg font-bold text-brand-navy-dark mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full" />
                  Recommended Influencers
                </h3>
                {loadingRecommended ? (
                  <div className="text-center py-20">
                    <Loader2 className="animate-spin mx-auto w-10 h-10 text-blue-600" />
                    <p className="mt-4 text-gray-500">Loading creators...</p>
                  </div>
                ) : recommendedCreators.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {recommendedCreators.map((creator) => (
                      <RecommendedCreatorCard
                        key={creator.id}
                        creator={creator}
                        onAddToCampaign={handleAddToCampaign}
                        isInviting={invitingCreatorId === creator.id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-500">
                    No creators found. Use the search above to find creators.
                  </div>
                )}
              </div>
            ) : (
              /* RESULTS VIEW */
              <div className="flex-1 overflow-y-auto p-8">
                <ResultsHeader
                  count={influencers.length}
                  title={`${influencers.length} Influencers Found`}
                />

                <div className="mt-6">
                  {searchError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {searchError}
                    </div>
                  )}
                  {isLoading && influencers.length === 0 ? (
                    <div className="text-center py-20">
                      <Loader2 className="animate-spin mx-auto w-10 h-10 text-blue-600" />
                      <p className="mt-4 text-gray-500">Searching creators...</p>
                    </div>
                  ) : influencers.length === 0 && !searchError ? (
                    <div className="text-center py-20 text-gray-500">
                      No creators found matching &quot;{searchTerm}&quot;
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                       {influencers.map((inf) => (
                         <RecommendedCreatorCard
                           key={inf.id}
                           creator={inf}
                           onAddToCampaign={handleAddToCampaign}
                           isInviting={invitingCreatorId === inf.id}
                         />
                       ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-white border-t flex justify-end shrink-0">
          <button onClick={onClose} className="px-8 py-2 bg-brand-navy-dark text-white rounded-xl font-bold">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}