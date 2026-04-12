/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Keep legacy dark-theme colors (used by existing components)
        ink: {
          950: '#08111f',
          900: '#0f1b2d',
          800: '#17263c',
        },
        sand: {
          100: '#f6f0dd',
          200: '#e8ddba',
        },
        coral: {
          400: '#ff7f61',
          500: '#ff6541',
        },
        // New purple sidebar palette
        sidebar: {
          DEFAULT: '#1e1048',
          light: '#2a1760',
          muted: '#3b2278',
        },
        // Primary purple accent
        violet: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        // Light theme surface colors
        surface: {
          DEFAULT: '#ffffff',
          50: '#f8f7ff',
          100: '#f1f0fb',
          200: '#e8e6f8',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(142, 232, 255, 0.18), 0 24px 60px rgba(8, 17, 31, 0.35)',
        card: '0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 2px 8px rgba(0,0,0,0.10), 0 8px 24px rgba(0,0,0,0.09)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      backgroundImage: {
        'grid-fade':
          'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
