/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tn: {
          dark: "#0b132b",
          card: "#1c2541",
          primary: "#3a506b",
          accent: "#5bc0be",
          emerald: "#10b981",
          gold: "#f59e0b"
        }
      }
    },
  },
  plugins: [],
}
