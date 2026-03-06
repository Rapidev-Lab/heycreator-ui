"use client";

import { Suspense } from "react";
import ProfileCompletionGuard from "@/components/auth/ProfileCompletionGuard";
import EmailVerificationGuard from "@/components/auth/EmailVerificationGuard";
import DiscoveryHeader from "@/components/brands/discover/DiscoveryHeader";
import SecondaryFilterBar from "@/components/brands/discover/SecondaryFilterBar";
import TopTopicsSection from "@/components/discovery/topics/TopTopicsSection";
import RecommendedCreatorCard from "@/components/brands/discover/RecommendedCreatorCard";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CreatorCardData } from "@/lib/utils/discovery-mappers";
import { formatFollowerCount } from "@/lib/types/discovery-filters";
import { useAuth } from "@/lib/firebase/auth-context";
import PageLoader from "@/components/ui/PageLoader";
import SkeletonGrid from "@/components/ui/SkeletonGrid";
import { CreatorCardSkeleton } from "@/components/ui/skeletons";

/**
 * Extended card data that includes navigation metadata from the raw API result.
 */
interface CreatorCardWithNav {
  card: CreatorCardData;
  platform: string;
  username: string;
  name: string;
  avatarUrl: string;
  followerCount: number;
}

/**
 * Map ProfileWithRelevance (discover API response shape) → CreatorCardWithNav.
 * The discover API returns SearchResultProfile fields (snake_case),
 * NOT GlobalInfluencer fields (camelCase).
 */
function mapDiscoverResultToCard(result: any): CreatorCardWithNav {
  const engagementRate = result.rawData?.engagementRate || 0;
  const trueReachPct = result.rawData?.trueReachPercentage || 0;

  // 1. Handle the key mismatch (platforms vs platform)
  const rawPlatformData = result.platforms || result.platform || "instagram";

  // 2. Normalize to a string with YouTube priority
  let normalizedPlatform: string;
  if (Array.isArray(rawPlatformData)) {
    // If 'youtube' is in the array, prioritize it for correct formatting
    normalizedPlatform =
      rawPlatformData.find((p) => p.toLowerCase() === "youtube") ||
      rawPlatformData[0] ||
      "instagram";
  } else {
    normalizedPlatform = rawPlatformData;
  }

  return {
    card: {
      id: result.id || result.username || "",
      avatarUrl: result.avatar_url || "",
      name: result.display_name || "",
      handle: "@" + (result.username || ""),
      isVerified: result.verified || false,
      isBookmarked: false,
      stats: {
        // Now passing the confirmed 'youtube' string
        followers: formatFollowerCount(
          result.follower_count || 0,
          normalizedPlatform,
        ),
        engagement: engagementRate > 0 ? engagementRate.toFixed(1) + "%" : "—",
        reach: trueReachPct > 0 ? trueReachPct.toFixed(1) + "%" : "—",
      },
      // Ensure the UI shows the full list of icons
      socials: (Array.isArray(rawPlatformData)
        ? rawPlatformData
        : [normalizedPlatform]) as CreatorCardData["socials"],
      specialty: result.bio || "",
      tags: result.rawData?.categories || [],
    },
    platform: normalizedPlatform,
    username: result.username || "",
    name: result.display_name || "",
    avatarUrl: result.avatar_url || "",
    followerCount: result.follower_count || 0,
  };
}

