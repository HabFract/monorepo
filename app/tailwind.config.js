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
      heading: ["Poppins", "Arial"],
    },
    extend: {
      colors: {
      "primary": {
        "DEFAULT": "rgba(80, 227, 194, 0.9)",
        "transparent": "rgba(80, 227, 194, 0.4)",
        "hover-bg": "rgba(80, 227, 194, 0.8)",
        "hover-text": "#000"
      },
      "secondary": {
        "DEFAULT": "rgb(54, 25, 91)",
        "extra-transparent": "rgba(54, 25, 91, 0.25)",
        "transparent": "rgba(54, 25, 91, 0.5)",
        "hover-bg": "rgba(54, 25, 91, 0.9)",
        "hover-text": "#FDFEFE"
      },
      // "secondary": {
      //   "DEFAULT": "#9B59B6",
      //   "extra-transparent": "rgba(155, 89, 182, 0.25)",
      //   "transparent": "rgba(155, 89, 182, 0.5)",
      //   "hover-bg": "rgba(155, 89, 182, 0.9)",
      //   "hover-text": "#FDFEFE"
      // },
      "neutral": {
        "DEFAULT": "#6B7D7F",
        "extra-transparent": "rgba(107,125,127, 0.25)",
        "transparent": "rgba(107,125,127, 0.65)",
        "hover-bg": "rgba(107,125,127, 0.9)",
        "hover-text": "#FDFEFE"
      },
        
      "danger": {
        "DEFAULT": "rgba(189, 16, 224, 0.9)",
        "transparent": "rgba(189, 16, 224, 0.3)",
        "hover-bg": "rgba(189, 16, 224, 0.7)",
        "hover-text": "#fff"
      },
      "info": {
        "DEFAULT": "#40A9FF",
        "transparent": "rgba(64, 169, 255, 0.5)",
        "hover-bg": "rgba(64, 169, 255, 0.9)",
        "hover-text": "#fff"
      },
      "warn": {
        "DEFAULT": "rgba(248, 231, 28, 0.8)",
        "transparent": "rgba(248, 231, 28, 0.3)",
        "hover-bg": "rgba(248, 231, 28, 0.7)",
        "hover-text": "#000"
      },

      "off-white": "#FEFEFE",
      "light-gray": "#dadce0",
      "brown": "#5E503F",
      "dark-gray": "#222222",
      
      // "sphere-card-bg": "#004955",
      "card-bg": "rgba(0,73,85, 0.5)",
      "card-bg-light": "rgba(0,73,85, 0.9)",
      "nav-bg": "rgba(0,73,85, 0.5)"
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ["hover", "focus"],
      textColor: ["hover", "focus"],
      border: ["hover", "focus"],
    },
  },
};
