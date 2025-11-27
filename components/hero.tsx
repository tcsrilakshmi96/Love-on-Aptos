"use client";

import Link from "next/link";
import { GL } from "./gl";
import { Pill } from "./pill";
import { Button } from "./ui/button";
import { useState } from "react";
import { useSession } from "next-auth/react";

export function Hero() {
  const [hovering, setHovering] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && session;
  const getStartedHref = isAuthenticated ? "/profile" : "/auth";

  return (
    <div className="relative flex flex-col h-svh justify-between">
      <GL hovering={hovering} />

      <div className="pb-16 mt-auto text-center relative z-10">
        <Pill className="mb-6">BETA RELEASE</Pill>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-sentient">
          Unlock your <br />
          <i className="font-light">potential</i> love
        </h1>
        <p className="font-mono text-sm sm:text-base text-foreground/60 text-balance mt-8 max-w-[440px] mx-auto">
          Love on Aptos — Find your perfect match on X
        </p>

        <Link className="contents max-sm:hidden" href={getStartedHref}>
          <Button
            className="mt-14"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            [Get Started]
          </Button>
        </Link>
        <Link className="contents sm:hidden" href={getStartedHref}>
          <Button
            size="sm"
            className="mt-14"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            [Get Started]
          </Button>
        </Link>

        {/* Disclaimer */}
        <div className="mt-12 max-w-[440px] mx-auto">
          <p className="font-mono text-xs text-foreground/40 text-center">
            This is for fun purposes and vibe coding series. Follow{" "}
            <a
              href="https://x.com/MoveClubIN"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/60 hover:text-foreground/80 underline"
            >
              @MoveClubIN
            </a>{" "}
            for more such builds
          </p>
        </div>
      </div>
    </div>
  );
}
