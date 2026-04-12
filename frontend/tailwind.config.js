/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#08111f',
          900: '#0f1b2d',
          800: '#17263c',
        },
        cyan: {
          300: '#8ee8ff',
          400: '#57d8ff',
          500: '#12c7ff',
        },
        sand: {
          100: '#f6f0dd',
          200: '#e8ddba',
        },
        coral: {
          400: '#ff7f61',
          500: '#ff6541',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(142, 232, 255, 0.18), 0 24px 60px rgba(8, 17, 31, 0.35)',
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
