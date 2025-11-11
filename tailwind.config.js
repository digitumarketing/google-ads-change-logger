/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#4285F4',
        'secondary': '#34A853',
        'danger': '#EA4335',
        'warning': '#FBBC05',
        'light': '#F8F9FA',
        'dark': '#202124',
      }
    }
  },
  plugins: [],
}
