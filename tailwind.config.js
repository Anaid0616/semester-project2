/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./**/*.{html,js,ts,mjs}', '!./node_modules/**/*'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },

    plugins: [require('@tailwindcss/aspect-ratio')],
    plugins: [require('@tailwindcss/line-clamp')],
  },
};
