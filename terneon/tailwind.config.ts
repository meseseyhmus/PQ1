import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './config/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        night: '#070a12',
        neon: {
          cyan: '#22d3ee',
          violet: '#a78bfa',
          pink: '#f472b6',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-sora)', 'var(--font-inter)', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(34, 211, 238, 0.35), 0 0 60px rgba(34, 211, 238, 0.12)',
        'glow-violet': '0 0 20px rgba(167, 139, 250, 0.35), 0 0 60px rgba(167, 139, 250, 0.12)',
        'glow-soft': '0 0 40px rgba(34, 211, 238, 0.08), 0 0 80px rgba(167, 139, 250, 0.08)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'aurora': 'aurora 14s ease-in-out infinite alternate',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        aurora: {
          '0%': { transform: 'translate(-8%, -6%) rotate(0deg) scale(1)' },
          '100%': { transform: 'translate(8%, 8%) rotate(12deg) scale(1.15)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
