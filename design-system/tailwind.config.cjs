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
    textTransform: {
      uppercase: "uppercase",
    },
    fontFamily: {
      sans: ["Manrope, Nunito", "Arial"],
      heading: ["Manrope", "Arial"],
    },
    extend: {
      fontWeight: {
        std: 300,
        medium: 400,
        semibold: 700,
        bold: 900,
      },
      lineHeight: {
        sm: "17.76px",
        std: "24px",
      },
      fontSize: {
        "sm": "13px",
        "std-input": "14px",
        base: "16px",
      },
      colors: {
        primary: {
          DEFAULT: "rgba(54, 175, 152, 1)", // KEPPEL
          500: "rgba(54, 175, 152, .5)",
        },
        secondary: {
          DEFAULT: "rgba(69, 97, 95, 1)", // DEEP SPACE
          500: "rgba(69, 97, 95, 0.5)",
        },
        bg: "#242424", // RAISIN_BLACK
        "menu-bg": "#3A3A3A",

        warn: {
          DEFAULT: "rgba(251,200,43, 1)",
          500: "rgba(251,200,43, .5)",
        }, // RIPE MANGO
        danger: {
          DEFAULT: "rgba(231,50,50, 1)",
          500: "rgba(231,50,50, .5)",
        }, // DEEP CARMINE

        win: {
          complete: "#0bfeb8",
          incomplete: "rgba(255, 255, 255, 0.1)"
        },

        title: "rgba(219,228,226, 1)", // CHINESE_WHITE

        text: "rgba(255,255,255, 1)", // WHITE

        "input-placeholder": "#4E5454",
        "input-bg": "#242424",
        "input-text": "rgba(255,255,255, 1)",
        "input-border": "rgba(255,255,255, 1)",

        "text-prim": "#A2EAC4;",

        link: "rgba(11,254,184, 1)", // SEA GREEN

        line: "rgba(169,189,182, 1)", // OPAL

        gray: {
          100: "#c0c7ce", // LAVENDER_GRAY
          200: "#909896", // SPANISH_GRAY
          300: "#505554", // DAVYS_GRAY
          400: "#37383a", // ONYX
          500: "#00120f", // RICH_BLACK
        },

        category: {
          1: "#688acc", // BLUE_GRAY
          2: "#c0dea9", // MOSS_GREEN
          3: "#9e5fcb", // AMETHYST
          4: "#92a8d4", // CEIL
          5: "#f16d53", // BURNT_SIENNA
          6: "#e2b657", // SUNRAY
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

module.exports = tailwindConfig;
