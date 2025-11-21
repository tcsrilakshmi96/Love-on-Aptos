import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const twitterUsername = (session.user as { username?: string })?.username;
    if (!twitterUsername) {
      return NextResponse.json(
        { error: "Twitter username not found" },
        { status: 400 }
      );
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: {
        userName: twitterUsername,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is matched
    if (!currentUser.isMatched || !currentUser.matchedWith) {
      return NextResponse.json(
        { error: "User is not matched" },
        { status: 400 }
      );
    }

    // Get matched user profile
    const matchedUser = await prisma.user.findUnique({
      where: {
        id: currentUser.matchedWith,
      },
      select: {
        id: true,
        name: true,
        userName: true,
        profilePicture: true,
        coverPicture: true,
        description: true,
        location: true,
        followers: true,
        following: true,
        traits: true,
        oneLiner: true,
        summary: true,
        tweets: true,
        isBlueVerified: true,
        url: true,
      },
    });

    if (!matchedUser) {
      return NextResponse.json(
        { error: "Matched user not found" },
        { status: 404 }
      );
    }

    // Calculate matching traits
    const matchingTraits = matchedUser.traits.filter((trait) =>
      currentUser.traits.includes(trait)
    );

    return NextResponse.json({
      success: true,
      match: {
        ...matchedUser,
        matchingTraits,
      },
    });
  } catch (error: unknown) {
    console.error("Error getting match:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

