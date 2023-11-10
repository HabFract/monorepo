/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./**/*.{js,jsx,ts,tsx}",
    "../../node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
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
            margin: 0
          },
        },
      };
      addUtilities(newUtilities);
    },
  ],
  theme: {
    textTransform: {
      uppercase: "uppercase",
    },
    fontFamily: {
      sans: ["Open Sans", "Arial"],
      heading: ["Montserrat", "Arial"],
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#559E78",
          transparent: "rgba(85,158,120, 0.5)",
          "hover-bg": "rgba(85,158,120, 0.9)",
          "hover-text": "#fff",
        }, // sea green for primary buttons

        secondary: {
          DEFAULT: "#FE6483",
          transparent: "rgba(254,100,131, 0.5)",
          "hover-bg": "rgba(254,100,131, 0.9)",
          "hover-text": "#3E3F48",
        }, // salmon for secondary buttons

        neutral: {
          DEFAULT: "#4B3030",
          transparent: "rgba(75, 48, 48, 0.65)",
          "hover-bg": "rgba(75, 48, 48, 0.9)",
          "hover-text": "#fff",
        }, // neutral brown
        
        accent: {
          DEFAULT: "#6F54B2",
          "hover-bg": "#91d5ff",
          "hover-text": "#3E3F48",
        }, 
        
        danger: {
          DEFAULT: "#B22222",
          transparent: "rgba(178,34,34, 0.5)",
          "hover-bg": "rgba(178,34,34, 0.9)",
          "hover-text": "#fff",
        }, // firebrick color for danger buttons, it doesn't clash with primary and secondary colors and still conveys the right meaning

        info: {
          DEFAULT: "#40a9ff",
          "transparent": "rgba(64, 169, 255, 0.5)",
          "hover-bg": "#91d5ff",
          "hover-text": "#3E3F48",
        }, // info color for pointing things out, it doesn't clash with primary and secondary colors and still conveys the right meaning

        warn: {
          DEFAULT: "#D8973C",
          "transparent": "rgba(216, 151, 60,0.5)",
          "hover-bg": "rgba(216, 151, 60,0.9)",
          "hover-text": "#3E3F48",
        },

        "off-white": "#E6E8E6",
        "brown": "#E4DFDA",
        "dark-gray": "#3E3F48",
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ["hover", "focus"],
      textColor: ["hover", "focus"],
    },
  },
};
