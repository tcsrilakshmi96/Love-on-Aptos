"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "@/components/logo";
import ProfileCard from "@/components/profile-card";

interface Tweet {
  id: string;
  text: string;
  url: string;
  createdAt?: string;
  retweetCount?: number;
  replyCount?: number;
  likeCount?: number;
}

interface TwitterUserData {
  id: string;
  twitterId: string;
  userName: string;
  name: string;
  url: string | null;
  isBlueVerified: boolean;
  verifiedType: string | null;
  profilePicture: string | null;
  coverPicture: string | null;
  description: string | null;
  location: string | null;
  followers: number;
  following: number;
  canDm: boolean;
  createdAt: string | null;
  favouritesCount: number;
  hasCustomTimelines: boolean;
  isTranslator: boolean;
  mediaCount: number;
  statusesCount: number;
  possiblySensitive: boolean;
  isAutomated: boolean;
  automatedBy: string | null;
  profileBioDescription: string | null;
  profileBioUrl: string | null;
  traits: string[];
  oneLiner: string | null;
  summary: string | null;
  tweets?: Tweet[] | null; // Can be null or array from DB
  isMatched?: boolean;
  matchedWith?: string | null;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isFetchingTwitterData, setIsFetchingTwitterData] = useState(false);
  const [twitterUserData, setTwitterUserData] = useState<TwitterUserData | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isGeneratingTraits, setIsGeneratingTraits] = useState(false);
  const [traitsError, setTraitsError] = useState<string | null>(null);
  const [userTweets, setUserTweets] = useState<Tweet[]>([]);
  const [isUnmatching, setIsUnmatching] = useState(false);
  const router = useRouter();
  const hasFetchedRef = useRef(false);

  const fetchTwitterUserData = useCallback(async () => {
    setIsFetchingTwitterData(true);
    setFetchError(null);
    
    try {
      const response = await fetch("/api/user/fetch-twitter-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch Twitter data");
      }

      const data = await response.json();
      if (data.success && data.user) {
        setTwitterUserData(data.user);
        // If user has stored tweets, show random 5
        if (data.user.tweets && Array.isArray(data.user.tweets) && data.user.tweets.length > 0) {
          const shuffled = [...data.user.tweets].sort(() => Math.random() - 0.5);
          setUserTweets(shuffled.slice(0, 5));
        }
      }
    } catch (error: unknown) {
      console.error("Error fetching Twitter data:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch Twitter data";
      setFetchError(errorMessage);
    } finally {
      setIsFetchingTwitterData(false);
    }
  }, []);

  const generateTraits = async () => {
    setIsGeneratingTraits(true);
    setTraitsError(null);
    
    try {
      const response = await fetch("/api/user/generate-traits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate traits");
      }

      const data = await response.json();
      if (data.success && twitterUserData) {
        // Update local state with new traits and tweets
        setTwitterUserData({
          ...twitterUserData,
          traits: data.traits || [],
          oneLiner: data.oneLiner || null,
          summary: data.summary || null,
          tweets: data.tweets || null,
        });
        // Store random tweets for display (from API response or from stored tweets)
        if (data.tweets && Array.isArray(data.tweets)) {
          setUserTweets(data.tweets);
        } else if (twitterUserData.tweets && Array.isArray(twitterUserData.tweets)) {
          // If we have stored tweets, show random 5
          const shuffled = [...twitterUserData.tweets].sort(() => Math.random() - 0.5);
          setUserTweets(shuffled.slice(0, 5));
        }
      }
    } catch (error: unknown) {
      console.error("Error generating traits:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate traits";
      setTraitsError(errorMessage);
    } finally {
      setIsGeneratingTraits(false);
    }
  };

  useEffect(() => {
    // Check authentication
    if (status === "unauthenticated") {
      router.push("/auth");
      return;
    }

    if (status === "authenticated" && session && !hasFetchedRef.current) {
      // Fetch Twitter data only once
      hasFetchedRef.current = true;
      fetchTwitterUserData();
    }
  }, [router, status, session, fetchTwitterUserData]);

  const handleRetry = () => {
    hasFetchedRef.current = false;
    fetchTwitterUserData();
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleUnmatch = async () => {
    setIsUnmatching(true);
    try {
      const response = await fetch("/api/matchmaking/unmatch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to unmatch");
      }

      // Refresh Twitter data to update matched status
      hasFetchedRef.current = false;
      await fetchTwitterUserData();
      hasFetchedRef.current = true;
    } catch (error: unknown) {
      console.error("Error unmatching:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to unmatch";
      alert(errorMessage);
    } finally {
      setIsUnmatching(false);
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Get user data from session or Twitter data
  const user = twitterUserData ? {
    username: twitterUserData.userName,
    name: twitterUserData.name,
    twitterHandle: `@${twitterUserData.userName}`,
    avatar: twitterUserData.profilePicture || session.user?.image || "",
  } : {
    username: (session.user as { username?: string })?.username || session.user?.name || "User",
    name: session.user?.name || (session.user as { username?: string })?.username || "User",
    twitterHandle: `@${(session.user as { username?: string })?.username || session.user?.name?.toLowerCase().replace(/\s+/g, '') || "user"}`,
    avatar: session.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user?.name || "user"}`,
  };


  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Logo className="text-3xl md:text-5xl" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-10 h-10 rounded-full border-2 border-purple-500"
              />
              <span className="text-gray-300 font-medium">{user.twitterHandle}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/20"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Loading State - Fetching Twitter Data */}
        {isFetchingTwitterData && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-purple-500/20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Fetching your Twitter profile...
                </h3>
                <p className="text-gray-400">
                  Please wait while we load your profile data
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {fetchError && !isFetchingTwitterData && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-500/10 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-red-500/30">
              <div className="flex items-center gap-4">
                <div className="text-2xl">⚠️</div>
                <div>
                  <h3 className="text-lg font-semibold text-red-400 mb-1">
                    Error loading profile
                  </h3>
                  <p className="text-red-300 text-sm">{fetchError}</p>
                  <button
                    onClick={handleRetry}
                    className="mt-3 px-4 py-2 rounded-full bg-red-600 text-white text-sm hover:bg-red-700 transition-all"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Profile Section - Using ProfileCard Component */}
        {twitterUserData && !isFetchingTwitterData && (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Profile Card Component */}
            <ProfileCard
              name={twitterUserData.name}
              username={twitterUserData.userName}
              bio={twitterUserData.description || twitterUserData.profileBioDescription || undefined}
              avatarSrc={twitterUserData.profilePicture || user.avatar}
              coverSrc={twitterUserData.coverPicture || undefined}
              statusText={twitterUserData.isMatched ? "Matched" : "Not Matched"}
              statusColor={twitterUserData.isMatched ? "bg-green-500" : "bg-purple-500"}
              glowText=""
              traits={twitterUserData.traits || []}
              oneLiner={twitterUserData.oneLiner || undefined}
              followers={twitterUserData.followers}
              following={twitterUserData.following}
              tweets={twitterUserData.statusesCount}
              location={twitterUserData.location || undefined}
              joinedDate={twitterUserData.createdAt ? new Date(twitterUserData.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : undefined}
              isVerified={twitterUserData.isBlueVerified}
              isMatched={twitterUserData.isMatched || false}
              onViewMatch={() => router.push("/matchmaking")}
              onUnmatch={handleUnmatch}
              isUnmatching={isUnmatching}
            />

            {/* Action Buttons */}
            <div className="max-w-5xl mx-auto space-y-3">
              {/* Generate Traits Button - Only show if no traits */}
              {(!twitterUserData.traits || twitterUserData.traits.length === 0) && (
                <div>
                  <button
                    onClick={generateTraits}
                    disabled={isGeneratingTraits}
                    className="w-full px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-bold text-base hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingTraits ? (
                      <span className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Generating Traits...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span className="text-xl">✨</span>
                        Generate Traits
                      </span>
                    )}
                  </button>
                  {traitsError && (
                    <p className="mt-3 text-sm text-red-400 text-center">{traitsError}</p>
                  )}
                </div>
              )}

              {/* Find Matches Button */}
              {twitterUserData.traits && twitterUserData.traits.length > 0 && !twitterUserData.isMatched && (
                <Link href="/matchmaking">
                  <button className="w-full px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white font-bold text-base hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 transition-all shadow-xl">
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-xl">💕</span>
                      Find Your Match
                    </span>
                  </button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Fallback Profile Section (if Twitter data not loaded) */}
        {!twitterUserData && !isFetchingTwitterData && !fetchError && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-purple-500/20">
              <div className="flex items-center gap-4">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-20 h-20 rounded-full border-4 border-purple-500 shadow-lg"
                />
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {user.name}
                  </h2>
                  <p className="text-purple-400 font-medium">
                    {user.twitterHandle}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Your Profile
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

