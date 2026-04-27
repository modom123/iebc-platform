/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:         '#0F4C81',
        'primary-dark':  '#082D4F',
        'primary-light': '#EEF4FB',
        navy:            '#0B2140',
        gold:            '#C8902A',
        'gold-dark':     '#b07820',
      },
      fontFamily: {
        sans:     ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        playfair: ['Playfair Display', 'Georgia', 'serif'],
        mono:     ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        iebc:      '0 2px 20px rgba(11,33,64,0.08)',
        'iebc-lg': '0 8px 48px rgba(11,33,64,0.14)',
      },
    },
  },
  plugins: [],
}
