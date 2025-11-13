import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const twitterUsername = (session.user as any)?.username;
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

    // Prepare user data for Supabase
    const userRecord = {
      twitter_id: userData.id,
      user_name: userData.userName,
      name: userData.name,
      url: userData.url || null,
      is_blue_verified: userData.isBlueVerified || false,
      verified_type: userData.verifiedType || null,
      profile_picture: userData.profilePicture || null,
      cover_picture: userData.coverPicture || null,
      description: userData.description || null,
      location: userData.location || null,
      followers: userData.followers || 0,
      following: userData.following || 0,
      can_dm: userData.canDm || false,
      created_at: userData.createdAt || null,
      favourites_count: userData.favouritesCount || 0,
      has_custom_timelines: userData.hasCustomTimelines || false,
      is_translator: userData.isTranslator || false,
      media_count: userData.mediaCount || 0,
      statuses_count: userData.statusesCount || 0,
      possibly_sensitive: userData.possiblySensitive || false,
      is_automated: userData.isAutomated || false,
      automated_by: userData.automatedBy || null,
      profile_bio_description: userData.profile_bio?.description || null,
      profile_bio_url: userData.profile_bio?.entities?.url?.urls?.[0]?.expanded_url || null,
      next_auth_user_id: (session.user as any)?.id || null,
      updated_at: new Date().toISOString(),
    };

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("twitter_id", userData.id)
      .maybeSingle();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw new Error(`Failed to check existing user: ${fetchError.message}`);
    }

    let user;
    if (existingUser) {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update(userRecord)
        .eq("twitter_id", userData.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update user: ${updateError.message}`);
      }
      user = updatedUser;
    } else {
      // Insert new user
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert(userRecord)
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to insert user: ${insertError.message}`);
      }
      user = newUser;
    }

    // Transform back to camelCase for frontend
    const transformedUser = {
      id: user.id,
      twitterId: user.twitter_id,
      userName: user.user_name,
      name: user.name,
      url: user.url,
      isBlueVerified: user.is_blue_verified,
      verifiedType: user.verified_type,
      profilePicture: user.profile_picture,
      coverPicture: user.cover_picture,
      description: user.description,
      location: user.location,
      followers: user.followers,
      following: user.following,
      canDm: user.can_dm,
      createdAt: user.created_at,
      favouritesCount: user.favourites_count,
      hasCustomTimelines: user.has_custom_timelines,
      isTranslator: user.is_translator,
      mediaCount: user.media_count,
      statusesCount: user.statuses_count,
      possiblySensitive: user.possibly_sensitive,
      isAutomated: user.is_automated,
      automatedBy: user.automated_by,
      profileBioDescription: user.profile_bio_description,
      profileBioUrl: user.profile_bio_url,
      nextAuthUserId: user.next_auth_user_id,
      createdAtDb: user.created_at_db,
      updatedAt: user.updated_at,
    };

    return NextResponse.json({ success: true, user: transformedUser });
  } catch (error: any) {
    console.error("Error fetching Twitter data:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

