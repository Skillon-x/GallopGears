/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#923D1E',    // Rich Mahogany
        secondary: '#E2E8F0',  // Silver Mane
        tertiary: '#2F4858',   // Deep Slate (a muted blue-gray)
        accent: '#B45309',     // Burnished Gold
      }
    },
  },
  plugins: [],
}