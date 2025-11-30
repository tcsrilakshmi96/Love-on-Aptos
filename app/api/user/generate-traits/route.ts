import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Fixed list of traits
const AVAILABLE_TRAITS = [
  "coder",
  "aptos maxi",
  "base maxi",
  "marketer",
  "gm paglu",
  "vibecoder",
  "ct lead",
  "shit poster",
  "solana maxi",
  "ibw paglu",
] as const;

type Trait = typeof AVAILABLE_TRAITS[number];

interface Tweet {
  id?: string;
  text: string;
  url?: string;
  twitterUrl?: string;
  createdAt?: string;
  retweetCount?: number;
  replyCount?: number;
  likeCount?: number;
  entities?: {
    hashtags?: Array<{ text: string }>;
    urls?: Array<{ expanded_url?: string }>;
    user_mentions?: Array<{ screen_name: string }>;
  };
}

// Analyze tweets using AI to determine traits via OpenRouter
async function analyzeTweetsWithAI(tweets: Tweet[]): Promise<Trait[]> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY not found, falling back to keyword-based analysis");
    return analyzeTweetsFallback(tweets);
  }

  try {
    const tweetsText = tweets.map((t) => t.text).join("\n\n");
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Love on Aptos",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          {
            role: "user",
            content: `Analyze the following Twitter/X posts and determine the top 5 traits that best describe this person. 

Available traits (you must ONLY use these exact trait names):
- coder
- aptos maxi
- base maxi
- marketer
- gm paglu
- vibecoder
- ct lead
- shit poster

Twitter Posts:
${tweetsText}

Instructions:
1. Analyze the content, tone, topics, and style of these posts
2. Select exactly 5 traits from the available list that best match this person
3. Return ONLY a comma-separated list of the 5 trait names (e.g., "coder, aptos maxi, marketer, vibecoder, ct lead")
4. Do not include any explanations or additional text, just the 5 traits separated by commas

Traits:`,
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(`OpenRouter API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim() || "";
    
    if (!text) {
      throw new Error("No response content from OpenRouter API");
    }

    const traits = text
      .split(",")
      .map((t: string) => t.trim().toLowerCase())
      .filter((t: string): t is Trait => AVAILABLE_TRAITS.includes(t as Trait))
      .slice(0, 5);

    // Ensure we have exactly 5 traits
    if (traits.length < 5) {
      const remaining = AVAILABLE_TRAITS.filter((t: Trait) => !traits.includes(t));
      traits.push(...remaining.slice(0, 5 - traits.length));
    }

    return traits.slice(0, 5);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const isAuthError = errorMessage.includes("authentication") || errorMessage.includes("invalid") || errorMessage.includes("401") || errorMessage.includes("unauthorized");
    
    if (isAuthError) {
      console.error("OpenRouter API authentication failed. Please check your OPENROUTER_API_KEY in .env.local");
      console.error("Error details:", errorMessage);
    } else {
      console.error("Error analyzing tweets with AI:", error);
    }
    console.warn("Falling back to keyword-based analysis");
    return analyzeTweetsFallback(tweets);
  }
}

// Fallback keyword-based analysis (original implementation)
function analyzeTweetsFallback(tweets: Tweet[]): Trait[] {
  const traitScores: Record<Trait, number> = {
    "coder": 0,
    "aptos maxi": 0,
    "base maxi": 0,
    "marketer": 0,
    "gm paglu": 0,
    "vibecoder": 0,
    "ct lead": 0,
    "shit poster": 0,
    "solana maxi": 0,
    "ibw paglu": 0,
  };

  const allText = tweets.map((t) => t.text.toLowerCase()).join(" ");

  // Coder indicators
  const coderKeywords = [
    "code",
    "programming",
    "developer",
    "github",
    "typescript",
    "javascript",
    "python",
    "solidity",
    "rust",
    "smart contract",
    "defi",
    "nft",
    "web3",
    "blockchain",
    "dapp",
  ];
  coderKeywords.forEach((keyword) => {
    if (allText.includes(keyword)) traitScores["coder"]++;
  });

  // Aptos Maxi indicators
  const aptosKeywords = [
    "aptos",
    "move",
    "aptoslabs",
    "apt",
    "aptos ecosystem",
    "aptos network",
  ];
  aptosKeywords.forEach((keyword) => {
    if (allText.includes(keyword)) traitScores["aptos maxi"] += 2;
  });

  // Base Maxi indicators
  const baseKeywords = ["base", "base l2", "base ecosystem", "onchain", "coinbase"];
  baseKeywords.forEach((keyword) => {
    if (allText.includes(keyword)) traitScores["base maxi"] += 2;
  });

  // Marketer indicators
  const marketerKeywords = [
    "marketing",
    "growth",
    "community",
    "brand",
    "campaign",
    "strategy",
    "engagement",
    "outreach",
  ];
  marketerKeywords.forEach((keyword) => {
    if (allText.includes(keyword)) traitScores["marketer"]++;
  });

  // GM Paglu indicators
  const gmKeywords = ["gm", "good morning", "gn", "good night", "wagmi"];
  gmKeywords.forEach((keyword) => {
    if (allText.includes(keyword)) traitScores["gm paglu"]++;
  });

  // Vibecoder indicators
  const vibecoderKeywords = [
    "vibe",
    "vibes",
    "energy",
    "vibing",
    "good vibes",
    "positive",
  ];
  vibecoderKeywords.forEach((keyword) => {
    if (allText.includes(keyword)) traitScores["vibecoder"]++;
  });

  // CT Lead indicators
  const ctLeadKeywords = [
    "alpha",
    "thread",
    "🧵",
    "breakdown",
    "analysis",
    "insights",
    "takeaways",
  ];
  ctLeadKeywords.forEach((keyword) => {
    if (allText.includes(keyword)) traitScores["ct lead"]++;
  });

  // Shit Poster indicators
  const shitPostKeywords = [
    "lol",
    "lmao",
    "💀",
    "fr",
    "ngl",
    "tbh",
    "meme",
    "funny",
    "based",
  ];
  shitPostKeywords.forEach((keyword) => {
    if (allText.includes(keyword)) traitScores["shit poster"]++;
  });

  // Get top 5 traits by score
  const sortedTraits = Object.entries(traitScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([trait]) => trait as Trait);

  // Ensure we have exactly 5 traits (fill with top remaining if needed)
  while (sortedTraits.length < 5 && sortedTraits.length < AVAILABLE_TRAITS.length) {
    const remaining = AVAILABLE_TRAITS.filter((t) => !sortedTraits.includes(t));
    if (remaining.length > 0) {
      sortedTraits.push(remaining[0]);
    } else {
      break;
    }
  }

  return sortedTraits.slice(0, 5);
}

// Generate one-liner from tweets
function generateOneLiner(tweets: Tweet[]): string {
  const texts = tweets.map((t) => t.text).slice(0, 20); // Use first 20 tweets for one-liner

  // Extract common themes
  const allWords = texts
    .join(" ")
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 4);

  const wordFreq: Record<string, number> = {};
  allWords.forEach((word) => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  const topWords = Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([word]) => word);

  // Generate one-liner based on common themes
  if (topWords.length > 0) {
    return `Passionate about ${topWords.join(", ")} and building in web3.`;
  }

  return "Building and vibing in the web3 space. 🚀";
}

// Generate summary from tweets
function generateSummary(tweets: Tweet[]): string {
  const texts = tweets.map((t) => t.text).slice(0, 50);
  const totalTweets = texts.length;

  // Count mentions of key topics
  const topics = {
    coding: 0,
    aptos: 0,
    base: 0,
    marketing: 0,
    community: 0,
  };

  const allText = texts.join(" ").toLowerCase();

  if (allText.includes("code") || allText.includes("developer")) topics.coding++;
  if (allText.includes("aptos")) topics.aptos++;
  if (allText.includes("base")) topics.base++;
  if (allText.includes("marketing") || allText.includes("growth")) topics.marketing++;
  if (allText.includes("community") || allText.includes("gm")) topics.community++;

  const summaryParts: string[] = [];
  summaryParts.push(`Based on analysis of ${totalTweets} recent tweets:`);

  if (topics.coding > 0) {
    summaryParts.push("Active developer sharing coding insights and technical content.");
  }
  if (topics.aptos > 0) {
    summaryParts.push("Engaged with the Aptos ecosystem and Move programming.");
  }
  if (topics.base > 0) {
    summaryParts.push("Involved in the Base ecosystem and onchain culture.");
  }
  if (topics.marketing > 0) {
    summaryParts.push("Focused on growth, marketing, and community building.");
  }
  if (topics.community > 0) {
    summaryParts.push("Active in web3 community engagement and discussions.");
  }

  if (summaryParts.length === 1) {
    summaryParts.push("Engaging with the web3 community through regular tweets and interactions.");
  }

  return summaryParts.join(" ");
}

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
      return NextResponse.json(
        { error: "Twitter username not found" },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: {
        userName: twitterUsername,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please fetch Twitter data first." },
        { status: 404 }
      );
    }

    // Fetch tweets from Twitter API
    const apiKey = process.env.TWITTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Twitter API key not configured" },
        { status: 500 }
      );
    }

    // Fetch tweets (need 10 tweets)
    const tweets: Tweet[] = [];
    
    const url = new URL("https://api.twitterapi.io/twitter/user/last_tweets");
    url.searchParams.set("userName", twitterUsername);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
      },
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      console.error("Twitter API HTTP error:", response.status, errorData);
      const errorMsg = typeof errorData === "object" 
        ? (errorData.message || errorData.error || `HTTP ${response.status}`)
        : errorData;
      throw new Error(`Failed to fetch tweets: ${errorMsg}`);
    }

    const data = await response.json();

    if (data.status !== "success") {
      const errorMsg = data.msg || data.message || data.error || "Unknown error from Twitter API";
      console.error("Twitter API error response:", {
        status: data.status,
        message: errorMsg,
        fullResponse: data
      });
      throw new Error(`Twitter API error: ${errorMsg}`);
    }

    // The API returns tweets nested in data.data.tweets
    const apiTweets = data.data?.tweets || [];
    
    if (!Array.isArray(apiTweets)) {
      console.error("Invalid tweets data:", data);
      throw new Error("Invalid response from Twitter API: tweets array not found");
    }

    // Get the last 10 tweets
    tweets.push(...apiTweets.slice(0, 10));

    if (tweets.length === 0) {
      return NextResponse.json(
        { error: "No tweets found for this user" },
        { status: 404 }
      );
    }

    // Analyze tweets and generate traits using AI, one-liner, and summary
    const traits = await analyzeTweetsWithAI(tweets);
    const oneLiner = generateOneLiner(tweets);
    const summary = generateSummary(tweets);

    // Format tweets for storage (all 10 tweets)
    const formattedTweets = tweets.map((tweet) => ({
      id: tweet.id || "",
      text: tweet.text || "",
      url: tweet.url || tweet.twitterUrl || "",
      createdAt: tweet.createdAt,
      retweetCount: tweet.retweetCount,
      replyCount: tweet.replyCount,
      likeCount: tweet.likeCount,
    }));

    // Update user in database with traits, one-liner, summary, and all tweets
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        traits,
        oneLiner,
        summary,
        tweets: formattedTweets as Prisma.InputJsonValue, // Store all 10 tweets as JSON
      } as Prisma.UserUpdateInput,
    });

    // Return random 5 tweets for display
    const shuffledTweets = [...formattedTweets].sort(() => Math.random() - 0.5);
    const randomTweets = shuffledTweets.slice(0, 5);

    return NextResponse.json({
      success: true,
      traits: updatedUser.traits,
      oneLiner: updatedUser.oneLiner,
      summary: updatedUser.summary,
      tweets: randomTweets, // Return random 5 tweets
    });
  } catch (error: unknown) {
    console.error("Error generating traits:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

