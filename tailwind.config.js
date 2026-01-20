/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Coupe Building Company Color Palette
        cream: {
          50: '#FDFBF7',
          100: '#FAF6ED',
          200: '#F5F0E1',  // Main background color from logo
          300: '#EDE5D3',
          400: '#E2D6BE',
          500: '#D4C4A5',
          600: '#C4B08A',
          700: '#B49B6E',
          800: '#A08553',
          900: '#8A7045',
        },
        brown: {
          50: '#F7F3F0',
          100: '#EDE5DE',
          200: '#D9CBBC',
          300: '#C4AF98',
          400: '#A08366',
          500: '#8B7355',  // Secondary brown
          600: '#6B5344',  // Primary brown from logo
          700: '#5A4538',
          800: '#4A382E',
          900: '#3D2E26',
        },
        // Semantic colors using Coupe palette
        primary: {
          DEFAULT: '#6B5344',
          light: '#8B7355',
          dark: '#5A4538',
        },
        secondary: {
          DEFAULT: '#F5F0E1',
          light: '#FAF6ED',
          dark: '#EDE5D3',
        },
      },
      backgroundColor: {
        'coupe': '#F5F0E1',
        'coupe-light': '#FAF6ED',
        'coupe-dark': '#EDE5D3',
      },
      textColor: {
        'coupe-primary': '#6B5344',
        'coupe-secondary': '#8B7355',
      },
    },
  },
  plugins: [],
}

