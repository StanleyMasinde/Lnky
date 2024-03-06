/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#695958',
        secondary: '#B6C8A9'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

