/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'serif'],
      },
      colors: {
        navy: {
          900: '#0d1b2a',
          800: '#1a2e42',
          700: '#1e3a52',
        },
        gold: '#d4a96a',
      },
    },
  },
  plugins: [],
}
