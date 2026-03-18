import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:          '#020617',
          card:        '#0f172a',
          border:      '#1e293b',
          blue:        '#2563eb',
          'blue-light':'#3b82f6',
        },
      },
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue':    '0 0 20px rgba(37, 99, 235, 0.15)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.15)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
    },
  },
  plugins: [],
}

export default config
