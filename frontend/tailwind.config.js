/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        fin: {
          bg:       '#080c14',
          surface:  '#0d1420',
          card:     '#111827',
          border:   '#1e2d40',
          accent:   '#00d4aa',
          accentDim:'#00d4aa33',
          gold:     '#f59e0b',
          up:       '#22c55e',
          down:     '#ef4444',
          muted:    '#6b7280',
          text:     '#e2e8f0',
          dim:      '#94a3b8',
        },
      },
      animation: {
        shimmer:  'shimmer 1.5s infinite',
        fadeUp:   'fadeUp 0.4s ease-out',
        pulse2:   'pulse2 2s ease-in-out infinite',
        ticker:   'ticker 30s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        pulse2: {
          '0%,100%': { opacity: 1 },
          '50%':     { opacity: 0.4 },
        },
        ticker: {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [],
}
