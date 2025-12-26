/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          pink: '#FFD1DC',
          lavender: '#E6E6FA',
          mint: '#B5EAD7',
          peach: '#FFDAB9',
          blue: '#B0E0E6',
          purple: '#DDA0DD',
          yellow: '#FFF9C4',
          green: '#C7E9C0',
        }
      }
    },
  },
  plugins: [],
}

