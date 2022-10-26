/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./app/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      keyframes: {
        alert: {
          'from': {
            opacity: 0,
            transform: 'translateX(-100%)'
          },
          'to': {
            opacity: 1,
            transform: 'translateX(0)'
          }
        },
        nprogress: {
          from: {
            transform: 'translateX(-100%)'
          },
          to: {
            transform: 'translateX(100%)'
          }
        },
      },
      animation: {
        alert: 'alert 0.5s ease-in-out',
        nprogress: 'nprogress 1.5s ease-out infinite'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ],
}