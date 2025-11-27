import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(_request: NextRequest) {
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
      select: {
        id: true,
        isMatched: true,
        matchedWith: true,
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

    const matchedUserId = currentUser.matchedWith;

    // Unmatch both users - set isMatched to false and matchedWith to null
    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        isMatched: false,
        matchedWith: null,
      } as unknown as Prisma.UserUpdateInput,
    });

    await prisma.user.update({
      where: { id: matchedUserId },
      data: {
        isMatched: false,
        matchedWith: null,
      } as unknown as Prisma.UserUpdateInput,
    });

    return NextResponse.json({
      success: true,
      message: "Successfully unmatched",
    });
  } catch (error: unknown) {
    console.error("Error unmatching:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

