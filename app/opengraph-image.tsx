import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#020617',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px 96px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -80,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -100,
            left: 60,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)',
          }}
        />

        {/* Logo + wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 48 }}>
          <svg
            width="56"
            height="56"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 32V8H22C26.4183 8 30 11.5817 30 16C30 20.4183 26.4183 24 22 24H18.5L12 32Z"
              fill="white"
            />
            <path
              d="M10 26L18 18"
              stroke="#020617"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <span
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: 'white',
              letterSpacing: '-0.03em',
            }}
          >
            PropertySignal
            <span style={{ color: '#60a5fa' }}>HQ</span>
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#6b7280',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              padding: '3px 8px',
              marginLeft: 4,
            }}
          >
            BETA
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            margin: '0 0 24px 0',
            maxWidth: 900,
          }}
        >
          Find Off-Market Property{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #60a5fa, #22d3ee)',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Leads
          </span>{' '}
          Before Other Investors
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontSize: 26,
            color: '#94a3b8',
            margin: '0 0 56px 0',
            maxWidth: 760,
            lineHeight: 1.5,
          }}
        >
          Pre-foreclosures, expired listings &amp; distressed owners — scored and ranked across 35 US markets.
        </p>

        {/* Stat row */}
        <div style={{ display: 'flex', gap: 48 }}>
          {[
            { value: '27,400+', label: 'Signals analyzed' },
            { value: '35',      label: 'Markets covered'  },
            { value: '3',       label: 'Lead types'       },
            { value: '100%',    label: 'Free to explore'  },
          ].map((stat) => (
            <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: '#60a5fa', letterSpacing: '-0.03em' }}>
                {stat.value}
              </span>
              <span style={{ fontSize: 16, color: '#64748b', fontWeight: 500 }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  )
}
