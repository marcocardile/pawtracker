/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3498db",
        secondary: "#F44336",
        success: "#4CAF50",
        warning: "#FF9800",
        dark: "#333333",
        light: "#f5f5f5",
      },
    },
  },
  plugins: [],
}