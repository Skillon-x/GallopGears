/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f7f3f0',
          100: '#efe6e1',
          200: '#dfcec3',
          300: '#cfb5a5',
          400: '#bf9d87',
          500: '#af8469',
          600: '#8c6a54',
          700: '#694f3f',
          800: '#47352a',
          900: '#241a15',
        },
        secondary: {
          50: '#f5f7f7',
          100: '#e7ebeb',
          200: '#d0d8d8',
          300: '#b8c5c5',
          400: '#a1b2b2',
          500: '#89a0a0',
          600: '#6e8080',
          700: '#526060',
          800: '#374040',
          900: '#1b2020',
        },
        accent: {
          50: '#fef7f7',
          100: '#fde9e9',
          200: '#fbd4d4',
          300: '#f9bebe',
          400: '#f7a9a9',
          500: '#f59393',
          600: '#c47676',
          700: '#935858',
          800: '#623b3b',
          900: '#311d1d',
        }
      }
    },
  },
  plugins: [],
}

