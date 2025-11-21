"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

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

export default function MatchmakingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<FullMatchProfile | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        }
      }
    } catch (error: unknown) {
      console.error("Error fetching matches:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch matches";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchExistingMatch = useCallback(async () => {
    try {
      const response = await fetch("/api/matchmaking/get-match");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.match) {
          setSelectedMatch(data.match as FullMatchProfile);
          setIsLoading(false);
          return;
        }
      }
      // If not matched, fetch potential matches
      fetchMatches();
    } catch {
      // If error, try to fetch matches
      fetchMatches();
    }
  }, [fetchMatches]);

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

  const handleNext = () => {
    if (currentMatchIndex < matches.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentMatchIndex(currentMatchIndex + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

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
      }
    } catch (error: unknown) {
      console.error("Error selecting match:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to select match";
      setError(errorMessage);
    } finally {
      setIsSelecting(false);
    }
  };

  const handlePass = () => {
    if (currentMatchIndex < matches.length - 1) {
      handleNext();
    } else {
      // No more matches
      setMatches([]);
      setCurrentMatchIndex(0);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Finding your perfect matches...</p>
        </div>
      </div>
    );
  }

  if (error && matches.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
        <nav className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              💝 Love on Aptos
            </Link>
            <Link href="/profile">
              <Button variant="outline">Profile</Button>
            </Link>
          </div>
        </nav>
        <main className="container mx-auto px-6 py-8">
          <div className="max-w-md mx-auto text-center py-20">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">No matches found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <Link href="/profile">
              <Button>Go to Profile</Button>
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
        <nav className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              💝 Love on Aptos
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/profile">
                <Button variant="outline">Profile</Button>
              </Link>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-pink-200 dark:border-pink-800">
              {/* Success Animation */}
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-8 text-center">
                <div className="text-6xl mb-4 animate-bounce">🎉</div>
                <h2 className="text-3xl font-bold text-white mb-2">You&apos;re Matched!</h2>
                <p className="text-white/90">You and {selectedMatch.name} are now connected!</p>
              </div>

              {/* Cover Picture */}
              {selectedMatch.coverPicture && (
                <div className="h-48 w-full bg-gradient-to-br from-pink-200 to-purple-200 dark:from-pink-900 dark:to-purple-900">
                  <img
                    src={selectedMatch.coverPicture}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                  <img
                    src={selectedMatch.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMatch.userName}`}
                    alt={selectedMatch.name}
                    className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-lg -mt-12 sm:-mt-16"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                        {selectedMatch.name}
                      </h2>
                      {selectedMatch.isBlueVerified && (
                        <span className="text-blue-500 text-xl">✓</span>
                      )}
                    </div>
                    <p className="text-purple-600 dark:text-purple-400 font-medium text-lg mb-2">
                      @{selectedMatch.userName}
                    </p>
                    {selectedMatch.location && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                        📍 {selectedMatch.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* One Liner */}
                {selectedMatch.oneLiner && (
                  <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-gray-700 dark:text-gray-300 text-lg italic">
                      &ldquo;{selectedMatch.oneLiner}&rdquo;
                    </p>
                  </div>
                )}

                {/* Traits */}
                {selectedMatch.traits && selectedMatch.traits.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                      Traits
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMatch.traits.map((trait, index) => (
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

                {/* Matching Traits */}
                {selectedMatch.matchingTraits && selectedMatch.matchingTraits.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2 uppercase">
                      Matching Traits
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMatch.matchingTraits.map((trait, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium"
                        >
                          ✨ {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {selectedMatch.summary && (
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 mb-6">
                    <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2 uppercase">
                      Summary
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {selectedMatch.summary}
                    </p>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {selectedMatch.followers.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
                  </div>
                  <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                      {selectedMatch.following.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Following</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Link href="/profile" className="flex-1">
                    <Button className="w-full">Go to Profile</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show matchmaking interface
  if (!currentMatch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
        <nav className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              💝 Love on Aptos
            </Link>
            <Link href="/profile">
              <Button variant="outline">Profile</Button>
            </Link>
          </div>
        </nav>
        <main className="container mx-auto px-6 py-8">
          <div className="max-w-md mx-auto text-center py-20">
            <div className="text-6xl mb-4">💔</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">No more matches</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Check back later for new potential matches!
            </p>
            <Link href="/profile">
              <Button>Go to Profile</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            💝 Love on Aptos
          </Link>
          <Link href="/profile">
            <Button variant="outline">Profile</Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-lg mx-auto">
          {/* Match Card */}
          <div
            className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-pink-200 dark:border-pink-800 transition-all duration-300 ${
              isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
            }`}
          >
            {/* Matching Traits Badge */}
            {currentMatch.matchingTraits && currentMatch.matchingTraits.length > 0 && (
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full font-bold shadow-lg text-sm">
                  {currentMatch.matchingTraits.length} Match{currentMatch.matchingTraits.length > 1 ? "es" : ""}
                </div>
              </div>
            )}

            {/* Blurred Profile Image */}
            <div className="relative h-96 bg-gradient-to-br from-pink-200 to-purple-200 dark:from-pink-900 dark:to-purple-900 overflow-hidden">
              {currentMatch.profilePicture ? (
                <div className="relative w-full h-full">
                  <img
                    src={currentMatch.profilePicture}
                    alt={currentMatch.name}
                    className="w-full h-full object-cover blur-md scale-110"
                  />
                  <div className="absolute inset-0 bg-black/30"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl">🔒</div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-6xl">👤</div>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                  {currentMatch.name}
                </h2>
                <p className="text-purple-600 dark:text-purple-400 font-medium">
                  @{currentMatch.userName}
                </p>
              </div>

              {/* One Liner */}
              {currentMatch.oneLiner && (
                <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg italic">
                  &ldquo;{currentMatch.oneLiner}&rdquo;
                </p>
              )}

              {/* Traits */}
              {currentMatch.traits && currentMatch.traits.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase">
                    Traits
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {currentMatch.traits.map((trait, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          currentMatch.matchingTraits.includes(trait)
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700"
                            : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
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
                <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    <span className="font-semibold">You both share:</span> {currentMatch.matchingTraits.join(", ")}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={handlePass}
                  variant="outline"
                  className="flex-1"
                  disabled={isSelecting}
                >
                  ✕ Pass
                </Button>
                <Button
                  onClick={handleSelectMatch}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  disabled={isSelecting}
                >
                  {isSelecting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Matching...
                    </span>
                  ) : (
                    "♥ Match"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Matches Count */}
          <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
            <p>
              {matches.length - currentMatchIndex - 1} more{" "}
              {matches.length - currentMatchIndex - 1 === 1 ? "match" : "matches"} available
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

