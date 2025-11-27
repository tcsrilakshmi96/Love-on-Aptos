"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "@/components/logo";

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

    if (status === "authenticated" && session) {
      // Fetch Twitter data
      fetchTwitterUserData();
    }
  }, [router, status, session, fetchTwitterUserData]);

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
      await fetchTwitterUserData();
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
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
              <span className="text-gray-700 dark:text-gray-300 font-medium">{user.twitterHandle}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
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
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-pink-200 dark:border-pink-800">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Fetching your Twitter profile...
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Please wait while we load your profile data
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {fetchError && !isFetchingTwitterData && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 dark:bg-red-900/20 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-4">
                <div className="text-2xl">⚠️</div>
                <div>
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-1">
                    Error loading profile
                  </h3>
                  <p className="text-red-600 dark:text-red-400 text-sm">{fetchError}</p>
                  <button
                    onClick={fetchTwitterUserData}
                    className="mt-3 px-4 py-2 rounded-full bg-red-600 text-white text-sm hover:bg-red-700 transition-all"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Profile Section - Full Twitter Data */}
        {twitterUserData && !isFetchingTwitterData && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-pink-200 dark:border-pink-800">
              {/* Cover Picture */}
              {twitterUserData.coverPicture && (
                <div className="h-48 w-full bg-gradient-to-br from-pink-200 to-purple-200 dark:from-pink-900 dark:to-purple-900">
                  <img
                    src={twitterUserData.coverPicture}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-6">
                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                  <img
                    src={twitterUserData.profilePicture || user.avatar}
                    alt={twitterUserData.name}
                    className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-lg -mt-12 sm:-mt-16"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                        {twitterUserData.name}
                      </h2>
                      {twitterUserData.isBlueVerified && (
                        <span className="text-blue-500 text-xl">✓</span>
                      )}
                    </div>
                    <p className="text-purple-600 dark:text-purple-400 font-medium text-lg mb-2">
                      @{twitterUserData.userName}
                    </p>
                    {twitterUserData.location && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                        📍 {twitterUserData.location}
                      </p>
                    )}
                    {twitterUserData.url && (
                      <a
                        href={twitterUserData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                      >
                        🔗 {twitterUserData.url}
                      </a>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {(twitterUserData.description || twitterUserData.profileBioDescription) && (
                  <div className="mb-6">
                    <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                      {twitterUserData.description || twitterUserData.profileBioDescription}
                    </p>
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {twitterUserData.followers.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
                  </div>
                  <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                      {twitterUserData.following.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Following</div>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {twitterUserData.statusesCount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Tweets</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {twitterUserData.mediaCount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Media</div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
                  {twitterUserData.createdAt && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <span>📅</span>
                      <span>Joined {new Date(twitterUserData.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  {twitterUserData.favouritesCount > 0 && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <span>❤️</span>
                      <span>{twitterUserData.favouritesCount.toLocaleString()} Likes</span>
                    </div>
                  )}
                  {twitterUserData.isTranslator && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <span>🌐</span>
                      <span>Translator</span>
                    </div>
                  )}
                  {twitterUserData.canDm && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <span>💬</span>
                      <span>DMs Open</span>
                    </div>
                  )}
                </div>

                {/* Matched Status */}
                {twitterUserData.isMatched && twitterUserData.matchedWith && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-1">
                          🎉 You&apos;re Matched!
                        </h3>
                        <p className="text-green-600 dark:text-green-400 text-sm">
                          You have a match waiting for you
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link href="/matchmaking">
                          <button className="px-4 py-2 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 transition-all">
                            View Match
                          </button>
                        </Link>
                        <button
                          onClick={handleUnmatch}
                          disabled={isUnmatching}
                          className="px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUnmatching ? "Unmatching..." : "Unmatch"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Generate Traits Button */}
                <div className="mb-6">
                  <button
                    onClick={generateTraits}
                    disabled={isGeneratingTraits}
                    className="w-full px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold text-lg hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isGeneratingTraits ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Generating Traits...
                      </span>
                    ) : (
                      "✨ Generate Traits"
                    )}
                  </button>
                  {traitsError && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-red-600 dark:text-red-400 text-sm">{traitsError}</p>
                    </div>
                  )}
                </div>

                {/* Matchmaking Button */}
                {twitterUserData.traits && twitterUserData.traits.length > 0 && !twitterUserData.isMatched && (
                  <div className="mb-6">
                    <Link href="/matchmaking">
                      <button className="w-full px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold text-lg hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                        💕 Find Matches
                      </button>
                    </Link>
                  </div>
                )}

                {/* Last 5 Tweets Display */}
                {userTweets.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                      Recent Tweets
                    </h3>
                    <div className="space-y-3">
                      {userTweets.map((tweet) => (
                        <div
                          key={tweet.id}
                          className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-2">
                            {tweet.text}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            {tweet.likeCount !== undefined && (
                              <span>❤️ {tweet.likeCount}</span>
                            )}
                            {tweet.retweetCount !== undefined && (
                              <span>🔄 {tweet.retweetCount}</span>
                            )}
                            {tweet.replyCount !== undefined && (
                              <span>💬 {tweet.replyCount}</span>
                            )}
                            {tweet.url && (
                              <a
                                href={tweet.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                View Tweet →
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Traits Display */}
                {twitterUserData && twitterUserData.traits && twitterUserData.traits.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                      Your Traits
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {twitterUserData.traits.map((trait, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 text-pink-700 dark:text-pink-300 text-sm font-medium border border-pink-200 dark:border-pink-800"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* One Liner Display */}
                {twitterUserData.oneLiner && (
                  <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h3 className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2 uppercase">
                      One-Liner
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-lg italic">
                      &ldquo;{twitterUserData.oneLiner}&rdquo;
                    </p>
                  </div>
                )}

                {/* Summary Display */}
                {twitterUserData.summary && (
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2 uppercase">
                      Summary
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {twitterUserData.summary}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Fallback Profile Section (if Twitter data not loaded) */}
        {!twitterUserData && !isFetchingTwitterData && !fetchError && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-pink-200 dark:border-pink-800">
              <div className="flex items-center gap-4">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-20 h-20 rounded-full border-4 border-purple-500 shadow-lg"
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {user.name}
                  </h2>
                  <p className="text-purple-600 dark:text-purple-400 font-medium">
                    {user.twitterHandle}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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

