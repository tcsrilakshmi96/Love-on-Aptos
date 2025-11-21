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
        { error: "User not found. Please fetch Twitter data first." },
        { status: 404 }
      );
    }

    // User must have traits to match
    if (!currentUser.traits || currentUser.traits.length === 0) {
      return NextResponse.json(
        { error: "Please generate traits first before matchmaking." },
        { status: 400 }
      );
    }

    // Find potential matches - users with at least one matching trait
    // Exclude current user and already matched users
    const allUsers = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUser.id } }, // Not current user
          { traits: { isEmpty: false } }, // Has traits
          { isMatched: false }, // Not already matched
          { matchedWith: null }, // Not matched with anyone
        ],
      },
      select: {
        id: true,
        name: true,
        userName: true,
        profilePicture: true,
        traits: true,
        oneLiner: true,
        isMatched: true,
        matchedWith: true,
      },
    });

    // Filter users with at least one matching trait
    const matches = allUsers.filter((user) => {
      if (!user.traits || user.traits.length === 0) return false;
      // Check if any trait matches
      return user.traits.some((trait) => currentUser.traits.includes(trait));
    });

    // Shuffle matches for random order
    const shuffledMatches = matches.sort(() => Math.random() - 0.5);

    // Return matches with partial profile info
    const matchProfiles = shuffledMatches.map((match) => ({
      id: match.id,
      name: match.name,
      userName: match.userName,
      profilePicture: match.profilePicture,
      traits: match.traits,
      oneLiner: match.oneLiner,
      matchingTraits: match.traits.filter((trait) =>
        currentUser.traits.includes(trait)
      ),
    }));

    return NextResponse.json({
      success: true,
      matches: matchProfiles,
      currentUserTraits: currentUser.traits,
    });
  } catch (error: unknown) {
    console.error("Error finding matches:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

