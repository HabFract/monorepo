import "./styles.css";

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    backgrounds: {
      default: "backdrop",
      values: [
        {
          name: "backdrop",
          value: "rgba(36, 36, 36, 1)",
        },
        {
          name: "ligher",
          value: "#4E5454",
        },
      ],
    },
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
