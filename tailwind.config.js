/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./resource/**/*.{css,html,js}"],
  theme: {
    extend: {
      fontSize: {
        sm: '0.86666667rem',
        base: '0.93333333rem',
        xl: '1rem',
        '2xl': '1.53333333rem',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [],
}