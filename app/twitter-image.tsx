import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Love on Aptos - Find Your Love";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 50%, #0a0a0a 100%)",
        }}
      >
        {/* Decorative gradient circles */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)",
          }}
        />

        {/* Heart emoji */}
        <div
          style={{
            fontSize: 120,
            marginBottom: 20,
          }}
        >
          ❤️
        </div>

        {/* Main title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              background: "linear-gradient(90deg, #a855f7, #ec4899, #a855f7)",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: "-2px",
            }}
          >
            Find Your Perfect Match
          </div>
          <div
            style={{
              fontSize: 36,
              color: "#9ca3af",
              fontWeight: 500,
            }}
          >
            on X
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 24,
            color: "#6b7280",
            marginTop: 30,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>Match with people who share your vibe on</span>
          <span style={{ color: "#fff", fontWeight: 600 }}>𝕏</span>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#4b5563",
            fontSize: 18,
          }}
        >
          <span>Built by</span>
          <span style={{ color: "#a855f7", fontWeight: 600 }}>@MoveClubIN</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

