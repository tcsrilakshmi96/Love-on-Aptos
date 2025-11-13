"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

interface Match {
  id: string;
  name: string;
  twitterHandle: string;
  avatar: string;
  bio: string;
  interests: string[];
  matchScore: number;
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
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingTwitterData, setIsFetchingTwitterData] = useState(false);
  const [twitterUserData, setTwitterUserData] = useState<TwitterUserData | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const router = useRouter();

  const fetchTwitterUserData = async () => {
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
      }
    } catch (error: any) {
      console.error("Error fetching Twitter data:", error);
      setFetchError(error.message || "Failed to fetch Twitter data");
    } finally {
      setIsFetchingTwitterData(false);
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
      
      // Simulate loading matches
      setTimeout(() => {
        setMatches([
          {
            id: "1",
            name: "Alex",
            twitterHandle: "@alex_crypto",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
            bio: "Blockchain enthusiast | Love hiking and coffee ☕",
            interests: ["Crypto", "Hiking", "Coffee", "Tech"],
            matchScore: 95
          },
          {
            id: "2",
            name: "Sam",
            twitterHandle: "@sam_aptos",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sam",
            bio: "Aptos builder | NFT collector | Art lover 🎨",
            interests: ["Aptos", "NFTs", "Art", "Web3"],
            matchScore: 88
          },
          {
            id: "3",
            name: "Jordan",
            twitterHandle: "@jordan_dev",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jordan",
            bio: "Developer | Gamer | Foodie 🍕",
            interests: ["Development", "Gaming", "Food", "Travel"],
            matchScore: 82
          },
          {
            id: "4",
            name: "Taylor",
            twitterHandle: "@taylor_web3",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=taylor",
            bio: "Web3 advocate | Yoga instructor | Bookworm 📚",
            interests: ["Web3", "Yoga", "Reading", "Wellness"],
            matchScore: 79
          }
        ]);
        setIsLoading(false);
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, status, session]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
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
    username: (session.user as any)?.username || session.user?.name || "User",
    name: session.user?.name || (session.user as any)?.username || "User",
    twitterHandle: `@${(session.user as any)?.username || session.user?.name?.toLowerCase().replace(/\s+/g, '') || "user"}`,
    avatar: session.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user?.name || "user"}`,
  };

  const handleLike = (matchId: string) => {
    setMatches(matches.filter(m => m.id !== matchId));
    // In production, this would send a like to the backend
  };

  const handlePass = (matchId: string) => {
    setMatches(matches.filter(m => m.id !== matchId));
    // In production, this would send a pass to the backend
  };

  const currentMatch = matches[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            💝 Love on Aptos
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
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

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Finding your perfect matches...</p>
            </div>
          </div>
        ) : matches.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="text-6xl mb-4">💔</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">No more matches</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Check back later for new potential matches!
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:from-pink-600 hover:to-purple-600 transition-all"
            >
              Go Home
            </Link>
          </div>
        ) : (
          <div className="max-w-lg mx-auto">
            {/* Match Card */}
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-pink-200 dark:border-pink-800">
              {/* Match Score Badge */}
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                  {currentMatch.matchScore}% Match
                </div>
              </div>

              {/* Profile Image */}
              <div className="relative h-96 bg-gradient-to-br from-pink-200 to-purple-200 dark:from-pink-900 dark:to-purple-900">
                <img
                  src={currentMatch.avatar}
                  alt={currentMatch.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Profile Info */}
              <div className="p-6">
                <div className="mb-4">
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                    {currentMatch.name}
                  </h2>
                  <p className="text-purple-600 dark:text-purple-400 font-medium">
                    {currentMatch.twitterHandle}
                  </p>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg">
                  {currentMatch.bio}
                </p>

                {/* Interests */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase">
                    Interests
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {currentMatch.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => handlePass(currentMatch.id)}
                    className="flex-1 px-6 py-4 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all transform hover:scale-105"
                  >
                    ✕ Pass
                  </button>
                  <button
                    onClick={() => handleLike(currentMatch.id)}
                    className="flex-1 px-6 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold text-lg hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    ♥ Like
                  </button>
                </div>
              </div>
            </div>

            {/* Matches Count */}
            <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
              <p>{matches.length - 1} more {matches.length - 1 === 1 ? 'match' : 'matches'} available</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

