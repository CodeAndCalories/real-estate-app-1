import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: '#020617',
          borderRadius: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="130"
          height="130"
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
      </div>
    ),
    { ...size },
  )
}
