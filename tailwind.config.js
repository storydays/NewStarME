/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Cosmic-inspired typography scale
      fontSize: {
        'cosmic-xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
        'cosmic-sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],
        'cosmic-base': ['0.875rem', { lineHeight: '1.5rem', letterSpacing: '0.01em' }],
        'cosmic-lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0.01em' }],
        'cosmic-xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '0.005em' }],
        'cosmic-2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '0.005em' }],
        'cosmic-3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '0' }],
        'cosmic-4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],
        'cosmic-5xl': ['2.5rem', { lineHeight: '2.75rem', letterSpacing: '-0.025em' }],
        'cosmic-6xl': ['3rem', { lineHeight: '3.25rem', letterSpacing: '-0.05em' }],
      },
      
      // Dark energy research color palette
      colors: {
        cosmic: {
          void: '#000000',
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
        
        // Gravitational lensing effects
        lensing: {
          'event-horizon': '#000000',
          'photon-sphere': '#1E1B4B',
          'accretion-disk': '#3730A3',
          'relativistic-jet': '#4338CA',
          'tidal-force': '#6366F1',
          'spacetime-curve': '#8B5CF6',
          'redshift': '#A855F7',
          'blueshift': '#C084FC',
        },
        
        // Particle physics inspired
        quantum: {
          'higgs-field': '#0C0A09',
          'dark-energy': '#1C1917',
          'neutrino': '#292524',
          'muon': '#44403C',
          'electron': '#57534E',
          'photon': '#78716C',
          'quark': '#A8A29E',
          'boson': '#D6D3D1',
        }
      },
      
      // Physics-based animations
      animation: {
        'orbital-slow': 'orbital 20s linear infinite',
        'orbital-medium': 'orbital 15s linear infinite',
        'orbital-fast': 'orbital 10s linear infinite',
        'gravitational-wave': 'gravitational-wave 3s ease-in-out infinite',
        'particle-drift': 'particle-drift 8s ease-in-out infinite',
        'quantum-fluctuation': 'quantum-fluctuation 2s ease-in-out infinite',
        'cherenkov-pulse': 'cherenkov-pulse 1.5s ease-in-out infinite',
        'redshift-fade': 'redshift-fade 4s ease-in-out infinite',
        'spacetime-ripple': 'spacetime-ripple 6s ease-in-out infinite',
        'dark-matter-flow': 'dark-matter-flow 12s linear infinite',
        'cosmic-float': 'cosmic-float 3s ease-in-out infinite',
        'field-distortion': 'field-distortion 5s ease-in-out infinite',
      },
      
      // Cosmic spacing system (based on Planck units conceptually)
      spacing: {
        'quantum': '0.125rem',    // 2px
        'atomic': '0.25rem',     // 4px
        'molecular': '0.5rem',   // 8px
        'cellular': '0.75rem',   // 12px
        'organism': '1rem',      // 16px
        'planetary': '1.5rem',   // 24px
        'stellar': '2rem',       // 32px
        'galactic': '3rem',      // 48px
        'cosmic': '4rem',        // 64px
        'universal': '6rem',     // 96px
      },
      
      // Gravitational field effects
      backdropBlur: {
        'quantum': '1px',
        'particle': '2px',
        'field': '4px',
        'spacetime': '8px',
        'cosmic': '16px',
      },
      
      // Dark energy gradients
      backgroundImage: {
        'cosmic-void': 'radial-gradient(ellipse at center, transparent 0%, #000000 70%)',
        'dark-matter': 'conic-gradient(from 0deg at 50% 50%, #0A0A0F, #1A1A2E, #0A0A0F)',
        'quantum-field': 'linear-gradient(135deg, #0F0F1A 0%, #1A1A2E 50%, #16213E 100%)',
        'gravitational-lensing': 'radial-gradient(circle at 30% 70%, #1E1B4B 0%, transparent 50%), radial-gradient(circle at 70% 30%, #3730A3 0%, transparent 50%)',
        'cherenkov-radiation': 'linear-gradient(45deg, #2563EB 0%, #3B82F6 50%, #60A5FA 100%)',
        'particle-collision': 'conic-gradient(from 180deg at 50% 50%, #000000, #2563EB, #000000)',
        'cosmic-microwave': 'radial-gradient(ellipse 200% 100% at 50% 0%, #0F0F1A 0%, #1A1A2E 50%, #000000 100%)',
      },
      
      // Research visualization box shadows
      boxShadow: {
        'particle-glow': '0 0 20px rgba(37, 99, 235, 0.3), 0 0 40px rgba(37, 99, 235, 0.1)',
        'quantum-field': '0 0 30px rgba(99, 102, 241, 0.2), inset 0 0 20px rgba(99, 102, 241, 0.05)',
        'gravitational-well': '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(37, 99, 235, 0.1)',
        'spacetime-curve': '0 10px 40px rgba(139, 92, 246, 0.3), 0 0 20px rgba(139, 92, 246, 0.1)',
        'dark-energy': '0 0 50px rgba(0, 0, 0, 0.9), 0 0 100px rgba(26, 26, 46, 0.5)',
        'cosmic-ray': '0 0 15px rgba(147, 197, 253, 0.4), 0 0 30px rgba(147, 197, 253, 0.2)',
      },
      
      // Z-index cosmic layers
      zIndex: {
        'quantum-vacuum': '-10',
        'dark-matter': '0',
        'ordinary-matter': '10',
        'electromagnetic': '20',
        'gravitational': '30',
        'spacetime': '40',
        'observation': '50',
      },
      
      // Viewport-based sizing
      maxHeight: {
        'cosmic-viewport': '100vh',
        'stellar-section': '80vh',
        'planetary-component': '60vh',
        'molecular-element': '40vh',
      },
      
      maxWidth: {
        'cosmic-container': '100vw',
        'galactic-section': '80vw',
        'stellar-component': '60vw',
        'planetary-element': '40vw',
      },
    },
  },
  plugins: [
    // Custom plugin for physics-based utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.cosmic-container': {
          'max-height': '100vh',
          'overflow': 'hidden',
          'position': 'relative',
        },
        '.gravitational-center': {
          'display': 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          'position': 'relative',
        },
        '.orbital-motion': {
          'transform-origin': 'center',
          'animation': 'orbital 20s linear infinite',
        },
        '.quantum-state': {
          'transition': 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          'will-change': 'transform, opacity',
        },
        '.field-effect': {
          'backdrop-filter': 'blur(8px)',
          'background': 'rgba(26, 26, 46, 0.1)',
          'border': '1px solid rgba(99, 102, 241, 0.2)',
        },
        '.particle-trail': {
          'position': 'relative',
          '&::after': {
            'content': '""',
            'position': 'absolute',
            'top': '50%',
            'left': '100%',
            'width': '20px',
            'height': '2px',
            'background': 'linear-gradient(90deg, rgba(37, 99, 235, 0.8), transparent)',
            'transform': 'translateY(-50%)',
            'opacity': '0',
            'transition': 'opacity 0.3s ease',
          },
          '&:hover::after': {
            'opacity': '1',
          },
        },
      }
      addUtilities(newUtilities)
    }
  ],
}

// Custom keyframes for physics-based animations
const customKeyframes = `
@keyframes orbital {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes gravitational-wave {
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
  50% { transform: scale(1.05) rotate(180deg); opacity: 1; }
}

@keyframes particle-drift {
  0%, 100% { transform: translateX(0) translateY(0); }
  25% { transform: translateX(5px) translateY(-3px); }
  50% { transform: translateX(-3px) translateY(5px); }
  75% { transform: translateX(-5px) translateY(-2px); }
}

@keyframes quantum-fluctuation {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.02); }
}

@keyframes cherenkov-pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(37, 99, 235, 0.3); }
  50% { box-shadow: 0 0 40px rgba(37, 99, 235, 0.6), 0 0 60px rgba(37, 99, 235, 0.3); }
}

@keyframes redshift-fade {
  0% { filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(30deg); }
  100% { filter: hue-rotate(0deg); }
}

@keyframes spacetime-ripple {
  0%, 100% { transform: scale(1); filter: blur(0px); }
  50% { transform: scale(1.02); filter: blur(1px); }
}

@keyframes dark-matter-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes cosmic-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

@keyframes field-distortion {
  0%, 100% { backdrop-filter: blur(4px); }
  50% { backdrop-filter: blur(8px); }
}
`;