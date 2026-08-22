// tailwind.config.js
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
        'ev-green': '#3ec06a',
        'ev-dark-green': '#1f7a3d',
        'ev-darker-green': '#166030',
        'ev-dark-blue': '#0c1f38',
        'ev-light-gray': '#f5f6f8',
        'ev-medium-gray': '#e4e9e7',
        'ev-text-gray': '#5a6472',
        'ev-light-text': '#c7d2de',
        'ev-muted': '#aebdcd',
        'ev-muted-dark': '#8a94a3',
        'ev-border': '#e6e8eb',
      },
    },
  },
  plugins: [],
}