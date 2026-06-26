/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sandy Serenity Palette - Light Mode
        cream: '#f1e6b2',
        sand: '#e2c68a',
        serria: '#d4a54e',
        marigold: '#c48f2b',
        copper: '#a8752f',
        dallas: '#7a5d2c',
        judge: '#4f3f2e',
        thunder: '#2e292b',
        white: '#ffffff',
        
        // Sandy Serenity Palette - Dark Mode (Black + Brown accents)
        'dark-bg': '#0a0a0a',        // Pure black background
        'dark-bg2': '#1a1208',       // Very dark brown
        'dark-bg3': '#2a1a0e',       // Dark brown
        'dark-surface': '#14100c',   // Dark surface
        'dark-border': '#3a2a1a',    // Brown border
        'dark-text': '#f1e6b2',      // Cream text
        'dark-text2': '#c9b28a',     // Lighter brown text
        'dark-text3': '#a8752f',     // Copper text
        'dark-accent': '#d4a54e',    // Gold accent
      },
    },
  },
  plugins: [],
}