"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleTwitterAuth = async () => {
    setIsLoading(true);
    try {
      await signIn("twitter", {
        callbackUrl: "/profile",
        redirect: true,
      });
    } catch (error) {
      console.error("Error signing in:", error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center px-6">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full opacity-30 blur-3xl animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.4) 0%, transparent 70%)',
            animationDuration: '4s',
          }}
        />
        <div 
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full opacity-20 blur-3xl animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)',
            animationDuration: '6s',
            animationDelay: '2s',
          }}
        />
        <div 
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-2xl animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(244,114,182,0.6) 0%, transparent 70%)',
            animationDuration: '5s',
            animationDelay: '1s',
          }}
        />
      </div>

      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div 
        className="max-w-md w-full relative z-10 animate-[fadeInUp_1s_ease-out_forwards]"
        style={{
          animation: 'fadeInUp 1s ease-out forwards',
        }}
      >
        {/* Logo */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block group">
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl group-hover:scale-110 transition-transform duration-300">💝</span>
              <span 
                className="text-4xl font-light tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #f472b6 0%, #c084fc 50%, #818cf8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Love on Aptos
              </span>
            </div>
          </Link>
          <p className="mt-3 text-zinc-500 text-sm tracking-widest">
            Find Your Match on X
          </p>
        </div>

        {/* Auth Card */}
        <div 
          className="relative rounded-3xl p-px overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(244,114,182,0.3) 0%, rgba(168,85,247,0.1) 50%, rgba(129,140,248,0.3) 100%)',
          }}
        >
          <div className="relative bg-zinc-950/90 backdrop-blur-xl rounded-3xl p-10">
            {/* Subtle inner glow */}
            <div 
              className="absolute inset-0 rounded-3xl opacity-50"
              style={{
                background: 'radial-gradient(ellipse at top, rgba(244,114,182,0.1) 0%, transparent 50%)',
              }}
            />

            <div className="relative">
              <h1 
                className="text-4xl font-light text-center mb-3 tracking-tight"
                style={{
                  background: 'linear-gradient(180deg, #ffffff 0%, #a1a1aa 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Welcome
              </h1>
              <p className="text-center text-zinc-400 mb-10 text-lg font-light">
                Connect your identity to begin
              </p>

              {/* Twitter Auth Button */}
              <button
                onClick={handleTwitterAuth}
                disabled={isLoading}
                className="group w-full relative overflow-hidden rounded-2xl p-px transition-all duration-500 hover:scale-[1.02] disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #1DA1F2 0%, #0d8bd9 100%)',
                }}
              >
                <div className="relative flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-[#1DA1F2] group-hover:bg-[#1a8cd8] transition-colors">
                  {/* Shine effect */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                      transform: 'skewX(-20deg)',
                    }}
                  />
                  
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-white font-medium text-lg">Connecting...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-white font-medium text-lg">Continue with</span>
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </>
                  )}
                </div>
              </button>

              {/* Divider */}
              {/* <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-linear-to-r from-transparent via-zinc-700 to-transparent" />
                <span className="text-zinc-600 text-xs uppercase tracking-widest">Secured by</span>
                <div className="flex-1 h-px bg-linear-to-r from-transparent via-zinc-700 to-transparent" />
              </div> */}

              {/* Aptos branding */}
              {/* <div className="flex items-center justify-center gap-2 text-zinc-500">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L24 12L12 24L0 12L12 0ZM12 4L4 12L12 20L20 12L12 4Z"/>
                </svg>
                <span className="text-sm tracking-wide">Aptos Blockchain</span>
              </div> */}

              {/* Info */}
              <div className="mt-8 p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                <p className="text-sm text-zinc-400 text-center leading-relaxed">
                  By continuing, you agree to connect your X account. 
                  We only access your <span className="text-zinc-300">public profile</span> information.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
          >
            <svg 
              className="w-4 h-4 transition-transform group-hover:-translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
        }}
      />
    </div>
    </>
  );
}
