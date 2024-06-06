/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,tsx}",
    "./src/**/*/*.{html,js,tsx}"],
  theme: {
    extend: {
      fontFamily:{
        sans: ['Poppins', 'Noto Sans JP', 'Roboto'],
      }
    }
  },
  plugins: [],
}