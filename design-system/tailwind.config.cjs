/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
  darkMode: "class",
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
        std: 300, // use 'light' instead
        medium: 400, // use 'normal' instead
        semibold: 700, // use 'bold' instead
        "std-bold": 900, // use 'extrabold' instead
      },
      lineHeight: {
        // New semantic names
        tight: "17.76px",
        normal: "20px",
        relaxed: "24px",

        // Deprecated names - to be removed
        sm: "17.76px", // use 'tight' instead
        lg: "20px", // use 'normal' instead
        std: "24px", // use 'relaxed' instead
      },
      fontSize: {
        // New semantic names
        xs: "13px",
        sm: "14px",
        base: "16px",

        // Deprecated names - to be removed
        "std-sm": "13px", // use 'xs' instead
        "std-input": "14px", // use 'sm' instead
        "std-base": "16px", // use 'base' instead
      },
      colors: {
        // Base semantic tokens
        surface: {
          DEFAULT: "#ffffff",
          dark: "#171717",
          overlay: {
            // for overlay controls in the Vis
            DEFAULT: "#cecece",
            dark: {
              DEFAULT: "#2F3232",
              500: "rgba(49, 49, 49, 0.5)",
            },
          },
          elevated: {
            // for cards, modals, forms, dropdowns, etc.
            DEFAULT: "#ffffff",
            dark: "#3A3A3A",
          },
          top: {
            DEFAULT: "#ffffff",
            dark: {
              DEFAULT: "#3A4040",
              500: "rgba(58, 64, 64, 0.5)",
            },
          },
        },
        secondary: {
          DEFAULT: "rgba(146, 168, 212, 1)",
          500: "rgba(146, 168, 212, 0.5)",
          dark: {
            DEFAULT: "rgba(146, 168, 212, 1)",
            500: "rgba(146, 168, 212, 0.5)",
          },
        },
        primary: {
          DEFAULT: "#24917C",
          500: "rgba(2, 177, 151, 0.5)",
          dark: {
            DEFAULT: "rgba(2, 177, 151, 0.75)",
            500: "rgba(29, 64, 76, .5)",
          },
        },
        accent: {
          DEFAULT: "#0BFEB8",
          dark: "rgba(11,254,184, 1)",
        },

        // Component-specific tokens
        modal: {
          bg: {
            DEFAULT: "#1F2827",
            dark: "#1F2827",
          },
          footer: {
            DEFAULT: "#1C3A38",
            dark: "#1C3A38",
          },
        },
        input: {
          bg: {
            DEFAULT: "#ffffff",
            dark: "#2F3232",
          },
          border: {
            DEFAULT: "#e5e7eb",
            dark: "rgba(255,255,255, 0.1)",
          },
          text: {
            DEFAULT: "#000000",
            dark: "rgba(255,255,255, 1)",
          },
          placeholder: {
            DEFAULT: "#9ca3af",
            dark: "rgba(255,255,255, 0.7)",
          },
          icon: {
            DEFAULT: "#9ca3af",
            dark: "#9ca3af",
          },
        },

        // Status colors
        overlay: {
          controls: "rgba(37, 55, 93, 0.8)",
          tooltip: "rgba(0,0,0, 0.8)",
          dashboard: {
            DEFAULT: "#1C3A38",
            700: "rgba(28, 58, 56, 0.7)",
          },
          tab: {
            DEFAULT: "#1F2827",
            700: "rgba(31, 40, 39, 0.7)",
          },
          gridline: "rgba(146, 168, 212, 0.3)",
        },
        // Status colors
        warn: {
          DEFAULT: "rgba(251,200,43, 1)",
          500: "rgba(251,200,43, .5)",
        },
        danger: {
          DEFAULT: "rgba(191,67,66, 1)",
          500: "rgba(191,67,66, .5)",
        },
        success: {
          positive: {
            DEFAULT: "#3A6E6A",
            streak: "rgba(11, 254, 184, 0.9)",
          },
          negative: {
            DEFAULT: "rgba(146, 168, 212, 1)",
            streak: "rgba(11, 254, 184, 0.9)",
          },
          DEFAULT: "rgba(11, 254, 184, 0.9)",
          incomplete: "rgba(255, 255, 255, 0.1)",
        },

        // Text colors
        text: {
          DEFAULT: "#000000",
          dark: "#fefefe",
          accent: {
            DEFAULT: "#A2EAC4",
            dark: "#A2EAC4",
          },
        },
        title: {
          DEFAULT: "#000000",
          dark: "#ffffff",
        },

        // Utility colors
        gray: {
          100: "#c0c7ce",
          200: "#909896",
          300: "#505554",
          400: "#37383a",
          500: "#00120f",
        },
        category: {
          1: "#688acc",
          2: "#c0dea9",
          3: "#9e5fcb",
          4: "#92a8d4",
          5: "#f16d53",
          6: "#e2b657",
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
