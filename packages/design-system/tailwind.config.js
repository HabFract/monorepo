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
    },
    extend: {
      colors: {
        primary: { 
          DEFAULT: "#559E78",
          transparent: "rgba(85,158,120, 0.5)",
          'hover-bg': 'rgba(85,158,120, 0.9)',
          'hover-text': '#3E3F48',
         }, // sea green for primary buttons

        secondary: { 
          DEFAULT: '#FE6483',
          transparent: 'rgba(254,100,131, 0.5)',
          'hover-bg': 'rgba(254,100,131, 0.9)',
          'hover-text': '#3E3F48',
         }, // salmon for secondary buttons

        danger: { 
          DEFAULT: '#B22222',
          transparent: 'rgba(178,34,34, 0.5)',
          'hover-bg': 'rgba(178,34,34, 0.9)',
          'hover-text': '#fff',
         }, // firebrick color for danger buttons, it doesn't clash with primary and secondary colors and still conveys the right meaning

        'dark-gray': '#3E3F48',
      }
    }
  },
  variants: {
    extend: {
      backgroundColor: ['hover', 'focus'],
      textColor: ['hover', 'focus'],
    },
  },
}

