/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#08090d',
          card: '#0f111a',
          cardHover: '#151928',
          border: '#232942',
          purple: '#a855f7',
          blue: '#3b82f6',
          cyan: '#06b6d4',
          neonCyan: '#00f0ff',
          neonPink: '#ff007f',
          neonGreen: '#00ff66',
          neonYellow: '#ffdd00',
        }
      },
      boxShadow: {
        'neon-purple': '0 0 20px -2px rgba(168, 85, 247, 0.45)',
        'neon-cyan': '0 0 20px -2px rgba(6, 182, 212, 0.45)',
        'neon-pink': '0 0 20px -2px rgba(255, 0, 127, 0.45)',
        'neon-green': '0 0 20px -2px rgba(0, 255, 102, 0.45)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { filter: 'drop-shadow(0 0 4px rgba(168, 85, 247, 0.6))' },
          '100%': { filter: 'drop-shadow(0 0 14px rgba(6, 182, 212, 0.9))' },
        }
      }
    },
  },
  plugins: [],
}

