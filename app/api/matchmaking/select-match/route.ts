import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { matchUserId } = body;

    if (!matchUserId) {
      return NextResponse.json(
        { error: "Match user ID is required" },
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

    // Check if match user exists
    const matchUser = await prisma.user.findUnique({
      where: {
        id: matchUserId,
      },
    });

    if (!matchUser) {
      return NextResponse.json(
        { error: "Match user not found" },
        { status: 404 }
      );
    }

    // Check if already matched
    // @ts-expect-error - Prisma Client types not updated yet, fields exist in DB
    if (currentUser.isMatched || matchUser.isMatched) {
      return NextResponse.json(
        { error: "One or both users are already matched" },
        { status: 400 }
      );
    }

    // Create match - update both users
    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        isMatched: true,
        matchedWith: matchUserId,
      } as unknown as Prisma.UserUpdateInput,
    });

    await prisma.user.update({
      where: { id: matchUserId },
      data: {
        isMatched: true,
        matchedWith: currentUser.id,
      } as unknown as Prisma.UserUpdateInput,
    });

    // Get full profile of matched user
    const matchedProfile = await prisma.user.findUnique({
      where: { id: matchUserId },
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
        isBlueVerified: true,
        url: true,
      },
    });

    // Calculate matching traits
    const matchingTraits = matchedProfile?.traits.filter((trait) =>
      currentUser.traits.includes(trait)
    ) || [];

    return NextResponse.json({
      success: true,
      matched: true,
      match: {
        ...matchedProfile,
        matchingTraits,
      },
    });
  } catch (error: unknown) {
    console.error("Error selecting match:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