function BrandDiscoveryPageContent() {
  const { firebaseUser } = useAuth();
  const router = useRouter();

  // Search bar state (lifted from DiscoveryHeader so TopTopicsSection can update it)
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("Keyword");

  // Topic selection state
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [recommendedCreators, setRecommendedCreators] = useState<
    CreatorCardWithNav[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const hasLoadedRef = useRef(false);

  // Animated show/hide for TopTopicsSection:
  // visible when searchType === 'Topic', hidden when 'Keyword'.
  // isMounted stays true during the fade-out so the transition can play before unmounting.
  const showTopics = searchType === "Topic";
  const [isTopicsMounted, setIsTopicsMounted] = useState(showTopics);
  const [isTopicsVisible, setIsTopicsVisible] = useState(showTopics);

  useEffect(() => {
    if (showTopics) {
      setIsTopicsMounted(true);
      // Two nested RAFs: first ensures the mount is committed to the DOM,
      // second ensures the browser has painted that frame before we transition.
      let outerRaf = 0;
      let innerRaf = 0;
      outerRaf = requestAnimationFrame(() => {
        innerRaf = requestAnimationFrame(() => setIsTopicsVisible(true));
      });
      return () => {
        cancelAnimationFrame(outerRaf);
        cancelAnimationFrame(innerRaf);
      };
    } else {
      setIsTopicsVisible(false);
      const timer = setTimeout(() => setIsTopicsMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [showTopics]);

  /**
   * When a topic card is clicked: toggle it in selectedTopics,
   * and if we're in Topic search mode, sync searchTerm to the selected topics list.
   */
  const handleTopicSelect = (topics: string[]) => {
    setSelectedTopics(topics);
    if (searchType === "Topic") {
      setSearchTerm(topics.join(", "));
    }
  };

  /**
   * When search type changes, if switching TO Topic mode, populate searchTerm
   * from any already-selected topics.
   */
  const handleSearchTypeChange = (type: string) => {
    setSearchType(type);
    if (type === "Topic" && selectedTopics.length > 0) {
      setSearchTerm(selectedTopics.join(", "));
    }
  };

  // Load recommended creators on mount (DB-only, <500ms)
  useEffect(() => {
    if (hasLoadedRef.current || !firebaseUser) return;

    const loadRecommendedCreators = async () => {
      hasLoadedRef.current = true;
      setIsLoading(true);

      try {
        const token = await firebaseUser.getIdToken();
        const response = await fetch("/api/dashboard/recommended?limit=12", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok)
          throw new Error("Failed to fetch recommended creators");

        const data = await response.json();

        if (data.success) {
          const cards: CreatorCardWithNav[] = data.results.map(
            mapDiscoverResultToCard,
          );
          // Deduplicate by platform:username
          const seen = new Set<string>();
          const uniqueCards = cards.filter(c => {
            const key = `${c.platform}:${(c.username || '').toLowerCase()}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          const sortedCards = uniqueCards.sort((a, b) => {
            // Logic to handle potential YouTube data scaling issues if they exist in the raw data
            const countA = a.platform === 'youtube' ? a.followerCount / 1000 : a.followerCount;
            const countB = b.platform === 'youtube' ? b.followerCount / 1000 : b.followerCount;
            return countB - countA;
          });
          setRecommendedCreators(sortedCards);
        }
      } catch (error) {
        console.error("Failed to load recommended creators:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendedCreators();
  }, [firebaseUser]);

  return (
    <ProfileCompletionGuard showLoading={false}>
      <EmailVerificationGuard>
        <div className="min-h-screen bg-gray-50">
          {/* Page Header */}
          <div className="bg-white px-4 sm:px-6 lg:px-8 pt-6 pb-6 border-b border-gray-200">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl font-bold text-brand-navy">Discover</h1>
              <p className="text-sm text-gray-500 mt-1">Find and connect with creators across all platforms</p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Encapsulating Container for Header and Filters */}
            <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-gray-200">
              {/* New Unified Search Header */}
              <div className="mb-4">
                {" "}
                {/* Removed outer padding here, keeping mb */}
                <DiscoveryHeader
                  searchTerm={searchTerm}
                  onSearchTermChange={setSearchTerm}
                  searchType={searchType}
                  onSearchTypeChange={handleSearchTypeChange}
                />
              </div>

              {/* New Secondary Filter Bar */}
              <div>
                {" "}
                {/* Removed mb here, container handles bottom margin */}
                <SecondaryFilterBar />
              </div>
            </div>

            {/* Top Topics Section — fade in when Topic mode, fade out when Keyword */}
            {isTopicsMounted && (
              <div
                className={`mb-12 transition-all duration-300 ease-in-out ${
                  isTopicsVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-2"
                }`}
              >
                <TopTopicsSection
                  selectedTopics={selectedTopics}
                  onTopicSelect={handleTopicSelect}
                />
              </div>
            )}

            {/* Recommended Creators Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-blue-600">•</span>
                Recommended Creators
              </h2>

              {isLoading ? (
                // Loading skeleton
                <SkeletonGrid count={6}>
                  {(i) => <CreatorCardSkeleton key={i} />}
                </SkeletonGrid>
              ) : recommendedCreators.length > 0 ? (
                // Show recommended creators
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendedCreators.map((item) => (
                    <div
                      key={`${item.platform}_${item.username}`}
                      onClick={() => {
                        const tempId = `${item.platform}_${item.username}`;
                        router.push(
                          `/brands/influencers/${tempId}?platform=${item.platform}&username=${encodeURIComponent(item.username)}&name=${encodeURIComponent(item.name)}&avatar=${encodeURIComponent(item.avatarUrl)}&followers=${item.followerCount}`,
                        );
                      }}
                      className="cursor-pointer transition-transform hover:scale-[1.02]"
                    >
                      <RecommendedCreatorCard creator={item.card} />
                    </div>
                  ))}
                </div>
              ) : (
                // Empty state
                <div className="text-center py-12 px-4">
                  <p className="text-gray-500 text-lg">
                    No recommended creators available
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Try searching for specific influencers
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </EmailVerificationGuard>
    </ProfileCompletionGuard>
  );
}

export default function BrandDiscoveryPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <BrandDiscoveryPageContent />
    </Suspense>
  );
}
