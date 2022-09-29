/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'media',
  content: ["./app/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}