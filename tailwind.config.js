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
        primary: '#FF2442',
        secondary: '#333333',
      },
      aspectRatio: {
        'xhs': '3/4',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 