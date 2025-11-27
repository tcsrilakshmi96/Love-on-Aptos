"use client";

import Link from "next/link";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { useSession } from "next-auth/react";

export const Header = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && session;

  return (
    <div className="fixed z-50 pt-8 md:pt-14 top-0 left-0 w-full">
      <header className="flex items-center justify-between container">
        <Link href="/">
          <Logo className="text-3xl md:text-5xl" />
        </Link>
        
        <Link 
          className="uppercase max-lg:hidden transition-colors ease-out duration-150 font-mono text-primary hover:text-primary/80" 
          href={isAuthenticated ? "/profile" : "/auth"}
        >
          Find Love
        </Link>
        <MobileMenu />
      </header>
    </div>
  );
};
