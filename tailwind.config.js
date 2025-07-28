/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        colors: {
        primary: '#FFB44F',
        info: '#a4c6e9',
        success: '#90d2ce',
        secondary: '#f7bcc5',
        danger: '#f8723f',
      },
    },
  },
  plugins: [],
}
