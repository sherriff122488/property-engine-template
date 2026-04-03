import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Claude-inspired warm accent
        brand: {
          DEFAULT: '#CF7454',   // Claude orange
          light:   '#F5EDE8',   // very light tint
          muted:   '#E8A98A',   // soft mid-tone
        },
      },
      backgroundColor: {
        // Warmer page background than stone-50
        page: '#F7F6F3',
      },
    },
  },
  plugins: [],
}

export default config
