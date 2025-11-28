import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Find Your Love ❤️",
  description: "Find your perfect match on X. Connect with like minded souls.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://love-on-aptos.vercel.app"),
  openGraph: {
    title: "Find Your Perfect Match ❤️",
    description: "Find your love on X. Match with people who share your vibe.",
    siteName: "Find Your Perfect Match",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Find Your Perfect Match ❤️",
    description: "Find your love on X. Match with people who share your vibe.",
    creator: "@MoveClubIN",
  },
  other: {
    "telegram:channel": "@MoveClubIN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-white min-h-screen`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
