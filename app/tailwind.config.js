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
        "primary": {
          "DEFAULT": "rgba(54, 175, 152, 1)", // KEPPEL
          "500": "rgba(54, 175, 152, .5)",
        },
        "secondary": {
          "DEFAULT": "rgba(69, 97, 95, 1)", // DEEP SPACE
          "500": "rgba(69, 97, 95, 0.5)",
        },
        "bg": "#242424", // RAISIN_BLACK
        "menu-bg": "#354342", // DARKENED DEEP SPACE

        "warn": {
          "DEFAULT": "rgba(251,200,43, 1)",
          "500": "rgba(251,200,43, .5)",
        }, // RIPE MANGO
        "danger": {
          "DEFAULT": "rgba(231,50,50, 1)",
          "500": "rgba(231,50,50, .5)",
        }, // DEEP CARMINE

        "title": "rgba(219,228,226, 1)", // CHINESE_WHITE
        "text": "rgba(255,225,225, 1)", // WHITE
        "link": "rgba(11,254,184, 1)", // SEA GREEN

        "line": "rgba(169,189,182, 1)", // OPAL

        "gray": {
          "100": "#c0c7ce", // LAVENDER_GRAY
          "200": "#909896", // SPANISH_GRAY
          "300": "#505554", // DAVYS_GRAY
          "400": "#37383a", // ONYX
          "500": "#00120f", // RICH_BLACK
        },
        
        "category": {
          "1": "#688acc", // BLUE_GRAY
          "2": "#c0dea9", // MOSS_GREEN
          "3": "#9e5fcb", // AMETHYST
          "4": "#92a8d4", // CEIL
          "5": "#f16d53", // BURNT_SIENNA
          "6": "#e2b657", // SUNRAY
        },
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
