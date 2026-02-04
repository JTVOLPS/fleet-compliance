/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Padres colors for branding
        'padres-brown': '#2F241D',
        'padres-gold': '#FFC425',
        // Navy for sidebar
        'navy': {
          800: '#1e3a5f',
          900: '#0f2744',
        },
        // Status colors
        'status-green': '#22c55e',
        'status-yellow': '#eab308',
        'status-red': '#ef4444',
      },
    },
  },
  plugins: [],
}
