/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './**/*.{js,jsx,ts,tsx}',
    '../../node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}'
  ],
  plugins: [require('flowbite/plugin')],
  theme: {
    textTransform: {
      'uppercase': 'uppercase',
    },
    fontFamily: {
      sans: ['Open Sans', 'Arial']
    }
  },
}

