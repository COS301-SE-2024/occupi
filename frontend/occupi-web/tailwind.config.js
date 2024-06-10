/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "selector",
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    extend: {
      colors: {
        text_col: 'var(--text-col)',
        text_col_alt: 'var(--text-col-alt)',
        text_col_secondary_alt: 'var(--secondary-alt)',
        text_col_tertiary: 'var(--tertiary)',
        text_col_green_leaf: 'var(--green-leaf)',
        text_col_red_salmon: 'var(--red-salmon)'
      },
      backgroundColor: {
        red_salmon: 'var(--red-salmon)',
        green_leaf: 'var(--green-leaf)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        primary_alt: 'var(--primary-alt)',
        secondary_alt: 'var(--secondary-alt)',
        primary_40: 'var(--primary-40)',
        tertiary: 'var(--tertiary)'
      },
      borderColor: {
        red_salmon: 'var(--red-salmon)',
        gray_900: 'var(--tertiary)',
        primary_alt: 'var(--primary-alt)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}