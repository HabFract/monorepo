/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
  darkMode: 'class',
  content: [
    "./**/*.{js,jsx,ts,tsx}",
    "../../node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
    "!./node_modules/**/*",
  ],
  plugins: [
    require("flowbite/plugin"),
    function ({ addUtilities }) {
      const newUtilities = {
        ".hidden-sm": {
          "@media (max-width: 440px)": {
            display: "none",
          },
        },
        ".m-0-sm": {
          "@media (max-width: 440px)": {
            margin: 0,
          },
        },
      };
      addUtilities(newUtilities);
    },
  ],
  theme: {
    fontFamily: {
      sans: ["Manrope, Nunito", "Arial"],
      heading: ["Manrope", "Arial"],
    },
    extend: {
      fontWeight: {
        // New semantic names
        light: 300,
        normal: 400,
        bold: 700,
        extrabold: 900,
        
        // Deprecated names - to be removed
        std: 300,        // use 'light' instead
        medium: 400,     // use 'normal' instead
        semibold: 700,   // use 'bold' instead
        'std-bold': 900, // use 'extrabold' instead
      },
      lineHeight: {
        // New semantic names
        tight: "17.76px",
        normal: "20px",
        relaxed: "24px",
        
        // Deprecated names - to be removed
        sm: "17.76px",   // use 'tight' instead
        lg: "20px",      // use 'normal' instead
        std: "24px",     // use 'relaxed' instead
      },
      fontSize: {
        // New semantic names
        xs: "13px",
        sm: "14px",
        base: "16px",
        
        // Deprecated names - to be removed
        'std-sm': "13px",     // use 'xs' instead
        'std-input': "14px",  // use 'sm' instead
        'std-base': "16px",   // use 'base' instead
      },
      colors: {
        // Base semantic tokens
        surface: {
          DEFAULT: '#ffffff',
          dark: '#242424',
          overlay: {            // for overlay controls in the Vis
            DEFAULT: '#cecece',
            dark: "#3A3A3A"
          },
          elevated: {           // for cards, modals, forms, dropdowns, etc.
            DEFAULT: '#ffffff',
            dark: '#3A3A3A'
          },
          top: {
            DEFAULT: '#ffffff',
            dark: '#4E5454'
          }
        },
        secondary: {
          DEFAULT: '#0A7557',
          500: 'rgba(29, 64, 76, .5)',
          dark:  {
            DEFAULT: 'rgb(29, 64, 76)',
            500: 'rgba(29, 64, 76, .5)',
          },
        },
        primary: {
          DEFAULT: '#1d404c',
          500: 'rgba(2, 177, 151, 0.5)',
          dark:  {
            DEFAULT: 'rgba(2, 177, 151, 0.75)',
            500: 'rgba(2, 177, 151, 0.5)',
          },
        },
        accent: {
          DEFAULT: '#0BFEB8',
          dark: 'rgba(11,254,184, 1)',
        },
        
        // Component-specific tokens
        modal: {
          bg: {
            DEFAULT: '#ffffff',
            dark: '#3A4040',
          },
          footer: {
            DEFAULT: '#f8f9fa',
            dark: '#02b197',
          }
        },
        input: {
          bg: {
            DEFAULT: '#ffffff',
            dark: '#242424',
          },
          border: {
            DEFAULT: '#e5e7eb',
            dark: 'transparent',
          },
          text: {
            DEFAULT: '#000000',
            dark: 'rgba(255,255,255, 1)',
          },
          placeholder: {
            DEFAULT: '#9ca3af',
            dark: '#4E5454',
          },
          icon: {
            DEFAULT: '#9ca3af',
            dark: '#9ca3af',
          }
        },

        // Status colors
        warn: {
          DEFAULT: 'rgba(251,200,43, 1)',
          500: 'rgba(251,200,43, .5)',
        },
        danger: {
          DEFAULT: 'rgba(191,67,66, 1)',
          500: 'rgba(191,67,66, .5)',
        },
        success: {
          DEFAULT: '#12d39d',
          incomplete: 'rgba(255, 255, 255, 0.1)',
        },

        // Text colors
        text: {
          DEFAULT: '#000000',
          dark: '#fefefe',
          accent: {
            DEFAULT: '#A2EAC4',
            dark: '#A2EAC4',
          }
        },
        title: {
          DEFAULT: '#000000',
          dark: '#ffffff',
        },

        // Utility colors
        gray: {
          100: '#c0c7ce',
          200: '#909896',
          300: '#505554',
          400: '#37383a',
          500: '#00120f',
        },
        category: {
          1: '#688acc',
          2: '#c0dea9',
          3: '#9e5fcb',
          4: '#92a8d4',
          5: '#f16d53',
          6: '#e2b657',
        },
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ["hover", "focus"],
      textColor: ["hover", "focus"],
      borderColor: ["hover", "focus"],
    },
  },
};

module.exports = tailwindConfig;