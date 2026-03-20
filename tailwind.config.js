/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./renderer/index.html",
    "./renderer/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        bebas: ['Bebas Neue', 'sans-serif'],
        inter: ['Inter', 'sans-serif']
      },
      colors: {
        'dexter-purple': '#7c3aed',
        'dexter-purple-light': '#8b5cf6'
      }
    },
  },
  plugins: [],
}