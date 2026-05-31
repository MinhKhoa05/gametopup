/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#07111f',
        ocean: '#0f766e',
        cyanline: '#22d3ee',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 18px 70px rgba(34, 211, 238, 0.18)',
      },
    },
  },
  plugins: [],
};
