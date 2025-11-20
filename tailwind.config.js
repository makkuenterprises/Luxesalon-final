/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        primary: '#0f172a', // Slate 900 (Luxury Black)
        secondary: '#ca8a04', // Gold 600
        accent: '#eab308', // Gold 500
        background: '#f8fafc', // Slate 50
        surface: '#ffffff',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      }
    },
  },
  plugins: [],
}