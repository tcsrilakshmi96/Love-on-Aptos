import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#09090b',
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(168, 85, 247, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Heart emoji */}
          <div
            style={{
              fontSize: 100,
              marginBottom: 20,
            }}
          >
            ❤️
          </div>

          {/* Main title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #a855f7, #ec4899, #a855f7)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: 10,
              letterSpacing: '-2px',
            }}
          >
            Find Your Perfect Match
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 36,
              color: '#9ca3af',
              marginBottom: 50,
            }}
          >
            on X
          </div>

          {/* Features */}
          <div
            style={{
              display: 'flex',
              gap: 50,
              alignItems: 'center',
              fontSize: 22,
              color: '#71717a',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'rgba(168, 85, 247, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a855f7',
                }}
              >
                ✨
              </div>
              AI Traits
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'rgba(236, 72, 153, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ec4899',
                }}
              >
                💕
              </div>
              Match Vibes
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'rgba(168, 85, 247, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a855f7',
                }}
              >
                🔗
              </div>
              Connect
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#4b5563',
            fontSize: 18,
          }}
        >
          <span>Built by</span>
          <span style={{ color: '#a855f7', fontWeight: 600 }}>@MoveClubIN</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

