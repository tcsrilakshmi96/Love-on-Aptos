import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const twitterUsername = (session.user as { username?: string })?.username;
    if (!twitterUsername) {
      return NextResponse.json({ error: "Twitter username not found" }, { status: 400 });
    }

    // Fetch user data from Twitter API
    const apiKey = process.env.TWITTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Twitter API key not configured" }, { status: 500 });
    }

    const response = await fetch(
      `https://api.twitterapi.io/twitter/user/info?userName=${twitterUsername}`,
      {
        method: "GET",
        headers: {
          "X-API-Key": apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Twitter API error:", errorData);
      return NextResponse.json(
        { error: "Failed to fetch Twitter data", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.status !== "success" || !data.data) {
      return NextResponse.json(
        { error: "Invalid response from Twitter API" },
        { status: 500 }
      );
    }

    const userData = data.data;

    // Prepare user data for Prisma
    const userRecord = {
      twitterId: userData.id,
      userName: userData.userName,
      name: userData.name,
      url: userData.url || null,
      isBlueVerified: userData.isBlueVerified || false,
      verifiedType: userData.verifiedType || null,
      profilePicture: userData.profilePicture || null,
      coverPicture: userData.coverPicture || null,
      description: userData.description || null,
      location: userData.location || null,
      followers: userData.followers || 0,
      following: userData.following || 0,
      canDm: userData.canDm || false,
      createdAt: userData.createdAt || null,
      favouritesCount: userData.favouritesCount || 0,
      hasCustomTimelines: userData.hasCustomTimelines || false,
      isTranslator: userData.isTranslator || false,
      mediaCount: userData.mediaCount || 0,
      statusesCount: userData.statusesCount || 0,
      possiblySensitive: userData.possiblySensitive || false,
      isAutomated: userData.isAutomated || false,
      automatedBy: userData.automatedBy || null,
      profileBioDescription: userData.profile_bio?.description || null,
      profileBioUrl: userData.profile_bio?.entities?.url?.urls?.[0]?.expanded_url || null,
      nextAuthUserId: (session.user as { id?: string })?.id || null,
    };

    // Upsert user (create or update)
    const user = await prisma.user.upsert({
      where: {
        twitterId: userData.id,
      },
      update: userRecord,
      create: userRecord,
    });

    // Transform to camelCase for frontend (already in camelCase from Prisma)
    const transformedUser = {
      id: user.id,
      twitterId: user.twitterId,
      userName: user.userName,
      name: user.name,
      url: user.url,
      isBlueVerified: user.isBlueVerified,
      verifiedType: user.verifiedType,
      profilePicture: user.profilePicture,
      coverPicture: user.coverPicture,
      description: user.description,
      location: user.location,
      followers: user.followers,
      following: user.following,
      canDm: user.canDm,
      createdAt: user.createdAt,
      favouritesCount: user.favouritesCount,
      hasCustomTimelines: user.hasCustomTimelines,
      isTranslator: user.isTranslator,
      mediaCount: user.mediaCount,
      statusesCount: user.statusesCount,
      possiblySensitive: user.possiblySensitive,
      isAutomated: user.isAutomated,
      automatedBy: user.automatedBy,
      profileBioDescription: user.profileBioDescription,
      profileBioUrl: user.profileBioUrl,
      nextAuthUserId: user.nextAuthUserId,
      traits: user.traits,
      oneLiner: user.oneLiner,
      summary: user.summary,
      createdAtDb: user.createdAtDb,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json({ success: true, user: transformedUser });
  } catch (error: unknown) {
    console.error("Error fetching Twitter data:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

