"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Clock, Sparkles } from "lucide-react";

interface ComponentProps {
  name?: string;
  username?: string;
  bio?: string;
  avatarSrc?: string;
  coverSrc?: string;
  statusText?: string;
  statusColor?: string;
  glowText?: string;
  traits?: string[];
  oneLiner?: string;
  followers?: number;
  following?: number;
  tweets?: number;
  location?: string;
  joinedDate?: string;
  isVerified?: boolean;
  isMatched?: boolean;
  onViewMatch?: () => void;
  onUnmatch?: () => void;
  isUnmatching?: boolean;
  className?: string;
}

export default function ProfileCard({
  name = "User Name",
  username = "username",
  bio,
  avatarSrc = "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
  coverSrc,
  statusText = "Not Matched",
  statusColor = "bg-purple-500",
  glowText = "Ready to Connect",
  traits = [],
  oneLiner,
  followers = 0,
  following = 0,
  tweets = 0,
  location,
  joinedDate,
  isVerified = false,
  isMatched = false,
  onViewMatch,
  onUnmatch,
  isUnmatching = false,
  className,
}: ComponentProps) {
  const timeText = useMemo(() => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, "0");
    const hour12 = ((h + 11) % 12) + 1;
    const ampm = h >= 12 ? "PM" : "AM";
    return `${hour12}:${m}${ampm}`;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("relative w-full", className)}
    >
      {/* Glow Effect */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-10 top-[80%] rounded-[28px] bg-purple-500/40 blur-3xl shadow-[0_40px_80px_-16px_rgba(168,85,247,0.6)] z-0" />

      {/* Glow Text */}
      <div className="absolute inset-x-0 -bottom-10 mx-auto w-full z-0">
        <div className="flex items-center justify-center gap-2 bg-transparent py-3 text-center text-sm font-medium text-purple-300">
          {glowText}
        </div>
      </div>

      <Card className="relative z-10 mx-auto w-full max-w-5xl overflow-hidden rounded-[28px] border-0 bg-[radial-gradient(120%_120%_at_30%_10%,#1a1a1a_0%,#0f0f10_60%,#0b0b0c_100%)] text-white shadow-2xl">
        {/* Cover Image */}
        {coverSrc && (
          <div className="relative h-40 w-full overflow-hidden">
            <img
              src={coverSrc}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1a1a1a]/80" />
          </div>
        )}

        <CardContent className="p-6 sm:p-8">
          {/* Header with Status and Time */}
          <div className="mb-6 flex items-center justify-between text-sm text-neutral-300">
            <div className="flex items-center gap-2">
              <span className={cn("inline-block h-2.5 w-2.5 rounded-full animate-pulse", statusColor)} />
              <span className="select-none">{statusText}</span>
            </div>
            <div className="flex items-center gap-2 opacity-80">
              <Clock className="h-4 w-4" />
              <span className="tabular-nums">{timeText}</span>
            </div>
          </div>

          {/* Profile Header */}
          <div className="flex flex-wrap items-start justify-between gap-5 mb-6">
            <div className="flex items-start gap-5">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-2 ring-purple-500/30">
                <img
                  src={avatarSrc}
                  alt={`${name} avatar`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-bold tracking-tight sm:text-3xl bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  {name}
                </h3>
                <p className="mt-1 text-sm text-neutral-400">@{username}</p>
                <div className="flex flex-wrap gap-2 mt-2 text-xs text-neutral-500">
                  {location && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {location}
                    </span>
                  )}
                  {joinedDate && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {joinedDate}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Match Buttons */}
            {isMatched && onViewMatch && onUnmatch && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={onViewMatch}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
                >
                  View Match
                </button>
                <button
                  onClick={onUnmatch}
                  disabled={isUnmatching}
                  className="px-4 py-2 rounded-xl bg-red-500/20 text-red-300 text-sm font-semibold hover:bg-red-500/30 transition-all disabled:opacity-50"
                >
                  {isUnmatching ? "..." : "Unmatch"}
                </button>
              </div>
            )}
          </div>

          {/* Bio */}
          {bio && (
            <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-sm text-neutral-300 leading-relaxed">{bio}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xl font-bold bg-gradient-to-br from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {followers.toLocaleString()}
              </div>
              <div className="text-xs text-neutral-400 mt-1">Followers</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xl font-bold bg-gradient-to-br from-pink-400 to-purple-400 bg-clip-text text-transparent">
                {following.toLocaleString()}
              </div>
              <div className="text-xs text-neutral-400 mt-1">Following</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xl font-bold bg-gradient-to-br from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                {tweets.toLocaleString()}
              </div>
              <div className="text-xs text-neutral-400 mt-1">Tweets</div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traits */}
            {traits.length > 0 && (
              <div className="p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <h4 className="text-sm font-semibold text-purple-300">Your Traits</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {traits.map((trait, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-200 text-xs font-medium border border-purple-500/30 hover:border-purple-400/50 transition-colors"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* One-Liner */}
            {oneLiner && (
              <div className="p-5 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-xl border border-pink-500/20">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-4 h-4 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  <h4 className="text-sm font-semibold text-pink-300">One-Liner</h4>
                </div>
                <p className="text-sm text-neutral-300 italic leading-relaxed">
                  &ldquo;{oneLiner}&rdquo;
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

