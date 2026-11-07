import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

/**
 * Apple touch icon — generated as a PNG at build time so iOS home-screen
 * bookmarks get a crisp, premium icon (iOS doesn't reliably use SVG favicons).
 * Visual matches the icon.svg: dark rounded square + gold candlestick motif.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1A1D24 0%, #0A0B0D 100%)',
          borderRadius: 38,
          position: 'relative',
          // subtle gold border via boxShadow
          boxShadow: 'inset 0 0 0 2px rgba(255,179,71,0.22)',
        }}
      >
        {/* Ambient gold glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 50% 55%, rgba(255,157,46,0.22) 0%, rgba(255,157,46,0) 55%)',
            borderRadius: 38,
          }}
        />
        {/* Candlesticks (flex row, growing heights) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 14,
            position: 'relative',
            marginBottom: 8,
          }}
        >
          {/* Candle 1 — small */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 3,
                height: 36,
                background: 'rgba(255,179,71,0.5)',
                marginBottom: -2,
              }}
            />
            <div
              style={{
                width: 16,
                height: 28,
                background: 'linear-gradient(180deg, #FFD27A 0%, #FF9D2E 55%, #D96B16 100%)',
                borderRadius: 4,
                opacity: 0.85,
              }}
            />
          </div>
          {/* Candle 2 — medium */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 3,
                height: 50,
                background: 'rgba(255,179,71,0.5)',
                marginBottom: -2,
              }}
            />
            <div
              style={{
                width: 16,
                height: 38,
                background: 'linear-gradient(180deg, #FFD27A 0%, #FF9D2E 55%, #D96B16 100%)',
                borderRadius: 4,
              }}
            />
          </div>
          {/* Candle 3 — tall (the winner) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 3,
                height: 64,
                background: 'rgba(255,179,71,0.5)',
                marginBottom: -2,
              }}
            />
            <div
              style={{
                width: 16,
                height: 52,
                background: 'linear-gradient(180deg, #FFD27A 0%, #FF9D2E 55%, #D96B16 100%)',
                borderRadius: 4,
              }}
            />
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
