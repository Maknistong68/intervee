/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0D0D0D',
        surface: '#1A1A1A',
        'surface-light': '#252525',
        primary: '#4CAF50',
        'primary-dark': '#388E3C',
        border: '#333333',
        divider: '#2A2A2A',
      },
    },
  },
  plugins: [],
}
