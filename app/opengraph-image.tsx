import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Michael Kim — Operations & AX';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
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
          backgroundColor: '#0a0a0a',
          backgroundImage:
            'linear-gradient(to bottom right, #0a0a0a 0%, #171717 100%)',
        }}
      >
        {/* Main title */}
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            fontWeight: 500,
            color: '#fafafa',
            fontFamily: 'monospace',
            letterSpacing: '-0.02em',
          }}
        >
          Michael Kim
        </div>

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            fontSize: 24,
            color: '#737373',
            fontFamily: 'monospace',
            marginTop: 24,
          }}
        >
          Operations &amp; AX Engineer
        </div>

        {/* Three dots */}
        <div
          style={{
            display: 'flex',
            gap: 20,
            marginTop: 48,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: '#fafafa',
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: '#fafafa',
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: '#fafafa',
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
