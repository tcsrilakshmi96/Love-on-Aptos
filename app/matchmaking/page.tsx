"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

interface MatchProfile {
  id: string;
  name: string;
  userName: string;
  profilePicture: string | null;
  traits: string[];
  oneLiner: string | null;
  matchingTraits: string[];
}

interface FullMatchProfile extends MatchProfile {
  coverPicture: string | null;
  description: string | null;
  location: string | null;
  followers: number;
  following: number;
  summary: string | null;
  tweets: unknown;
  isBlueVerified: boolean;
  url: string | null;
}

interface CurrentUserProfile {
  id: string;
  name: string;
  userName: string;
  profilePicture: string | null;
  coverPicture: string | null;
  description: string | null;
  location: string | null;
  followers: number;
  following: number;
  traits: string[];
  oneLiner: string | null;
  summary: string | null;
  isBlueVerified: boolean;
  url: string | null;
}

export default function MatchmakingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [selectedMatch, setSelectedMatch] = useState<FullMatchProfile | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<CurrentUserProfile | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isUnmatching, setIsUnmatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [dragX, setDragX] = useState(0);

  const fetchMatches = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/matchmaking/find-matches");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch matches");
      }
      const data = await response.json();
      if (data.success && data.matches) {
        setMatches(data.matches);
        if (data.matches.length > 0) {
          setCurrentMatchIndex(0);
        } else {
          setMatches([]);
          setCurrentMatchIndex(0);
        }
      } else {
        setMatches([]);
        setCurrentMatchIndex(0);
      }
    } catch (error: unknown) {
      console.error("Error fetching matches:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch matches";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUserProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/user/fetch-twitter-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setCurrentUserProfile({
            id: data.user.id,
            name: data.user.name,
            userName: data.user.userName,
            profilePicture: data.user.profilePicture,
            coverPicture: data.user.coverPicture,
            description: data.user.description,
            location: data.user.location,
            followers: data.user.followers,
            following: data.user.following,
            traits: data.user.traits || [],
            oneLiner: data.user.oneLiner,
            summary: data.user.summary,
            isBlueVerified: data.user.isBlueVerified,
            url: data.user.url,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching current user profile:", error);
    }
  }, []);

  const fetchExistingMatch = useCallback(async () => {
    try {
      const response = await fetch("/api/matchmaking/get-match");
      const data = await response.json();
      if (response.ok && data.success && data.match) {
        setSelectedMatch(data.match as FullMatchProfile);
        // Also fetch current user profile
        await fetchCurrentUserProfile();
        setIsLoading(false);
        return;
      }
      // If not matched (success: false), fetch potential matches
      fetchMatches();
    } catch {
      // If error, try to fetch matches
      fetchMatches();
    }
  }, [fetchMatches, fetchCurrentUserProfile]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
      return;
    }

    if (status === "authenticated" && session) {
      // Check if user is already matched, if so fetch the match
      fetchExistingMatch();
    }
  }, [router, status, session, fetchExistingMatch]);

  const handleSelectMatch = async () => {
    if (!matches[currentMatchIndex]) return;

    setIsSelecting(true);
    try {
      const response = await fetch("/api/matchmaking/select-match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matchUserId: matches[currentMatchIndex].id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to select match");
      }

      const data = await response.json();
      if (data.success && data.match) {
        setSelectedMatch(data.match as FullMatchProfile);
        setExitDirection(null);
        setDragX(0);
        // Also fetch current user profile
        await fetchCurrentUserProfile();
      }
    } catch (error: unknown) {
      console.error("Error selecting match:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to select match";
      setError(errorMessage);
      setExitDirection(null);
      setDragX(0);
    } finally {
      setIsSelecting(false);
    }
  };

  const handlePass = () => {
    if (currentMatchIndex < matches.length - 1) {
      setCurrentMatchIndex(currentMatchIndex + 1);
      setExitDirection(null);
      setDragX(0);
    } else {
      // No more matches
      setMatches([]);
      setCurrentMatchIndex(0);
      setExitDirection(null);
      setDragX(0);
    }
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

      // Clear matched state and refresh to show matchmaking
      setSelectedMatch(null);
      setCurrentUserProfile(null);
      // Fetch potential matches again
      await fetchMatches();
    } catch (error: unknown) {
      console.error("Error unmatching:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to unmatch";
      setError(errorMessage);
    } finally {
      setIsUnmatching(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Finding your perfect matches...</p>
        </div>
      </div>
    );
  }

  if (error && matches.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <nav className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Logo className="text-3xl md:text-5xl" />
            </Link>
            <Link href="/profile">
              <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">Profile</Button>
            </Link>
          </div>
        </nav>
        <main className="container mx-auto px-6 py-8">
          <div className="max-w-md mx-auto text-center py-20">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold mb-2 text-white">No matches found</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <Link href="/profile">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">Go to Profile</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const currentMatch = matches[currentMatchIndex];

  // Show matched profile
  if (selectedMatch) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Logo className="text-2xl md:text-4xl" />
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/profile">
                <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-sm px-3 py-1.5">Profile</Button>
              </Link>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-2">
          <div className="max-w-5xl mx-auto">

            {/* Two Profiles Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Current User Profile */}
              {currentUserProfile && (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/5 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-purple-500/20"
                >
                  <div className="p-4">
                    {/* Profile Header */}
                    <div className="flex flex-col items-center text-center mb-3">
                      <img
                        src={currentUserProfile.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserProfile.userName}`}
                        alt={currentUserProfile.name}
                        className="w-16 h-16 rounded-xl border-4 border-[#0a0a0a] shadow-xl ring-2 ring-purple-500/30"
                      />
                      <div className="flex items-center gap-1.5 mt-2">
                        <h2 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          {currentUserProfile.name}
                        </h2>
                        {currentUserProfile.isBlueVerified && (
                          <span className="text-blue-400 text-sm">✓</span>
                        )}
                      </div>
                      <p className="text-purple-400 font-medium text-xs">
                        @{currentUserProfile.userName}
                      </p>
                      {currentUserProfile.location && (
                        <p className="text-gray-400 text-xs mt-0.5">
                          📍 {currentUserProfile.location}
                        </p>
                      )}
                    </div>

                    {/* One Liner */}
                    {currentUserProfile.oneLiner && (
                      <div className="mb-3 p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <p className="text-gray-300 text-xs italic text-center line-clamp-2">
                          &ldquo;{currentUserProfile.oneLiner}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Traits */}
                    {currentUserProfile.traits && currentUserProfile.traits.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold text-gray-400 mb-2 text-center">
                          Your Traits
                        </h3>
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {currentUserProfile.traits.slice(0, 8).map((trait, index) => (
                            <span
                              key={index}
                              className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                                selectedMatch.matchingTraits?.includes(trait)
                                  ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                  : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              }`}
                            >
                              {selectedMatch.matchingTraits?.includes(trait) && "✨ "}
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Matched User Profile */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white/5 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-pink-500/20"
              >
                <div className="p-4">
                  {/* Profile Header */}
                  <div className="flex flex-col items-center text-center mb-3">
                    <img
                      src={selectedMatch.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMatch.userName}`}
                      alt={selectedMatch.name}
                      className="w-16 h-16 rounded-xl border-4 border-[#0a0a0a] shadow-xl ring-2 ring-pink-500/30"
                    />
                    <div className="flex items-center gap-1.5 mt-2">
                      <h2 className="text-lg font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                        {selectedMatch.name}
                      </h2>
                      {selectedMatch.isBlueVerified && (
                        <span className="text-blue-400 text-sm">✓</span>
                      )}
                    </div>
                    <p className="text-pink-400 font-medium text-xs">
                      @{selectedMatch.userName}
                    </p>
                    {selectedMatch.location && (
                      <p className="text-gray-400 text-xs mt-0.5">
                        📍 {selectedMatch.location}
                      </p>
                    )}
                  </div>

                  {/* One Liner */}
                  {selectedMatch.oneLiner && (
                    <div className="mb-3 p-2 bg-pink-500/10 rounded-lg border border-pink-500/20">
                      <p className="text-gray-300 text-xs italic text-center line-clamp-2">
                        &ldquo;{selectedMatch.oneLiner}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Traits */}
                  {selectedMatch.traits && selectedMatch.traits.length > 0 && (
                    <div className="mb-3">
                      <h3 className="text-xs font-semibold text-gray-400 mb-2 text-center">
                        Their Traits
                      </h3>
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        {selectedMatch.traits.slice(0, 8).map((trait, index) => (
                          <span
                            key={index}
                            className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                              selectedMatch.matchingTraits?.includes(trait)
                                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                : "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                            }`}
                          >
                            {selectedMatch.matchingTraits?.includes(trait) && "✨ "}
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Twitter/X Profile Button */}
                  <a
                    href={`https://x.com/${selectedMatch.userName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block"
                  >
                    <Button className="w-full text-xs py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white">
                      <span className="mr-1.5">𝕏</span>
                      View on X
                    </Button>
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-4 flex gap-3 justify-center"
            >
              <Link href="/profile">
                <Button className="px-5 py-2 text-sm bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600">Go to Profile</Button>
              </Link>
              <Button
                onClick={handleUnmatch}
                disabled={isUnmatching}
                variant="outline"
                className="px-5 py-2 text-sm border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
              >
                {isUnmatching ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-red-400"></div>
                    Unmatching...
                  </span>
                ) : (
                  "Unmatch"
                )}
              </Button>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  // Show matchmaking interface
  if (!currentMatch) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <nav className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Logo className="text-3xl md:text-5xl" />
            </Link>
            <Link href="/profile">
              <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">Profile</Button>
            </Link>
          </div>
        </nav>
        <main className="container mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto text-center py-20"
          >
            <div className="text-6xl mb-4">💔</div>
            <h2 className="text-2xl font-bold mb-2 text-white">No more matches</h2>
            <p className="text-gray-400 mb-6">
              Check back later for new potential matches!
            </p>
            <Link href="/profile">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">Go to Profile</Button>
            </Link>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Logo className="text-2xl md:text-4xl" />
          </Link>
          <Link href="/profile">
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-sm px-3 py-1.5">Profile</Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-2">
        <div className="max-w-md mx-auto">
          {/* Swipe Instructions */}
          <div className="text-center mb-3">
            <p className="text-gray-500 text-xs">
              Swipe left to pass ← | Swipe right to match →
            </p>
          </div>

          {/* Cards Stack Container */}
          <div className="relative h-[600px]">
            {/* Card Stack - 3rd card (bottom) */}
            {matches[currentMatchIndex + 2] && (
              <motion.div
                className="absolute inset-0 h-[600px]"
                initial={false}
                animate={{
                  scale: 0.9,
                  y: 16,
                  opacity: 0.3,
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-purple-500/10 h-full">
                  <div className="relative h-64 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-indigo-600/20"></div>
                </div>
              </motion.div>
            )}

            {/* Card Stack - 2nd card (middle) */}
            {matches[currentMatchIndex + 1] && (
              <motion.div
                className="absolute inset-0 h-[600px]"
                initial={false}
                animate={{
                  scale: exitDirection ? 0.98 : 0.95,
                  y: exitDirection ? 4 : 8,
                  opacity: exitDirection ? 0.8 : 0.5,
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-purple-500/15 h-full">
                  <div className="relative h-64 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-indigo-600/20 overflow-hidden">
                    {matches[currentMatchIndex + 1].profilePicture && (
                      <img
                        src={matches[currentMatchIndex + 1].profilePicture || ""}
                        alt="Next match"
                        className="w-full h-full object-cover blur-2xl scale-110 opacity-30"
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Current Match Card (top) */}
            <AnimatePresence mode="popLayout">
              <motion.div
                key={currentMatch.id}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.9}
                onDrag={(e, { offset }) => {
                  setDragX(offset.x);
                }}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = offset.x * velocity.x;
                  const swipeThreshold = 2000;

                  if (swipe < -swipeThreshold || offset.x < -100) {
                    // Swipe left - Pass
                    setExitDirection("left");
                    setTimeout(() => {
                      handlePass();
                    }, 300);
                  } else if (swipe > swipeThreshold || offset.x > 100) {
                    // Swipe right - Match
                    setExitDirection("right");
                    setTimeout(() => {
                      handleSelectMatch();
                    }, 300);
                  } else {
                    setDragX(0);
                  }
                }}
                initial={{ scale: 0.95, opacity: 0, y: 8 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1, 
                  y: 0,
                  x: 0,
                  rotate: dragX / 20,
                }}
                exit={{ 
                  x: exitDirection === "right" ? 500 : -500,
                  opacity: 0,
                  rotate: exitDirection === "right" ? 20 : -20,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                }}
                whileDrag={{ cursor: "grabbing" }}
                className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-purple-500/20 select-none h-full"
                style={{
                  cursor: "grab",
                  touchAction: "none",
                  boxShadow: dragX > 0
                    ? `0 0 30px rgba(34, 197, 94, ${Math.min(Math.abs(dragX) / 150, 0.5)})`
                    : dragX < 0
                    ? `0 0 30px rgba(239, 68, 68, ${Math.min(Math.abs(dragX) / 150, 0.5)})`
                    : "0 20px 40px -12px rgba(0, 0, 0, 0.3)",
                }}
              >
                {/* Swipe Indicators */}
                <motion.div
                  className="absolute top-4 right-4 z-20 pointer-events-none"
                  animate={{
                    opacity: Math.max(0, Math.min(1, dragX / 60)),
                    scale: 0.9 + Math.max(0, Math.min(0.1, dragX / 200)),
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="bg-green-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg font-semibold text-sm border-2 border-green-400/50 shadow-lg">
                    ♥ MATCH
                  </div>
                </motion.div>
                <motion.div
                  className="absolute top-4 left-4 z-20 pointer-events-none"
                  animate={{
                    opacity: Math.max(0, Math.min(1, -dragX / 60)),
                    scale: 0.9 + Math.max(0, Math.min(0.1, -dragX / 200)),
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="bg-red-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg font-semibold text-sm border-2 border-red-400/50 shadow-lg">
                    ✕ PASS
                  </div>
                </motion.div>

            {/* Matching Traits Badge */}
            {currentMatch.matchingTraits && currentMatch.matchingTraits.length > 0 && (
              <div className="absolute top-3 right-3 z-10">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full font-bold shadow-lg text-xs">
                  {currentMatch.matchingTraits.length} Match{currentMatch.matchingTraits.length > 1 ? "es" : ""}
                </div>
              </div>
            )}

            {/* Blurred Profile Image */}
            <div className="relative h-64 bg-gradient-to-br from-purple-600/30 via-pink-600/30 to-indigo-600/30 overflow-hidden">
              {currentMatch.profilePicture ? (
                <div className="relative w-full h-full">
                  <img
                    src={currentMatch.profilePicture}
                    alt={currentMatch.name}
                    className="w-full h-full object-cover blur-3xl scale-125"
                  />
                  <div className="absolute inset-0 bg-black/60"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-5xl drop-shadow-2xl">🔒</div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-5xl">👤</div>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="p-4">
              <div className="mb-3">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-0.5">
                  {currentMatch.name}
                </h2>
                <p className="text-purple-400 font-medium text-sm">
                  @{currentMatch.userName}
                </p>
              </div>

              {/* One Liner */}
              {currentMatch.oneLiner && (
                <div className="mb-3 p-2.5 bg-pink-500/10 rounded-lg border border-pink-500/20">
                  <p className="text-gray-300 text-sm italic line-clamp-2">
                    &ldquo;{currentMatch.oneLiner}&rdquo;
                  </p>
                </div>
              )}

              {/* Traits */}
              {currentMatch.traits && currentMatch.traits.length > 0 && (
                <div className="mb-3">
                  <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase">
                    Traits
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {currentMatch.traits.slice(0, 6).map((trait, index) => (
                      <span
                        key={index}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                          currentMatch.matchingTraits.includes(trait)
                            ? "bg-green-500/20 text-green-300 border border-green-500/30"
                            : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        }`}
                      >
                        {currentMatch.matchingTraits.includes(trait) && "✨ "}
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Traits Highlight */}
              {currentMatch.matchingTraits && currentMatch.matchingTraits.length > 0 && (
                <div className="mb-3 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                  <p className="text-xs text-green-300">
                    <span className="font-semibold">Shared:</span> {currentMatch.matchingTraits.slice(0, 3).join(", ")}
                    {currentMatch.matchingTraits.length > 3 && ` +${currentMatch.matchingTraits.length - 3} more`}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handlePass}
                  variant="outline"
                  className="flex-1 border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm py-2"
                  disabled={isSelecting}
                >
                  ✕ Pass
                </Button>
                <Button
                  onClick={handleSelectMatch}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-sm py-2"
                  disabled={isSelecting}
                >
                  {isSelecting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                      Matching...
                    </span>
                  ) : (
                    "♥ Match"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
            </AnimatePresence>
          </div>

          {/* Matches Count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-center text-gray-500"
          >
            <p className="text-sm">
              {matches.length - currentMatchIndex - 1} more{" "}
              {matches.length - currentMatchIndex - 1 === 1 ? "match" : "matches"} available
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

