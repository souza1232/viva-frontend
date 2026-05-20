/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#C96A8A',
        'primary-light': '#E8A4BB',
        'primary-dark': '#9D4A6A',
        secondary: '#7B6EA8',
        accent: '#E8A87C',
        background: '#FDF6F8',
        border: '#EDE0E5',
        'text-main': '#2D1B2E',
        'text-secondary': '#7A5E6A',
        'text-light': '#B89AAA',
        success: '#6BAE75',
        error: '#D05555',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
