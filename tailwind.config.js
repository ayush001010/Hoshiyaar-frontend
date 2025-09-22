/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'duo-blue': '#1E65FA',
        'duo-blue-dark': '#0A3DAA',
        'duo-green': '#58cc02',
        'duo-green-dark': '#58a700',
        'duo-gray': '#e5e5e5',
        'duo-text': '#4b4b4b',
        'duo-light-blue': '#ddf4ff',
        'duo-footer-blue': '#1a237e', // Custom color for the dark blue footer
      },
      fontFamily: {
        sans: ['"Nunito"', 'sans-serif'],
      },
      animation: {
        scroll: 'scroll 40s linear infinite',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}