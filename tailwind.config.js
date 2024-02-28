/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "id-back": "url('@/assets/id_back.jpg')"
      },
      colors: {
        "brand-blue": "#0c598a",
        "brand-red": "#ff0000",
        "brand-green": "#00ff00",
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
};