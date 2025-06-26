/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        space: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['2.5rem', { lineHeight: '1.1' }], // Cosmic-inspired type scale
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
      },
      colors: {
        cosmic: {
          'void': '#000000',
          'dark-matter': '#0A0A0F',
          'deep-space': '#0F0F1A',
          'quantum-field': '#1A1A2E',
          'particle-trace': '#16213E',
          'energy-flux': '#0E4B99',
          'cherenkov-blue': '#2563EB',
          'plasma-glow': '#3B82F6',
          'stellar-wind': '#60A5FA',
          'cosmic-ray': '#93C5FD',
          'light-echo': '#DBEAFE',
          'observation': '#F8FAFC',
        },
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      spacing: {
        'quantum': '0.125rem',    // 2px
        'atomic': '0.25rem',      // 4px
        'molecular': '0.5rem',    // 8px
        'cellular': '0.75rem',    // 12px
        'organism': '1rem',       // 16px
        'planetary': '1.5rem',    // 24px
        'stellar': '2rem',        // 32px
        'galactic': '3rem',       // 48px
        'cosmic': '4rem',         // 64px
        'universal': '6rem',      // 96px
      },
      animation: {
        'spin': 'spin 1s linear infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'cosmic-float': 'cosmic-float 3s ease-in-out infinite',
        'orbital-slow': 'orbital 20s linear infinite',
        'orbital-medium': 'orbital 10s linear infinite',
        'orbital-fast': 'orbital 5s linear infinite',
        'gravitational-wave': 'gravitational-wave 4s ease-in-out infinite',
        'particle-drift': 'particle-drift 8s ease-in-out infinite',
        'quantum-fluctuation': 'quantum-fluctuation 2s ease-in-out infinite',
        'supernova-burst': 'supernova-burst 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      keyframes: {
        'cosmic-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'orbital': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'gravitational-wave': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        },
        'particle-drift': {
          '0%, 100%': { transform: 'translateX(0px) translateY(0px)' },
          '25%': { transform: 'translateX(2px) translateY(-1px)' },
          '50%': { transform: 'translateX(-1px) translateY(-2px)' },
          '75%': { transform: 'translateX(-2px) translateY(1px)' },
        },
        'quantum-fluctuation': {
          '0%, 100%': { opacity: '0.7', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        'supernova-burst': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.3)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backdropBlur: {
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
        'xl': '24px',
      },
      backgroundImage: {
        'cosmic-void': 'radial-gradient(circle at center, transparent 0%, #000000 100%)',
        'dark-matter': 'conic-gradient(from 0deg, #0A0A0F, #1A1A2E, #0A0A0F)',
        'quantum-field': 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0E4B99 100%)',
        'gravitational-lensing': 'radial-gradient(ellipse at top, #2563EB 0%, transparent 50%), radial-gradient(ellipse at bottom, #3B82F6 0%, transparent 50%)',
        'cherenkov-radiation': 'linear-gradient(90deg, #2563EB 0%, #3B82F6 50%, #60A5FA 100%)',
      },
    },
  },
  plugins: [],
}