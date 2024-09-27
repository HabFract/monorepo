/** @type {import('tailwindcss').Config} */
const designSystemConfig = require("../design-system/tailwind.config.cjs");

module.exports = {
  ...designSystemConfig,
  content: [...designSystemConfig.content, "./src/**/*.{js,jsx,ts,tsx}"],
};
