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

      sans: ["Nunito", "Arial"],
      heading: ["Poppins", "Arial"],
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#16a085", // deep emerald
          transparent: "rgba(22, 160, 133, 0.5)",
          "hover-bg": "rgba(22, 160, 133, 0.9)",
          "hover-text": "#fff",
        },
    
        secondary: {
          DEFAULT: "#ff6b6b", // coral
          transparent: "rgba(255, 107, 107, 0.5)",
          "hover-bg": "rgba(255, 107, 107, 0.9)",
          "hover-text": "#3E3F48",
        },
    
        neutral: {
          DEFAULT: "#95afc0", // soft blue-grey
          transparent: "rgba(149, 175, 192, 0.65)",
          "hover-bg": "rgba(149, 175, 192, 0.9)",
          "hover-text": "#fff",
        },
        
        danger: {
          DEFAULT: "#B22222",
          transparent: "rgba(178,34,34, 0.5)",
          "hover-bg": "rgba(178,34,34, 0.9)",
          "hover-text": "#fff",
        }, // firebrick color for danger buttons, it doesn't clash with primary and secondary colors and still conveys the right meaning

        info: {
          DEFAULT: "#365d56",
          "transparent": "rgba(54, 93, 86, 0.5)",
          "hover-bg": "#365d56",
          "hover-text": "#3E3F48",
        }, // info color for pointing things out, it doesn't clash with primary and secondary colors and still conveys the right meaning

        warn: {
          DEFAULT: "#D8973C",
          "transparent": "rgba(216, 151, 60,0.5)",
          "hover-bg": "rgba(216, 151, 60,0.9)",
          "hover-text": "#3E3F48",
        },

        "off-white": "#fdfdfd",
        "brown": "#E4DFDA",
        // "dark-gray": "#3E3F48",
        "dark-gray": "#011632",
        // "dark-gray": "#1B2430",
        "sphere-card-bg": "#172b34",
        "card-bg-light": "#95afc0",
        "card-bg": "#173a3e",
        
        "nav-bg": "#1B2430",
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
